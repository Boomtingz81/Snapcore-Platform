/**
 * MIC3X2X Data Parser
 * Parses responses from MIC3X2X multiprotocol OBD interpreter
 * Based on MIC3X2X DS Ver2.3.08 specification
 * Handles AT, ST, and VT command responses with enhanced MIC3X2X features
 */

class MIC3X2XDataParser {
  constructor() {
    // Enhanced response patterns for MIC3X2X
    this.RESPONSE_PATTERNS = {
      // Basic responses
      OK: /^OK$/,
      ERROR: /^\?$/,
      SEARCHING: /SEARCHING/,
      UNABLE_TO_CONNECT: /UNABLE TO CONNECT/,
      NO_DATA: /NO DATA/,
      BUS_ERROR: /BUS ERROR/,
      DATA_ERROR: /DATA ERROR/,
      BUFFER_FULL: /BUFFER FULL/,
      BUFFER_SMALL: /BUFFER SMALL/,  // New in MIC3X2X
      CAN_ERROR: /CAN ERROR/,
      OUT_OF_MEMORY: /OUT OF MEMORY/,
      ACT_ALERT: /ACT ALERT/,
      LP_ALERT: /LP ALERT/,

      // Data patterns
      HEX_DATA: /^[0-9A-F\s]+$/i,
      VOLTAGE: /^\d+\.\d+V$/,
      PROMPT: />$/,
      
      // Protocol patterns
      PROTOCOL_AT: /\[AT\]$/,
      PROTOCOL_ST: /\[ST\]$/,
      PROTOCOL_VT: /\[VT\]$/,
      
      // Enhanced patterns for MIC3X2X
      MAC_ADDRESS: /^[0-9A-F]{2}(-[0-9A-F]{2}){5,11}$/i,
      SERIAL_NUMBER: /^[0-9A-F]{48}$/i,
      FIRMWARE_VERSION: /MIC3X2X\s+V\d+\.\d+\.\d+/i,
      
      // Bus activity patterns
      BUS_INACTIVE: /Inativly/,
      BUS_PWM: /P:\s*PWM/,
      BUS_VPW: /P:\s*VPW/,
      BUS_ISO: /P:\s*ISO/,
      BUS_HSCAN: /P:\s*HSCAN/,
      BUS_MSCAN: /P:\s*MSCAN/,
      BUS_SWCAN: /P:\s*SWCAN/,
      
      // Wake message patterns
      WM_DISPLAY: /No:(\d+);\s*P:([0-9A-F]+);\s*H:([0-9A-F]+);\s*D:\[?([0-9A-F\s]+)\]?;\s*T:([0-9A-F]+)[,;]\s*[MC]:([0-9A-F]+)/i,
      
      // Multi-frame ISO15765 patterns
      MULTI_FRAME_START: /^([0-9A-F]+)\s+([0-9A-F]{2})\s+1([0-9A-F])\s+([0-9A-F]{2})/i,
      MULTI_FRAME_CONTINUE: /^([0-9A-F]+)\s+([0-9A-F]{2})\s+2([0-9A-F])/i,
      
      // Power management patterns
      POWER_SLEEP: /SLEEP:/,
      POWER_WAKE: /WAKE:/,
      
      // Error patterns specific to MIC3X2X features
      HEADER_FORMAT_ERROR: /Header format error/,
      PROTOCOL_INPUT_ERROR: /Protocol input error/,
      PROTOCOL_NOT_EXIST: /Agreement does not exist/
    };

    // CAN types supported by MIC3X2X
    this.CAN_TYPES = {
      HS_CAN: 'HS_CAN',
      MS_CAN: 'MS_CAN', 
      SW_CAN: 'SW_CAN',
      CH_CAN: 'CH_CAN',
      LS_CAN: 'LS_CAN'
    };

    // OBD mode definitions
    this.OBD_MODES = {
      '01': 'Show current data',
      '02': 'Show freeze frame data',
      '03': 'Show stored DTCs',
      '04': 'Clear DTCs',
      '05': 'Test results, oxygen sensor monitoring',
      '06': 'Test results, other component/system monitoring',
      '07': 'Show pending DTCs',
      '08': 'Control operation of on-board component/system',
      '09': 'Request vehicle information',
      '0A': 'Permanent DTCs'
    };

    // Enhanced PID definitions for MIC3X2X
    this.PIDS = {
      // Mode 01 PIDs
      '00': { name: 'PIDs supported [01-20]', unit: 'bitmap', formula: 'bitmap' },
      '01': { name: 'Monitor status since DTCs cleared', unit: 'bitmap', formula: 'bitmap' },
      '02': { name: 'Freeze DTC', unit: '', formula: 'raw' },
      '03': { name: 'Fuel system status', unit: 'bitmap', formula: 'bitmap' },
      '04': { name: 'Calculated engine load', unit: '%', formula: 'A*100/255' },
      '05': { name: 'Engine coolant temperature', unit: '°C', formula: 'A-40' },
      '06': { name: 'Short term fuel trim—Bank 1', unit: '%', formula: '(A-128)*100/128' },
      '07': { name: 'Long term fuel trim—Bank 1', unit: '%', formula: '(A-128)*100/128' },
      '08': { name: 'Short term fuel trim—Bank 2', unit: '%', formula: '(A-128)*100/128' },
      '09': { name: 'Long term fuel trim—Bank 2', unit: '%', formula: '(A-128)*100/128' },
      '0A': { name: 'Fuel pressure', unit: 'kPa', formula: 'A*3' },
      '0B': { name: 'Intake manifold absolute pressure', unit: 'kPa', formula: 'A' },
      '0C': { name: 'Engine RPM', unit: 'rpm', formula: '((A*256)+B)/4' },
      '0D': { name: 'Vehicle speed', unit: 'km/h', formula: 'A' },
      '0E': { name: 'Timing advance', unit: '° before TDC', formula: '(A-128)/2' },
      '0F': { name: 'Intake air temperature', unit: '°C', formula: 'A-40' },
      '10': { name: 'MAF air flow rate', unit: 'g/s', formula: '((A*256)+B)/100' },
      '11': { name: 'Throttle position', unit: '%', formula: 'A*100/255' },
      '12': { name: 'Commanded secondary air status', unit: 'bitmap', formula: 'bitmap' },
      '13': { name: 'Oxygen sensors present', unit: 'bitmap', formula: 'bitmap' },
      '14': { name: 'O2 Sensor 1 Voltage', unit: 'V', formula: 'A/200' },
      '15': { name: 'O2 Sensor 2 Voltage', unit: 'V', formula: 'A/200' }
    };

    // Bluetooth parameter descriptions
    this.BLUETOOTH_PARAMS = {
      COD: 'Class of Device',
      DM: 'Discovery Mode',
      DN: 'Device Name',
      HCIBAUD: 'HCI Baud Rate',
      I: 'Information',
      LEDN: 'BLE Device Name',
      PIN: 'PIN Code',
      PKPARAM: 'SPP Configuration Parameters',
      PM: 'Pairing Mode',
      WM: 'Work Mode'
    };
  }

  /**
   * Parse any response from MIC3X2X
   */
  parseResponse(response, context = {}) {
    if (!response || typeof response !== 'string') {
      return {
        type: 'error',
        error: 'Invalid response format',
        raw: response
      };
    }

    const cleanResponse = response.trim();
    
    // Check for basic response patterns first
    if (this.RESPONSE_PATTERNS.OK.test(cleanResponse)) {
      return { type: 'success', message: 'OK', raw: cleanResponse };
    }

    if (this.RESPONSE_PATTERNS.ERROR.test(cleanResponse)) {
      return { type: 'error', error: 'Command error', raw: cleanResponse };
    }

    if (this.RESPONSE_PATTERNS.SEARCHING.test(cleanResponse)) {
      return { type: 'status', message: 'Searching for protocol', raw: cleanResponse };
    }

    // Parse based on response content
    if (this.RESPONSE_PATTERNS.HEX_DATA.test(cleanResponse)) {
      return this.parseHexData(cleanResponse, context);
    }

    if (this.RESPONSE_PATTERNS.VOLTAGE.test(cleanResponse)) {
      return this.parseVoltage(cleanResponse);
    }

    if (this.RESPONSE_PATTERNS.FIRMWARE_VERSION.test(cleanResponse)) {
      return this.parseFirmwareInfo(cleanResponse);
    }

    if (this.RESPONSE_PATTERNS.MAC_ADDRESS.test(cleanResponse)) {
      return this.parseMACAddress(cleanResponse);
    }

    if (this.RESPONSE_PATTERNS.BUS_HSCAN.test(cleanResponse) || 
        this.RESPONSE_PATTERNS.BUS_MSCAN.test(cleanResponse) ||
        this.RESPONSE_PATTERNS.BUS_SWCAN.test(cleanResponse)) {
      return this.parseBusActivity(cleanResponse);
    }

    if (this.RESPONSE_PATTERNS.WM_DISPLAY.test(cleanResponse)) {
      return this.parseWakeMessage(cleanResponse);
    }

    if (this.RESPONSE_PATTERNS.POWER_SLEEP.test(cleanResponse)) {
      return this.parsePowerManagement(cleanResponse);
    }

    // Check for protocol information
    if (cleanResponse.includes('[AT]') || cleanResponse.includes('[ST]') || cleanResponse.includes('[VT]')) {
      return this.parseProtocolInfo(cleanResponse);
    }

    // Check for multi-line responses
    if (cleanResponse.includes('\n') || cleanResponse.includes('\r')) {
      return this.parseMultiLineResponse(cleanResponse, context);
    }

    // Default text response
    return {
      type: 'text',
      message: cleanResponse,
      raw: cleanResponse
    };
  }

  /**
   * Parse hexadecimal OBD data
   */
  parseHexData(response, context = {}) {
    const lines = response.split(/[\r\n]+/).filter(line => line.trim());
    const parsedLines = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check if it's a CAN frame with header
      const canMatch = trimmed.match(/^([0-9A-F]+)\s+(.+)$/i);
      if (canMatch) {
        const [, header, data] = canMatch;
        const dataBytes = this.parseHexBytes(data);
        
        parsedLines.push({
          header: header,
          data: dataBytes,
          raw: trimmed,
          interpreted: this.interpretOBDData(dataBytes, context)
        });
      } else {
        // Simple hex data without header
        const dataBytes = this.parseHexBytes(trimmed);
        parsedLines.push({
          data: dataBytes,
          raw: trimmed,
          interpreted: this.interpretOBDData(dataBytes, context)
        });
      }
    }

    return {
      type: 'hex_data',
      frames: parsedLines,
      raw: response
    };
  }

  /**
   * Parse hex bytes from string
   */
  parseHexBytes(hexString) {
    const cleanHex = hexString.replace(/[^0-9A-Fa-f]/g, '');
    const bytes = [];
    
    for (let i = 0; i < cleanHex.length; i += 2) {
      const byte = parseInt(cleanHex.substr(i, 2), 16);
      if (!isNaN(byte)) {
        bytes.push(byte);
      }
    }
    
    return bytes;
  }

  /**
   * Interpret OBD data based on mode and PID
   */
  interpretOBDData(dataBytes, context = {}) {
    if (!dataBytes || dataBytes.length === 0) {
      return null;
    }

    const mode = dataBytes[0];
    const pid = dataBytes.length > 1 ? dataBytes[1] : null;

    // Response to mode request (add 0x40 to mode)
    if (mode >= 0x41 && mode <= 0x4A) {
      const originalMode = (mode - 0x40).toString(16).toUpperCase().padStart(2, '0');
      const pidHex = pid ? pid.toString(16).toUpperCase().padStart(2, '0') : null;
      
      return this.interpretModeResponse(originalMode, pidHex, dataBytes.slice(2));
    }

    // Direct mode interpretation
    const modeHex = mode.toString(16).toUpperCase().padStart(2, '0');
    return {
      mode: modeHex,
      description: this.OBD_MODES[modeHex] || 'Unknown mode',
      data: dataBytes
    };
  }

  /**
   * Interpret mode response data
   */
  interpretModeResponse(mode, pid, dataBytes) {
    const result = {
      mode,
      pid,
      modeDescription: this.OBD_MODES[mode] || 'Unknown mode',
      data: dataBytes
    };

    if (mode === '01' && pid && this.PIDS[pid]) {
      const pidInfo = this.PIDS[pid];
      result.pidDescription = pidInfo.name;
      result.unit = pidInfo.unit;
      result.value = this.calculatePIDValue(pid, dataBytes);
    }

    return result;
  }

  /**
   * Calculate PID value using formula
   */
  calculatePIDValue(pid, dataBytes) {
    const pidInfo = this.PIDS[pid];
    if (!pidInfo || !dataBytes.length) return null;

    const A = dataBytes[0] || 0;
    const B = dataBytes[1] || 0;
    const C = dataBytes[2] || 0;
    const D = dataBytes[3] || 0;

    try {
      switch (pidInfo.formula) {
        case 'A':
          return A;
        case 'A-40':
          return A - 40;
        case 'A*100/255':
          return Math.round((A * 100) / 255 * 100) / 100;
        case '((A*256)+B)/4':
          return Math.round(((A * 256) + B) / 4 * 100) / 100;
        case '(A-128)*100/128':
          return Math.round(((A - 128) * 100) / 128 * 100) / 100;
        case 'A*3':
          return A * 3;
        case '(A-128)/2':
          return Math.round(((A - 128) / 2) * 100) / 100;
        case '((A*256)+B)/100':
          return Math.round(((A * 256) + B) / 100 * 100) / 100;
        case 'A/200':
          return Math.round((A / 200) * 1000) / 1000;
        case 'bitmap':
          return this.parseBitmap(dataBytes);
        case 'raw':
        default:
          return dataBytes;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse bitmap data
   */
  parseBitmap(dataBytes) {
    const bitmap = [];
    dataBytes.forEach((byte, byteIndex) => {
      for (let bit = 0; bit < 8; bit++) {
        const bitValue = (byte >> (7 - bit)) & 1;
        bitmap.push({
          byte: byteIndex,
          bit: bit,
          value: bitValue === 1
        });
      }
    });
    return bitmap;
  }

  /**
   * Parse voltage reading
   */
  parseVoltage(response) {
    const match = response.match(/(\d+\.\d+)V/);
    if (match) {
      return {
        type: 'voltage',
        value: parseFloat(match[1]),
        unit: 'V',
        raw: response
      };
    }
    return null;
  }

  /**
   * Parse firmware and device information
   */
  parseFirmwareInfo(response) {
    const versionMatch = response.match(/MIC3X2X\s+V(\d+\.\d+\.\d+)/i);
    
    return {
      type: 'device_info',
      version: versionMatch ? versionMatch[1] : null,
      fullVersion: response,
      raw: response
    };
  }

  /**
   * Parse MAC address
   */
  parseMACAddress(response) {
    const cleanMAC = response.replace(/[^0-9A-Fa-f-]/g, '');
    const bytes = cleanMAC.split('-');
    
    return {
      type: 'mac_address',
      address: cleanMAC,
      bytes: bytes,
      length: bytes.length,
      raw: response
    };
  }

  /**
   * Parse bus activity information
   */
  parseBusActivity(response) {
    const protocolMatch = response.match(/P:\s*(\w+)/i);
    const frequencyMatch = response.match(/F:\s*([\d.]+K?)/i);
    
    return {
      type: 'bus_activity',
      protocol: protocolMatch ? protocolMatch[1] : null,
      frequency: frequencyMatch ? frequencyMatch[1] : null,
      active: !this.RESPONSE_PATTERNS.BUS_INACTIVE.test(response),
      raw: response
    };
  }

  /**
   * Parse wake message display
   */
  parseWakeMessage(response) {
    const match = response.match(this.RESPONSE_PATTERNS.WM_DISPLAY);
    if (match) {
      return {
        type: 'wake_message',
        sequenceNumber: parseInt(match[1]),
        protocol: match[2],
        header: match[3],
        data: this.parseHexBytes(match[4]),
        period: parseInt(match[5], 16),
        mode: parseInt(match[6], 16),
        raw: response
      };
    }
    return null;
  }

  /**
   * Parse power management information
   */
  parsePowerManagement(response) {
    const lines = response.split(/[\r\n]+/);
    const sleepInfo = {};
    const wakeInfo = {};
    let currentSection = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed === 'SLEEP:') {
        currentSection = 'sleep';
        continue;
      }
      
      if (trimmed === 'WAKE:') {
        currentSection = 'wake';
        continue;
      }

      // Parse individual settings
      const settingMatch = trimmed.match(/(\w+)\s*\(([^)]+)\)/);
      if (settingMatch) {
        const [, setting, value] = settingMatch;
        const info = { setting, value: value.trim() };
        
        if (currentSection === 'sleep') {
          sleepInfo[setting] = info;
        } else if (currentSection === 'wake') {
          wakeInfo[setting] = info;
        }
      }
    }

    return {
      type: 'power_management',
      sleep: sleepInfo,
      wake: wakeInfo,
      raw: response
    };
  }

  /**
   * Parse protocol information
   */
  parseProtocolInfo(response) {
    const protocolTypeMatch = response.match(/\[(AT|ST|VT)\]$/);
    const protocolType = protocolTypeMatch ? protocolTypeMatch[1] : 'unknown';
    
    // Extract protocol number if present
    const numberMatch = response.match(/^([0-9A-F]+):/i);
    const protocolNumber = numberMatch ? numberMatch[1] : null;
    
    return {
      type: 'protocol_info',
      protocolType,
      protocolNumber,
      description: response.replace(/\s*\[(AT|ST|VT)\]$/, '').trim(),
      raw: response
    };
  }

  /**
   * Parse multi-line responses
   */
  parseMultiLineResponse(response, context = {}) {
    const lines = response.split(/[\r\n]+/).filter(line => line.trim());
    const parsedLines = [];

    for (const line of lines) {
      const parsed = this.parseResponse(line, context);
      if (parsed) {
        parsedLines.push(parsed);
      }
    }

    return {
      type: 'multi_line',
      lines: parsedLines,
      count: parsedLines.length,
      raw: response
    };
  }

  /**
   * Parse ISO15765 multi-frame response with enhanced formatting
   */
  parseISO15765MultiFrame(response) {
    const lines = response.split(/[\r\n]+/).filter(line => line.trim());
    const frames = [];
    let totalLength = 0;
    let assembledData = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for first frame (10 xx ...)
      const firstFrameMatch = trimmed.match(/^([0-9A-F]+)\s+([0-9A-F]{2})\s+1([0-9A-F])\s+([0-9A-F]{2})\s+(.+)$/i);
      if (firstFrameMatch) {
        const [, header, extAddr, lengthNibble, lengthByte, data] = firstFrameMatch;
        totalLength = parseInt(lengthNibble + lengthByte, 16);
        
        frames.push({
          type: 'first_frame',
          header,
          extendedAddress: extAddr,
          totalLength,
          data: this.parseHexBytes(data),
          raw: trimmed
        });
        
        assembledData = assembledData.concat(this.parseHexBytes(data));
        continue;
      }

      // Check for consecutive frame (2x ...)
      const consecutiveFrameMatch = trimmed.match(/^([0-9A-F]+)\s+([0-9A-F]{2})\s+2([0-9A-F])\s+(.+)$/i);
      if (consecutiveFrameMatch) {
        const [, header, extAddr, sequence, data] = consecutiveFrameMatch;
        
        frames.push({
          type: 'consecutive_frame',
          header,
          extendedAddress: extAddr,
          sequence: parseInt(sequence, 16),
          data: this.parseHexBytes(data),
          raw: trimmed
        });
        
        assembledData = assembledData.concat(this.parseHexBytes(data));
        continue;
      }

      // Single frame or other format
      frames.push({
        type: 'single_frame',
        data: this.parseHexBytes(trimmed),
        raw: trimmed
      });
    }

    return {
      type: 'iso15765_multiframe',
      frames,
      assembledData: assembledData.slice(0, totalLength), // Trim to actual length
      totalLength,
      complete: assembledData.length >= totalLength,
      raw: response
    };
  }

  /**
   * Parse Bluetooth module responses
   */
  parseBluetoothResponse(response, parameter) {
    const result = {
      type: 'bluetooth_config',
      parameter,
      parameterDescription: this.BLUETOOTH_PARAMS[parameter] || 'Unknown parameter',
      raw: response
    };

    switch (parameter) {
      case 'COD':
        result.classOfDevice = response.trim();
        break;
      case 'DM':
        const dmValue = parseInt(response.trim());
        result.discoveryMode = dmValue;
        result.description = dmValue === 0 ? 'Disabled' : dmValue === 1 ? 'Always discoverable' : 'Auto 300s';
        break;
      case 'DN':
      case 'LEDN':
        result.deviceName = response.trim();
        break;
      case 'HCIBAUD':
        result.baudRate = parseInt(response.trim());
        break;
      case 'I':
        return this.parseBluetoothInfo(response);
      case 'PIN':
        result.pinCode = response.trim();
        break;
      case 'PKPARAM':
        const params = response.trim().split(/\s+/);
        result.maxFrameSize = params[0];
        result.transmitBuffer = params[1];
        result.receiveBuffer = params[2];
        break;
      case 'PM':
        const pmValue = parseInt(response.trim());
        result.pairingMode = pmValue;
        result.description = pmValue === 1 ? 'PIN code required' : 'Simple pairing';
        break;
      case 'WM':
        const wmValue = parseInt(response.trim());
        result.workMode = wmValue;
        result.description = wmValue === 1 ? 'BT 3.0' : wmValue === 3 ? 'BT 3.0 + MFI' : 'BT 3.0 + BLE';
        break;
    }

    return result;
  }

  /**
   * Parse Bluetooth information response
   */
  parseBluetoothInfo(response) {
    const lines = response.split(/[\r\n]+/);
    const info = {};

    for (const line of lines) {
      const match = line.match(/^(\w+):(.+)$/);
      if (match) {
        const [, key, value] = match;
        info[key.toLowerCase()] = value.trim();
      }
    }

    return {
      type: 'bluetooth_info',
      info,
      raw: response
    };
  }

  /**
   * Parse EEPROM data
   */
  parseEEPROMData(response) {
    const lines = response.split(/[\r\n]+/).filter(line => line.trim());
    const allBytes = [];

    for (const line of lines) {
      const bytes = this.parseHexBytes(line);
      allBytes.push(...bytes);
    }

    return {
      type: 'eeprom_data',
      bytes: allBytes,
      length: allBytes.length,
      asHex: allBytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' '),
      asString: String.fromCharCode(...allBytes.filter(b => b >= 32 && b <= 126)),
      raw: response
    };
  }

  /**
   * Validate and clean response data
   */
  validateResponse(response) {
    if (!response) {
      return { valid: false, error: 'Empty response' };
    }

    if (typeof response !== 'string') {
      return { valid: false, error: 'Response must be string' };
    }

    const cleaned = response.trim();
    
    if (cleaned.length === 0) {
      return { valid: false, error: 'Empty response after trim' };
    }

    return { valid: true, cleaned };
  }

  /**
   * Format parsed data for display
   */
  formatForDisplay(parsedData) {
    if (!parsedData || typeof parsedData !== 'object') {
      return 'Invalid data';
    }

    switch (parsedData.type) {
      case 'hex_data':
        return this.formatHexDataDisplay(parsedData);
      case 'voltage':
        return `${parsedData.value}${parsedData.unit}`;
      case 'device_info':
        return `Device: ${parsedData.fullVersion}`;
      case 'protocol_info':
        return `Protocol: ${parsedData.description} [${parsedData.protocolType}]`;
      case 'bus_activity':
        return `Bus: ${parsedData.protocol} ${parsedData.frequency ? '@ ' + parsedData.frequency : ''}`;
      case 'power_management':
        return this.formatPowerManagementDisplay(parsedData);
      default:
        return parsedData.message || parsedData.raw || 'Unknown response';
    }
  }

  /**
   * Format hex data for display
   */
  formatHexDataDisplay(parsedData) {
    if (!parsedData.frames || parsedData.frames.length === 0) {
      return 'No data';
    }

    return parsedData.frames.map(frame => {
      let display = '';
      if (frame.header) {
        display += `${frame.header}: `;
      }
      display += frame.data.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
      
      if (frame.interpreted && frame.interpreted.pidDescription) {
        display += ` (${frame.interpreted.pidDescription}`;
        if (frame.interpreted.value !== null) {
          display += `: ${frame.interpreted.value}${frame.interpreted.unit || ''}`;
        }
        display += ')';
      }
      
      return display;
    }).join('\n');
  }

  /**
   * Format power management for display
   */
  formatPowerManagementDisplay(parsedData) {
    let display = 'Power Management:\n';
    
    if (parsedData.sleep) {
      display += 'Sleep Triggers:\n';
      Object.values(parsedData.sleep).forEach(info => {
        display += `  ${info.setting}: ${info.value}\n`;
      });
    }
    
    if (parsedData.wake) {
      display += 'Wake Triggers:\n';
      Object.values(parsedData.wake).forEach(info => {
        display += `  ${info.setting}: ${info.value}\n`;
      });
    }
    
    return display.trim();
  }
}

export default MIC3X2XDataParser;