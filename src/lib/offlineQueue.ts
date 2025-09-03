// 📂 FILE: src/lib/offlineQueue.ts
// Enhanced offline queue with sync capabilities, retry logic, and better type safety

import { saveCompleteScan, type CustomerInput, type VehicleInput } from './scans';

// Type definitions
export interface QueuedScanPayload {
  customer: CustomerInput;
  vehicle?: VehicleInput;
  entries: any[];
  health?: any;
  durationSec?: number;
  meta?: Record<string, any>;
}

export interface QueuedScanItem {
  id: string;
  payload: QueuedScanPayload;
  ts: number;
  retryCount: number;
  lastError?: string;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
}

export interface QueueStats {
  total: number;
  pending: number;
  failed: number;
  oldestTimestamp?: number;
}

// Configuration
const CONFIG = {
  storageKey: 'snapcore_scan_queue_v1',
  maxRetries: 3,
  retryDelayMs: 2000,
  maxQueueSize: 100,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

// Storage utilities with enhanced error handling
function loadQueue(): QueuedScanItem[] {
  try {
    const stored = localStorage.getItem(CONFIG.storageKey);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      console.warn('Invalid queue data format, resetting...');
      return [];
    }
    
    // Migrate old format if needed
    return parsed.map((item: any) => ({
      id: item.id || generateId(),
      payload: item.payload,
      ts: item.ts || Date.now(),
      retryCount: item.retryCount || 0,
      lastError: item.lastError,
      status: item.status || 'pending',
    }));
  } catch (error) {
    console.error('Failed to load offline queue:', error);
    return [];
  }
}

function saveQueue(queue: QueuedScanItem[]): boolean {
  try {
    // Clean up old items before saving
    const cleaned = cleanupOldItems(queue);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(cleaned));
    return true;
  } catch (error) {
    console.error('Failed to save offline queue:', error);
    
    // If storage is full, try to make space
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      try {
        const reduced = queue.slice(-50); // Keep only 50 most recent
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(reduced));
        console.log('Reduced queue size due to storage quota');
        return true;
      } catch {
        console.error('Failed to save even reduced queue');
      }
    }
    return false;
  }
}

function generateId(): string {
  return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function cleanupOldItems(queue: QueuedScanItem[]): QueuedScanItem[] {
  const cutoff = Date.now() - CONFIG.maxAge;
  return queue
    .filter(item => item.ts > cutoff || item.status === 'pending') // Keep recent or pending
    .slice(-CONFIG.maxQueueSize); // Limit total size
}

/**
 * Add a scan to the offline queue
 */
export function queueScan(payload: QueuedScanPayload): string {
  const queue = loadQueue();
  
  // Check for duplicates (same customer + timestamp within 1 minute)
  const recentDuplicate = queue.find(item => 
    item.payload.customer.name === payload.customer.name &&
    Math.abs(item.ts - Date.now()) < 60000 // 1 minute
  );
  
  if (recentDuplicate) {
    console.log('Duplicate scan detected, skipping queue');
    return recentDuplicate.id;
  }

  const item: QueuedScanItem = {
    id: generateId(),
    payload: {
      ...payload,
      meta: {
        ...payload.meta,
        queuedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
      },
    },
    ts: Date.now(),
    retryCount: 0,
    status: 'pending',
  };

  queue.push(item);
  saveQueue(queue);
  
  console.log(`Queued scan for offline sync: ${item.id}`);
  return item.id;
}

/**
 * Get all queued scans
 */
export function getQueuedScans(): QueuedScanItem[] {
  return loadQueue();
}

/**
 * Get queue statistics
 */
export function getQueueStats(): QueueStats {
  const queue = loadQueue();
  return {
    total: queue.length,
    pending: queue.filter(item => item.status === 'pending').length,
    failed: queue.filter(item => item.status === 'failed').length,
    oldestTimestamp: queue.length > 0 ? Math.min(...queue.map(item => item.ts)) : undefined,
  };
}

/**
 * Remove a scan from the queue by ID
 */
export function clearQueuedScan(id: string): boolean {
  const queue = loadQueue();
  const index = queue.findIndex(item => item.id === id);
  
  if (index === -1) {
    console.warn(`Queue item not found: ${id}`);
    return false;
  }
  
  queue.splice(index, 1);
  return saveQueue(queue);
}

/**
 * Update the status of a queued item
 */
function updateQueueItemStatus(
  id: string, 
  status: QueuedScanItem['status'], 
  error?: string
): boolean {
  const queue = loadQueue();
  const item = queue.find(q => q.id === id);
  
  if (!item) return false;
  
  item.status = status;
  if (error) item.lastError = error;
  if (status === 'failed') item.retryCount++;
  
  return saveQueue(queue);
}

/**
 * Sync a single queued scan
 */
async function syncQueuedScan(item: QueuedScanItem): Promise<boolean> {
  try {
    updateQueueItemStatus(item.id, 'syncing');
    
    console.log(`Syncing queued scan: ${item.id}`);
    
    const result = await saveCompleteScan({
      customer: item.payload.customer,
      vehicle: item.payload.vehicle,
      entries: item.payload.entries,
      health: item.payload.health,
      durationSec: item.payload.durationSec,
      meta: {
        ...item.payload.meta,
        syncedAt: new Date().toISOString(),
        originalQueueTime: new Date(item.ts).toISOString(),
      },
    });

    console.log(`Successfully synced scan: ${item.id}`, result.scan.id);
    
    // Mark as completed and remove from queue
    clearQueuedScan(item.id);
    return true;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
    console.error(`Failed to sync scan ${item.id}:`, errorMessage);
    
    // Update status and retry count
    if (item.retryCount >= CONFIG.maxRetries) {
      updateQueueItemStatus(item.id, 'failed', errorMessage);
      console.error(`Scan ${item.id} failed permanently after ${CONFIG.maxRetries} retries`);
    } else {
      updateQueueItemStatus(item.id, 'pending', errorMessage);
    }
    
    return false;
  }
}

/**
 * Sync all pending queued scans
 */
export async function syncQueuedScans(): Promise<{ 
  success: number; 
  failed: number; 
  total: number 
}> {
  const queue = loadQueue();
  const pendingItems = queue.filter(item => 
    item.status === 'pending' && item.retryCount < CONFIG.maxRetries
  );

  if (pendingItems.length === 0) {
    console.log('No pending scans to sync');
    return { success: 0, failed: 0, total: 0 };
  }

  console.log(`Starting sync of ${pendingItems.length} pending scans...`);
  
  let success = 0;
  let failed = 0;

  // Sync items sequentially to avoid overwhelming the server
  for (const item of pendingItems) {
    try {
      const result = await syncQueuedScan(item);
      if (result) {
        success++;
      } else {
        failed++;
      }
      
      // Add small delay between requests
      if (pendingItems.length > 1) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelayMs));
      }
    } catch (error) {
      console.error('Sync error:', error);
      failed++;
    }
  }

  console.log(`Sync completed: ${success} successful, ${failed} failed`);
  
  return { success, failed, total: pendingItems.length };
}

/**
 * Auto-sync when online (for use with network detection)
 */
export async function autoSyncWhenOnline(): Promise<void> {
  if (!navigator.onLine) {
    console.log('Device is offline, skipping auto-sync');
    return;
  }

  const stats = getQueueStats();
  if (stats.pending === 0) {
    return; // Nothing to sync
  }

  try {
    console.log('Auto-syncing queued scans...');
    await syncQueuedScans();
  } catch (error) {
    console.error('Auto-sync failed:', error);
  }
}

/**
 * Clear all completed and old failed items
 */
export function cleanupQueue(): { removed: number; remaining: number } {
  const queue = loadQueue();
  const initialCount = queue.length;
  
  const cleaned = queue.filter(item => 
    item.status === 'pending' || 
    item.status === 'syncing' ||
    (item.status === 'failed' && item.ts > Date.now() - CONFIG.maxAge)
  );
  
  saveQueue(cleaned);
  
  const removed = initialCount - cleaned.length;
  console.log(`Queue cleanup: removed ${removed} items, ${cleaned.length} remaining`);
  
  return { removed, remaining: cleaned.length };
}

/**
 * Export all queued data (for backup/debugging)
 */
export function exportQueueData(): string {
  const queue = loadQueue();
  const stats = getQueueStats();
  
  return JSON.stringify({
    version: 'v1',
    exportedAt: new Date().toISOString(),
    stats,
    queue,
  }, null, 2);
}

/**
 * Get a human-readable queue summary
 */
export function getQueueSummary(): string {
  const stats = getQueueStats();
  
  if (stats.total === 0) {
    return 'No offline scans queued';
  }
  
  const parts: string[] = [];
  if (stats.pending > 0) parts.push(`${stats.pending} pending`);
  if (stats.failed > 0) parts.push(`${stats.failed} failed`);
  
  const age = stats.oldestTimestamp 
    ? Math.round((Date.now() - stats.oldestTimestamp) / 1000 / 60) 
    : 0;
    
  return `${stats.total} queued scans (${parts.join(', ')})${age > 0 ? `, oldest: ${age}m ago` : ''}`;
}

// Setup automatic cleanup on load
if (typeof window !== 'undefined') {
  // Clean up old items when the module loads
  setTimeout(() => {
    const queue = loadQueue();
    if (queue.length > 0) {
      saveQueue(queue); // This will trigger cleanup
    }
  }, 1000);
}
