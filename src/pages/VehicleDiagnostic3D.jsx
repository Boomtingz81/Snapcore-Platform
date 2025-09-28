// src/pages/VehicleDiagnostics3D.jsx
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import AudiRSQ3Model from '../components/AudiRSQ3Model';

const VehicleDiagnostics3D = () => {
  const [faultCodes, setFaultCodes] = useState([
    {
      code: 'P0420',
      description: 'Catalyst System Efficiency Below Threshold',
      severity: 'high',
      detected: '28:19:51'
    },
    {
      code: 'C0035',
      description: 'Left Front Wheel Speed Sensor Circuit',
      severity: 'medium',
      detected: '28:19:51'
    }
  ]);

  const [liveData, setLiveData] = useState({
    engineRPM: 0,
    vehicleSpeed: 0,
    coolantTemp: 85,
    throttlePosition: 12
  });

  const [selectedPart, setSelectedPart] = useState(null);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        engineRPM: Math.floor(Math.random() * 1000) + 800,
        vehicleSpeed: Math.floor(Math.random() * 60),
        coolantTemp: 85 + Math.floor(Math.random() * 10),
        throttlePosition: Math.floor(Math.random() * 20) + 10
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePartClick = (partKey, partData) => {
    setSelectedPart({ key: partKey, data: partData });
  };

  const getRelatedFaultCodes = (partKey) => {
    if (!selectedPart) return [];
    return faultCodes.filter(fault => 
      selectedPart.data.faultCodes.includes(fault.code)
    );
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-400 border-red-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'low': return 'text-green-400 border-green-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            3D Vehicle Diagnostics
          </h1>
          <p className="text-gray-400">Interactive diagnostic visualization for Audi RS Q3</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* 3D Model Viewer - Takes up 2 columns */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="p-4 border-b border-slate-700/50">
              <h2 className="text-xl font-semibold text-green-400">Vehicle Model</h2>
              <p className="text-gray-400 text-sm">Click on highlighted areas to inspect components</p>
            </div>
            <div className="h-full">
              <Canvas
                camera={{ position: [5, 2, 5], fov: 50 }}
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
              >
                <ambientLight intensity={0.3} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -5]} intensity={0.5} />
                
                <AudiRSQ3Model
                  faultCodes={faultCodes}
                  liveData={liveData}
                  onPartClick={handlePartClick}
                />
              </Canvas>
            </div>
          </div>

          {/* Diagnostic Information Panel */}
          <div className="space-y-6">
            {/* Selected Component Info */}
            {selectedPart && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">
                  Selected Component
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-300 capitalize">
                    <span className="text-gray-400">Component:</span> {selectedPart.key.replace(/([A-Z])/g, ' $1')}
                  </p>
                  <div className="text-sm">
                    <span className="text-gray-400">Related Fault Codes:</span>
                    <div className="mt-1 space-y-1">
                      {getRelatedFaultCodes().map(fault => (
                        <div key={fault.code} className={`px-2 py-1 rounded border ${getSeverityColor(fault.severity)}`}>
                          <div className="font-mono text-xs">{fault.code}</div>
                          <div className="text-xs">{fault.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live Data Stream */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
              <h3 className="text-lg font-semibold text-green-400 mb-3">Live Data Stream</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                  <span className="text-gray-400">Engine RPM</span>
                  <span className="text-white font-mono">{liveData.engineRPM} RPM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                  <span className="text-gray-400">Vehicle Speed</span>
                  <span className="text-white font-mono">{liveData.vehicleSpeed} km/h</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                  <span className="text-gray-400">Coolant Temp</span>
                  <span className="text-white font-mono">{liveData.coolantTemp}°C</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Throttle Position</span>
                  <span className="text-white font-mono">{liveData.throttlePosition}%</span>
                </div>
              </div>
            </div>

            {/* Active Fault Codes */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
              <h3 className="text-lg font-semibold text-red-400 mb-3">Active Fault Codes</h3>
              <div className="space-y-3">
                {faultCodes.map(fault => (
                  <div key={fault.code} className={`p-3 rounded-lg border ${getSeverityColor(fault.severity)} bg-slate-700/30`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-sm font-bold">{fault.code}</span>
                      <span className="text-xs text-gray-400">{fault.detected}</span>
                    </div>
                    <p className="text-sm text-gray-300">{fault.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors">
                  Start Live Diagnostics
                </button>
                <button className="w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-medium transition-colors">
                  Clear Fault Codes
                </button>
                <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
                  Generate Report
                </button>
                <button className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">
                  Emergency Stop
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDiagnostics3D;
