// 📂 FILE: src/lib/flushQueuedScans.ts
// Fixed version that works with both original and enhanced queue systems

import { getQueuedScans, clearQueuedScan } from "./offlineQueue";
import { saveScan, saveCompleteScan } from "./scans";

/**
 * Simple flush function - fixes the index bug
 * Works with your original queue system
 */
export async function flushQueuedScans() {
  const queued = getQueuedScans();
  
  // Process from end to beginning to avoid index shifting
  for (let i = queued.length - 1; i >= 0; i--) {
    const item = queued[i];
    try {
      // Use the original saveScan approach
      await saveScan(item.payload);
      clearQueuedScan(i);
      console.log(`Successfully synced queued scan ${i}`);
    } catch (error) {
      console.error(`Failed to sync queued scan ${i}:`, error);
      // Stop on first error to retry later
      break;
    }
  }
}

/**
 * Enhanced flush function - works with the enhanced queue system
 * Uses IDs instead of indexes and provides better error handling
 */
export async function flushQueuedScansEnhanced() {
  const queued = getQueuedScans();
  const pendingItems = queued.filter(item => 
    !item.status || item.status === 'pending'
  );
  
  if (pendingItems.length === 0) {
    console.log('No pending scans to flush');
    return { success: 0, failed: 0 };
  }
  
  let successCount = 0;
  let failedCount = 0;
  
  console.log(`Flushing ${pendingItems.length} queued scans...`);
  
  for (const item of pendingItems) {
    try {
      // Use enhanced saveCompleteScan for better error handling
      await saveCompleteScan({
        customer: item.payload.customer,
        vehicle: item.payload.vehicle,
        entries: item.payload.entries,
        health: item.payload.health,
        durationSec: item.payload.durationSec,
        meta: {
          ...item.payload.meta,
          flushedAt: new Date().toISOString(),
          originalQueueTime: new Date(item.ts).toISOString(),
        }
      });
      
      // Clear by ID instead of index
      clearQueuedScan(item.id || String(queued.indexOf(item)));
      successCount++;
      console.log(`Successfully synced scan: ${item.id || 'unknown'}`);
      
    } catch (error) {
      console.error(`Failed to sync scan ${item.id || 'unknown'}:`, error);
      failedCount++;
      
      // Stop on first error (your original behavior)
      break;
    }
  }
  
  console.log(`Flush complete: ${successCount} successful, ${failedCount} failed`);
  return { success: successCount, failed: failedCount };
}

/**
 * Robust flush function - continues on errors, with retry logic
 * Best for production use
 */
export async function flushQueuedScansRobust() {
  const queued = getQueuedScans();
  const pendingItems = queued.filter(item => 
    !item.status || item.status === 'pending'
  );
  
  if (pendingItems.length === 0) {
    return { success: 0, failed: 0, skipped: 0 };
  }
  
  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  
  console.log(`Starting robust flush of ${pendingItems.length} queued scans...`);
  
  for (const item of pendingItems) {
    // Skip items that have failed too many times
    const retryCount = item.retryCount || 0;
    if (retryCount >= 3) {
      console.log(`Skipping scan ${item.id} (max retries exceeded)`);
      skippedCount++;
      continue;
    }
    
    try {
      const result = await saveCompleteScan({
        customer: item.payload.customer,
        vehicle: item.payload.vehicle,
        entries: item.payload.entries,
        health: item.payload.health,
        durationSec: item.payload.durationSec,
        meta: {
          ...item.payload.meta,
          syncAttempt: retryCount + 1,
          syncedAt: new Date().toISOString(),
        }
      });
      
      clearQueuedScan(item.id || String(queued.indexOf(item)));
      successCount++;
      console.log(`✅ Synced scan: ${item.id}`, result.scan.id);
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Failed to sync scan ${item.id}:`, error);
      failedCount++;
      
      // Continue processing other items instead of stopping
      // The enhanced queue system will handle retry logic
    }
  }
  
  const summary = `Flush complete: ${successCount} successful, ${failedCount} failed, ${skippedCount} skipped`;
  console.log(summary);
  
  return { 
    success: successCount, 
    failed: failedCount, 
    skipped: skippedCount,
    summary 
  };
}

// Export the version that matches your current setup
export default flushQueuedScans;
