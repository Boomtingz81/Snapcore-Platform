import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MIC3X2XDiagnosticTools = () => {
  const [currentProtocol, setCurrentProtocol] = useState('6');
  const [isConnected, setIsConnected] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState({});
  const [faultCodes, setFaultCodes] = useState([]);
  const [freezeFrameData, setFreezeFrameData] = useState(null);
  const [realTimeData, setRealTimeData] = useState({});
  const [vinNumber, setVinNumber] = useState('');
  const [ecuInfo, setEcuInfo] = useState({});
  const [monitorStatus, setMonitorStatus] = useState({});
  const [status, setStatus] = useState('Ready');
  const [commandHistory, setCommandHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // OBD-II Protocols supported by MIC3X2X
  const protocols = {
    '1': 'SAE J1850 PWM (41.6Kbaud)',
    '2': 'SAE J1850 VPW (10.4Kbaud)', 
    '3': 'ISO 9141-2 (5 baud init)',
    '4': 'ISO 14230-4 KWP (5 baud init)',
    '5': 'ISO 14230-4 KWP (fast init)',
    '6': 'ISO 15765-4 CAN (11bit ID, 500 Kbaud)',
    '7': 'ISO 15765-4 CAN (29bit ID, 500 Kbaud)',
    '8': 'ISO 15765-4 CAN (11bit ID, 250 Kbaud)',
    '9': 'ISO 15765-4 CAN (29bit ID, 250 Kbaud)',
    'A': 'SAE J1939 CAN (29bit ID, 250 Kbaud)',
    'B': 'USER1 CAN (11bit ID, 125 Kbaud)',
    'C': 'USER2 CAN (11bit ID, 50 Kbaud)'
  };

  // Standard OBD-II PIDs
  const obdPids = {
    '00': 'PIDs supported [01-20]',
    '01': 'Monitor status since DTCs cleared',
    '02': 'Freeze frame DTC',
    '03': 'Fuel system status',
    '04': 'Calculated engine load',
    '05': 'Engine coolant temperature',
    '06': 'Short term fuel trim—Bank 1',
    '07': 'Long term fuel trim—Bank 1',
    '08': 'Short term fuel trim—Bank 2',
    '09': 'Long term fuel trim—Bank 2',
    '0A': 'Fuel pressure',
    '0B': 'Intake manifold absolute pressure',
    '0C': 'Engine speed',
    '0D': 'Vehicle speed',
    '0E': 'Timing advance',
    '0F': 'Intake air temperature',
    '10': 'Mass air flow sensor (MAF) air flow rate',
    '11': 'Throttle position',
    '12': 'Commanded secondary air status',
    '13': 'Oxygen sensors present (in 2 banks)',
    '14': 'Oxygen Sensor 1',
    '15': 'Oxygen Sensor 2',
    '1F': 'Run time since engine start',
    '20': 'PIDs supported [21-40]',
    '21': 'Distance traveled with malfunction indicator lamp (MIL) on',
    '2F': 'Fuel Tank Level Input',
    '30': 'Warm-ups since codes cleared',
    '31': 'Distance traveled since codes cleared',
    '40': 'PIDs supported [41-60]',
    '41': 'Monitor status this drive cycle',
    '42': 'Control module voltage',
    '43': 'Absolute load value',
    '44': 'Fuel–Air commanded equivalence ratio',
    '45': 'Relative throttle position',
    '46': 'Ambient air temperature',
    '47': 'Absolute throttle position B',
    '48': 'Absolute throttle position C',
    '49': 'Accelerator pedal position D',
    '4A': 'Accelerator pedal position E',
    '4B': 'Accelerator pedal position F',
    '4C': 'Commanded throttle actuator',
    '4D': 'Time run with MIL on',
    '4E': 'Time since trouble codes cleared'
  };

  // Add command to history
  const addToHistory = useCallback((command, response) => {
    setCommandHistory(prev => [...prev, {
      command,
      response,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DIAGNOSTIC'
    }]);
  }, []);

  // Initialize connection
  const initializeConnection = useCallback(async () => {
    try {
      setStatus('Initializing connection...');
      
      // Reset and detect protocol
      addToHistory('ATZ', 'ELM327 v2.3');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      addToHistory('ATSP0', 'OK');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Try to connect with detected protocol
      addToHistory('0100', '41 00 BE 3F A8 13');
      
      setIsConnected(true);
      setStatus('Connected to vehicle');
      
      // Get basic vehicle info
      await getVehicleInfo();
      
    } catch (error) {
      setStatus(`Connection failed: ${error.message}`);
      setIsConnected(false);
    }
  }, [addToHistory]);

  // Get vehicle information
  const getVehicleInfo = useCallback(async () => {
    try {
      setStatus('Reading vehicle information...');
      
      // Get VIN
      addToHistory('0902', '49 02 01 00 00 00 31');
      const mockVin = 'WVWZZZ1JZ3W386752';
      setVinNumber(mockVin);
      
      // Get ECU information
      addToHistory('0904', '49 04 47 4D 20 20 20 20');
      setEcuInfo({
        manufacturer: 'General Motors',
        software: 'v2.3.08',
        hardware: 'MIC3X2X',
        calibration: '12345678'
      });
      
      setStatus('Vehicle information retrieved');
    } catch (error) {
      setStatus(`Error reading vehicle info: ${error.message}`);
    }
  }, [addToHistory]);

  // Read diagnostic trouble codes
  const readDtcs = useCallback(async () => {
    try {
      setStatus('Reading diagnostic trouble codes...');
      
      addToHistory('03', '43 02 01 33 02 34');
      
      // Parse mock DTCs
      const mockDtcs = [
        {
          code: 'P0133',
          description: 'O2 Sensor Circuit Slow Response (Bank 1, Sensor 1)',
          status: 'Confirmed',
          freezeFrame: true
        },
        {
          code: 'P0234', 
          description: 'Turbocharger/Supercharger Overboost Condition',
          status: 'Pending',
          freezeFrame: false
        }
      ];
      
      setFaultCodes(mockDtcs);
      setStatus(`Found ${mockDtcs.length} diagnostic trouble codes`);
      
    } catch (error) {
      setStatus(`Error reading DTCs: ${error.message}`);
    }
  }, [addToHistory]);

  // Clear diagnostic trouble codes
  const clearDtcs = useCallback(async () => {
    try {
      setStatus('Clearing diagnostic trouble codes...');
      
      addToHistory('04', '44');
      
      setFaultCodes([]);
      setFreezeFrameData(null);
      setStatus('Diagnostic trouble codes cleared');
      
    } catch (error) {
      setStatus(`Error clearing DTCs: ${error.message}`);
    }
  }, [addToHistory]);

  // Read freeze frame data
  const readFreezeFrame = useCallback(async (dtcIndex = 0) => {
    try {
      setStatus('Reading freeze frame data...');
      
      addToHistory(`02${dtcIndex.toString(16).padStart(2, '0')}`, '42 00 41 00 BE 3F A8 13');
      
      const mockFreezeFrame = {
        dtc: 'P0133',
        data: {
          '05': { value: 87, unit: '°C', description: 'Engine Coolant Temperature' },
          '0C': { value: 1850, unit: 'RPM', description: 'Engine Speed' },
          '0D': { value: 65, unit: 'km/h', description: 'Vehicle Speed' },
          '11': { value: 45.5, unit: '%', description: 'Throttle Position' },
          '42': { value: 13.8, unit: 'V', description: 'Control Module Voltage' }
        }
      };
      
      setFreezeFrameData(mockFreezeFrame);
      setStatus('Freeze frame data retrieved');
      
    } catch (error) {
      setStatus(`Error reading freeze frame: ${error.message}`);
    }
  }, [addToHistory]);

  // Read real-time data
  const readRealTimeData = useCallback(async (pids = ['05', '0C', '0D', '11']) => {
    try {
      setStatus('Reading real-time data...');
      
      const pidString = `01${pids.join('')}`;
      addToHistory(pidString, '41 05 5F 0C 1C 84 0D 41 11 73');
      
      // Parse mock real-time data
      const mockData = {
        '05': { value: 95, unit: '°C', description: 'Engine Coolant Temperature' },
        '0C': { value: 1860, unit: 'RPM', description: 'Engine Speed' },
        '0D': { value: 65, unit: 'km/h', description: 'Vehicle Speed' },
        '11': { value: 45.1, unit: '%', description: 'Throttle Position' },
        '42': { value: 13.9, unit: 'V', description: 'Control Module Voltage' },
        '0A': { value: 48, unit: 'kPa', description: 'Fuel Pressure' },
        '0B': { value: 32, unit: 'kPa', description: 'Intake Manifold Pressure' },
        '10': { value: 24.5, unit: 'g/s', description: 'Mass Air Flow' }
      };
      
      setRealTimeData(mockData);
      setStatus('Real-time data updated');
      
    } catch (error) {
      setStatus(`Error reading real-time data: ${error.message}`);
    }
  }, [addToHistory]);

  // Read monitor status
  const readMonitorStatus = useCallback(async () => {
    try {
      setStatus('Reading monitor status...');
      
      addToHistory('0101', '41 01 82 07 61 61');
      
      const mockMonitorStatus = {
        mil: false,
        dtcCount: 2,
        monitors: {
          'Misfire': { supported: true, complete: true },
          'Fuel System': { supported: true, complete: true },
          'Components': { supported: true, complete: false },
          'Catalyst': { supported: true, complete: true },
          'Heated Catalyst': { supported: false, complete: false },
          'Evaporative System': { supported: true, complete: true },
          'Secondary Air System': { supported: false, complete: false },
          'A/C Refrigerant': { supported: false, complete: false },
          'Oxygen Sensor': { supported: true, complete: true },
          'Oxygen Sensor Heater': { supported: true, complete: false },
          'EGR System': { supported: true, complete: true }
        }
      };
      
      setMonitorStatus(mockMonitorStatus);
      setStatus('Monitor status retrieved');
      
    } catch (error) {
      setStatus(`Error reading monitor status: ${error.message}`);
    }
  }, [addToHistory]);

  // Auto-refresh real-time data
  useEffect(() => {
    let interval;
    if (isConnected && activeTab === 'realtime') {
      interval = setInterval(() => {
        readRealTimeData();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isConnected, activeTab, readRealTimeData]);

  // Format diagnostic data for display
  const formatValue = (value, unit) => {
    if (typeof value === 'number') {
      return `${value.toFixed(1)} ${unit}`;
    }
    return `${value} ${unit}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            MIC3X2X Diagnostic Tools
            <div className="flex items-center space-x-2 text-sm">
              <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Bar */}
          <Alert>
            <AlertDescription>
              Status: {status} | Protocol: {protocols[currentProtocol]} | VIN: {vinNumber || 'Not available'}
            </AlertDescription>
          </Alert>

          {/* Connection Controls */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={initializeConnection}
              disabled={isConnected}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded font-medium"
            >
              Connect to Vehicle
            </button>
            
            <button
              onClick={() => {
                setIsConnected(false);
                setStatus('Disconnected');
                setDiagnosticData({});
                setFaultCodes([]);
                setRealTimeData({});
              }}
              disabled={!isConnected}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded font-medium"
            >
              Disconnect
            </button>

            <select
              value={currentProtocol}
              onChange={(e) => setCurrentProtocol(e.target.value)}
              disabled={isConnected}
              className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
            >
              {Object.entries(protocols).map(([value, label]) => (
                <option key={value} value={value}>{value}: {label}</option>
              ))}
            </select>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-2 border-b">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'dtcs', label: 'Fault Codes' },
              { id: 'realtime', label: 'Live Data' },
              { id: 'freeze', label: 'Freeze Frame' },
              { id: 'monitors', label: 'Monitors' },
              { id: 'advanced', label: 'Advanced' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium ${activeTab === tab.id 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>VIN:</strong> {vinNumber || 'Not available'}</div>
                  <div><strong>Protocol:</strong> {protocols[currentProtocol]}</div>
                  <div><strong>ECU Manufacturer:</strong> {ecuInfo.manufacturer || 'Unknown'}</div>
                  <div><strong>Software Version:</strong> {ecuInfo.software || 'Unknown'}</div>
                  <div><strong>Hardware:</strong> {ecuInfo.hardware || 'Unknown'}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>MIL Status:</span>
                    <span className={monitorStatus.mil ? 'text-red-600 font-bold' : 'text-green-600'}>
                      {monitorStatus.mil ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>DTC Count:</span>
                    <span className={faultCodes.length > 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                      {faultCodes.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connection:</span>
                    <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                      {isConnected ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'dtcs' && (
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={readDtcs}
                  disabled={!isConnected}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded font-medium"
                >
                  Read DTCs
                </button>
                <button
                  onClick={clearDtcs}
                  disabled={!isConnected || faultCodes.length === 0}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded font-medium"
                >
                  Clear DTCs
                </button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Diagnostic Trouble Codes ({faultCodes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {faultCodes.length === 0 ? (
                    <div className="text-gray-500 text-center py-4">No fault codes found</div>
                  ) : (
                    <div className="space-y-3">
                      {faultCodes.map((dtc, index) => (
                        <div key={index} className="border rounded p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-lg">{dtc.code}</div>
                              <div className="text-gray-700">{dtc.description}</div>
                              <div className="text-sm text-gray-500">Status: {dtc.status}</div>
                            </div>
                            <div className="space-y-2">
                              {dtc.freezeFrame && (
                                <button
                                  onClick={() => readFreezeFrame(index)}
                                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                                >
                                  Freeze Frame
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'realtime' && (
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => readRealTimeData()}
                  disabled={!isConnected}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded font-medium"
                >
                  Refresh Data
                </button>
                <div className="text-sm text-gray-500 flex items-center">
                  Auto-refresh: {isConnected && activeTab === 'realtime' ? 'ON' : 'OFF'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(realTimeData).map(([pid, data]) => (
                  <Card key={pid}>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-500">PID {pid}</div>
                      <div className="font-bold text-2xl">{formatValue(data.value, data.unit)}</div>
                      <div className="text-sm text-gray-700">{data.description}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'freeze' && (
            <div className="space-y-4">
              {freezeFrameData ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Freeze Frame Data - {freezeFrameData.dtc}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(freezeFrameData.data).map(([pid, data]) => (
                        <div key={pid} className="border rounded p-3">
                          <div className="text-sm text-gray-500">PID {pid}</div>
                          <div className="font-bold text-xl">{formatValue(data.value, data.unit)}</div>
                          <div className="text-sm text-gray-700">{data.description}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <div className="text-gray-500">No freeze frame data available</div>
                    <div className="text-sm text-gray-400 mt-2">
                      Read DTCs first, then select a code with freeze frame data
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'monitors' && (
            <div className="space-y-4">
              <button
                onClick={readMonitorStatus}
                disabled={!isConnected}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded font-medium"
              >
                Read Monitor Status
              </button>

              {Object.keys(monitorStatus).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Readiness Monitors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(monitorStatus.monitors || {}).map(([monitor, status]) => (
                        <div key={monitor} className="flex justify-between items-center border-b pb-2">
                          <span>{monitor}</span>
                          <div className="space-x-2">
                            <span className={`px-2 py-1 rounded text-xs ${status.supported ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                              {status.supported ? 'Supported' : 'N/A'}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${status.complete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {status.complete ? 'Complete' : 'Incomplete'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Diagnostic Functions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => addToHistory('0902', '49 02 01 ' + vinNumber)}
                      disabled={!isConnected}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white rounded"
                    >
                      Read VIN
                    </button>
                    <button
                      onClick={() => addToHistory('0904', '49 04 47 4D 20 20 20 20')}
                      disabled={!isConnected}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white rounded"
                    >
                      Read Calibration ID
                    </button>
                    <button
                      onClick={() => addToHistory('090A', '49 0A 45 43 55 20 4E 61 6D 65')}
                      disabled={!isConnected}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white rounded"
                    >
                      Read ECU Name
                    </button>
                    <button
                      onClick={() => addToHistory('01C4', '41 C4 12 34 56 78')}
                      disabled={!isConnected}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white rounded"
                    >
                      Read Performance Tracking
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom PID Reader</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Enter PID (e.g., 010C for RPM)"
                      className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                      disabled={!isConnected}
                    />
                    <button
                      disabled={!isConnected}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded"
                    >
                      Send
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Command History */}
          <Card>
            <CardHeader>
              <CardTitle>Command History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {commandHistory.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">No commands executed yet</div>
                ) : (
                  commandHistory.map((cmd, index) => (
                    <div key={index} className="font-mono text-sm border-l-4 border-blue-500 pl-2">
                      <div className="text-blue-600">&gt; {cmd.command}</div>
                      <div className="text-green-600">{cmd.response}</div>
                      <div className="text-xs text-gray-500">{cmd.timestamp}</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default MIC3X2XDiagnosticTools;