// src/components/SnapCoreConnect.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Zap, Wifi, Database, FileText, RotateCw, Power, FileEdit } from 'lucide-react';

export default function SnapCoreConnect() {
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);
  
  const handleConnect = () => {
    setConnecting(true);
    // Simulate connection process
    setTimeout(() => {
      setConnecting(false);
      navigate('/'); // Navigate to dashboard after connection
    }, 2000);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background glow effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-cyan-400/10 to-transparent"></div>
      </div>
      
      <div className="flex h-full w-full max-w-7xl">
        {/* Left Sidebar */}
        <div className="w-64 p-4 space-y-4">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center space-x-3">
            <Wifi className="w-5 h-5 text-cyan-400" />
            <span>Internet</span>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center space-x-3">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>Viewer</span>
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-400/20 to-transparent border border-cyan-400/30 flex items-center space-x-3">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400">All/Viewer</span>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center space-x-3">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Filter</span>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center space-x-3">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>Timeline</span>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center space-x-3">
            <RotateCw className="w-5 h-5 text-cyan-400" />
            <span>Version</span>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center space-x-3">
            <Power className="w-5 h-5 text-cyan-400" />
            <span>Power Reset</span>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          <div className="relative">
            {/* Glow effect behind the panel */}
            <div className="absolute inset-0 bg-gradient-radial from-cyan-400/20 to-transparent rounded-3xl blur-xl"></div>
            
            {/* Main panel */}
            <div className="glass-glow rounded-3xl p-12 w-full max-w-md flex flex-col items-center relative z-10">
              <div className="text-2xl font-bold text-cyan-400 mb-6">SnapCore</div>
              <div className="w-32 h-32 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 p-0.5 mb-8 relative">
                <div className="w-full h-full rounded-xl bg-black flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">SC</span>
                  
                  {/* Animated circle */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin"></div>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleConnect}
                className={`px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 ${
                  connecting 
                    ? 'bg-black border border-cyan-400 text-cyan-400 opacity-75 cursor-wait'
                    : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:from-blue-500 hover:to-cyan-400'
                }`}
              >
                {connecting ? 'Connecting...' : 'Connect OBD'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="w-64 p-4 space-y-4">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm font-medium mb-2">Airsuite 1000i</div>
            <div className="w-full h-1 bg-black/50 rounded-full mb-4">
              <div className="h-full w-3/4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
              <span>Document RRAnno</span>
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
              <span>Collision Document</span>
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
              <span>Creation</span>
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
              <span>Rotation</span>
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
              <span>Notes</span>
              <FileEdit className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
