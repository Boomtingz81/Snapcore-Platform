import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Settings, Monitor, Zap, MessageSquare, Database, Bluetooth, Power, AlertTriangle, CheckCircle, XCircle, Radio, Cpu, Activity } from 'lucide-react';

const MIC3X2XInterface = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [currentProtocol, setCurrentProtocol] = useState('6');
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [commandInput, setCommandInput] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    protocols: true,
    filters: false,
    power: false,
    bluetooth: false
  });
  
  // Mock device status
  const [deviceStatus, setDeviceStatus] = useState({
    version: 'MIC3X2X V2.3.08',
    voltage: 12.4,
    temperature: 45,
    canActivity: true,
    protocolActive: true,
    periodicMessages: 2,
    filters: { pass: 3, block: 1, flowControl: 2 }
  });

  const [protocolSettings, setProtocolSettings] = useState({
    current: 'ISO 15765-4 (CAN 11/500)',
    baudRate: 500000,
    addressing: '11-bit',
    flowControl: true,
    headers: true
  });

  const protocols = {
    'AT': {
      '1': 'SAE J1850 PWM',
      '2': 'SAE J1850 VPW', 
      '3': 'ISO 9141-2',
      '4': 'ISO 14230-4 (KWP 5BAUD)',
      '5': 'ISO 14230-4 (KWP FAST)',
      '6': 'ISO 15765-4 (CAN 11/500)',
      '7': 'ISO 15765-4 (CAN 29/500)',
      '8': 'ISO 15765-4 (CAN 11/250)',
      '9': 'ISO 15765-4 (CAN 29/250)',
      'A': 'SAE J1939 (CAN 29/250)',
      'B': 'USER1 CAN (11/125)',
      'C': 'USER2 CAN (11/50)'
    },
    'ST': {
      '33': 'HS CAN (ISO 15765, 11-bit, 500K)',
      '53': 'MS CAN (ISO 15765, 11-bit, 125K)', 
      '63': 'SW CAN (ISO 15765, 11-bit, 33.3K)',
      'C3': 'CH CAN (ISO 15765, 11-bit, 500K)',
      'D3': 'LS CAN (ISO 15765, 11-bit, 500K)'
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sendCommand = () => {
    if (!commandInput.trim()) return;
    
    const timestamp = new Date().toLocaleTimeString();
    setTerminalOutput(prev => [
      ...prev,
      { type: 'command', text: commandInput, timestamp },
      { type: 'response', text: 'OK', timestamp }
    ]);
    setCommandInput('');
  };

  const connectDevice = () => {
    setConnectionStatus(connectionStatus === 'connected' ? 'disconnected' : 'connected');
  };

  const StatusIndicator = ({ status, label }) => {
    const getStatusIcon = () => {
      switch(status) {
        case 'connected':
        case 'active':
        case true:
          return <CheckCircle className="w-4 h-4 text-green-500" />;
        case 'disconnected':
        case 'inactive':
        case false:
          return <XCircle className="w-4 h-4 text-red-500" />;
        default:
          return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      }
    };

    return (
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-sm">{label}</span>
      </div>
    );
  };

  const MetricCard = ({ icon: Icon, label, value, unit = '', status = 'normal' }) => {
    const getStatusColor = () => {
      switch(status) {
        case 'good': return 'text-green-600';
        case 'warning': return 'text-yellow-600';
        case 'error': return 'text-red-600';
        default: return 'text-blue-600';
      }
    };

    return (
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${getStatusColor()}`} />
          <div>
            <div className="text-sm text-gray-600">{label}</div>
            <div className={`text-xl font-bold ${getStatusColor()}`}>
              {value}{unit}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === id 
          ? 'bg-blue-100 text-blue-700' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  const SectionHeader = ({ title, section, children }) => (
    <div className="border rounded-lg">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
      >
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {expandedSections[section] ? 
          <ChevronDown className="w-5 h-5" /> : 
          <ChevronRight className="w-5 h-5" />
        }
      </button>
      {expandedSections[section] && (
        <div className="p-4 border-t bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">MIC3X2X OBD Interface</h1>
            <p className="text-gray-600">Multiprotocol OBD to UART Interpreter v2.3.08</p>
          </div>
          <div className="flex items-center gap-4">
            <StatusIndicator status={connectionStatus} label={`Device ${connectionStatus}`} />
            <button
              onClick={connectDevice}
              className={`px-4 py-2 rounded-lg font-medium ${
                connectionStatus === 'connected'
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {connectionStatus === 'connected' ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <TabButton id="dashboard" label="Dashboard" icon={Activity} />
        <TabButton id="protocols" label="Protocols" icon={Settings} />
        <TabButton id="monitoring" label="Monitoring" icon={Monitor} />
        <TabButton id="terminal" label="Terminal" icon={MessageSquare} />
        <TabButton id="power" label="Power" icon={Power} />
        <TabButton id="bluetooth" label="Bluetooth" icon={Bluetooth} />
        <TabButton id="advanced" label="Advanced" icon={Cpu} />
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard icon={Zap} label="Voltage" value={deviceStatus.voltage} unit="V" status="good" />
            <MetricCard icon={Radio} label="CAN Activity" value={deviceStatus.canActivity ? 'Active' : 'Inactive'} status={deviceStatus.canActivity ? 'good' : 'error'} />
            <MetricCard icon={Settings} label="Protocol" value={currentProtocol} status="good" />
            <MetricCard icon={MessageSquare} label="Periodic Msgs" value={deviceStatus.periodicMessages} status="normal" />
          </div>

          {/* Protocol Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Current Protocol Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Protocol</label>
                <div className="text-lg">{protocolSettings.current}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Baud Rate</label>
                <div className="text-lg">{protocolSettings.baudRate.toLocaleString()} bps</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Addressing</label>
                <div className="text-lg">{protocolSettings.addressing}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Flow Control</label>
                <div className="text-lg">{protocolSettings.flowControl ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                <div className="font-medium">Reset Device</div>
                <div className="text-sm text-gray-600">ATZ - Full reset</div>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                <div className="font-medium">Read Voltage</div>
                <div className="text-sm text-gray-600">Check battery voltage</div>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                <div className="font-medium">Scan Protocols</div>
                <div className="text-sm text-gray-600">Auto-detect vehicle</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Protocols Tab */}
      {activeTab === 'protocols' && (
        <div className="space-y-6">
          <SectionHeader title="AT Protocols (ELM327 Compatible)" section="protocols">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(protocols.AT).map(([id, name]) => (
                <div key={id} className="p-3 border rounded-lg hover:bg-white cursor-pointer">
                  <div className="font-medium">{id}: {name}</div>
                  <div className="text-sm text-gray-600">Protocol {id}</div>
                </div>
              ))}
            </div>
          </SectionHeader>

          <SectionHeader title="ST Protocols (STN Compatible)" section="filters">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(protocols.ST).map(([id, name]) => (
                <div key={id} className="p-3 border rounded-lg hover:bg-white cursor-pointer">
                  <div className="font-medium">{id}: {name}</div>
                  <div className="text-sm text-gray-600">Protocol {id}</div>
                </div>
              ))}
            </div>
          </SectionHeader>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Custom VT Protocols (101-140)</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" placeholder="Protocol ID (101-140)" className="border rounded px-3 py-2" />
                <select className="border rounded px-3 py-2">
                  <option>HS_CAN</option>
                  <option>MS_CAN</option>
                  <option>SW_CAN</option>
                  <option>CH_CAN</option>
                  <option>LS_CAN</option>
                </select>
                <input type="text" placeholder="Baud Rate" className="border rounded px-3 py-2" />
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Configure
                </button>
              </div>
              <p className="text-sm text-gray-600">Configure custom protocols with specific CAN settings and save them for reuse.</p>
            </div>
          </div>
        </div>
      )}

      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Bus Monitoring</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Filter Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Pass Filters</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {deviceStatus.filters.pass} active
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Block Filters</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      {deviceStatus.filters.block} active
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Flow Control</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {deviceStatus.filters.flowControl} active
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3">Monitor Controls</h3>
                <div className="space-y-3">
                  <button className="w-full p-3 border rounded hover:bg-gray-50 text-left">
                    <div className="font-medium">Monitor All (ATMA)</div>
                    <div className="text-sm text-gray-600">Monitor all bus activity</div>
                  </button>
                  <button className="w-full p-3 border rounded hover:bg-gray-50 text-left">
                    <div className="font-medium">Monitor Filtered (VTMFCA)</div>
                    <div className="text-sm text-gray-600">Monitor with current filters</div>
                  </button>
                  <button className="w-full p-3 border rounded hover:bg-gray-50 text-left">
                    <div className="font-medium">Show Bus Activity</div>
                    <div className="text-sm text-gray-600">Analyze bus protocols</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Live Data Stream</h3>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
              <div>7E8 06 41 00 BE 3F A8 13</div>
              <div>7E9 06 41 00 BF BE F9 80</div>
              <div>7EC 06 41 00 00 00 00 00</div>
              <div className="text-gray-500">[Monitoring active...]</div>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Tab */}
      {activeTab === 'terminal' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Command Terminal</h2>
            <p className="text-gray-600">Send AT, ST, or VT commands directly to the MIC3X2X</p>
          </div>
          <div className="p-4">
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto mb-4">
              {terminalOutput.map((line, i) => (
                <div key={i} className={line.type === 'command' ? 'text-yellow-400' : 'text-green-400'}>
                  <span className="text-gray-500">[{line.timestamp}]</span> {line.type === 'command' ? '>' : ''} {line.text}
                </div>
              ))}
              <div className="text-gray-500">Ready for commands...</div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendCommand()}
                placeholder="Enter command (e.g., ATI, VTVERS, 0100)"
                className="flex-1 border rounded px-3 py-2 font-mono"
              />
              <button
                onClick={sendCommand}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                Send
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <button onClick={() => setCommandInput('ATI')} className="p-2 border rounded hover:bg-gray-50">ATI</button>
              <button onClick={() => setCommandInput('ATDP')} className="p-2 border rounded hover:bg-gray-50">ATDP</button>
              <button onClick={() => setCommandInput('VTVERS')} className="p-2 border rounded hover:bg-gray-50">VTVERS</button>
              <button onClick={() => setCommandInput('0100')} className="p-2 border rounded hover:bg-gray-50">0100</button>
            </div>
          </div>
        </div>
      )}

      {/* Power Management Tab */}
      {activeTab === 'power' && (
        <div className="space-y-6">
          <SectionHeader title="Power Management Settings" section="power">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Sleep Triggers</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>UART Silence</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>OBD Bus Silence</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Low Voltage Threshold</label>
                    <div className="flex gap-2">
                      <input type="number" step="0.1" placeholder="6.8" className="border rounded px-3 py-2 w-20" />
                      <span className="self-center">V</span>
                      <input type="number" placeholder="20" className="border rounded px-3 py-2 w-20" />
                      <span className="self-center">seconds</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Wake Triggers</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>UART Activity</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>OBD Bus Activity</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-blue-600 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:translate-x-full"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Voltage Drop Detection</label>
                    <div className="flex gap-2">
                      <input type="number" step="0.1" placeholder="2.5" className="border rounded px-3 py-2 w-20" />
                      <span className="self-center">V drop,</span>
                      <input type="number" placeholder="20" className="border rounded px-3 py-2 w-20" />
                      <span className="self-center">ms duration</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionHeader>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Current Power Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard icon={Zap} label="Input Voltage" value="12.4" unit="V" status="good" />
              <MetricCard icon={Power} label="Current Draw" value="34" unit="mA" status="normal" />
              <MetricCard icon={Activity} label="Power Mode" value="Normal" status="good" />
            </div>
          </div>
        </div>
      )}

      {/* Bluetooth Tab */}
      {activeTab === 'bluetooth' && (
        <div className="space-y-6">
          <SectionHeader title="Bluetooth Configuration" section="bluetooth">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Device Name</label>
                  <input type="text" defaultValue="vLinker FS 00001" className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">PIN Code</label>
                  <input type="text" defaultValue="1234" className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Class of Device</label>
                  <input type="text" defaultValue="001F00" className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Discovery Mode</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option>Disabled</option>
                    <option>Always Discoverable</option>
                    <option>Auto 300s on Power</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Work Mode</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option>BT 3.0 Classic</option>
                    <option>BT 3.0 + MFI</option>
                    <option>BT 3.0 + BLE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pairing Mode</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option>PIN Code Required</option>
                    <option>Simple Pairing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">HCI Baud Rate</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option>115200</option>
                    <option>2000000</option>
                    <option>4000000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">BLE Name</label>
                  <input type="text" defaultValue="vLinker FS-IOS" className="w-full border rounded px-3 py-2" />
                </div>
              </div>
            </div>
          </SectionHeader>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Connection Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Bluetooth className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Bluetooth Classic</span>
                </div>
                <StatusIndicator status="disconnected" label="Not Connected" />
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Radio className="w-5 h-5 text-green-500" />
                  <span className="font-medium">BLE</span>
                </div>
                <StatusIndicator status="disconnected" label="Not Connected" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">EEPROM Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Write Data</h4>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Position (00-FF)" className="border rounded px-3 py-2 w-32" />
                    <input type="text" placeholder="Data (hex bytes)" className="flex-1 border rounded px-3 py-2" />
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Write</button>
                  </div>
                  <p className="text-sm text-gray-600">Write up to 8 bytes to user EEPROM (256 bytes total, 10,000+ write cycles)</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Read Data</h4>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Position (00-FF)" className="border rounded px-3 py-2 w-32" />
                    <input type="text" placeholder="Length (01-FF)" className="border rounded px-3 py-2 w-32" />
                    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Read</button>
                  </div>
                  <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                    01 02 03 04 05 06 07 08<br/>
                    11 12 13 14 15 16 17 18
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Device Identification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Unique Device ID</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Enter device ID (up to 15 chars)" className="flex-1 border rounded px-3 py-2" />
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Set</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">MAC Address</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="6 or 12 byte MAC (hex)" className="flex-1 border rounded px-3 py-2" />
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Set</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Custom ATI String</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Device description (47 chars max)" className="flex-1 border rounded px-3 py-2" />
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Set</button>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Values</label>
                  <div className="space-y-2 text-sm">
                    <div><strong>Serial Number:</strong> 449519228014E7FEB70AD003B0B517529DC2A1A401640190</div>
                    <div><strong>Device ID:</strong> Not Set</div>
                    <div><strong>MAC Address:</strong> Not Set</div>
                    <div><strong>ATI String:</strong> MIC3X2X v2.3.08</div>
                  </div>
                </div>
                <button className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                  Read All Values
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Multi-Packet Transmission (TP)</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Total Length</label>
                  <input type="number" min="50" max="4128" placeholder="Total bytes" className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Block Size</label>
                  <input type="number" min="1" max="500" placeholder="Bytes per packet" className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Enable Checksum</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option value="0">Disabled</option>
                    <option value="1">Enabled</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Start TP_RTS</button>
                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Send TP_DT</button>
                <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">End TP_END</button>
                <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Abort TP_ABORT</button>
              </div>
              <p className="text-sm text-gray-600">
                Multi-packet transmission allows sending up to 4128 bytes with error checking and recovery.
                Useful for ECU programming and large data transfers.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Periodic Message Groups</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                <input type="number" min="1" max="8" placeholder="Group #" className="border rounded px-3 py-2" />
                <input type="text" placeholder="Header" className="border rounded px-3 py-2" />
                <input type="text" placeholder="Data (hex)" className="border rounded px-3 py-2" />
                <input type="number" placeholder="Period (ms)" className="border rounded px-3 py-2" />
                <select className="border rounded px-3 py-2">
                  <option value="01">Mode 01</option>
                  <option value="02">Mode 02</option>
                  <option value="03">Mode 03</option>
                  <option value="09">Mode 09 (Auto Header)</option>
                  <option value="0A">Mode 0A (Auto Header)</option>
                  <option value="0B">Mode 0B (Auto Header)</option>
                </select>
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add</button>
              </div>
              
              <div className="border rounded-lg">
                <div className="p-3 border-b bg-gray-50">
                  <h4 className="font-medium">Active Periodic Messages</h4>
                </div>
                <div className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="flex gap-4">
                        <span className="font-mono text-sm">Group 1:</span>
                        <span className="font-mono text-sm">7DF → 3E 80</span>
                        <span className="text-sm text-gray-600">Every 1000ms</span>
                      </div>
                      <button className="text-red-600 hover:text-red-800">Delete</button>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="flex gap-4">
                        <span className="font-mono text-sm">Group 2:</span>
                        <span className="font-mono text-sm">710 → 02 01 00</span>
                        <span className="text-sm text-gray-600">Every 500ms</span>
                      </div>
                      <button className="text-red-600 hover:text-red-800">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Programming Parameters (PP)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Common Parameters</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">PP 0C - RS232 Baud Rate</span>
                    <input type="text" defaultValue="68" className="w-16 border rounded px-2 py-1 text-sm" />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">PP 06 - OBD Source Address</span>
                    <input type="text" defaultValue="F1" className="w-16 border rounded px-2 py-1 text-sm" />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">PP 03 - Timeout Setting</span>
                    <input type="text" defaultValue="32" className="w-16 border rounded px-2 py-1 text-sm" />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">PP 0E - Power Control</span>
                    <input type="text" defaultValue="9A" className="w-16 border rounded px-2 py-1 text-sm" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">CAN Parameters</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">PP 2C - Protocol B Options</span>
                    <input type="text" defaultValue="E0" className="w-16 border rounded px-2 py-1 text-sm" />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">PP 2D - Protocol B Baud Rate</span>
                    <input type="text" defaultValue="04" className="w-16 border rounded px-2 py-1 text-sm" />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">PP 22 - CAN Wakeup Rate</span>
                    <input type="text" defaultValue="62" className="w-16 border rounded px-2 py-1 text-sm" />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">PP 26 - CAN Filler Byte</span>
                    <input type="text" defaultValue="00" className="w-16 border rounded px-2 py-1 text-sm" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Apply Changes</button>
              <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Reset to Defaults</button>
              <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Read All PP</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MIC3X2XInterface;