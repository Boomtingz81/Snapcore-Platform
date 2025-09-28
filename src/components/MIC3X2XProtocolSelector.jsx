import React, { useState, useEffect } from 'react';
import { Settings, Radio, Zap, CheckCircle, AlertTriangle, XCircle, Info, ChevronDown, ChevronRight, Cpu, Activity } from 'lucide-react';

const MIC3X2XProtocolSelector = () => {
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [protocolType, setProtocolType] = useState('AT');
  const [customProtocol, setCustomProtocol] = useState({
    id: '',
    option: '81',
    baudrate: '01',
    type: 'HS_CAN',
    tm: '3'
  });
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [expandedCategories, setExpandedCategories] = useState({
    at: true,
    st: true,
    vt: false,
    ch_ls: true
  });
  const [protocolDetails, setProtocolDetails] = useState(null);

  // Complete protocol definitions from MIC3X2X datasheet
  const protocols = {
    AT: {
      '1': { name: 'SAE J1850 PWM', type: 'J1850', speed: 41600, description: 'Ford vehicles, 41.6 kbps' },
      '2': { name: 'SAE J1850 VPW', type: 'J1850', speed: 10400, description: 'GM vehicles, 10.4 kbps' },
      '3': { name: 'ISO 9141-2', type: 'ISO', speed: 10400, description: 'European/Asian vehicles, K-line' },
      '4': { name: 'ISO 14230-4 (KWP 5BAUD)', type: 'ISO', speed: 10400, description: 'KWP2000, slow init' },
      '5': { name: 'ISO 14230-4 (KWP FAST)', type: 'ISO', speed: 10400, description: 'KWP2000, fast init' },
      '6': { name: 'ISO 15765-4 (CAN 11/500)', type: 'CAN', speed: 500000, bits: 11, description: 'Most modern vehicles' },
      '7': { name: 'ISO 15765-4 (CAN 29/500)', type: 'CAN', speed: 500000, bits: 29, description: 'Extended CAN ID' },
      '8': { name: 'ISO 15765-4 (CAN 11/250)', type: 'CAN', speed: 250000, bits: 11, description: 'Lower speed CAN' },
      '9': { name: 'ISO 15765-4 (CAN 29/250)', type: 'CAN', speed: 250000, bits: 29, description: 'Extended ID, 250k' },
      'A': { name: 'SAE J1939 (CAN 29/250)', type: 'J1939', speed: 250000, bits: 29, description: 'Heavy duty vehicles' },
      'B': { name: 'USER1 CAN (11/125)', type: 'CAN', speed: 125000, bits: 11, description: 'User configurable' },
      'C': { name: 'USER2 CAN (11/50)', type: 'CAN', speed: 50000, bits: 11, description: 'Low speed CAN' }
    },
    ST: {
      '211': { name: 'J1850 PWM', type: 'J1850', speed: 41600, description: 'STN J1850 PWM' },
      '212': { name: 'J1850 VPW', type: 'J1850', speed: 10400, description: 'STN J1850 VPW' },
      '221': { name: 'ISO 9141 (no header)', type: 'ISO', speed: 10400, description: 'No auto header' },
      '222': { name: 'ISO 9141-2 (5 baud)', type: 'ISO', speed: 10400, description: '5 baud auto init' },
      '223': { name: 'ISO 14230 (no autoinit)', type: 'ISO', speed: 10400, description: 'Manual initialization' },
      '224': { name: 'ISO 14230 (5 baud)', type: 'ISO', speed: 10400, description: '5 baud auto init' },
      '225': { name: 'ISO 14230 (fast)', type: 'ISO', speed: 10400, description: 'Fast initialization' },
      '231': { name: 'HS CAN (11-bit, 500K)', type: 'HS_CAN', speed: 500000, bits: 11, description: 'High Speed CAN' },
      '232': { name: 'HS CAN (29-bit, 500K)', type: 'HS_CAN', speed: 500000, bits: 29, description: 'HS CAN Extended' },
      '233': { name: 'HS CAN (ISO 15765, 11-bit, 500K)', type: 'HS_CAN', speed: 500000, bits: 11, description: 'ISO15765 HS CAN' },
      '234': { name: 'HS CAN (ISO 15765, 29-bit, 500K)', type: 'HS_CAN', speed: 500000, bits: 29, description: 'ISO15765 HS Extended' },
      '235': { name: 'HS CAN (ISO 15765, 11-bit, 250K)', type: 'HS_CAN', speed: 250000, bits: 11, description: 'ISO15765 HS 250K' },
      '236': { name: 'HS CAN (ISO 15765, 29-bit, 250K)', type: 'HS_CAN', speed: 250000, bits: 29, description: 'ISO15765 HS 250K Ext' },
      '241': { name: 'J1939 (29-bit, 250K)', type: 'J1939', speed: 250000, bits: 29, description: 'J1939 250K' },
      '242': { name: 'J1939 (29-bit, 500K)', type: 'J1939', speed: 500000, bits: 29, description: 'J1939 500K' },
      '251': { name: 'MS CAN (11-bit, 125K)', type: 'MS_CAN', speed: 125000, bits: 11, description: 'Medium Speed CAN' },
      '252': { name: 'MS CAN (29-bit, 125K)', type: 'MS_CAN', speed: 125000, bits: 29, description: 'MS CAN Extended' },
      '253': { name: 'MS CAN (ISO 15765, 11-bit, 125K)', type: 'MS_CAN', speed: 125000, bits: 11, description: 'ISO15765 MS CAN' },
      '254': { name: 'MS CAN (ISO 15765, 29-bit, 125K)', type: 'MS_CAN', speed: 125000, bits: 29, description: 'ISO15765 MS Extended' },
      '261': { name: 'SW CAN (11-bit, 33.3K)', type: 'SW_CAN', speed: 33300, bits: 11, description: 'Single Wire CAN' },
      '262': { name: 'SW CAN (29-bit, 33.3K)', type: 'SW_CAN', speed: 33300, bits: 29, description: 'SW CAN Extended' },
      '263': { name: 'SW CAN (ISO 15765, 11-bit, 33.3K)', type: 'SW_CAN', speed: 33300, bits: 11, description: 'ISO15765 SW CAN' },
      '264': { name: 'SW CAN (ISO 15765, 29-bit, 33.3K)', type: 'SW_CAN', speed: 33300, bits: 29, description: 'ISO15765 SW Extended' }
    },
    CH_CAN: {
      'C1': { name: 'CH CAN (11-bit, 125K)', type: 'CH_CAN', speed: 125000, bits: 11, description: 'GM Chassis CAN 125K' },
      'C2': { name: 'CH CAN (29-bit, 500K)', type: 'CH_CAN', speed: 500000, bits: 29, description: 'GM Chassis CAN 500K' },
      'C3': { name: 'CH CAN (ISO 15765, 11-bit, 500K)', type: 'CH_CAN', speed: 500000, bits: 11, description: 'ISO15765 CH CAN 500K' },
      'C4': { name: 'CH CAN (ISO 15765, 29-bit, 500K)', type: 'CH_CAN', speed: 500000, bits: 29, description: 'ISO15765 CH Extended' },
      'C5': { name: 'CH CAN (ISO 15765, 11-bit, 250K)', type: 'CH_CAN', speed: 250000, bits: 11, description: 'ISO15765 CH CAN 250K' },
      'C6': { name: 'CH CAN (ISO 15765, 29-bit, 250K)', type: 'CH_CAN', speed: 250000, bits: 29, description: 'ISO15765 CH 250K Ext' },
      '2C1': { name: 'CH CAN (11-bit, 500K)', type: 'CH_CAN', speed: 500000, bits: 11, description: 'ST CH CAN 500K' },
      '2C2': { name: 'CH CAN (29-bit, 500K)', type: 'CH_CAN', speed: 500000, bits: 29, description: 'ST CH CAN 500K Ext' },
      '2C3': { name: 'CH CAN (ISO 15765, 11-bit, 500K)', type: 'CH_CAN', speed: 500000, bits: 11, description: 'ST ISO15765 CH 500K' },
      '2C4': { name: 'CH CAN (ISO 15765, 29-bit, 500K)', type: 'CH_CAN', speed: 500000, bits: 29, description: 'ST ISO15765 CH Ext' },
      '2C5': { name: 'CH CAN (ISO 15765, 11-bit, 250K)', type: 'CH_CAN', speed: 250000, bits: 11, description: 'ST ISO15765 CH 250K' },
      '2C6': { name: 'CH CAN (ISO 15765, 29-bit, 250K)', type: 'CH_CAN', speed: 250000, bits: 29, description: 'ST ISO15765 CH 250K Ext' }
    },
    LS_CAN: {
      'D1': { name: 'LS CAN (11-bit, 500K)', type: 'LS_CAN', speed: 500000, bits: 11, description: 'Low Speed CAN 500K' },
      'D2': { name: 'LS CAN (29-bit, 500K)', type: 'LS_CAN', speed: 500000, bits: 29, description: 'LS CAN 500K Extended' },
      'D3': { name: 'LS CAN (ISO 15765, 11-bit, 500K)', type: 'LS_CAN', speed: 500000, bits: 11, description: 'ISO15765 LS CAN' },
      'D4': { name: 'LS CAN (ISO 15765, 29-bit, 500K)', type: 'LS_CAN', speed: 500000, bits: 29, description: 'ISO15765 LS Extended' },
      'D5': { name: 'LS CAN (ISO 15765, 11-bit, 250K)', type: 'LS_CAN', speed: 250000, bits: 11, description: 'ISO15765 LS 250K' },
      'D6': { name: 'LS CAN (ISO 15765, 29-bit, 250K)', type: 'LS_CAN', speed: 250000, bits: 29, description: 'ISO15765 LS 250K Ext' },
      '2D1': { name: 'LS CAN (11-bit, 500K)', type: 'LS_CAN', speed: 500000, bits: 11, description: 'ST LS CAN 500K' },
      '2D2': { name: 'LS CAN (29-bit, 500K)', type: 'LS_CAN', speed: 500000, bits: 29, description: 'ST LS CAN Extended' },
      '2D3': { name: 'LS CAN (ISO 15765, 11-bit, 500K)', type: 'LS_CAN', speed: 500000, bits: 11, description: 'ST ISO15765 LS' },
      '2D4': { name: 'LS CAN (ISO 15765, 29-bit, 500K)', type: 'LS_CAN', speed: 500000, bits: 29, description: 'ST ISO15765 LS Ext' },
      '2D5': { name: 'LS CAN (ISO 15765, 11-bit, 250K)', type: 'LS_CAN', speed: 250000, bits: 11, description: 'ST ISO15765 LS 250K' },
      '2D6': { name: 'LS CAN (ISO 15765, 29-bit, 250K)', type: 'LS_CAN', speed: 250000, bits: 29, description: 'ST ISO15765 LS 250K Ext' }
    }
  };

  const vehicleRecommendations = {
    'GM/Chevrolet': ['2', 'C1', 'C3', '2C3', 'VT_CH_CAN'],
    'Ford': ['1', '6', '233', 'VT_HS_CAN'],
    'Toyota/Lexus': ['6', '233', 'VT_HS_CAN'],
    'Honda/Acura': ['6', '233', 'VT_HS_CAN'],
    'BMW/Mercedes': ['6', '7', '233', '234'],
    'Audi/VW': ['6', '233', 'VT_HS_CAN'],
    'Nissan/Infiniti': ['6', '233', 'VT_HS_CAN'],
    'Hyundai/Kia': ['6', '233', 'VT_HS_CAN'],
    'Mazda': ['6', '233', 'VT_HS_CAN'],
    'Subaru': ['6', '233', 'VT_HS_CAN'],
    'Heavy Duty/Truck': ['A', '241', '242', 'VT_J1939'],
    'European (older)': ['3', '4', '5', '221', '222', '223']
  };

  const canTypes = [
    { id: 'HS_CAN', name: 'High Speed CAN', description: 'Standard automotive CAN, 500kbps typical' },
    { id: 'MS_CAN', name: 'Medium Speed CAN', description: 'Ford MS-CAN, 125kbps' },
    { id: 'SW_CAN', name: 'Single Wire CAN', description: 'GM SWCAN, 33.3kbps' },
    { id: 'CH_CAN', name: 'Chassis CAN', description: 'GM chassis high-speed CAN bus' },
    { id: 'LS_CAN', name: 'Low Speed CAN', description: 'Fault-tolerant CAN, various speeds' }
  ];

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const selectProtocol = (protocolId, category) => {
    setSelectedProtocol({ id: protocolId, category });
    setProtocolDetails(protocols[category][protocolId]);
  };

  const getStatusIcon = (type) => {
    switch(connectionStatus) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'testing': return <Activity className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'J1850': 'bg-purple-100 text-purple-800',
      'ISO': 'bg-blue-100 text-blue-800',
      'CAN': 'bg-green-100 text-green-800',
      'HS_CAN': 'bg-green-100 text-green-800',
      'MS_CAN': 'bg-yellow-100 text-yellow-800',
      'SW_CAN': 'bg-orange-100 text-orange-800',
      'CH_CAN': 'bg-red-100 text-red-800',
      'LS_CAN': 'bg-indigo-100 text-indigo-800',
      'J1939': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const ProtocolCard = ({ protocolId, protocol, category, isSelected }) => (
    <div
      onClick={() => selectProtocol(protocolId, category)}
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="font-medium text-gray-900">{protocolId}</div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(protocol.type)}`}>
          {protocol.type}
        </span>
      </div>
      <div className="text-sm font-medium text-gray-700 mb-1">{protocol.name}</div>
      <div className="text-xs text-gray-500 mb-2">{protocol.description}</div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">
          {protocol.speed ? `${(protocol.speed / 1000).toFixed(1)}K bps` : 'Variable'}
        </span>
        {protocol.bits && (
          <span className="text-gray-600">{protocol.bits}-bit ID</span>
        )}
      </div>
    </div>
  );

  const CategorySection = ({ title, categoryKey, protocols, icon: Icon }) => (
    <div className="border rounded-lg">
      <button
        onClick={() => toggleCategory(categoryKey)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
            {Object.keys(protocols).length} protocols
          </span>
        </div>
        {expandedCategories[categoryKey] ? 
          <ChevronDown className="w-5 h-5 text-gray-400" /> : 
          <ChevronRight className="w-5 h-5 text-gray-400" />
        }
      </button>
      {expandedCategories[categoryKey] && (
        <div className="p-4 border-t bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(protocols).map(([id, protocol]) => (
              <ProtocolCard
                key={id}
                protocolId={id}
                protocol={protocol}
                category={categoryKey}
                isSelected={selectedProtocol?.id === id && selectedProtocol?.category === categoryKey}
              />
            ))}
          </div>
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
            <h1 className="text-3xl font-bold text-gray-800">MIC3X2X Protocol Selector</h1>
            <p className="text-gray-600">Enhanced CH-CAN and LS-CAN Support</p>
          </div>
          <div className="flex items-center gap-4">
            {getStatusIcon()}
            <span className="text-sm capitalize">{connectionStatus}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Protocol Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* AT Protocols */}
          <CategorySection
            title="AT Protocols (ELM327 Compatible)"
            categoryKey="AT"
            protocols={protocols.AT}
            icon={Settings}
          />

          {/* ST Standard Protocols */}
          <CategorySection
            title="ST Protocols (STN Compatible)"
            categoryKey="ST"
            protocols={protocols.ST}
            icon={Radio}
          />

          {/* CH-CAN Protocols */}
          <CategorySection
            title="CH-CAN Protocols (GM Chassis CAN)"
            categoryKey="CH_CAN"
            protocols={protocols.CH_CAN}
            icon={Cpu}
          />

          {/* LS-CAN Protocols */}
          <CategorySection
            title="LS-CAN Protocols (Low Speed/Fault Tolerant)"
            categoryKey="LS_CAN"
            protocols={protocols.LS_CAN}
            icon={Activity}
          />

          {/* Custom VT Protocol Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Custom VT Protocol Configuration (101-140)</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Protocol ID</label>
                <input
                  type="text"
                  placeholder="101-140"
                  value={customProtocol.id}
                  onChange={(e) => setCustomProtocol(prev => ({ ...prev, id: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={customProtocol.type}
                  onChange={(e) => setCustomProtocol(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                >
                  {canTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Option</label>
                <input
                  type="text"
                  placeholder="81"
                  value={customProtocol.option}
                  onChange={(e) => setCustomProtocol(prev => ({ ...prev, option: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Baud Rate</label>
                <select
                  value={customProtocol.baudrate}
                  onChange={(e) => setCustomProtocol(prev => ({ ...prev, baudrate: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="00">1000K</option>
                  <option value="01">500K</option>
                  <option value="04">125K</option>
                  <option value="06">95.2K</option>
                  <option value="0A">50K</option>
                  <option value="0F">33.3K</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">TM Mode</label>
                <select
                  value={customProtocol.tm}
                  onChange={(e) => setCustomProtocol(prev => ({ ...prev, tm: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  disabled={customProtocol.type !== 'SW_CAN'}
                >
                  <option value="0">Sleep</option>
                  <option value="1">High Speed</option>
                  <option value="2">High Voltage Wake</option>
                  <option value="3">Normal</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Configure Protocol
              </button>
              <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Test Connection
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Selected Protocol Details */}
          {protocolDetails && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Protocol Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Protocol ID:</span>
                  <div className="text-lg font-bold">{selectedProtocol.id}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Name:</span>
                  <div>{protocolDetails.name}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Type:</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getTypeColor(protocolDetails.type)}`}>
                    {protocolDetails.type}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Speed:</span>
                  <div>{protocolDetails.speed ? `${(protocolDetails.speed / 1000).toFixed(1)} kbps` : 'Variable'}</div>
                </div>
                {protocolDetails.bits && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">ID Length:</span>
                    <div>{protocolDetails.bits}-bit</div>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-600">Description:</span>
                  <div className="text-sm text-gray-600">{protocolDetails.description}</div>
                </div>
              </div>
              <button className="w-full mt-4 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                Activate Protocol
              </button>
            </div>
          )}

          {/* Vehicle Recommendations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Vehicle Recommendations</h3>
            <div className="space-y-3">
              {Object.entries(vehicleRecommendations).map(([vehicle, protocolIds]) => (
                <div key={vehicle} className="border-b pb-3 last:border-b-0">
                  <div className="font-medium text-gray-800 mb-1">{vehicle}</div>
                  <div className="flex flex-wrap gap-1">
                    {protocolIds.map(id => (
                      <span key={id} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CAN Bus Types Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">CAN Bus Types</h3>
            <div className="space-y-3">
              {canTypes.map(type => (
                <div key={type.id} className="border-l-4 border-blue-500 pl-3">
                  <div className="font-medium text-gray-800">{type.name}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Features */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Special Features</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-500 mt-1" />
                <div>
                  <div className="font-medium">CH-CAN Support</div>
                  <div className="text-sm text-gray-600">GM chassis high-speed CAN bus support</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-500 mt-1" />
                <div>
                  <div className="font-medium">LS-CAN Support</div>
                  <div className="text-sm text-gray-600">Low-speed fault-tolerant CAN protocols</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-500 mt-1" />
                <div>
                  <div className="font-medium">Auto Detection</div>
                  <div className="text-sm text-gray-600">Automatic protocol discovery and switching</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-500 mt-1" />
                <div>
                  <div className="font-medium">Multi-Channel</div>
                  <div className="text-sm text-gray-600">Up to 5 CAN channels simultaneously</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Commands */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Commands</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded border">
                <div className="font-mono text-sm">VTSHOW_BUS</div>
                <div className="text-xs text-gray-600">Detect active protocols</div>
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded border">
                <div className="font-mono text-sm">ATLNKCH PF</div>
                <div className="text-xs text-gray-600">Link CH-CAN to protocol F</div>
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded border">
                <div className="font-mono text-sm">ATLNKLS PF</div>
                <div className="text-xs text-gray-600">Link LS-CAN to protocol F</div>
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded border">
                <div className="font-mono text-sm">VTCFG_CAN</div>
                <div className="text-xs text-gray-600">Configure custom CAN protocol</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Status:</span>
            {getStatusIcon()}
            <span className="text-sm capitalize">{connectionStatus}</span>
          </div>
          <div className="flex items-center gap-4">
            {selectedProtocol && (
              <span className="text-sm">
                Selected: <span className="font-mono">{selectedProtocol.id}</span>
              </span>
            )}
            <div className="flex gap-2">
              <button 
                onClick={() => setConnectionStatus('testing')}
                className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
              >
                Test Protocol
              </button>
              <button 
                onClick={() => setConnectionStatus('connected')}
                className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MIC3X2XProtocolSelector;