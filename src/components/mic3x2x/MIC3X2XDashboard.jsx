import React, { useState, useEffect } from 'react';
import { 
  Cpu, Battery, Filter, Zap, HardDrive, Package, Settings, 
  Wifi, Bluetooth, Network, Clock, AlertTriangle, CheckCircle,
  TrendingUp, TrendingDown, Eye, Activity, Radio, Shield
} from 'lucide-react';

const MIC3X2XDashboard = () => {
  const [systemStatus, setSystemStatus] = useState({
    voltage: 12.4,
    temperature: 45,
    protocolActive: 'ISO 15765 (500K/11B)',
    canActivity: true,
    sleepMode: false,
    writeOperations: 1245,
    filterCount: 47,
    wakeSequences: 3
  });

  const [protocolStats, setProtocolStats] = useState({
    at: 15,
    st: 23,
    vt: 40,
    total: 78
  });

  const [connectionStats, setConnectionStats] = useState({
    hscan: { active: true, speed: '500K', frames: 2847 },
    mscan: { active: false, speed: '125K', frames: 0 },
    swcan: { active: false, speed: '33.3K', frames: 0 },
    chcan: { active: false, speed: '500K', frames: 0 },
    lscan: { active: false, speed: '500K', frames: 0 }
  });

  const [powerStats, setPowerStats] = useState({
    sleepCurrent: 2.1,
    activeCurrent: 34,
    wakeEvents: 12,
    sleepCycles: 8
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        voltage: 12.0 + Math.random() * 0.8,
        temperature: 40 + Math.random() * 20,
        writeOperations: prev.writeOperations + Math.floor(Math.random() * 3)
      }));

      if (connectionStats.hscan.active) {
        setConnectionStats(prev => ({
          ...prev,
          hscan: {
            ...prev.hscan,
            frames: prev.hscan.frames + Math.floor(Math.random() * 10)
          }
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [connectionStats.hscan.active]);

  const StatusCard = ({ title, value, unit, icon, status = 'normal', trend }) => {
    const statusColors = {
      normal: 'border-gray-200 bg-white',
      warning: 'border-yellow-300 bg-yellow-50',
      critical: 'border-red-300 bg-red-50',
      success: 'border-green-300 bg-green-50'
    };

    const trendIcons = {
      up: <TrendingUp size={16} className="text-green-600" />,
      down: <TrendingDown size={16} className="text-red-600" />,
      stable: <Activity size={16} className="text-gray-600" />
    };

    return (
      <div className={`border-2 rounded-lg p-4 ${statusColors[status]}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {icon}
            <span className="text-sm font-medium text-gray-600">{title}</span>
          </div>
          {trend && trendIcons[trend]}
        </div>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toFixed(1) : value}
          {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
        </div>
      </div>
    );
  };

  const ProtocolCard = ({ protocols, title, color }) => (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="space-y-2">
        {protocols.map(protocol => (
          <div key={protocol.id} className="flex justify-between items-center text-sm">
            <span className="font-mono">{protocol.id}</span>
            <span className="text-gray-600">{protocol.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const ConnectionStatus = ({ name, stats, icon }) => (
    <div className={`p-3 rounded-lg border ${stats.active ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-medium">{name}</span>
        </div>
        <div className={`w-2 h-2 rounded-full ${stats.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
      </div>
      <div className="text-xs space-y-1">
        <div>Speed: {stats.speed}</div>
        <div>Frames: {stats.frames.toLocaleString()}</div>
      </div>
    </div>
  );

  const FeatureHighlight = ({ title, description, icon, status = 'available' }) => (
    <div className="flex items-start space-x-3 p-3 bg-white border rounded-lg">
      <div className={`p-2 rounded-lg ${status === 'new' ? 'bg-blue-100' : 'bg-gray-100'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium">{title}</h4>
          {status === 'new' && (
            <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">NEW</span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );

  const enhancedProtocols = {
    at: [
      { id: '1-C', name: 'Standard OBD Protocols' },
      { id: 'B-F', name: 'User Configurable CAN' }
    ],
    st: [
      { id: '11-64', name: 'STN Extended Protocols' },
      { id: '221-254', name: 'Pre-configured Protocols' }
    ],
    vt: [
      { id: '101-13F', name: 'Custom CAN Protocols' },
      { id: '101-13F', name: 'Custom ISO Protocols' }
    ]
  };

  const newFeatures = [
    {
      title: '208 Filter Groups',
      description: 'Enhanced filtering vs standard 48 filters for complex CAN networks',
      icon: <Filter className="text-blue-600" size={20} />,
      status: 'new'
    },
    {
      title: '4,128 Byte Multi-Frame',
      description: 'Large data transmission capability vs standard 1,024 bytes',
      icon: <Package className="text-green-600" size={20} />,
      status: 'new'
    },
    {
      title: 'Voltage Change Wake',
      description: 'Advanced power management with configurable voltage monitoring',
      icon: <Zap className="text-yellow-600" size={20} />,
      status: 'new'
    },
    {
      title: '256-Byte User EEPROM',
      description: 'Dedicated storage for application data and configuration',
      icon: <HardDrive className="text-purple-600" size={20} />,
      status: 'available'
    },
    {
      title: '8 Wake Sequences',
      description: 'Enhanced wake/hold sequences per protocol type',
      icon: <Clock className="text-orange-600" size={20} />,
      status: 'available'
    },
    {
      title: '5 CAN Interfaces',
      description: 'HS-CAN, MS-CAN, SW-CAN, CH-CAN, LS-CAN support',
      icon: <Network className="text-indigo-600" size={20} />,
      status: 'available'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Cpu className="text-blue-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">MIC3X2X Dashboard</h1>
              <p className="text-gray-600">Enhanced OBD-II Multi-Protocol Interpreter</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">v2.3.08</div>
            <div className="text-sm text-gray-500">32-bit Core • 3000K UART</div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatusCard
          title="Supply Voltage"
          value={systemStatus.voltage}
          unit="V"
          icon={<Battery className="text-green-600" size={20} />}
          status={systemStatus.voltage < 11.0 ? 'critical' : systemStatus.voltage < 12.0 ? 'warning' : 'success'}
          trend="stable"
        />
        <StatusCard
          title="Temperature"
          value={systemStatus.temperature}
          unit="°C"
          icon={<Activity className="text-orange-600" size={20} />}
          status={systemStatus.temperature > 70 ? 'critical' : systemStatus.temperature > 60 ? 'warning' : 'normal'}
        />
        <StatusCard
          title="Active Protocol"
          value={systemStatus.protocolActive}
          icon={<Settings className="text-blue-600" size={20} />}
          status="success"
        />
        <StatusCard
          title="Sleep Current"
          value={powerStats.sleepCurrent}
          unit="mA"
          icon={<Zap className="text-purple-600" size={20} />}
          status={powerStats.sleepCurrent < 3.0 ? 'success' : 'warning'}
        />
      </div>

      {/* Protocol Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ProtocolCard
          title="AT Commands (ELM327 Compatible)"
          protocols={enhancedProtocols.at}
          color="bg-blue-500"
        />
        <ProtocolCard
          title="ST Commands (STN Compatible)"
          protocols={enhancedProtocols.st}
          color="bg-green-500"
        />
        <ProtocolCard
          title="VT Commands (Enhanced Macro)"
          protocols={enhancedProtocols.vt}
          color="bg-purple-500"
        />
      </div>

      {/* CAN Interface Status */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <Network className="text-blue-600" size={24} />
          <span>CAN Interface Status</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <ConnectionStatus
            name="HS-CAN"
            stats={connectionStats.hscan}
            icon={<Radio className="text-green-600" size={16} />}
          />
          <ConnectionStatus
            name="MS-CAN"
            stats={connectionStats.mscan}
            icon={<Radio className="text-blue-600" size={16} />}
          />
          <ConnectionStatus
            name="SW-CAN"
            stats={connectionStats.swcan}
            icon={<Radio className="text-yellow-600" size={16} />}
          />
          <ConnectionStatus
            name="CH-CAN"
            stats={connectionStats.chcan}
            icon={<Radio className="text-purple-600" size={16} />}
          />
          <ConnectionStatus
            name="LS-CAN"
            stats={connectionStats.lscan}
            icon={<Radio className="text-red-600" size={16} />}
          />
        </div>
      </div>

      {/* Enhanced Features */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <Shield className="text-green-600" size={24} />
          <span>Enhanced Features</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {newFeatures.map((feature, index) => (
            <FeatureHighlight key={index} {...feature} />
          ))}
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Filter className="text-blue-600" size={20} />
            <span className="font-medium">Active Filters</span>
          </div>
          <div className="text-2xl font-bold">{systemStatus.filterCount}/208</div>
          <div className="text-xs text-gray-500">Pass/Block/FC filters</div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <HardDrive className="text-purple-600" size={20} />
            <span className="font-medium">EEPROM Writes</span>
          </div>
          <div className="text-2xl font-bold">{systemStatus.writeOperations}/10K</div>
          <div className="text-xs text-gray-500">User storage cycles</div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="text-orange-600" size={20} />
            <span className="font-medium">Wake Sequences</span>
          </div>
          <div className="text-2xl font-bold">{systemStatus.wakeSequences}/8</div>
          <div className="text-xs text-gray-500">Per protocol type</div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="text-yellow-600" size={20} />
            <span className="font-medium">Power Events</span>
          </div>
          <div className="text-2xl font-bold">{powerStats.wakeEvents}</div>
          <div className="text-xs text-gray-500">Sleep/wake cycles</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center space-x-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <Filter size={16} />
            <span>Manage Filters</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600">
            <Clock size={16} />
            <span>Wake Sequences</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
            <Battery size={16} />
            <span>Power Settings</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            <Package size={16} />
            <span>Multi-Frame</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-gray-500 text-sm">
        <p>MIC3X2X Enhanced OBD-II Interpreter • Datasheet v2.3.08</p>
        <p>208 Filters • 4,128-byte Multi-Frame • 5 CAN Interfaces • Enhanced Power Management</p>
      </div>
    </div>
  );
};

export default MIC3X2XDashboard;