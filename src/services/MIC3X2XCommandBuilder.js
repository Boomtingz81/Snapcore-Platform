/**
 * MIC3X2X Command Builder
 * Constructs and validates commands for MIC3X2X multiprotocol OBD interpreter
 * Based on MIC3X2X DS Ver2.3.08 specification
 * Supports AT, ST, and VT command sets with enhanced MIC3X2X features
 */

class MIC3X2XCommandBuilder {
  constructor() {
    this.COMMAND_PREFIXES = {
      AT: 'AT',
      ST: 'ST', 
      VT: 'VT'
    };

    // Enhanced CAN types for MIC3X2X
    this.CAN_TYPES = {
      HS_CAN: 'HS_CAN',
      MS_CAN: 'MS_CAN', 
      SW_CAN: 'SW_CAN',
      CH_CAN: 'CH_CAN',    // New in MIC3X2X
      LS_CAN: 'LS_CAN'     // New in MIC3X2X
    };

    // MIC3X2X Limits
    this.LIMITS = {
      MAX_REQUEST_BYTES: 4128,
      MAX_UART_SPEED: 3000000,
      MAX_USER_PROTOCOLS: 64,
      VT_PROTOCOL_MIN: 101,
      VT_PROTOCOL_MAX: 140,
      MAX_WM_SEQUENCES: 8,
      MAX_PERIODIC_MESSAGES: 8,
      USER_EEPROM_SIZE: 256,
      MAX_CAN_FILTERS: 208,
      MAX_FC_PAIRS: 208
    };

    // Baud rate options for different interfaces
    this.BAUD_RATES = {
      UART: [9600, 38400, 57600, 115200, 230400, 460800, 921600, 1500000, 3000000],
      CAN_HS: [125000, 250000, 500000, 1000000],
      CAN_MS: [33300, 95238, 125000],
      CAN_SW: [33300, 83300],
      ISO: [1200, 4800, 9600, 10400, 12500, 15625]
    };

    // Switch group parameters for SWGP command
    this.SWITCH_PARAMS = {
      AL: 'ATAL', NL: 'ATNL',
      D0: 'ATD0', D1: 'ATD1',
      E0: 'ATE0', E1: 'ATE1', 
      H0: 'ATH0', H1: 'ATH1',
      L0: 'ATL0', L1: 'ATL1',
      M0: 'ATM0', M1: 'ATM1',
      R0: 'ATR0', R1: 'ATR1',
      S0: 'ATS0', S1: 'ATS1',
      V0: 'ATV0', V1: 'ATV1',
      W0: 'ATW0', W1: 'ATW1',
      AT0: 'ATAT0', AT1: 'ATAT1', AT2: 'ATAT2',
      KW0: 'ATKW0', KW1: 'ATKW1',
      CAF0: 'ATCAF0', CAF1: 'ATCAF1',
      CFC0: 'ATCFC0', CFC1: 'ATCFC1',
      CSM0: 'ATCSM0', CSM1: 'ATCSM1',
      JHF0: 'ATJHF0', JHF1: 'ATJHF1',
      GT0: 'STCSEGT0', GT1: 'STCSEGT1',
      GR0: 'STCSEGR0', GR1: 'STCSEGR1',
      PCB0: 'STPCB0', PCB1: 'STPCB1',
      IAT0: 'STIAT0', IAT1: 'STIAT1',
      FC0: 'STFAC', FC1: 'STFA',
      IMCS0: 'STIMCS0', IMCS1: 'STIMCS1',
      BZF0: 'BZF0', BZF1: 'BZF1',
      CRF0: 'CRF0', CRF1: 'CRF1',
      FCDA0: 'FCDA0', FCDA1: 'FCDA1',
      DRB0: 'DRB0', DRB1: 'DRB1',
      BOOST0: 'BOOST0', BOOST1: 'BOOST1',
      HEX0: 'HEX0', HEX1: 'HEX1'
    };

    // Timeout types for TOST command
    this.TIMEOUT_TYPES = {
      IP1X: 'IP1X',    // ISO/KWP P1 max interbyte time
      IP4: 'IP4',      // ISO/KWP P4 interbyte time
      REP: 'REP',      // Request to reply timeout
      REQ: 'REQ',      // Message sending timeout
      REPQ: 'REPQ',    // Reply to next request interval
      CFST: 'CFST',    // Adaptive separation time
      HTOT: 'HTOT',    // UART inactive timeout
      BTDC: 'BTDC'     // Bluetooth auto disconnect time
    };
  }

  // ================== BASIC AT COMMANDS ==================

  /**
   * Reset device
   */
  buildReset() {
    return 'ATZ';
  }

  /**
   * Get device information
   */
  buildGetInfo() {
    return 'ATI';
  }

  /**
   * Set protocol
   */
  buildSetProtocol(protocol) {
    if (typeof protocol === 'number') {
      return `ATSP${protocol}`;
    }
    return `ATSP${protocol.toString().toUpperCase()}`;
  }

  /**
   * Get current protocol
   */
  buildGetProtocol() {
    return 'ATDP';
  }

  /**
   * Set header
   */
  buildSetHeader(header) {
    if (!this.isValidHex(header)) {
      throw new Error('Invalid header format');
    }
    return `ATSH${header.toUpperCase()}`;
  }

  /**
   * Monitor all messages
   */
  buildMonitorAll() {
    return 'ATMA';
  }

  // ================== ENHANCED AT COMMANDS ==================

  /**
   * Set CAN filter and mask
   */
  buildSetFilter(filter, mask) {
    const commands = [];
    if (filter) {
      commands.push(`ATCF${filter.toUpperCase()}`);
    }
    if (mask) {
      commands.push(`ATCM${mask.toUpperCase()}`);
    }
    return commands;
  }

  /**
   * Set CAN extended addressing
   */
  buildSetExtendedAddress(address) {
    if (!this.isValidHex(address, 2)) {
      throw new Error('Invalid extended address');
    }
    return `ATCEA${address.toUpperCase()}`;
  }

  /**
   * Link CAN physical interface to protocol - MIC3X2X specific
   */
  buildLinkCANInterface(canType, protocol) {
    const validTypes = {
      'HS_CAN': 'ATLNKHS',
      'MS_CAN': 'ATLNKMS', 
      'SW_CAN': 'ATLNKSW',
      'CH_CAN': 'ATLNKCH',  // New in MIC3X2X
      'LS_CAN': 'ATLNKLS'   // New in MIC3X2X
    };

    if (!validTypes[canType]) {
      throw new Error(`Invalid CAN type: ${canType}`);
    }

    return `${validTypes[canType]} P${protocol.toString().toUpperCase()}`;
  }

  // ================== VT COMMANDS - MIC3X2X SPECIFIC ==================

  /**
   * Get device version and info
   */
  buildVTDeviceInfo() {
    return [
      'VTVT',    // Company name
      'VTI',     // Device name  
      'VTVERS',  // Firmware version
      'VTPROI'   // Manufacturer
    ];
  }

  /**
   * Configure custom CAN protocol
   */
  buildConfigureCAN(protocolNum, option, baudRate, canType, mode = null) {
    if (protocolNum < this.LIMITS.VT_PROTOCOL_MIN || protocolNum > this.LIMITS.VT_PROTOCOL_MAX) {
      throw new Error(`Protocol number must be between ${this.LIMITS.VT_PROTOCOL_MIN}-${this.LIMITS.VT_PROTOCOL_MAX}`);
    }

    if (!Object.values(this.CAN_TYPES).includes(canType)) {
      throw new Error(`Invalid CAN type: ${canType}`);
    }

    let command = `VTCFG_CAN ${protocolNum.toString(16).toUpperCase()}, ${option.toString(16).toUpperCase()}, ${baudRate.toString(16).toUpperCase()}, ${canType}`;
    
    if (mode !== null && canType === 'SW_CAN') {
      if (mode < 0 || mode > 7) {
        throw new Error('SW CAN mode must be 0-7');
      }
      command += `, ${mode}`;
    }

    return command;
  }

  /**
   * Configure custom ISO protocol
   */
  buildConfigureISO(protocolNum, option, baudRate, initAddress = null) {
    if (protocolNum < this.LIMITS.VT_PROTOCOL_MIN || protocolNum > this.LIMITS.VT_PROTOCOL_MAX) {
      throw new Error(`Protocol number must be between ${this.LIMITS.VT_PROTOCOL_MIN}-${this.LIMITS.VT_PROTOCOL_MAX}`);
    }

    let command = `VTCFG_ISO ${protocolNum.toString(16).toUpperCase()}, ${option.toString(16).toUpperCase()}, ${baudRate.toString(16).toUpperCase()}`;
    
    if (initAddress !== null) {
      command += `, ${initAddress.toString(16).toUpperCase()}`;
    }

    return command;
  }

  /**
   * Set up CAN wake/hold message sequence
   */
  buildCANWakeMessage(sequenceNum, protocolNum, header, data, period, mode) {
    if (sequenceNum < 0 || sequenceNum > this.LIMITS.MAX_WM_SEQUENCES) {
      throw new Error(`Sequence number must be 0-${this.LIMITS.MAX_WM_SEQUENCES}`);
    }

    if (data.length > 8) {
      throw new Error('CAN data cannot exceed 8 bytes');
    }

    const dataStr = Array.isArray(data) ? data.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ') : data;
    
    return `VTCAN_WM ${sequenceNum}, ${protocolNum || 'XX'}, ${header || 'XX'}, ${dataStr}, ${period.toString(16).toUpperCase()}, ${mode}`;
  }

  /**
   * Set up ISO wake/hold message sequence  
   */
  buildISOWakeMessage(sequenceNum, protocolNum, header, data, period, control) {
    if (sequenceNum < 0 || sequenceNum > this.LIMITS.MAX_WM_SEQUENCES) {
      throw new Error(`Sequence number must be 0-${this.LIMITS.MAX_WM_SEQUENCES}`);
    }

    if (data.length > 5) {
      throw new Error('ISO data cannot exceed 5 bytes');
    }

    const dataStr = Array.isArray(data) ? data.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ') : data;
    
    return `VTISO_WM ${sequenceNum}, ${protocolNum || 'XX'}, ${header}, ${dataStr}, ${period.toString(16).toUpperCase()}, ${control}`;
  }

  /**
   * Set filter and mask in one command
   */
  buildSetFilterMask(filter, mask) {
    return `VTSET_FM ${filter.toUpperCase()}, ${mask.toUpperCase()}`;
  }

  /**
   * Set header, receiver, and timeout
   */
  buildSetHeaderComplete(header, receiver = null, timeout = null) {
    let command = `VTSET_HD ${header || 'XX'}`;
    
    if (receiver !== null) {
      command += `, ${receiver}`;
    }
    
    if (timeout !== null) {
      command += `, ${timeout.toString(16).toUpperCase()}`;
    }

    return command;
  }

  /**
   * Set CAN flow control frame
   */
  buildSetCANFlowControl(data, mode, header = null) {
    const dataStr = Array.isArray(data) ? data.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ') : data;
    
    let command = `VTSET_CAN_FC ${dataStr}, ${mode}`;
    
    if (header !== null) {
      command += `, ${header}`;
    }

    return command;
  }

  /**
   * Monitor bus with filter criteria
   */
  buildMonitorFiltered(filter, mask = null) {
    if (mask) {
      return `VTM ${filter.toUpperCase()}, ${mask.toUpperCase()}`;
    }
    return `VTM ${filter.toUpperCase()}`;
  }

  /**
   * Show bus activity and protocols
   */
  buildShowBusActivity(canType = null) {
    if (canType && Object.values(this.CAN_TYPES).includes(canType)) {
      return `VTSHOW_BUS ${canType}`;
    }
    return 'VTSHOW_BUS';
  }

  // ================== SWITCH GROUP COMMANDS ==================

  /**
   * Build switch group command for multiple settings
   */
  buildSwitchGroup(switches) {
    if (!Array.isArray(switches) || switches.length === 0) {
      throw new Error('Switches must be a non-empty array');
    }

    const validSwitches = switches.filter(sw => this.SWITCH_PARAMS[sw]);
    
    if (validSwitches.length === 0) {
      throw new Error('No valid switch parameters provided');
    }

    return `VTSWGP ${validSwitches.join(', ')}`;
  }

  // ================== TIMEOUT MANAGEMENT ==================

  /**
   * Set multiple timeout values
   */
  buildSetTimeouts(timeouts) {
    if (!timeouts || Object.keys(timeouts).length === 0) {
      throw new Error('Timeout parameters required');
    }

    const timeoutPairs = [];
    
    for (const [type, value] of Object.entries(timeouts)) {
      if (!this.TIMEOUT_TYPES[type]) {
        throw new Error(`Invalid timeout type: ${type}`);
      }
      timeoutPairs.push(`${type}:${value}`);
    }

    return `VTTOST ${timeoutPairs.join(', ')}`;
  }

  // ================== USER EEPROM COMMANDS ==================

  /**
   * Write to user EEPROM
   */
  buildWriteEEPROM(position, data) {
    if (position < 0 || position > 255) {
      throw new Error('EEPROM position must be 0-255');
    }

    if (!Array.isArray(data) || data.length === 0 || data.length > 8) {
      throw new Error('Data must be array of 1-8 bytes');
    }

    const posHex = position.toString(16).toUpperCase().padStart(2, '0');
    const dataStr = data.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
    
    return `VTWT_EE ${posHex}, ${dataStr}`;
  }

  /**
   * Read from user EEPROM
   */
  buildReadEEPROM(position, length) {
    if (position < 0 || position > 255) {
      throw new Error('EEPROM position must be 0-255');
    }

    if (length < 1 || length > 255) {
      throw new Error('Length must be 1-255');
    }

    const posHex = position.toString(16).toUpperCase().padStart(2, '0');
    const lenHex = length.toString(16).toUpperCase().padStart(2, '0');
    
    return `VTRD_EE ${posHex}, ${lenHex}`;
  }

  // ================== POWER MANAGEMENT ==================

  /**
   * Set power down voltage and timer
   */
  buildPowerDownSettings(voltage, timer) {
    if (voltage < 1.0 || voltage > 25.0) {
      throw new Error('Voltage must be between 1.0-25.0V');
    }

    if (timer < 1 || timer > 65535) {
      throw new Error('Timer must be between 1-65535 seconds');
    }

    return `VTPDVS ${voltage.toFixed(1)}, ${timer}`;
  }

  /**
   * Set voltage drop wake settings
   */
  buildVoltageDropWake(voltage, timer) {
    if (voltage < 0.1 || voltage > 9.9) {
      throw new Error('Voltage must be between 0.1-9.9V');
    }

    if (timer < 1 || timer > 100) {
      throw new Error('Timer must be between 1-100ms');
    }

    return `VTVDWK ${voltage.toFixed(1)}, ${timer}`;
  }

  /**
   * Set voltage change wake - New in MIC3X2X
   */
  buildVoltageChangeWake(direction, voltage, timer) {
    const validDirections = ['+', '-', ''];
    if (!validDirections.includes(direction)) {
      throw new Error('Direction must be "+", "-", or empty');
    }

    if (voltage < 0.1 || voltage > 8.0) {
      throw new Error('Voltage must be between 0.1-8.0V');
    }

    if (timer < 1 || timer > 65535) {
      throw new Error('Timer must be between 1-65535ms');
    }

    return `VTVLCW ${direction}${voltage.toFixed(1)}, ${timer}`;
  }

  // ================== MULTI-PACKET TRANSMISSION ==================

  /**
   * Request multi-packet transmission setup
   */
  buildTransmissionRequest(totalLength, blockSize, enableChecksum = false) {
    if (totalLength < 50 || totalLength > this.LIMITS.MAX_REQUEST_BYTES) {
      throw new Error(`Total length must be between 50-${this.LIMITS.MAX_REQUEST_BYTES} bytes`);
    }

    if (blockSize > 500) {
      throw new Error('Block size cannot exceed 500 bytes');
    }

    let command = `VTTP_RTS ${totalLength}, ${blockSize}`;
    
    if (enableChecksum) {
      command += ', 1';
    }

    return command;
  }

  /**
   * Send data packet
   */
  buildDataPacket(packetNumber, data, checksum = null) {
    const dataStr = Array.isArray(data) ? 
      data.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ') : 
      data;

    let command = `VTTP_DT ${packetNumber.toString(16).toUpperCase().padStart(2, '0')} ${dataStr}`;
    
    if (checksum !== null) {
      command += ` ${checksum.toString(16).toUpperCase().padStart(2, '0')}`;
    }

    return command;
  }

  // ================== BLUETOOTH MANAGEMENT - MIC3X2X SPECIFIC ==================

  /**
   * Bluetooth module configuration commands
   */
  buildBluetoothConfig(parameter, value = null) {
    const validParams = ['COD', 'DM', 'DN', 'HCIBAUD', 'I', 'LEDN', 'PIN', 'PKPARAM', 'PM', 'WM'];
    
    if (!validParams.includes(parameter)) {
      throw new Error(`Invalid Bluetooth parameter: ${parameter}`);
    }

    if (value !== null) {
      return `VTBTMD ${parameter} ${value}`;
    }
    
    return `VTBTMD ${parameter}`;
  }

  // ================== VALIDATION HELPERS ==================

  /**
   * Validate hexadecimal string
   */
  isValidHex(hex, exactLength = null) {
    if (typeof hex !== 'string') return false;
    
    const cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '');
    
    if (exactLength && cleanHex.length !== exactLength) {
      return false;
    }
    
    return /^[0-9A-Fa-f]+$/.test(cleanHex);
  }

  /**
   * Validate data array
   */
  isValidDataArray(data, maxLength = 8) {
    if (!Array.isArray(data)) return false;
    if (data.length === 0 || data.length > maxLength) return false;
    
    return data.every(byte => 
      Number.isInteger(byte) && byte >= 0 && byte <= 255
    );
  }

  /**
   * Convert hex string to byte array
   */
  hexToBytes(hex) {
    const cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '');
    const bytes = [];
    
    for (let i = 0; i < cleanHex.length; i += 2) {
      const byte = parseInt(cleanHex.substr(i, 2), 16);
      bytes.push(byte);
    }
    
    return bytes;
  }

  /**
   * Convert byte array to hex string
   */
  bytesToHex(bytes) {
    return bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
  }

  /**
   * Get available baud rates for interface type
   */
  getAvailableBaudRates(interfaceType) {
    return this.BAUD_RATES[interfaceType] || [];
  }

  /**
   * Get switch parameter description
   */
  getSwitchDescription(switchParam) {
    const descriptions = {
      AL: 'Allow Long messages',
      NL: 'Normal Length messages', 
      E0: 'Echo off', E1: 'Echo on',
      H0: 'Headers off', H1: 'Headers on',
      S0: 'Spaces off', S1: 'Spaces on',
      CAF0: 'CAN Auto Formatting off', CAF1: 'CAN Auto Formatting on',
      CSM0: 'Silent Monitoring off', CSM1: 'Silent Monitoring on'
    };
    
    return descriptions[switchParam] || 'Unknown parameter';
  }

  /**
   * Validate command syntax
   */
  validateCommand(command) {
    if (!command || typeof command !== 'string') {
      return { valid: false, error: 'Command must be a non-empty string' };
    }

    const cmd = command.trim().toUpperCase();
    
    // Check for valid prefixes
    const hasValidPrefix = Object.values(this.COMMAND_PREFIXES).some(prefix => 
      cmd.startsWith(prefix)
    );

    if (!hasValidPrefix) {
      return { valid: false, error: 'Command must start with AT, ST, or VT' };
    }

    // Additional validation can be added here

    return { valid: true, error: null };
  }
}

export default MIC3X2XCommandBuilder;