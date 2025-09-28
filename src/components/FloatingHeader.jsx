import React, { useState, useEffect, useRef } from "react";

const FloatingHeader = ({ 
  currentPath = "/", 
  onNavigate = () => {}, 
  showBrandLogo = true,
  showSystemStatus = true,
  className = ""
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [systemStatus, setSystemStatus] = useState('All Systems Online');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  const navigationItems = [
    { icon: "🏠", name: "Home", path: "/" },
    { icon: "🔍", name: "Scan", path: "/snap-scan" },
    { icon: "▶️", name: "Live", path: "/snap-live-dashboard" },
    { icon: "📈", name: "Analytics", path: "/snap-analytics-dashboard" },
    { icon: "💻", name: "Terminal", path: "/snap-terminal" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      // Show/hide based on scroll direction
      if (scrollPosition > lastScrollY.current && scrollPosition > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      // Background opacity based on scroll position
      setIsScrolled(scrollPosition > 50);
      lastScrollY.current = scrollPosition;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleNavClick = (path, event) => {
    event.preventDefault();
    onNavigate(path);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header 
      className={`floating-header ${isScrolled ? 'scrolled' : ''} ${isVisible ? 'visible' : 'hidden'} ${className}`}
      style={{
        transform: `translateY(${isVisible ? '0' : '-100%'})`,
        opacity: isVisible ? 1 : 0
      }}
    >
      <div className="header-content">
        {/* Brand Logo */}
        {showBrandLogo && (
          <div className="brand-section">
            <button 
              className="brand-logo"
              onClick={(e) => handleNavClick('/', e)}
              aria-label="SnapFaultCore Home"
            >
              <div className="logo-icon">⚡</div>
              <div className="brand-text">
                <span className="brand-name">SnapFaultCore</span>
                <span className="brand-sub">SnapCore AI Systems</span>
              </div>
            </button>
          </div>
        )}

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main navigation">
          <div className="nav-items">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
                onClick={(e) => handleNavClick(item.path, e)}
                aria-current={currentPath === item.path ? 'page' : undefined}
              >
                <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          {showSystemStatus && (
            <div 
              className="system-status" 
              role="status" 
              aria-live="polite"
              title={`System status: ${systemStatus}`}
            >
              <div className={`status-dot ${isOnline ? 'online' : 'offline'}`} aria-hidden="true"></div>
              <span className="status-text">{systemStatus}</span>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            <span className="menu-line"></span>
            <span className="menu-line"></span>
            <span className="menu-line"></span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <nav 
        className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!isMenuOpen}
      >
        <div className="mobile-nav-items">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              className={`mobile-nav-item ${currentPath === item.path ? 'active' : ''}`}
              onClick={(e) => handleNavClick(item.path, e)}
              tabIndex={isMenuOpen ? 0 : -1}
              aria-current={currentPath === item.path ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </button>
          ))}
          
          {/* Mobile System Status */}
          <div className="mobile-status">
            <div 
              className="system-status mobile" 
              role="status" 
              aria-live="polite"
              title={`System status: ${systemStatus}`}
            >
              <div className={`status-dot ${isOnline ? 'online' : 'offline'}`} aria-hidden="true"></div>
              <span className="status-text">{systemStatus}</span>
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .floating-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: var(--panel);
          border-bottom: 1px solid var(--panel-border);
          backdrop-filter: blur(20px);
          transition: all 0.4s ease;
          height: 64px;
        }

        .floating-header.scrolled {
          background: rgba(15, 25, 40, 0.95);
          border-bottom-color: rgba(0, 255, 170, 0.3);
          box-shadow: var(--shadow);
        }

        .floating-header.hidden {
          pointer-events: none;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        /* Brand Section */
        .brand-section {
          flex-shrink: 0;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          background: none;
          border: none;
          color: var(--text);
          cursor: pointer;
          padding: 8px;
          border-radius: var(--radius);
          transition: all 0.25s ease;
        }

        .brand-logo:hover {
          background: var(--panel-hover);
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--brand), #ff6666);
          border-radius: 8px;
          font-size: 16px;
          box-shadow: 0 0 10px rgba(255, 68, 68, 0.4);
          animation: logoGlow 3s ease-in-out infinite alternate;
        }

        @keyframes logoGlow {
          from {
            box-shadow: 0 0 10px rgba(255, 68, 68, 0.4);
          }
          to {
            box-shadow: 0 0 15px rgba(255, 68, 68, 0.6), 0 0 25px rgba(255, 68, 68, 0.3);
          }
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .brand-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--brand);
          line-height: 1;
          text-shadow: 0 0 8px rgba(255, 68, 68, 0.4);
        }

        .brand-sub {
          font-size: 11px;
          color: var(--muted);
          line-height: 1;
          margin-top: 2px;
        }

        /* Desktop Navigation */
        .desktop-nav {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .nav-items {
          display: flex;
          gap: 4px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius);
          padding: 6px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: none;
          border: none;
          color: var(--muted);
          font-size: 14px;
          font-family: inherit;
          border-radius: 8px;
          transition: all 0.25s ease;
          cursor: pointer;
          white-space: nowrap;
          position: relative;
        }

        .nav-item:hover {
          background: var(--panel-hover);
          color: var(--accent);
          transform: translateY(-1px);
        }

        .nav-item.active {
          background: rgba(0, 255, 170, 0.12);
          color: var(--accent);
          border: 1px solid rgba(0, 255, 170, 0.2);
        }

        .nav-item.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background: var(--accent);
          border-radius: 50%;
          box-shadow: 0 0 6px var(--ring);
        }

        .nav-icon {
          font-size: 16px;
        }

        .nav-text {
          font-weight: 500;
        }

        /* Header Actions */
        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }

        /* System Status */
        .system-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(0, 255, 170, 0.08);
          border: 1px solid rgba(0, 255, 170, 0.2);
          border-radius: 20px;
          font-size: 13px;
          color: var(--muted);
        }

        .system-status.mobile {
          margin-top: 16px;
          padding: 12px 16px;
          font-size: 14px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 6px var(--ring);
          animation: statusPulse 2s ease-in-out infinite;
        }

        .status-dot.offline {
          background: var(--brand);
          box-shadow: 0 0 6px rgba(255, 68, 68, 0.6);
        }

        @keyframes statusPulse {
          50% { 
            transform: scale(1.2); 
            opacity: 0.8; 
          }
        }

        .status-text {
          font-weight: 500;
        }

        /* Mobile Menu Toggle */
        .mobile-menu-toggle {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          width: 24px;
          height: 18px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .menu-line {
          width: 100%;
          height: 2px;
          background: var(--text);
          border-radius: 1px;
          transition: all 0.3s ease;
          transform-origin: center;
        }

        .mobile-menu-toggle.active .menu-line:nth-child(1) {
          transform: translateY(8px) rotate(45deg);
        }

        .mobile-menu-toggle.active .menu-line:nth-child(2) {
          opacity: 0;
        }

        .mobile-menu-toggle.active .menu-line:nth-child(3) {
          transform: translateY(-8px) rotate(-45deg);
        }

        /* Mobile Navigation */
        .mobile-nav {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(15, 25, 40, 0.98);
          border-bottom: 1px solid var(--panel-border);
          backdrop-filter: blur(20px);
          transform: translateY(-100%);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          box-shadow: var(--shadow);
        }

        .mobile-nav.open {
          transform: translateY(0);
          opacity: 1;
          visibility: visible;
        }

        .mobile-nav-items {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: var(--muted);
          font-size: 16px;
          font-family: inherit;
          text-align: left;
          border-radius: var(--radius);
          transition: all 0.25s ease;
          cursor: pointer;
          width: 100%;
        }

        .mobile-nav-item:hover,
        .mobile-nav-item.active {
          background: var(--panel-hover);
          color: var(--accent);
          border-color: var(--panel-border);
          transform: translateX(4px);
        }

        .mobile-status {
          margin-top: 8px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .header-content {
            padding: 0 16px;
          }

          .brand-text {
            display: none;
          }

          .desktop-nav {
            display: none;
          }

          .mobile-menu-toggle {
            display: flex;
          }

          .system-status:not(.mobile) {
            display: none;
          }

          .floating-header {
            height: 56px;
          }
        }

        @media (max-width: 1024px) {
          .nav-text {
            display: none;
          }

          .nav-item {
            padding: 8px 12px;
          }

          .brand-sub {
            display: none;
          }
        }

        /* Focus Styles */
        .brand-logo:focus-visible,
        .nav-item:focus-visible,
        .mobile-nav-item:focus-visible,
        .mobile-menu-toggle:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: duration 0.1s !important;
          }
        }
      `}</style>
    </header>
  );
};

export default FloatingHeader;