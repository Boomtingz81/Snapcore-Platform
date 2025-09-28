import React, { useState, useEffect } from 'react';
import { Bluetooth, Settings, Radio, Wifi, Power, RefreshCw, Save, Eye, EyeOff, AlertTriangle, CheckCircle, Info, Terminal } from 'lucide-react';

const MIC3X2XBluetoothManager = () => {
  const [activeTab, setActiveTab] = useState('config');
  const [bluetoothConfig, setBluetoothConfig] = useState({
    cod: '001F00',
    discoveryMode: '1',
    deviceName: 'vLinker FS 00001',
    hciBaud: '2000000',
    bleName: 'vLinker FS-IOS',
    pin: '1234',
    pkParam: '1010 2020 2020',
    pairingMode: '2',
    workMode: '3'
  });
  
  const [bluetoothInfo, setBluetoothInfo] = useState({
    name: 'MIC3624 00001',
    bleName: 'MIC3624-IOS',
    mac: 'C4F312205D7F',
    softwareVersion: '1.1.6,20230222',
    cod: '001F00',
    mode: 'BT3.0+BLE'
  });
  
  const [commandOutput, setCommandOutput] = useState([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // BTMD Commands from datasheet
  const btmdCommands = {
    'Device Information': [
      { cmd: 'VTBTMD I', desc: 'Read Bluetooth module information', category: 'info' },
      { cmd: 'VTBTMD COD', desc: 'Read class of device', category: 'info' },
      { cmd: 'VTBTMD DN', desc: 'Read device name', category: 'info' },
      { cmd: 'VTBTMD LEDN', desc: 'Read BLE name', category: 'info' }
    ],
    'Basic Configuration': [
      { cmd: 'VTBTMD COD <hhhhhh>', desc: 'Set class of device', category: 'config' },
      { cmd: 'VTBTMD DN <ascii>', desc: 'Set device name (max 23 chars)', category: 'config' },
      { cmd: 'VTBTMD LEDN <ascii>', desc: 'Set BLE name (max 23 chars)', category: 'config' },
      { cmd: 'VTBTMD PIN <ascii>', desc: 'Set PIN code (max 6 chars)', category: 'config' }
    ],
    'Advanced Settings': [
      { cmd: 'VTBTMD DM <h>', desc: 'Set discovery mode (0-2)', category: 'advanced' },
      { cmd: 'VTBTMD HCIBAUD <ascii>', desc: 'Set HCI baud rate (115200-4000000)', category: 'advanced' },
      { cmd: 'VTBTMD PKPARAM <ascii>', desc: 'Set SPP configuration params', category: 'advanced' },
      { cmd: 'VTBTMD PM <h>', desc: 'Set pairing mode (1-2)', category: 'advanced' },
      { cmd: 'VTBTMD WM <h>', desc: 'Set work mode (1,3,5)', category: 'advanced' }
    ]
  };

  // Class of Device options from datasheet
  const codOptions = [
    { value: '001F00', label: '001F00 - Default' },
    { value: '200404', label: '200404 - Audio/Video' },
    { value: '240404', label: '240404 - Computer' },
    { value: '080704', label: '080704 - Phone' }
  ];

  // Discovery Mode options from datasheet
  const discoveryModes = [
    { value: '0', label: 'Disabled - Key press required' },
    { value: '1', label: 'Always discoverable' },
    { value: '2', label: 'Auto 300s on power up' }
  ];

  // Work Mode options from datasheet
  const workModes = [
    { value: '1', label: 'BT 3.0 Classic' },
    { value: '3', label: 'BT 3.0 + MFI' },
    { value: '5', label: 'BT 3.0 + BLE' }
  ];

  // Pairing Mode options from datasheet
  const pairingModes = [
    { value: '1', label: 'PIN Code Required' },
    { value: '2', label: 'Simple Pairing' }
  ];

  // HCI Baud Rate options from datasheet
  const hciBaudRates = [
    { value: '115200', label: '115200 bps' },
    { value: '2000000', label: '2000000 bps' },
    { value: '4000000', label: '4000000 bps' }
  ];

  const executeCommand = (command) => {
    const timestamp = new Date().toLocaleTimeString();
    setCommandOutput(prev => [...prev, {
      type: 'command',
      text: command,
      timestamp
    }]);

    // Simulate responses based on datasheet examples
    let response = 'ERROR';
    const upperCmd = command.toUpperCase().trim();

    if (upperCmd === 'VTBTMD I') {
      response = `Name:${bluetoothInfo.name}\nBleName:${bluetoothInfo.bleName}\nMAC:${bluetoothInfo.mac}\nSoftware version:${bluetoothInfo.softwareVersion}\nCOD:${bluetoothInfo.cod}\nMode:${bluetoothInfo.mode}`;
    } else if (upperCmd === 'VTBTMD COD') {
      response = bluetoothConfig.cod;
    } else if (upperCmd === 'VTBTMD DN') {
      response = bluetoothConfig.deviceName;
    } else if (upperCmd === 'VTBTMD LEDN') {
      response = bluetoothConfig.bleName;
    } else if (upperCmd === 'VTBTMD PIN') {
      response = bluetoothConfig.pin;
    } else if (upperCmd === 'VTBTMD DM') {
      response = bluetoothConfig.discoveryMode;
    } else if (upperCmd === 'VTBTMD HCIBAUD') {
      response = bluetoothConfig.hciBaud;
    } else if (upperCmd === 'VTBTMD PKPARAM') {
      response = bluetoothConfig.pkParam;
    } else if (upperCmd === 'VTBTMD PM') {
      response = bluetoothConfig.pairingMode;
    } else if (upperCmd === 'VTBTMD WM') {
      response = bluetoothConfig.workMode;
    } else if (upperCmd.startsWith('VTBTMD ') && upperCmd.includes(' ')) {
      response = 'OK';
    }

    setTimeout(() => {
      setCommandOutput(prev => [...prev, {
        type: 'response',
        text: response,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }, 100);
  };

  const sendCommand = () => {
    if (!currentCommand.trim()) return;
    executeCommand(currentCommand);
    setCurrentCommand('');
  };

  const applyConfiguration = () => {
    const commands = [
      `VTBTMD COD ${bluetoothConfig.cod}`,
      `VTBTMD DN ${bluetoothConfig.deviceName}`,
      `VTBTMD LEDN ${bluetoothConfig.bleName}`,
      `VTBTMD PIN ${bluetoothConfig.pin}`,
      `VTBTMD DM ${bluetoothConfig.discoveryMode}`,
      `VTBTMD HCIBAUD ${bluetoothConfig.hciBaud}`,
      `VTBTMD PKPARAM ${bluetoothConfig.pkParam}`,
      `VTBTMD PM ${bluetoothConfig.pairingMode}`,
      `VTBTMD WM ${bluetoothConfig.workMode}`
    ];

    commands.forEach((cmd, index) => {
      setTimeout(() => executeCommand(cmd), index * 200);
    });
  };

  const readAllSettings = () => {
    const readCommands = [
      'VTBTMD I',
      'VTBTMD COD',
      'VTBTMD DN', 
      'VTBTMD LEDN',
      'VTBTMD PIN',
      'VTBTMD DM',
      'VTBTMD HCIBAUD',
      'VTBTMD PKPARAM',
      'VTBTMD PM',
      'VTBTMD WM'
    ];

    readCommands.forEach((cmd, index) => {
      setTimeout(() => executeCommand(cmd), index * 150);
    });
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

  const ConfigField = ({ label, value, onChange, options, type = 'text', maxLength, helpText }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          className="w-full border rounded-lg px-3 py-2"
        />
      )}
      {helpText && (
        <div className="text-xs text-gray-500">{helpText}</div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bluetooth className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">MIC3X2X Bluetooth Manager</h1>
              <p className="text-gray-600">Configure Bluetooth module using BTMD commands</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              <Radio className="w-4 h-4" />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <button
              onClick={() => setIsConnected(!isConnected)}
              className={`px-4 py-2 rounded-lg font-medium ${
                isConnected 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <TabButton id="config" label="Configuration" icon={Settings} />
        <TabButton id="info" label="Device Info" icon={Info} />
        <TabButton id="commands" label="BTMD Commands" icon={Terminal} />
      </div>

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Basic Settings</h2>
              <div className="flex gap-2">
                <button
                  onClick={readAllSettings}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                >
                  <RefreshCw className="w-3 h-3" />
                  Read
                </button>
                <button
                  onClick={applyConfiguration}
                  className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                >
                  <Save className="w-3 h-3" />
                  Apply
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <ConfigField
                label="Device Name"
                value={bluetoothConfig.deviceName}
                onChange={(value) => setBluetoothConfig(prev => ({ ...prev, deviceName: value }))}
                maxLength={23}
                helpText="Maximum 23 characters. Changes take effect after power restart."
              />

              <ConfigField
                label="BLE Name"
                value={bluetoothConfig.bleName}
                onChange={(value) => setBluetoothConfig(prev => ({ ...prev, bleName: value }))}
                maxLength={23}
                helpText="Bluetooth Low Energy name. Maximum 23 characters."
              />

              <ConfigField
                label="PIN Code"
                value={bluetoothConfig.pin}
                onChange={(value) => setBluetoothConfig(prev => ({ ...prev, pin: value }))}
                maxLength={6}
                helpText="Maximum 6 characters. Used for pairing authentication."
              />

              <ConfigField
                label="Class of Device (COD)"
                value={bluetoothConfig.cod}
                onChange={(value) => setBluetoothConfig(prev => ({ ...prev, cod: value }))}
                options={codOptions}
                helpText="Defines device type for Bluetooth discovery."
              />

              <ConfigField
                label="Discovery Mode"
                value={bluetoothConfig.discoveryMode}
                onChange={(value) => setBluetoothConfig(prev => ({ ...prev, discoveryMode: value }))}
                options={discoveryModes}
                helpText="Controls when device is discoverable to other devices."
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Advanced Settings</h2>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                {showAdvanced ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showAdvanced ? 'Hide' : 'Show'}
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-4">
                <ConfigField
                  label="Work Mode"
                  value={bluetoothConfig.workMode}
                  onChange={(value) => setBluetoothConfig(prev => ({ ...prev, workMode: value }))}
                  options={workModes}
                  helpText="Operating mode. Changes take effect after power restart."
                />

                <ConfigField
                  label="Pairing Mode"
                  value={bluetoothConfig.pairingMode}
                  onChange={(value) => setBluetoothConfig(prev => ({ ...prev, pairingMode: value }))}
                  options={pairingModes}
                  helpText="Authentication method for device pairing."
                />

                <ConfigField
                  label="HCI Baud Rate"
                  value={bluetoothConfig.hciBaud}
                  onChange={(value) => setBluetoothConfig(prev => ({ ...prev, hciBaud: value }))}
                  options={hciBaudRates}
                  helpText="Host Controller Interface communication speed."
                />

                <ConfigField
                  label="SPP Parameters"
                  value={bluetoothConfig.pkParam}
                  onChange={(value) => setBluetoothConfig(prev => ({ ...prev, pkParam: value }))}
                  helpText="Format: MaxFrameSize TxBufferSize RxBufferSize (e.g., 640 987 987)"
                />
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-yellow-800">Important Notes</div>
                  <ul className="text-yellow-700 mt-1 space-y-1">
                    <li>• Changes take effect after device power restart</li>
                    <li>• Invalid settings may cause connection issues</li>
                    <li>• Use "Read" button to verify current settings</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Device Info Tab */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Bluetooth Module Information</h2>
            <button
              onClick={() => executeCommand('VTBTMD I')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Info
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Device Name</label>
                <div className="text-lg font-mono">{bluetoothInfo.name}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">BLE Name</label>
                <div className="text-lg font-mono">{bluetoothInfo.bleName}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">MAC Address</label>
                <div className="text-lg font-mono">{bluetoothInfo.mac}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Software Version</label>
                <div className="text-lg font-mono">{bluetoothInfo.softwareVersion}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Class of Device</label>
                <div className="text-lg font-mono">{bluetoothInfo.cod}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Operating Mode</label>
                <div className="text-lg font-mono">{bluetoothInfo.mode}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Connection Status</label>
                <div className={`flex items-center gap-2 ${isConnected ? 'text-green-600' : 'text-gray-600'}`}>
                  {isConnected ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  {isConnected ? 'Connected' : 'Not Connected'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Discovery Status</label>
                <div className="text-lg">
                  {bluetoothConfig.discoveryMode === '0' ? 'Disabled' :
                   bluetoothConfig.discoveryMode === '1' ? 'Always On' : 'Auto 300s'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BTMD Commands Tab */}
      {activeTab === 'commands' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">BTMD Command Reference</h2>
            
            {Object.entries(btmdCommands).map(([category, commands]) => (
              <div key={category} className="mb-6">
                <h3 className="font-medium text-lg mb-3">{category}</h3>
                <div className="space-y-2">
                  {commands.map((command, index) => (
                    <div key={index} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-mono text-blue-600 text-sm">{command.cmd}</div>
                          <div className="text-gray-600 text-xs mt-1">{command.desc}</div>
                        </div>
                        <button
                          onClick={() => setCurrentCommand(command.cmd.split(' ')[0])}
                          className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                        >
                          Use
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Command Terminal</h3>
            </div>
            
            <div className="p-4">
              <div className="bg-black text-green-400 p-3 rounded font-mono text-sm h-64 overflow-y-auto mb-4">
                <div className="text-blue-400 mb-2">MIC3X2X Bluetooth Terminal</div>
                {commandOutput.map((entry, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-gray-500 text-xs">[{entry.timestamp}] </span>
                    <span className={entry.type === 'command' ? 'text-yellow-400' : 'text-green-400'}>
                      {entry.type === 'command' && '> '}
                      {entry.text}
                    </span>
                  </div>
                ))}
                <div className="text-gray-500">Ready for BTMD commands...</div>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendCommand()}
                  placeholder="Enter BTMD command (e.g., VTBTMD I)"
                  className="flex-1 border rounded px-3 py-2 font-mono text-sm"
                />
                <button
                  onClick={sendCommand}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MIC3X2XBluetoothManager;