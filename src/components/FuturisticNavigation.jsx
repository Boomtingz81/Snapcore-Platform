// src/components/FuturisticNavigation.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Activity, 
  Scan, 
  Settings, 
  Monitor,
  Zap,
  Terminal,
  Search,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function FuturisticNavigation({ user, tier }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');
  const [showMenu, setShowMenu] = useState(false);

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveTab('home');
    else if (path === '/scan') setActiveTab('scan');
    else if (path === '/live') setActiveTab('live');
    else if (path === '/analytics') setActiveTab('analytics');
    else if (path === '/terminal') setActiveTab('terminal');
    else setActiveTab('');
  }, [location.pathname]);

  // Main navigation items (bottom floating nav)
  const mainNavItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
      color: 'from-cyan-400 to-blue-500'
    },
    {
      id: 'scan',
      label: 'Scan',
      icon: Scan,
      path: '/scan',
      color: 'from-green-400 to-cyan-500'
    },
    {
      id: 'live',
      label: 'Live',
      icon: Activity,
      path: '/live',
      color: 'from-purple-400 to-pink-500'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: Monitor,
      path: '/analytics',
      color: 'from-orange-400 to-red-500'
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: Terminal,
      path: '/terminal',
      color: 'from-emerald-400 to-teal-500'
    }
  ];

  // Extended menu items
  const menuItems = [
    { label: 'SnapTech', path: '/snaptech', icon: Zap },
    { label: 'SnapPro', path: '/pro', icon: Settings },
    { label: 'History', path: '/history', icon: Monitor },
    { label: 'VIN Decoder', path: '/vin', icon: Search },
    { label: 'Plate Scanner', path: '/plate', icon: Scan },
    { label: 'SnapDNA', path: '/snapdna', icon: Activity },
    { label: 'Lab Tools', path: '/lab', icon: Terminal },
    { label: 'Vehicle Lookup', path: '/vehicle-lookup', icon: Search }
  ];

  const handleNavigation = (path, id) => {
    navigate(path);
    setActiveTab(id);
    setShowMenu(false);
  };

  const handleLogout = () => {
    // Add your logout logic here
    navigate('/login');
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 p-0.5">
                <div className="w-full h-full rounded-lg bg-black flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SC</span>
                </div>
              </div>
              {/* Pulse effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 opacity-20 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                SnapCore
              </h1>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Diagnostic Suite</p>
            </div>
          </div>

          {/* User Info & Menu Toggle */}
          <div className="flex items-center space-x-4">
            {/* Tier Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              tier === 'pro' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
              tier === 'garage' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
              'bg-gray-800 text-gray-300 border border-gray-700'
            }`}>
              {tier}
            </div>

            {/* User Avatar */}
            {user ? (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 p-0.5">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-semibold text-sm hover:from-purple-500 hover:to-cyan-400 transition-all duration-300"
              >
                Login
              </button>
            )}

            {/* Menu Toggle */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all duration-300"
            >
              {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Extended Menu Overlay */}
      <div className={`fixed inset-0 z-40 transition-all duration-300 ${
        showMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowMenu(false)} />
        <div className={`absolute top-20 right-6 w-80 bg-black/90 backdrop-blur-lg border border-white/10 rounded-2xl p-6 transform transition-all duration-300 ${
          showMenu ? 'translate-y-0 scale-100' : '-translate-y-4 scale-95'
        }`}>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300 group"
              >
                <item.icon className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                <span className="text-sm text-gray-300 group-hover:text-white">{item.label}</span>
              </button>
            ))}
          </div>

          {user && (
            <div className="pt-6 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-300 text-red-400 hover:text-red-300"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center space-x-2 px-6 py-4 bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl">
          {mainNavItems.map((item, index) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path, item.id)}
                className={`relative group flex flex-col items-center space-y-1 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r ' + item.color + ' shadow-lg shadow-cyan-400/25' 
                    : 'hover:bg-white/10'
                }`}
              >
                {/* Icon */}
                <div className={`relative ${isActive ? 'text-black' : 'text-gray-400 group-hover:text-white'}`}>
                  <Icon className="w-5 h-5" />
                  
                  {/* Active indicator glow */}
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} blur-md opacity-50 -z-10`} />
                  )}
                </div>

                {/* Label */}
                <span className={`text-xs font-medium transition-colors ${
                  isActive 
                    ? 'text-black' 
                    : 'text-gray-400 group-hover:text-white'
                }`}>
                  {item.label}
                </span>

                {/* Connection lines */}
                {index < mainNavItems.length - 1 && (
                  <div className="absolute top-1/2 -right-2 w-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                )}

                {/* Hover glow effect */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10`} />
              </button>
            );
          })}
        </div>

        {/* Orbital rings around active nav */}
        {activeTab && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/20 animate-pulse" />
            <div className="absolute inset-2 rounded-2xl border border-purple-500/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        )}
      </nav>

      {/* Connection indicator */}
      <div className="fixed top-6 right-6 flex items-center space-x-2 px-3 py-2 bg-black/40 backdrop-blur-lg border border-green-500/30 rounded-lg">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-green-400 font-medium">CONNECTED</span>
      </div>
    </>
  );
}
