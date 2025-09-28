import React, { useState, useCallback, useRef, useEffect } from 'react';

// MIC3X2X Protocol Definitions from Datasheet Section 5.7(18)
const PROTOCOLS = {
  AT: {
    '1': 'SAE J1850 VPW',
    '2': 'SAE J1850 PWM', 
    '3': 'ISO 9141-2',
    '4': 'ISO 14230-4 (KWP2000)',
    '5': 'ISO 14230-4 (KWP2000 Fast)',
    '6': 'ISO 15765-4 (CAN 11/500)',
    '7': 'ISO 15765-4 (CAN 29/500)',
    '8': 'ISO 15765-4 (CAN 11/250)',
    '9': 'ISO 15765-4 (CAN 29/250)',
    'A': 'SAE J1939 (CAN 29/250)',
    'B': 'USER1 CAN',
    'C': 'USER2 CAN',
    'D': 'USER3 CAN',
    'E': 'USER4 CAN',
    'F': 'USER5 CAN'
  },
  ST: {
    '231': 'HS CAN (ISO 11898, 11-bit Tx, 500kbps, var DLC)',
    '232': 'HS CAN (ISO 11898, 29-bit Tx, 500kbps, var DLC)',
    '233': 'HS CAN (ISO 15765, 11-bit Tx, 500kbps, DLC=8)',
    '234': 'HS CAN (ISO 15765, 29-bit Tx, 500kbps, DLC=8)',
    '235': 'HS CAN (ISO 15765, 11-bit Tx, 250kbps, DLC=8)',
    '236': 'HS CAN (ISO 15765, 29-bit Tx, 250kbps, DLC=8)',
    '251': 'MS CAN (ISO 11898, 11-bit Tx, 125kbps, var DLC)',
    '252': 'MS CAN (ISO 11898, 29-bit Tx, 125kbps, var DLC)',
    '253': 'MS CAN (ISO 15765, 11-bit Tx, 125kbps, DLC=8)',
    '254': 'MS CAN (ISO 15765, 29-bit Tx, 125kbps, DLC=8)',
    '261': 'SW CAN (ISO 11898, 11-bit Tx, 33.3kbps, var DLC)',
    '262': 'SW CAN (ISO 11898, 29-bit Tx, 33.3kbps, var DLC)',
    '263': 'SW CAN (ISO 15765, 11-bit Tx, 33.3kbps, DLC=8)',
    '264': 'SW CAN (ISO 15765, 29-bit Tx, 33.3kbps, DLC=8)'
  },
  VT: {
    '101': 'ISO 15765 (33.3K/11B), DLC:F, SWCAN, MODE3',
    '102': 'ISO 15765 (500K/11B), DLC:F, HS_CAN',
    '103': 'ISO 14230 (10.4K), Fast Init',
    '11A': 'ISO 15765 (500K/11B), DLC:V, HS_CAN, WM_NO:1',
    '11B': 'ISO 15765 (500K/29B), DLC:V, HS_CAN, WM_NO:2',
    '11C': 'ISO 15765 (250K/11B), DLC:V, HS_CAN',
    '11D': 'ISO 15765 (1000K/11B), DLC:F, HS_CAN'
  }
};

// Device state management
const DEFAULT_DEVICE_STATE = {
  echo: true,
  headers: false,
  spaces: true,
  linefeeds: true,
  adaptiveTiming: 1,
  currentProtocol: '6',
  protocolType: 'AT',
  voltage: 12.6,
  baudRate: 115200
};

export default function MIC3X2XDatasheetImplementation() {
  const [connected, setConnected] = useState(false);
  const [deviceState, setDeviceState] = useState(DEFAULT_DEVICE_STATE);
  const [command, setCommand] = useState('');
  const [terminal, setTerminal] = useState('');
  const [executing, setExecuting] = useState(false);
  const [history, setHistory] = useState([]);
  
  const terminalRef = useRef(null);

  // Scroll terminal to bottom when content changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminal]);

  // Add text to terminal with proper formatting
  const addToTerminal = useCallback((text, isCommand = false) => {
    setTerminal(prev => {
      const prefix = isCommand ? '>' : '';
      const newText = prefix + text + (deviceState.linefeeds ? '\r\n' : '\r');
      return prev + newText;
    });
  }, [deviceState.linefeeds]);

  // Simulate OBD responses based on datasheet examples
  const getOBDResponse = useCallback((request) => {
    const responses = {
      '0100': '41 00 BE 3F A8 13',
      '0101': '41 01 82 07 65 04', 
      '010C': '41 0C 1A F8',
      '010D': '41 0D 00',
      '0902': '49 02 01 31 47 31 4A 43 35 34 34 34 52 37 32 35 32 33 36 37',
      '22F190': '62 F1 90 57 42 41 4A 42 39 43 35 36 4A 42 30 33 35 36 35 35',
      '220200': '62 02 00 00 00 00 64',
      '1001': '50 01',
      '1003': '50 03',
      '3E00': '7E 00'
    };
    
    const response = responses[request.replace(/\s/g, '')];
    if (response) {
      return deviceState.spaces ? response : response.replace(/\s/g, '');
    }
    return 'NO DATA';
  }, [deviceState.spaces]);

  // Process AT commands according to datasheet
  const processATCommand = useCallback((cmd) => {
    const command = cmd.toUpperCase();
    
    switch (command) {
      case 'Z':
        setDeviceState(DEFAULT_DEVICE_STATE);
        return 'MIC3X2X v2.3.08';
        
      case 'I':
        return 'MIC3X2X v2.3.08';
        
      case '@1':
        return 'JINXUSOLU OBD to UART Interpreter';
        
      case '@2':
        return '449519228014E7FEB70AD003B0B517529DC2A1A401640190';
        
      case 'D':
        setDeviceState(DEFAULT_DEVICE_STATE);
        return 'OK';
        
      case 'DP':
        return PROTOCOLS.AT[deviceState.currentProtocol] || 'Unknown Protocol';
        
      case 'DPN':
        return deviceState.currentProtocol;
        
      case 'PC':
        return 'OK';
        
      case 'PO':
        return 'OK';
        
      case 'E0':
        setDeviceState(prev => ({ ...prev, echo: false }));
        return 'OK';
        
      case 'E1':
        setDeviceState(prev => ({ ...prev, echo: true }));
        return 'OK';
        
      case 'H0':
        setDeviceState(prev => ({ ...prev, headers: false }));
        return 'OK';
        
      case 'H1':
        setDeviceState(prev => ({ ...prev, headers: true }));
        return 'OK';
        
      case 'L0':
        setDeviceState(prev => ({ ...prev, linefeeds: false }));
        return 'OK';
        
      case 'L1':
        setDeviceState(prev => ({ ...prev, linefeeds: true }));
        return 'OK';
        
      case 'S0':
        setDeviceState(prev => ({ ...prev, spaces: false }));
        return 'OK';
        
      case 'S1':
        setDeviceState(prev => ({ ...prev, spaces: true }));
        return 'OK';
        
      case 'RV':
        return deviceState.voltage.toFixed(1) + 'V';
        
      case 'MA':
        return 'SEARCHING...\r\nCAN\r\n' +
               (deviceState.headers ? '7E8 06 ' : '') + '41 00 BE 3F A8 13\r\n' +
               (deviceState.headers ? '7E9 06 ' : '') + '41 00 BF BE F9 80\r\n' +
               (deviceState.headers ? '7EC 06 ' : '') + '41 00 00 00 00 00';
        
      default:
        // Check for protocol setting (SP command)
        if (command.startsWith('SP') && command.length === 3) {
          const protocol = command.substring(2);
          if (PROTOCOLS.AT[protocol]) {
            setDeviceState(prev => ({ ...prev, currentProtocol: protocol }));
            return 'OK';
          }
        }
        
        // Check for OBD data request
        if (/^[0-9A-F\s]+$/.test(command) && command.length >= 2) {
          return getOBDResponse(command);
        }
        
        return '?';
    }
  }, [deviceState, getOBDResponse]);

  // Process ST commands according to datasheet
  const processSTCommand = useCallback((cmd) => {
    const command = cmd.toUpperCase();
    
    switch (command) {
      case 'I':
        return 'STN1110 Compatible v2.3.08';
        
      case 'DI':
        return 'MIC3X2X Hardware v1.0';
        
      case 'MFR':
        return 'JINXUSOLU';
        
      case 'SN':
        return '449519228014E7FEB70AD003B0B517529DC2A1A401640190';
        
      case 'PC':
        return 'OK';
        
      case 'PO':
        return 'OK';
        
      case 'PR':
        return deviceState.currentProtocol + ' [ST]';
        
      case 'PRS':
        return (PROTOCOLS.ST[deviceState.currentProtocol] || 'Unknown') + ' [ST]';
        
      default:
        // Check for protocol setting (P command)
        if (command.startsWith('P') && command.length >= 2) {
          const protocol = command.substring(1);
          if (PROTOCOLS.ST[protocol]) {
            setDeviceState(prev => ({ 
              ...prev, 
              currentProtocol: protocol,
              protocolType: 'ST'
            }));
            return 'OK';
          }
        }
        
        return '?';
    }
  }, [deviceState]);

  // Process VT commands according to datasheet section 5.5
  const processVTCommand = useCallback((cmd) => {
    const command = cmd.toUpperCase().trim();
    
    if (command === 'D') {
      return 'JINXUSOLU';
    } else if (command === 'I') {
      return 'Logo v2.3.08';
    } else if (command === 'VERS') {
      return 'MIC3X2X V2.3.08';
    } else if (command === 'PROI') {
      return 'Vgate';
    } else if (command === 'PRON') {
      return deviceState.currentProtocol + (deviceState.protocolType !== 'AT' ? ` [${deviceState.protocolType}]` : '');
    } else if (command === 'PROT') {
      const protocols = deviceState.protocolType === 'VT' ? PROTOCOLS.VT : 
                       deviceState.protocolType === 'ST' ? PROTOCOLS.ST : PROTOCOLS.AT;
      return (protocols[deviceState.currentProtocol] || 'Unknown') + 
             (deviceState.protocolType !== 'AT' ? ` [${deviceState.protocolType}]` : '');
    } else if (command === 'PC') {
      return 'OK';
    } else if (command === 'PO') {
      return 'OK';
    } else if (command.startsWith('P1')) {
      const protocol = command.substring(2);
      if (PROTOCOLS.VT[protocol]) {
        setDeviceState(prev => ({ 
          ...prev, 
          currentProtocol: protocol,
          protocolType: 'VT'
        }));
        return 'OK';
      }
      return '?';
    } else if (command.startsWith('P2')) {
      const protocol = command.substring(2);
      if (PROTOCOLS.ST[protocol]) {
        setDeviceState(prev => ({ 
          ...prev, 
          currentProtocol: protocol,
          protocolType: 'ST'
        }));
        return 'OK';
      }
      return '?';
    } else if (command.startsWith('CFG_CAN')) {
      return 'OK';
    } else if (command.startsWith('SET_HD')) {
      return 'OK';
    } else if (command.startsWith('TP_RTS')) {
      return 'OK';
    } else if (command.startsWith('TP_DT')) {
      return 'OK';
    } else if (command === 'TP_END') {
      return '640F1036E3044';
    } else if (command.startsWith('SHOW_BUS')) {
      return 'P: HSCAN; F:500K';
    } else if (command === 'POWERMANAGE') {
      return 'SLEEP:\r\nUART (OFF)\r\nOBD (OFF)\r\nVOLTAGE (0V)\r\nIGN (OFF)\r\n' +
             'WAKE:\r\nUART (OFF)\r\nOBD (ON)\r\nVOL DEEP DROP (4.0V)\r\nIGN (OFF)';
    }
    
    return '?';
  }, [deviceState]);

  // Main command processor
  const executeCommand = useCallback(async (cmdText) => {
    if (!cmdText.trim()) return;
    
    setExecuting(true);
    const cmd = cmdText.trim();
    
    // Echo command if enabled
    if (deviceState.echo) {
      addToTerminal(cmd, true);
    }
    
    let response = '';
    
    try {
      if (cmd.toUpperCase().startsWith('AT')) {
        response = processATCommand(cmd.substring(2));
      } else if (cmd.toUpperCase().startsWith('ST')) {
        response = processSTCommand(cmd.substring(2));
      } else if (cmd.toUpperCase().startsWith('VT')) {
        response = processVTCommand(cmd.substring(2));
      } else {
        // Try as direct OBD command
        if (/^[0-9A-F\s]+$/.test(cmd.toUpperCase())) {
          response = getOBDResponse(cmd);
        } else {
          response = '?';
        }
      }
      
      // Add to history
      setHistory(prev => [...prev, {
        command: cmd,
        response: response,
        timestamp: new Date().toLocaleTimeString()
      }].slice(-20));
      
    } catch (error) {
      response = 'ERROR';
    }
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    addToTerminal(response);
    setExecuting(false);
  }, [deviceState, addToTerminal, processATCommand, processSTCommand, processVTCommand, getOBDResponse]);

  const handleConnect = useCallback(() => {
    setConnected(true);
    setTerminal('MIC3X2X v2.3.08\r\n\r\n>');
  }, []);

  const handleDisconnect = useCallback(() => {
    setConnected(false);
    setTerminal('');
    setCommand('');
  }, []);

  const handleSendCommand = useCallback(() => {
    if (command.trim() && connected) {
      executeCommand(command);
      setCommand('');
    }
  }, [command, connected, executeCommand]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSendCommand();
    }
  }, [handleSendCommand]);

  const clearTerminal = useCallback(() => {
    setTerminal(connected ? 'MIC3X2X v2.3.08\r\n\r\n>' : '');
  }, [connected]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">MIC3X2X OBD Interpreter</h1>
          <p className="text-gray-600">Multiprotocol OBD to UART Interpreter - Datasheet Implementation</p>
        </div>

        {/* Connection Status */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
              {connected && (
                <span className="text-sm text-gray-600">
                  Protocol: {deviceState.currentProtocol} ({deviceState.protocolType}) | 
                  Baud: {deviceState.baudRate} | 
                  {deviceState.voltage}V
                </span>
              )}
            </div>
            <button
              onClick={connected ? handleDisconnect : handleConnect}
              className={`px-4 py-2 rounded font-medium ${
                connected 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Terminal */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Terminal</label>
              <div
                ref={terminalRef}
                className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-auto"
              >
                <pre className="whitespace-pre-wrap">{terminal}</pre>
                {connected && !executing && (
                  <span className="inline-block w-2 h-4 bg-green-400 animate-pulse"></span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter command (e.g., ATI, ATDP, 0100)..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!connected || executing}
              />
              <button
                onClick={handleSendCommand}
                disabled={!connected || executing || !command.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
              >
                Send
              </button>
              <button
                onClick={clearTerminal}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Quick Commands */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Quick Commands</h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: 'Reset', cmd: 'ATZ' },
                  { label: 'Version', cmd: 'ATI' },
                  { label: 'Protocol', cmd: 'ATDP' },
                  { label: 'Monitor All', cmd: 'ATMA' },
                  { label: 'Voltage', cmd: 'ATRV' },
                  { label: 'VT Version', cmd: 'VTVERS' },
                  { label: 'Show Bus', cmd: 'VTSHOW_BUS' },
                  { label: 'PIDs Supported', cmd: '0100' },
                  { label: 'Engine RPM', cmd: '010C' },
                  { label: 'Vehicle Speed', cmd: '010D' }
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setCommand(item.cmd)}
                    className="text-left px-3 py-2 bg-white rounded border hover:bg-gray-50 text-sm"
                    disabled={!connected}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Device Settings */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Device Settings</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Echo</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    deviceState.echo ? 'bg-green-500 text-white' : 'bg-gray-300'
                  }`}>
                    {deviceState.echo ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Headers</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    deviceState.headers ? 'bg-green-500 text-white' : 'bg-gray-300'
                  }`}>
                    {deviceState.headers ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Spaces</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    deviceState.spaces ? 'bg-green-500 text-white' : 'bg-gray-300'
                  }`}>
                    {deviceState.spaces ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Linefeeds</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    deviceState.linefeeds ? 'bg-green-500 text-white' : 'bg-gray-300'
                  }`}>
                    {deviceState.linefeeds ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>

            {/* Protocol Info */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Current Protocol</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-mono">{deviceState.protocolType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number:</span>
                  <span className="font-mono">{deviceState.currentProtocol}</span>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  {PROTOCOLS[deviceState.protocolType][deviceState.currentProtocol] || 'Unknown Protocol'}
                </div>
              </div>
            </div>

            {/* Command History */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Recent Commands</h3>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {history.slice(-10).reverse().map((item, index) => (
                  <div key={index} className="text-xs border-b border-gray-200 pb-1">
                    <div className="font-mono text-blue-600">{item.command}</div>
                    <div className="text-gray-500 truncate">{item.response.substring(0, 30)}</div>
                    <div className="text-gray-400">{item.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          MIC3X2X Multiprotocol OBD to UART Interpreter v2.3.08 - JINXUSOLU Technology
        </div>
      </div>
    </div>
  );
}