/**
 * MIC3X2X OBD-II Interface Service
 * Provides comprehensive communication interface for MIC3X2X multiprotocol OBD interpreter
 * Based on MIC3X2X DS Ver2.3.08 specification
 */

class MIC3X2XService {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.connected = false;
    this.currentProtocol = null;
    this.responseBuffer = '';
    this.commandQueue = [];
    this.isProcessingQueue = false;
    this.listeners = new Map();
    
    // MIC3X2X Specifications
    this.SPECS = {
      FIRMWARE_VERSION: 'v2.3.08',
      MAX_REQUEST_BYTES: 4128,
      MAX_UART_SPEED: 3000000,
      DEFAULT_UART_SPEED: 115200,
      MAX_UART_BUFFER: 8192, // 8K bytes
      MAX_USER_PROTOCOLS: 64,
      MAX_CAN_FILTERS: 208,
      MAX_FC_PAIRS: 208,
      USER_EEPROM_SIZE: 256,
      VT_PROTOCOL_RANGE: { MIN: 101, MAX: 140 },
      EEPROM_WRITE_CYCLES: 10000
    };

    // Supported CAN Types
    this.CAN_TYPES = {
      HS_CAN: 'HS_CAN',    // High Speed CAN
      MS_CAN: 'MS_CAN',    // Medium Speed CAN  
      SW_CAN: 'SW_CAN',    // Single Wire CAN
      CH_CAN: 'CH_CAN',    // GM Chassis High Speed CAN
      LS_CAN: 'LS_CAN'     // Low Speed/Fault Tolerant CAN
    };

    // AT Protocol Numbers (ELM327 Compatible)
    this.AT_PROTOCOLS = {
      AUTO: 0,
      SAE_J1850_PWM: 1,
      SAE_J1850_VPW: 2,
      ISO_9141_2: 3,
      ISO_14230_4_KWP_5BAUD: 4,
      ISO_14230_4_KWP_FAST: 5,
      ISO_15765_4_CAN_11_500: 6,
      ISO_15765_4_CAN_29_500: 7,
      ISO_15765_4_CAN_11_250: 8,
      ISO_15765_4_CAN_29_250: 9,
      SAE_J1939_CAN: 'A',
      USER_1_CAN: 'B',
      USER_2_CAN: 'C',
      USER_3_CAN: 'D',
      USER_4_CAN: 'E',
      USER_5_CAN: 'F'
    };

    // ST Protocol Numbers (STN Compatible)
    this.ST_PROTOCOLS = {
      J1850_PWM: 0x11,
      J1850_VPW: 0x12,
      ISO_9141: 0x21,
      ISO_14230_5BAUD: 0x22,
      ISO_14230_FAST: 0x25,
      HS_CAN_11BIT: 0x33,
      HS_CAN_29BIT: 0x34,
      MS_CAN_11BIT: 0x53,
      MS_CAN_29BIT: 0x54,
      SW_CAN_11BIT: 0x63,
      SW_CAN_29BIT: 0x64,
      CH_CAN_11BIT: 0xC3,
      CH_CAN_29BIT: 0xC4,
      LS_CAN_11BIT: 0xD3,
      LS_CAN_29BIT: 0xD4
    };

    // VT Commands (91 total commands)
    this.VT_COMMANDS = {
      // Basic Info Commands
      D: 'D',                                    // Display company name
      I: 'I',                                    // Display device name
      PROI: 'PROI',                             // Display manufacturer
      VERS: 'VERS',                             // Display firmware version
      
      // Protocol Management
      P1: 'P1',                                 // Switch VT protocol
      P2: 'P2',                                 // Switch ST protocol  
      PRON: 'PRON',                             // Display current protocol number
      PROT: 'PROT',                             // Display protocol description
      PC: 'PC',                                 // Protocol close
      PO: 'PO',                                 // Protocol open
      PBR: 'PBR',                              // Set protocol baud rate
      PBRD: 'PBRD',                            // Display protocol baud rate
      
      // UART Management
      UART_BAUD_SET: 'UART_BAUD_SET',          // Set UART baud rate
      
      // Protocol Configuration
      CFG_CAN: 'CFG_CAN',                      // Configure CAN protocol
      SET_CAN: 'SET_CAN',                      // Set CAN protocol options
      CFG_ISO: 'CFG_ISO',                      // Configure ISO protocol
      
      // Wake/Hold Sequences
      CAN_WM: 'CAN_WM',                        // CAN wake/hold message
      ISO_WM: 'ISO_WM',                        // ISO wake/hold message
      DEL_CAN_WM: 'DEL_CAN_WM',               // Delete CAN wake message
      DEL_ISO_WM: 'DEL_ISO_WM',               // Delete ISO wake message
      DISP_CAN_WM: 'DISP_CAN_WM',             // Display CAN wake message
      DISP_ISO_WM: 'DISP_ISO_WM',             // Display ISO wake message
      
      // Filter and Mask Settings
      SET_FM: 'SET_FM',                        // Set filter and mask
      SET_CAN_FC: 'SET_CAN_FC',               // Set CAN flow control
      SET_HD: 'SET_HD',                        // Set header and receiver
      
      // Timing Controls
      FCST: 'FCST',                           // FC frame timeout
      SDST: 'SDST',                           // Multi-frame send interval
      
      // ISO Fast Init
      ISOFI: 'ISOFI',                         // ISO fast initialization
      
      // Filter Management
      FBA: 'FBA',                             // Block filter add/clear
      FPA: 'FPA',                             // Pass filter add/clear  
      FCPA: 'FCPA',                           // Flow control filter add/clear
      FCTRA: 'FCTRA',                         // Flow control address pair
      
      // Monitoring
      M: 'M',                                 // Monitor with filter
      MFCA: 'MFCA',                           // Monitor with current filters
      SHOW_BUS: 'SHOW_BUS',                   // Show bus activity
      
      // Protocol Display
      AT_PROTOCOL_ALL: 'AT_PROTOCOL_ALL',      // Show all AT protocols
      ST_PROTOCOL_ALL: 'ST_PROTOCOL_ALL',      // Show all ST protocols  
      VT_PROTOCOL_ALL: 'VT_PROTOCOL_ALL',      // Show all VT protocols
      
      // User Configuration Strings
      UCS_ATI: 'UCS_ATI',                     // Set ATI string
      UCS_ATDI: 'UCS_ATDI',                   // Set AT@1 string
      UCS_STDI: 'UCS_STDI',                   // Set STDI string
      UCS_STI: 'UCS_STI',                     // Set STI string
      UCS_MFR: 'UCS_MFR',                     // Set STMFR string
      UCS_VTI: 'UCS_VTI',                     // Set VTI string
      UCS_PROI: 'UCS_PROI',                   // Set VTPROI string
      
      // Device Management
      SET_UDS: 'SET_UDS',                     // Set unique device ID
      SET_MAC: 'SET_MAC',                     // Set MAC address
      RD_MAC: 'RD_MAC',                       // Read MAC address
      RD_UDS: 'RD_UDS',                       // Read unique device ID
      RDSN: 'RDSN',                           // Read serial number
      
      // User EEPROM
      WT_EE: 'WT_EE',                         // Write EEPROM
      RD_EE: 'RD_EE',                         // Read EEPROM
      
      // Power Management
      POWERMANAGE: 'POWERMANAGE',             // Show power settings
      PDVS: 'PDVS',                           // Power down voltage/time
      VDWK: 'VDWK',                           // Voltage drop wake
      VLCW: 'VLCW',                           // Voltage change wake
      VLRD: 'VLRD',                           // Voltage read
      
      // Switch Group
      SWGP: 'SWGP',                           // Switch group settings
      SWSC: 'SWSC',                           // SW CAN auto speed
      SWRS: 'SWRS',                           // SW CAN load resistor
      
      // Timeouts
      TOST: 'TOST',                           // Set timeout types
      
      // Multi-packet Transmission
      TP_RTS: 'TP_RTS',                       // Request transmission setup
      TP_DT: 'TP_DT',                         // Data transmission
      TP_END: 'TP_END',                       // End transmission
      TP_ABORT: 'TP_ABORT',                   // Abort transmission
      
      // Programming Support
      FEPS: 'FEPS',                           // FEPS voltage control
      FULLY_REQUEST: 'FullyRequest',           // Full programming request
      FULLY_REQUEST_CK: 'FullyRequestCk',     // Full programming with checksum
      TSPA: 'TSPA',                           // Request with variadic args
      
      // Periodic Messages
      PMQE: 'PMQE',                           // Periodic message queue
      PMQE_PRT: 'PMQE_PRT',                   // Print periodic messages
      WMGP: 'WMGP',                           // Wake message group
      WMGP_PRT: 'WMGP_PRT',                   // Print wake message group
      
      // Bluetooth Management
      BTMD: 'BTMD'                            // Bluetooth module control
    };

    // Command Response Patterns
    this.RESPONSE_PATTERNS = {
      OK: /^OK$/,
      ERROR: /^\?$/,
      SEARCHING: /SEARCHING/,
      UNABLE_TO_CONNECT: /UNABLE TO CONNECT/,
      NO_DATA: /NO DATA/,
      BUS_ERROR: /BUS ERROR/,
      DATA_ERROR: /DATA ERROR/,
      BUFFER_FULL: /BUFFER FULL/,
      BUFFER_SMALL: /BUFFER SMALL/,
      CAN_ERROR: /CAN ERROR/,
      HEX_DATA: /^[0-9A-F\s]+$/i,
      VOLTAGE: /^\d+\.\d+V$/,
      PROMPT: />$/
    };
  }

  /**
   * Initialize connection to MIC3X2X device
   */
  async connect(options = {}) {
    try {
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API not supported');
      }

      const portOptions = {
        baudRate: options.baudRate || this.SPECS.DEFAULT_UART_SPEED,
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        flowControl: 'none',
        bufferSize: this.SPECS.MAX_UART_BUFFER
      };

      this.port = await navigator.serial.requestPort();
      await this.port.open(portOptions);

      this.reader = this.port.readable.getReader();
      this.writer = this.port.writable.getWriter();
      this.connected = true;

      // Start reading responses
      this.startReading();

      // Initialize device
      await this.initialize();
      
      this.emit('connected', { baudRate: portOptions.baudRate });
      return true;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Disconnect from device
   */
  async disconnect() {
    try {
      if (this.reader) {
        await this.reader.cancel();
        await this.reader.releaseLock();
        this.reader = null;
      }

      if (this.writer) {
        await this.writer.releaseLock();
        this.writer = null;
      }

      if (this.port) {
        await this.port.close();
        this.port = null;
      }

      this.connected = false;
      this.emit('disconnected');
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * Send command to MIC3X2X
   */
  async sendCommand(command, timeout = 5000) {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        reject(new Error('Device not connected'));
        return;
      }

      const commandData = {
        command,
        resolve,
        reject,
        timeout: setTimeout(() => {
          reject(new Error(`Command timeout: ${command}`));
        }, timeout),
        timestamp: Date.now()
      };

      this.commandQueue.push(commandData);
      
      if (!this.isProcessingQueue) {
        this.processCommandQueue();
      }
    });
  }

  /**
   * Process command queue
   */
  async processCommandQueue() {
    if (this.isProcessingQueue || this.commandQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.commandQueue.length > 0) {
      const commandData = this.commandQueue.shift();
      
      try {
        const response = await this.executeCommand(commandData);
        clearTimeout(commandData.timeout);
        commandData.resolve(response);
      } catch (error) {
        clearTimeout(commandData.timeout);
        commandData.reject(error);
      }

      // Small delay between commands
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    this.isProcessingQueue = false;
  }

  /**
   * Execute single command
   */
  async executeCommand(commandData) {
    const { command } = commandData;
    
    // Send command
    const encoder = new TextEncoder();
    const commandBytes = encoder.encode(command + '\r');
    await this.writer.write(commandBytes);

    this.emit('commandSent', { command, timestamp: Date.now() });

    // Wait for response
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkResponse = () => {
        if (this.responseBuffer.includes('>')) {
          const response = this.responseBuffer.substring(0, this.responseBuffer.indexOf('>'));
          this.responseBuffer = this.responseBuffer.substring(this.responseBuffer.indexOf('>') + 1);
          
          const cleanResponse = response.trim();
          this.emit('commandResponse', { command, response: cleanResponse, timestamp: Date.now() });
          resolve(cleanResponse);
        } else if (Date.now() - startTime > 10000) {
          reject(new Error('Response timeout'));
        } else {
          setTimeout(checkResponse, 10);
        }
      };
      
      setTimeout(checkResponse, 10);
    });
  }

  /**
   * Start reading responses from device
   */
  async startReading() {
    try {
      while (this.connected && this.reader) {
        const { value, done } = await this.reader.read();
        if (done) break;

        const decoder = new TextDecoder();
        const text = decoder.decode(value);
        this.responseBuffer += text;

        this.emit('dataReceived', { data: text, timestamp: Date.now() });
      }
    } catch (error) {
      if (this.connected) {
        this.emit('error', error);
      }
    }
  }

  /**
   * Initialize device with basic setup
   */
  async initialize() {
    try {
      // Reset device
      await this.sendCommand('ATZ');
      
      // Get device info
      const version = await this.sendCommand('VT' + this.VT_COMMANDS.VERS);
      const deviceName = await this.sendCommand('VT' + this.VT_COMMANDS.I);
      
      this.emit('initialized', {
        version,
        deviceName,
        timestamp: Date.now()
      });

    } catch (error) {
      throw new Error(`Initialization failed: ${error.message}`);
    }
  }

  /**
   * Get device information
   */
  async getDeviceInfo() {
    try {
      const [version, deviceName, company, manufacturer] = await Promise.all([
        this.sendCommand('VT' + this.VT_COMMANDS.VERS),
        this.sendCommand('VT' + this.VT_COMMANDS.I),
        this.sendCommand('VT' + this.VT_COMMANDS.D),
        this.sendCommand('VT' + this.VT_COMMANDS.PROI)
      ]);

      return {
        version: version.replace('MIC3X2X ', ''),
        deviceName,
        company,
        manufacturer,
        specs: this.SPECS
      };
    } catch (error) {
      throw new Error(`Failed to get device info: ${error.message}`);
    }
  }

  /**
   * Set UART baud rate
   */
  async setUARTBaudRate(baudRate, timeout = 1000) {
    if (baudRate > this.SPECS.MAX_UART_SPEED) {
      throw new Error(`Baud rate exceeds maximum: ${this.SPECS.MAX_UART_SPEED}`);
    }

    const command = `VT${this.VT_COMMANDS.UART_BAUD_SET} ${baudRate}, ${timeout}`;
    return await this.sendCommand(command);
  }

  /**
   * Configure custom VT protocol
   */
  async configureCANProtocol(protocolNum, option, baudRate, canType, mode = null) {
    if (protocolNum < this.SPECS.VT_PROTOCOL_RANGE.MIN || 
        protocolNum > this.SPECS.VT_PROTOCOL_RANGE.MAX) {
      throw new Error('Protocol number out of range (101-140)');
    }

    if (!Object.values(this.CAN_TYPES).includes(canType)) {
      throw new Error(`Invalid CAN type: ${canType}`);
    }

    let command = `VT${this.VT_COMMANDS.CFG_CAN} ${protocolNum.toString(16).toUpperCase()}, ${option.toString(16).toUpperCase()}, ${baudRate.toString(16).toUpperCase()}, ${canType}`;
    
    if (mode !== null && canType === this.CAN_TYPES.SW_CAN) {
      command += `, ${mode}`;
    }

    return await this.sendCommand(command);
  }

  /**
   * Event listener management
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      });
    }
  }

  /**
   * Check if device is connected
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Get current connection status
   */
  getStatus() {
    return {
      connected: this.connected,
      currentProtocol: this.currentProtocol,
      queueLength: this.commandQueue.length,
      processing: this.isProcessingQueue
    };
  }
}

export default MIC3X2XService;