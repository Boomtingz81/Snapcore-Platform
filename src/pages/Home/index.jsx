import React, { useState, useEffect } from "react";

// Mock components since we don't have the actual imports
const RegistrationSearch = ({ onSearch, placeholder }) => {
  const [value, setValue] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className="registration-search">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="reg-input"
      />
      <button type="submit" className="search-btn">Search</button>
    </form>
  );
};

export default function Home() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [systemStatus, setSystemStatus] = useState('All Systems Online');

  const diagnosticTools = [
    { icon: "🔍", name: "SnapScan", path: "/snap-scan", description: "Vehicle diagnostic scanning" },
    { icon: "📊", name: "Analytics", path: "/snap-analytics-dashboard", description: "Data analysis and trends" },
    { icon: "💻", name: "Terminal", path: "/snap-terminal", description: "Developer console access" },
    { icon: "⚡", name: "Live Data", path: "/snap-live-dashboard", description: "Real-time monitoring" }
  ];

  const snapTools = [
    { icon: "⚡", name: "SnapTech", path: "/snap-tech" },
    { icon: "👤", name: "SnapPro", path: "/snap-pro" },
    { icon: "📺", name: "History", path: "/snap-history" },
    { icon: "🔍", name: "VIN Decoder", path: "/vin-decoder" },
    { icon: "➰", name: "Plate Scanner", path: "/plate" },
    { icon: "⚠️", name: "SnapDNA", path: "/snap-dna" },
    { icon: "🧪", name: "Lab Tools", path: "/snap-lab-toolkit" },
    { icon: "🚗", name: "Vehicle Lookup", path: "/vehicle-lookup" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % diagnosticTools.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [diagnosticTools.length]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSystemStatus('All Systems Online');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSystemStatus('Offline Mode Active');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSearch = (reg) => {
    if (reg?.trim()) {
      console.log(`Would navigate to: /vehicle-lookup?reg=${encodeURIComponent(reg.trim())}`);
      // Simulate navigation
      alert(`Searching for registration: ${reg.trim()}`);
    }
  };

  const handleNavClick = (path) => {
    console.log(`Would navigate to: ${path}`);
  };

  return (
    <div className="snapfault-home">
      {/* Particle Background */}
      <div className="particle-background" aria-hidden="true"></div>
      <div className="floating-particles" id="particleContainer" aria-hidden="true"></div>

      {/* Skip Link */}
      <a className="skip-link" href="#main">Skip to main content</a>

      {/* Hero Section */}
      <header className="container hero" id="home" role="banner">
        <h1 className="title">SnapFaultCore</h1>
        <div className="powered">Powered by SnapCore AI Systems Ltd</div>

        <nav className="nav-strip" aria-label="Primary">
          <button className="nav-btn active" onClick={() => handleNavClick('/')}>
            <span aria-hidden="true">🏠</span><span>Home</span>
          </button>
          <button className="nav-btn" onClick={() => handleNavClick('/snap-scan')}>
            <span aria-hidden="true">🔍</span><span>Scan</span>
          </button>
          <button className="nav-btn" onClick={() => handleNavClick('/snap-live-dashboard')}>
            <span aria-hidden="true">▶️</span><span>Live</span>
          </button>
          <button className="nav-btn" onClick={() => handleNavClick('/snap-analytics-dashboard')}>
            <span aria-hidden="true">📈</span><span>Analytics</span>
          </button>
          <button className="nav-btn" onClick={() => handleNavClick('/snap-terminal')}>
            <span aria-hidden="true">💻</span><span>Terminal</span>
          </button>
        </nav>

        <div className="status" role="status" aria-live="polite" title="System status">
          <div className={`dot ${isOnline ? 'online' : 'offline'}`} aria-hidden="true"></div>
          <span>{systemStatus}</span>
        </div>
      </header>

      {/* Main Content */}
      <main id="main" role="main">
        <div className="container grid">
          {/* Left Sidebar - Tools */}
          <aside className="sidebar" aria-label="Tools">
            <div className="panel" aria-labelledby="tools-heading">
              <h3 id="tools-heading">SnapCore Tools</h3>
              <div className="menu" role="navigation" aria-label="Tools menu">
                {snapTools.slice(0, 3).map((tool, index) => (
                  <button key={index} onClick={() => handleNavClick(tool.path)} className="menu-btn">
                    <span aria-hidden="true">{tool.icon}</span>
                    <span>{tool.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="panel" aria-labelledby="diag-heading">
              <h3 id="diag-heading">Diagnostic Tools</h3>
              <div className="menu" role="navigation" aria-label="Diagnostic menu">
                {snapTools.slice(3).map((tool, index) => (
                  <button key={index} onClick={() => handleNavClick(tool.path)} className="menu-btn">
                    <span aria-hidden="true">{tool.icon}</span>
                    <span>{tool.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="panel">
              <h3>Quick Actions</h3>
              <div className="menu">
                <button onClick={() => handleNavClick('/snap-fault-core-pro')} className="menu-btn">
                  <span aria-hidden="true">⚡</span>
                  <span>Launch Diagnostics</span>
                </button>
                <button onClick={() => handleNavClick('/emergency-diagnostic')} className="menu-btn">
                  <span aria-hidden="true">🚨</span>
                  <span>Emergency Scan</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Right Panel - Welcome + Sections */}
          <section className="panel main-content" aria-labelledby="welcome-title">
            <h2 className="section-title" id="welcome-title">Welcome to SnapFaultCore</h2>
            <p className="sub">Professional Automotive Diagnostic Platform</p>

            {/* Featured Tool Showcase */}
            <div className="feature-showcase">
              <div className="featured-tool">
                <div className="tool-icon">
                  <span>{diagnosticTools[currentFeature].icon}</span>
                </div>
                <div className="tool-info">
                  <h3>{diagnosticTools[currentFeature].name}</h3>
                  <p>{diagnosticTools[currentFeature].description}</p>
                  <button 
                    onClick={() => handleNavClick(diagnosticTools[currentFeature].path)}
                    className="tool-link"
                  >
                    Launch Tool →
                  </button>
                </div>
              </div>
            </div>

            {/* Vehicle Registration Search */}
            <div className="search-section">
              <h3>Vehicle Registration Lookup</h3>
              <p className="sub">Enter a registration number for instant vehicle identification</p>
              <div className="search-wrapper">
                <RegistrationSearch 
                  onSearch={handleSearch}
                  placeholder="Enter registration (e.g., AB12 CDE)"
                />
              </div>
            </div>

            {/* Quick Access Grid */}
            <div className="quick-access-grid">
              {diagnosticTools.map((tool, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleNavClick(tool.path);
                    setCurrentFeature(index);
                  }}
                  className={`access-card ${index === currentFeature ? 'active' : ''}`}
                >
                  <div className="card-icon">{tool.icon}</div>
                  <div className="card-name">{tool.name}</div>
                </button>
              ))}
            </div>

            {/* System Information */}
            <div className="system-info">
              <div className="info-item">
                <span className="info-label">Platform Version:</span>
                <span className="info-value">v2.1.4</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Update:</span>
                <span className="info-value">2024-09-25</span>
              </div>
              <div className="info-item">
                <span className="info-label">Active Tools:</span>
                <span className="info-value">{snapTools.length}</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      <div className="footer-space"></div>

      <style jsx>{`
        :root {
          --bg: #0a1420;
          --accent: #00ffaa;
          --accent-dim: #66ffcc;
          --brand: #ff4444;
          --text: #ffffff;
          --muted: rgba(255,255,255,.75);
          --panel: rgba(15,25,40,.4);
          --panel-border: rgba(0,255,170,.25);
          --panel-hover: rgba(0,255,170,.08);
          --ring: rgba(0,255,102,.6);
          --shadow: 0 8px 32px rgba(0,0,0,.35);
          --radius: 12px;
          --gap: 40px;
        }

        .snapfault-home {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          overflow-x: hidden;
          line-height: 1.45;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
        }

        .particle-background {
          position: fixed;
          inset: 0;
          z-index: -1000;
          background:
            radial-gradient(ellipse at 30% 40%, rgba(0,100,150,.05) 0%, transparent 60%),
            radial-gradient(ellipse at 70% 60%, rgba(0,80,120,.04) 0%, transparent 50%),
            var(--bg);
          pointer-events: none;
        }

        .floating-particles {
          position: fixed;
          inset: 0;
          z-index: -999;
          pointer-events: none;
          overflow: hidden;
        }

        .skip-link {
          position: fixed;
          left: 16px;
          top: 16px;
          z-index: 50;
          background: rgba(0,0,0,.6);
          color: #fff;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,.2);
          text-decoration: none;
          font-size: 14px;
          opacity: .9;
        }

        .container {
          max-width: 1200px;
          margin: auto;
          padding: 48px 24px;
        }

        .hero {
          min-height: 90vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 16px;
          padding-top: 48px;
          padding-bottom: 32px;
        }

        .title {
          font-size: clamp(2.5rem, 6vw, 5.5rem);
          font-weight: 400;
          letter-spacing: 1px;
          color: var(--brand);
          text-shadow: 0 0 10px rgba(255,68,68,.8), 0 0 20px rgba(255,68,68,.6), 0 0 30px rgba(255,68,68,.4);
          animation: glow 3s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from { text-shadow: 0 0 10px rgba(255,68,68,.8), 0 0 20px rgba(255,68,68,.6), 0 0 30px rgba(255,68,68,.4); }
          to { text-shadow: 0 0 15px rgba(255,68,68,1), 0 0 25px rgba(255,68,68,.8), 0 0 35px rgba(255,68,68,.6); }
        }

        .powered {
          color: var(--muted);
          margin-top: 4px;
          margin-bottom: 28px;
        }

        .nav-strip {
          display: flex;
          gap: 8px;
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: var(--radius);
          padding: 12px;
          backdrop-filter: blur(10px);
          box-shadow: var(--shadow);
          align-self: stretch;
          justify-content: center;
          flex-wrap: wrap;
          margin: 40px 0;
        }

        .nav-btn {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
          flex: 1 1 140px;
          padding: 10px 16px;
          color: var(--muted);
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 8px;
          transition: all .25s ease;
          cursor: pointer;
          font-family: inherit;
          font-size: inherit;
        }

        .nav-btn:hover {
          color: var(--accent);
          background: var(--panel-hover);
          border-color: var(--panel-border);
          transform: translateY(-2px);
        }

        .nav-btn.active {
          color: var(--accent);
          background: rgba(0,255,170,.12);
          border-color: rgba(0,255,170,.3);
        }

        .status {
          display: inline-flex;
          gap: 10px;
          align-items: center;
          padding: 12px 20px;
          border-radius: 999px;
          border: 1px solid rgba(0,255,170,.3);
          background: rgba(0,255,170,.08);
        }

        .dot {
          width: 10px;
          height: 10px;
          background: #00ff66;
          border-radius: 50%;
          box-shadow: 0 0 8px var(--ring);
          animation: pulse 2s ease-in-out infinite;
        }

        .dot.offline {
          background: #ff4444;
          box-shadow: 0 0 8px rgba(255,68,68,.6);
        }

        @keyframes pulse {
          50% { transform: scale(1.2); opacity: .8; }
        }

        .grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: var(--gap);
        }

        .sidebar {
          display: flex;
          flex-direction: column;
          gap: var(--gap);
        }

        .panel {
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: var(--radius);
          padding: 20px;
          backdrop-filter: blur(10px);
          box-shadow: var(--shadow);
        }

        .panel h3 {
          color: var(--accent);
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 12px;
        }

        .menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .menu-btn {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 12px;
          border-radius: 8px;
          color: var(--muted);
          border: 1px solid rgba(255,255,255,.06);
          background: rgba(255,255,255,.03);
          transition: all .2s;
          cursor: pointer;
          font-family: inherit;
          font-size: inherit;
          text-align: left;
          width: 100%;
        }

        .menu-btn:hover {
          color: var(--accent);
          background: var(--panel-hover);
          border-color: var(--panel-border);
          transform: translateX(4px);
        }

        .main-content {
          min-height: 600px;
        }

        .section-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 300;
          color: var(--brand);
          text-shadow: 0 0 15px rgba(255,68,68,.7), 0 0 25px rgba(255,68,68,.4);
          margin-bottom: 12px;
        }

        .sub {
          color: var(--muted);
          margin-bottom: 20px;
        }

        .feature-showcase {
          background: rgba(0,255,170,.05);
          border: 1px solid var(--panel-border);
          border-radius: var(--radius);
          padding: 20px;
          margin: 24px 0;
        }

        .featured-tool {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .tool-icon {
          font-size: 2.5rem;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,255,170,.1);
          border-radius: 12px;
          flex-shrink: 0;
        }

        .tool-info h3 {
          color: var(--text);
          font-size: 1.25rem;
          margin-bottom: 8px;
        }

        .tool-info p {
          color: var(--muted);
          margin-bottom: 12px;
        }

        .tool-link {
          color: var(--accent);
          background: none;
          border: none;
          font-weight: 500;
          transition: all .2s;
          cursor: pointer;
          font-family: inherit;
          font-size: inherit;
        }

        .tool-link:hover {
          color: var(--accent-dim);
        }

        .search-section {
          margin: 32px 0;
          padding: 20px;
          background: rgba(255,255,255,.02);
          border-radius: var(--radius);
        }

        .search-section h3 {
          color: var(--accent);
          margin-bottom: 8px;
        }

        .search-wrapper {
          margin-top: 16px;
        }

        .registration-search {
          display: flex;
          gap: 8px;
        }

        .reg-input {
          flex: 1;
          padding: 12px;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 8px;
          color: var(--text);
          font-family: inherit;
        }

        .reg-input::placeholder {
          color: var(--muted);
        }

        .search-btn {
          padding: 12px 16px;
          background: var(--accent);
          color: var(--bg);
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all .2s;
        }

        .search-btn:hover {
          background: var(--accent-dim);
        }

        .quick-access-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin: 24px 0;
        }

        .access-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 8px;
          color: var(--muted);
          transition: all .25s;
          cursor: pointer;
          font-family: inherit;
        }

        .access-card:hover,
        .access-card.active {
          background: var(--panel-hover);
          border-color: var(--panel-border);
          color: var(--accent);
          transform: translateY(-2px);
        }

        .card-icon {
          font-size: 1.5rem;
        }

        .card-name {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .system-info {
          margin-top: 32px;
          padding: 16px;
          background: rgba(0,0,0,.2);
          border-radius: 8px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label {
          color: var(--muted);
          font-size: 0.875rem;
        }

        .info-value {
          color: var(--accent);
          font-weight: 600;
        }

        .footer-space {
          height: 96px;
        }

        @media (max-width: 1024px) {
          .grid {
            grid-template-columns: 1fr;
          }
          
          .sidebar {
            order: 2;
          }
          
          .main-content {
            order: 1;
          }
        }

        @media (max-width: 768px) {
          .hero {
            padding: 24px 16px;
          }
          
          .nav-strip {
            flex-direction: column;
          }
          
          .nav-btn {
            flex: none;
          }
          
          .featured-tool {
            flex-direction: column;
            text-align: center;
          }
          
          .quick-access-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}