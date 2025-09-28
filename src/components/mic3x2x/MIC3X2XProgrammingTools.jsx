import React, { useState, useCallback, useEffect } from 'react';
import { Zap, Upload, Download, Play, Pause, AlertTriangle, CheckCircle, XCircle, Settings, Code, Shield } from 'lucide-react';

const MIC3X2XProgrammingTools = () => {
  const [activeTab, setActiveTab] = useState('feps');
  const [fepsEnabled, setFepsEnabled] = useState(false);
  const [programmingData, setProgrammingData] = useState('');
  const [programmingLog, setProgrammingLog] = useState([]);
  const [isProgramming, setIsProgramming] = useState(false);
  
  // FEPS Configuration
  const [fepsConfig, setFepsConfig] = useState({
    voltage: '18V',
    enabled: false,
    pin13Control: false
  });

  // FullyRequest Configuration
  const [fullyRequestConfig, setFullyRequestConfig] = useState({
    data: '',
    responseLines: 1,
    enableChecksum: false,
    dataLength: '',
    checksum: ''
  });

  // TSPA Configuration
  const [tspaConfig, setTspaConfig] = useState({
    address: '7E0',
    data: '',
    responseLines: 1,
    timeout: 1000,
    checksum: '',
    receiveAddress: '',
    useVariadicParams: false
  });

  const addToLog = (type, message) => {
    const logEntry = {
      id: Date.now() + Math.random(),
      type,
      message,
      timestamp: new Date().toISOString()
    };
    setProgrammingLog(prev => [...prev, logEntry]);
  };

  const toggleFEPS = () => {
    const newState = !fepsEnabled;
    setFepsEnabled(newState);
    const command = `VT FEPS ${newState ? '1' : '0'}`;
    addToLog('command', command);
    addToLog(newState ? 'success' : 'info', `FEPS ${newState ? 'enabled' : 'disabled'} - ${newState ? '18V output active' : 'Programming voltage off'}`);
  };

  const executeFullyRequest = () => {
    if (!fullyRequestConfig.data.trim()) {
      addToLog('error', 'No data specified for FullyRequest');
      return;
    }

    let command;
    if (fullyRequestConfig.enableChecksum) {
      command = `VT FullyRequestCk ${fullyRequestConfig.dataLength || 'auto'} ${fullyRequestConfig.data}`;
      if (fullyRequestConfig.checksum) {
        command += ` ${fullyRequestConfig.checksum}`;
      }
      if (fullyRequestConfig.responseLines > 1) {
        command += ` ${fullyRequestConfig.responseLines}`;
      }
    } else {
      command = `VT FullyRequest ${fullyRequestConfig.data}`;
      if (fullyRequestConfig.responseLines > 1) {
        command += ` ${fullyRequestConfig.responseLines}`;
      }
    }

    addToLog('command', command);
    
    // Simulate ECU response
    setTimeout(() => {
      const mockResponses = [
        '7E8 03 7F 22 78',
        '7E8 10 20 62 F1 90 01 02 03',
        '7E8 21 04 05 06 07 08 09 0A',
        '7E8 22 0B 0C 0D 0E 0F 10 11'
      ];
      
      mockResponses.slice(0, fullyRequestConfig.responseLines).forEach(response => {
        addToLog('response', response);
      });
    }, 200);
  };

  const executeTSPA = () => {
    if (!tspaConfig.data.trim()) {
      addToLog('error', 'No data specified for TSPA');
      return;
    }

    let command = 'VT TSPA';
    const params = [];

    if (tspaConfig.address) {
      params.push(`a:${tspaConfig.address}`);
    }

    if (tspaConfig.responseLines > 1) {
      params.push(`r:${tspaConfig.responseLines.toString().padStart(2, '0')}`);
    }

    if (tspaConfig.timeout !== 1000) {
      params.push(`t:${tspaConfig.timeout.toString().padStart(4, '0')}`);
    }

    if (tspaConfig.checksum) {
      params.push(`c:${tspaConfig.checksum}`);
    }

    if (tspaConfig.receiveAddress) {
      params.push(`z:${tspaConfig.receiveAddress}`);
    }

    // Data must be last parameter
    if (tspaConfig.data) {
      params.push(`d:${tspaConfig.data}`);
    }

    command += ' ' + params.join(', ');
    addToLog('command', command);

    // Simulate ECU response
    setTimeout(() => {
      addToLog('response', '7E8 62 F1 90 01 02 03 04');
    }, tspaConfig.timeout / 4);
  };

  const calculateChecksum = (data) => {
    try {
      const cleanData = data.replace(/\s+/g, '');
      let sum = 0;
      for (let i = 0; i < cleanData.length; i += 2) {
        sum += parseInt(cleanData.substr(i, 2), 16);
      }
      return (sum & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    } catch {
      return '';
    }
  };

  const startProgramming = () => {
    setIsProgramming(true);
    addToLog('info', 'Starting programming sequence...');
    
    // Enable FEPS first
    if (!fepsEnabled) {
      addToLog('command', 'VT FEPS 1');
      setFepsEnabled(true);
      addToLog('success', 'FEPS enabled - 18V programming voltage active');
    }

    // Simulate programming sequence
    setTimeout(() => {
      addToLog('command', 'VT FullyRequest 1001 1');
      addToLog('response', '7E8 50 01');
      
      setTimeout(() => {
        addToLog('command', 'VT FullyRequest 1003 1');
        addToLog('response', '7E8 50 03');
        
        setTimeout(() => {
          addToLog('success', 'Programming sequence completed');
          setIsProgramming(false);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const clearLog = () => {
    setProgrammingLog([]);
  };

  const exportLog = () => {
    const logText = programmingLog.map(entry => 
      `[${new Date(entry.timestamp).toLocaleTimeString()}] ${entry.type.toUpperCase()}: ${entry.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mic3x2x_programming_log.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const TabButton = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === tab
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const LogEntry = ({ entry }) => {
    const typeColors = {
      command: 'text-blue-600',
      response: 'text-green-600',
      error: 'text-red-600',
      warning: 'text-yellow-600',
      info: 'text-gray-600',
      success: 'text-green-700'
    };

    return (
      <div className={`text-sm font-mono ${typeColors[entry.type]}`}>
        <span className="text-gray-400 text-xs">
          [{new Date(entry.timestamp).toLocaleTimeString()}]
        </span>
        {' '}
        <span className="font-bold">{entry.type.toUpperCase()}:</span>
        {' '}
        {entry.message}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="text-red-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-800">MIC3X2X Programming Tools</h1>
            <div className="text-sm text-gray-500">
              FEPS • FullyRequest • TSPA Commands
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={startProgramming}
              className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              disabled={isProgramming}
            >
              <Zap size={16} />
              <span>{isProgramming ? 'Programming...' : 'Start Programming'}</span>
            </button>
            
            <button
              onClick={exportLog}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              disabled={programmingLog.length === 0}
            >
              <Download size={16} />
              <span>Export Log</span>
            </button>
          </div>
        </div>

        {/* FEPS Status */}
        <div className={`p-4 rounded-lg border-2 mb-6 ${
          fepsEnabled ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className={fepsEnabled ? 'text-red-600' : 'text-gray-400'} size={24} />
              <div>
                <div className="font-semibold">FEPS Programming Voltage</div>
                <div className="text-sm text-gray-600">
                  Pin 13 • {fepsEnabled ? '18V Output Active' : 'Disabled'}
                </div>
              </div>
            </div>
            
            <button
              onClick={toggleFEPS}
              className={`px-4 py-2 rounded font-medium ${
                fepsEnabled 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              {fepsEnabled ? 'Disable FEPS' : 'Enable FEPS'}
            </button>
          </div>
          
          {fepsEnabled && (
            <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded">
              <div className="flex items-center space-x-2 text-red-700 text-sm">
                <AlertTriangle size={16} />
                <span>WARNING: 18V programming voltage is active on Pin 13</span>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          <TabButton tab="feps" label="FEPS Control" icon={<Zap size={16} />} />
          <TabButton tab="fullyrequest" label="FullyRequest" icon={<Upload size={16} />} />
          <TabButton tab="tspa" label="TSPA Commands" icon={<Code size={16} />} />
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            {activeTab === 'feps' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">FEPS Configuration</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Programming Voltage:</span>
                    <span className="font-mono">18V</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Output Pin:</span>
                    <span className="font-mono">Pin 13 (FEPS_CTR)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className={`font-semibold ${fepsEnabled ? 'text-red-600' : 'text-gray-600'}`}>
                      {fepsEnabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="text-sm text-yellow-800">
                      <div className="font-semibold mb-1">Safety Notes:</div>
                      <div>• Only enable during ECU programming</div>
                      <div>• Ensure proper ECU connection before enabling</div>
                      <div>• Disable immediately after programming</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fullyrequest' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">FullyRequest Configuration</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Data (hex)</label>
                    <textarea
                      value={fullyRequestConfig.data}
                      onChange={(e) => setFullyRequestConfig({...fullyRequestConfig, data: e.target.value.toUpperCase()})}
                      className="w-full p-2 border rounded font-mono text-xs"
                      rows="3"
                      placeholder="22 F1 90"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Response Lines</label>
                      <input
                        type="number"
                        value={fullyRequestConfig.responseLines}
                        onChange={(e) => setFullyRequestConfig({...fullyRequestConfig, responseLines: parseInt(e.target.value) || 1})}
                        className="w-full p-2 border rounded"
                        min="1"
                        max="15"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={fullyRequestConfig.enableChecksum}
                          onChange={(e) => setFullyRequestConfig({...fullyRequestConfig, enableChecksum: e.target.checked})}
                        />
                        <span className="text-sm">Enable Checksum</span>
                      </label>
                    </div>
                  </div>
                  
                  {fullyRequestConfig.enableChecksum && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Data Length</label>
                        <input
                          type="text"
                          value={fullyRequestConfig.dataLength}
                          onChange={(e) => setFullyRequestConfig({...fullyRequestConfig, dataLength: e.target.value})}
                          className="w-full p-2 border rounded font-mono"
                          placeholder="Auto"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Checksum</label>
                        <input
                          type="text"
                          value={fullyRequestConfig.checksum || calculateChecksum(fullyRequestConfig.data)}
                          onChange={(e) => setFullyRequestConfig({...fullyRequestConfig, checksum: e.target.value})}
                          className="w-full p-2 border rounded font-mono"
                          placeholder="Auto"
                        />
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={executeFullyRequest}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                  >
                    Execute FullyRequest
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'tspa' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">TSPA Configuration</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Address (a:)</label>
                      <input
                        type="text"
                        value={tspaConfig.address}
                        onChange={(e) => setTspaConfig({...tspaConfig, address: e.target.value.toUpperCase()})}
                        className="w-full p-2 border rounded font-mono"
                        placeholder="7E0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Receive Address (z:)</label>
                      <input
                        type="text"
                        value={tspaConfig.receiveAddress}
                        onChange={(e) => setTspaConfig({...tspaConfig, receiveAddress: e.target.value.toUpperCase()})}
                        className="w-full p-2 border rounded font-mono"
                        placeholder="7E8"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Data (d:)</label>
                    <textarea
                      value={tspaConfig.data}
                      onChange={(e) => setTspaConfig({...tspaConfig, data: e.target.value.toUpperCase()})}
                      className="w-full p-2 border rounded font-mono text-xs"
                      rows="2"
                      placeholder="22 F1 90"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Response Lines (r:)</label>
                      <input
                        type="number"
                        value={tspaConfig.responseLines}
                        onChange={(e) => setTspaConfig({...tspaConfig, responseLines: parseInt(e.target.value) || 1})}
                        className="w-full p-2 border rounded"
                        min="1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Timeout (t:)</label>
                      <input
                        type="number"
                        value={tspaConfig.timeout}
                        onChange={(e) => setTspaConfig({...tspaConfig, timeout: parseInt(e.target.value) || 1000})}
                        className="w-full p-2 border rounded"
                        min="1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Checksum (c:)</label>
                      <input
                        type="text"
                        value={tspaConfig.checksum}
                        onChange={(e) => setTspaConfig({...tspaConfig, checksum: e.target.value})}
                        className="w-full p-2 border rounded font-mono"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={executeTSPA}
                    className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                  >
                    Execute TSPA
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Command Reference */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Command Reference</h3>
            
            {activeTab === 'feps' && (
              <div className="space-y-3">
                <div className="font-medium text-red-600 mb-2">FEPS Commands:</div>
                <div className="space-y-1 font-mono text-xs">
                  <div>VT FEPS 1    # Enable 18V output</div>
                  <div>VT FEPS 0    # Disable 18V output</div>
                </div>
                
                <div className="mt-4 text-xs text-gray-600">
                  <div className="font-medium mb-1">FEPS Features:</div>
                  <div>• Pin 13 programming voltage control</div>
                  <div>• 18V output for ECU programming</div>
                  <div>• Safety interlocks and monitoring</div>
                  <div>• Automatic disable on errors</div>
                </div>
              </div>
            )}

            {activeTab === 'fullyrequest' && (
              <div className="space-y-3">
                <div className="font-medium text-blue-600 mb-2">FullyRequest Commands:</div>
                <div className="space-y-1 font-mono text-xs">
                  <div>VT FullyRequest hh...hh [n]</div>
                  <div>VT FullyRequestCk [len] hh...hh [chksum] [n]</div>
                </div>
                
                <div className="mt-4 text-xs text-gray-600">
                  <div className="font-medium mb-1">Parameters:</div>
                  <div>• hh...hh: Hex data field</div>
                  <div>• [n]: Number of reply lines (optional)</div>
                  <div>• [len]: Data field length (for checksum)</div>
                  <div>• [chksum]: Sum check byte (16-bit)</div>
                </div>
              </div>
            )}

            {activeTab === 'tspa' && (
              <div className="space-y-3">
                <div className="font-medium text-green-600 mb-2">TSPA Parameters:</div>
                <div className="space-y-1 font-mono text-xs">
                  <div>a:hhh        # Send address</div>
                  <div>c:hh         # 8-bit checksum</div>
                  <div>d:hh...hh    # Data (max 4128 bytes)</div>
                  <div>r:h~hh       # Reply line number</div>
                  <div>t:d~dddd     # Timeout (ms)</div>
                  <div>z:hhh        # Receive address</div>
                </div>
                
                <div className="mt-4 text-xs text-gray-600">
                  <div className="font-medium mb-1">TSPA Features:</div>
                  <div>• Variadic argument support</div>
                  <div>• Up to 4128 bytes data transmission</div>
                  <div>• Flexible addressing modes</div>
                  <div>• Optimized for large data transfers</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Programming Log */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Programming Log</h3>
            <button
              onClick={clearLog}
              className="text-gray-500 hover:text-gray-700 text-sm"
              disabled={programmingLog.length === 0}
            >
              Clear Log
            </button>
          </div>
          
          <div className="bg-gray-900 text-white p-4 rounded-lg h-64 overflow-y-auto">
            {programmingLog.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                No programming activity
              </div>
            ) : (
              <div className="space-y-1">
                {programmingLog.map(entry => (
                  <LogEntry key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Safety Warning */}
        <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-red-600" size={20} />
            <div className="text-red-700">
              <div className="font-semibold">Programming Safety Warning</div>
              <div className="text-sm mt-1">
                ECU programming operations can damage vehicle systems if performed incorrectly. 
                Ensure proper connections, stable power supply, and use only approved programming data.
                Always verify ECU compatibility before programming.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MIC3X2XProgrammingTools;