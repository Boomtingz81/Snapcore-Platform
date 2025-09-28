// 📂 FILE: src/services/SnapCoreWebSocketBridge.js
import { EventEmitter } from 'events';

/**
 * WebSocket Bridge for SnapCore Python Backend Communication
 * Handles all communication between React frontend and Python diagnostic core
 */
class SnapCoreWebSocketBridge extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 2000;
    this.isConnected = false;
    this.messageQueue = [];
    this.sessionId = null;
    
    // Configuration
    this.config = {
      // Adjust these based on your Python backend configuration
      host: process.env.REACT_APP_SNAPCORE_HOST || 'localhost',
      port: process.env.REACT_APP_SNAPCORE_PORT || '8765',
      protocol: process.env.REACT_APP_SNAPCORE_PROTOCOL || 'ws',
      path: process.env.REACT_APP_SNAPCORE_PATH || '/snapcore'
    };
    
    this.url = `${this.config.protocol}://${this.config.host}:${this.config.port}${this.config.path}`;
    
    // Auto-connect on instantiation
    this.connect();
  }

  /**
   * Establish WebSocket connection to Python backend
   */
  connect() {
    try {
      console.log(`[SnapCore Bridge] Connecting to ${this.url}`);
      
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      
    } catch (error) {
      console.error('[SnapCore Bridge] Connection failed:', error);
      this.handleReconnect();
    }
  }

  /**
   * Handle WebSocket connection opened
   */
  handleOpen(event) {
    console.log('[SnapCore Bridge] Connected to Python backend');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Generate session ID
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Send initialization message
    this.send({
      type: 'init',
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      clientInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      }
    });
    
    // Process queued messages
    this.processMessageQueue();
    
    this.emit('connected', { sessionId: this.sessionId });
  }

  /**
   * Handle incoming messages from Python backend
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      console.log('[SnapCore Bridge] Received:', data);
      
      // Handle different message types
      switch (data.type) {
        case 'diagnostic_data':
          this.emit('diagnosticData', data.payload);
          break;
          
        case 'fault_codes':
          this.emit('faultCodes', data.payload);
          break;
          
        case 'live_data':
          this.emit('liveData', data.payload);
          break;
          
        case 'scan_complete':
          this.emit('scanComplete', data.payload);
          break;
          
        case 'vehicle_info':
          this.emit('vehicleInfo', data.payload);
          break;
          
        case 'error':
          this.emit('error', data.payload);
          break;
          
        case 'status':
          this.emit('status', data.payload);
          break;
          
        case 'python_log':
          this.emit('pythonLog', data.payload);
          break;
          
        default:
          console.warn('[SnapCore Bridge] Unknown message type:', data.type);
          this.emit('unknownMessage', data);
      }
      
    } catch (error) {
      console.error('[SnapCore Bridge] Failed to parse message:', error);
    }
  }

  /**
   * Handle WebSocket connection closed
   */
  handleClose(event) {
    console.log('[SnapCore Bridge] Connection closed:', event.code, event.reason);
    this.isConnected = false;
    this.emit('disconnected', { code: event.code, reason: event.reason });
    
    // Attempt reconnection if not intentionally closed
    if (event.code !== 1000) {
      this.handleReconnect();
    }
  }

  /**
   * Handle WebSocket errors
   */
  handleError(error) {
    console.error('[SnapCore Bridge] WebSocket error:', error);
    this.emit('error', error);
  }

  /**
   * Handle reconnection logic
   */
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[SnapCore Bridge] Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval * this.reconnectAttempts);
      
    } else {
      console.error('[SnapCore Bridge] Max reconnection attempts reached');
      this.emit('reconnectFailed');
    }
  }

  /**
   * Send message to Python backend
   */
  send(message) {
    const payload = {
      ...message,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };
    
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(payload));
        console.log('[SnapCore Bridge] Sent:', payload);
      } catch (error) {
        console.error('[SnapCore Bridge] Send failed:', error);
        this.messageQueue.push(payload);
      }
    } else {
      // Queue message for later
      this.messageQueue.push(payload);
      console.log('[SnapCore Bridge] Message queued (not connected)');
    }
  }

  /**
   * Process queued messages
   */
  processMessageQueue() {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  // ========================================
  // Diagnostic Commands
  // ========================================

  /**
   * Start vehicle diagnostic scan
   */
  startDiagnosticScan(vehicleData) {
    this.send({
      type: 'start_diagnostic',
      payload: {
        vehicle: vehicleData,
        scanTypes: ['dtc', 'live_data', 'freeze_frame'],
        priority: 'high'
      }
    });
  }

  /**
   * Request live data stream
   */
  startLiveData(pids = []) {
    this.send({
      type: 'start_live_data',
      payload: {
        pids: pids.length > 0 ? pids : ['default'],
        interval: 100, // milliseconds
        format: 'json'
      }
    });
  }

  /**
   * Stop live data stream
   */
  stopLiveData() {
    this.send({
      type: 'stop_live_data',
      payload: {}
    });
  }

  /**
   * Clear diagnostic trouble codes
   */
  clearDTC() {
    this.send({
      type: 'clear_dtc',
      payload: {
        confirm: true
      }
    });
  }

  /**
   * Request vehicle information
   */
  getVehicleInfo(vin = null, registration = null) {
    this.send({
      type: 'get_vehicle_info',
      payload: {
        vin,
        registration,
        includeSpecs: true
      }
    });
  }

  /**
   * Execute VLinker command
   */
  executeVLinkerCommand(command, parameters = {}) {
    this.send({
      type: 'vlinker_command',
      payload: {
        command,
        parameters,
        timeout: 30000
      }
    });
  }

  /**
   * Test OBD connection
   */
  testOBDConnection() {
    this.send({
      type: 'test_connection',
      payload: {
        adapter: 'auto_detect',
        protocols: ['auto']
      }
    });
  }

  /**
   * Request specific PID data
   */
  requestPID(pid, mode = '01') {
    this.send({
      type: 'request_pid',
      payload: {
        pid,
        mode,
        format: 'processed'
      }
    });
  }

  /**
   * Perform DPF regeneration
   */
  performDPFRegeneration(vehicleData) {
    this.send({
      type: 'dpf_regeneration',
      payload: {
        vehicle: vehicleData,
        type: 'forced',
        monitoring: true
      }
    });
  }

  /**
   * Execute ECU reset/programming
   */
  executeECUReset(resetType, ecuData) {
    this.send({
      type: 'ecu_reset',
      payload: {
        resetType, // 'soft', 'hard', 'programming'
        ecuData,
        backup: true
      }
    });
  }

  // ========================================
  // File and Data Management
  // ========================================

  /**
   * Request expected files list
   */
  getExpectedFiles() {
    this.send({
      type: 'get_expected_files',
      payload: {}
    });
  }

  /**
   * Upload dataset to Python backend
   */
  uploadDataset(datasetData, datasetType) {
    this.send({
      type: 'upload_dataset',
      payload: {
        data: datasetData,
        type: datasetType,
        format: 'json'
      }
    });
  }

  /**
   * Request missing files log
   */
  getMissingFilesLog() {
    this.send({
      type: 'get_missing_files',
      payload: {}
    });
  }

  // ========================================
  // Vehicle Policy Management
  // ========================================

  /**
   * Load vehicle-specific policy
   */
  loadVehiclePolicy(make, model, year, type = 'standard') {
    this.send({
      type: 'load_vehicle_policy',
      payload: {
        make,
        model,
        year,
        policyType: type,
        includeEV: true
      }
    });
  }

  /**
   * Get available vehicle policies
   */
  getAvailablePolicies() {
    this.send({
      type: 'get_policies',
      payload: {}
    });
  }

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Close WebSocket connection
   */
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      sessionId: this.sessionId,
      queuedMessages: this.messageQueue.length,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Ping Python backend
   */
  ping() {
    this.send({
      type: 'ping',
      payload: {
        timestamp: Date.now()
      }
    });
  }
}

// Singleton instance
let bridgeInstance = null;

/**
 * Get singleton instance of SnapCore WebSocket Bridge
 */
export const getSnapCoreBridge = () => {
  if (!bridgeInstance) {
    bridgeInstance = new SnapCoreWebSocketBridge();
  }
  return bridgeInstance;
};

/**
 * React Hook for SnapCore WebSocket Bridge
 */
export const useSnapCoreBridge = () => {
  const bridge = getSnapCoreBridge();
  
  return {
    bridge,
    isConnected: bridge.isConnected,
    sessionId: bridge.sessionId,
    send: bridge.send.bind(bridge),
    startDiagnostic: bridge.startDiagnosticScan.bind(bridge),
    startLiveData: bridge.startLiveData.bind(bridge),
    stopLiveData: bridge.stopLiveData.bind(bridge),
    clearDTC: bridge.clearDTC.bind(bridge),
    getVehicleInfo: bridge.getVehicleInfo.bind(bridge),
    testConnection: bridge.testOBDConnection.bind(bridge),
    ping: bridge.ping.bind(bridge)
  };
};

export default SnapCoreWebSocketBridge;