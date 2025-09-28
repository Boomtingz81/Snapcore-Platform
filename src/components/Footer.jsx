import React, { useState, useEffect } from "react";

const Footer = ({ 
  showBackToTop = true,
  showSystemInfo = true,
  className = "" 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());
  const [systemStats, setSystemStats] = useState({
    uptime: '99.9%',
    tools: 12,
    diagnostics: '2.1M+'
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleNavClick = (path) => {
    console.log(`Navigate to: ${path}`);
    // Handle navigation here
  };

  const companyLinks = [
    { name: "About SnapCore", path: "/about" },
    { name: "Careers", path: "/careers" },
    { name: "Press Kit", path: "/press" },
    { name: "Partners", path: "/partners" }
  ];

  const productLinks = [
    { name: "SnapScan", path: "/snap-scan" },
    { name: "Live Dashboard", path: "/snap-live-dashboard" },
    { name: "Analytics", path: "/snap-analytics-dashboard" },
    { name: "Terminal", path: "/snap-terminal" }
  ];

  const supportLinks = [
    { name: "Documentation", path: "/docs" },
    { name: "Support Center", path: "/support" },
    { name: "System Status", path: "/status" },
    { name: "Contact Us", path: "/contact" }
  ];

  const legalLinks = [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Security", path: "/security" },
    { name: "Compliance", path: "/compliance" }
  ];

  return (
    <footer className={`snap-footer ${className}`}>
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-container">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="brand-logo">
              <div className="logo-icon">⚡</div>
              <div className="brand-text">
                <span className="brand-name">SnapFaultCore</span>
                <span className="brand-tagline">Professional Automotive Diagnostics</span>
              </div>
            </div>
            <p className="brand-description">
              Advanced AI-powered automotive diagnostic platform by SnapCore AI Systems Ltd. 
              Empowering technicians with real-time analysis and comprehensive reporting.
            </p>
            {showSystemInfo && (
              <div className="system-stats">
                <div className="stat-item">
                  <span className="stat-label">System Uptime</span>
                  <span className="stat-value">{systemStats.uptime}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Active Tools</span>
                  <span className="stat-value">{systemStats.tools}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Diagnostics Run</span>
                  <span className="stat-value">{systemStats.diagnostics}</span>
                </div>
              </div>
            )}
          </div>

          {/* Links Grid */}
          <div className="footer-links">
            <div className="link-column">
              <h3>Company</h3>
              <ul>
                {companyLinks.map((link, index) => (
                  <li key={index}>
                    <button onClick={() => handleNavClick(link.path)}>{link.name}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-column">
              <h3>Products</h3>
              <ul>
                {productLinks.map((link, index) => (
                  <li key={index}>
                    <button onClick={() => handleNavClick(link.path)}>{link.name}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-column">
              <h3>Support</h3>
              <ul>
                {supportLinks.map((link, index) => (
                  <li key={index}>
                    <button onClick={() => handleNavClick(link.path)}>{link.name}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-column">
              <h3>Legal</h3>
              <ul>
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <button onClick={() => handleNavClick(link.path)}>{link.name}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="bottom-content">
            <div className="copyright">
              <p>&copy; {currentYear} SnapCore AI Systems Ltd. All rights reserved.</p>
              <p className="build-info">SnapFaultCore v2.1.4 | Build 240925</p>
            </div>
            
            <div className="social-links">
              <button 
                onClick={() => handleNavClick('/github')} 
                className="social-link"
                aria-label="GitHub"
              >
                <span>⚡</span>
              </button>
              <button 
                onClick={() => handleNavClick('/linkedin')} 
                className="social-link"
                aria-label="LinkedIn"
              >
                <span>🔗</span>
              </button>
              <button 
                onClick={() => handleNavClick('/twitter')} 
                className="social-link"
                aria-label="Twitter"
              >
                <span>🐦</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          className={`back-to-top ${isVisible ? 'visible' : ''}`}
          onClick={scrollToTop}
          aria-label="Back to top"
          title="Back to top"
        >
          <span>↑</span>
        </button>
      )}

      <style jsx>{`
        .snap-footer {
          position: relative;
          background: linear-gradient(180deg, var(--bg) 0%, rgba(5, 10, 15, 0.98) 100%);
          border-top: 1px solid rgba(255, 68, 68, 0.2);
          margin-top: auto;
        }

        .footer-main {
          padding: 60px 0 40px;
          position: relative;
        }

        .footer-main::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 68, 68, 0.3), transparent);
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .footer-main .footer-container {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 60px;
        }

        /* Brand Section */
        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--brand), #ff6666, #ff8888);
          border-radius: 10px;
          font-size: 20px;
          box-shadow: 
            0 0 15px rgba(255, 68, 68, 0.4),
            0 0 25px rgba(255, 68, 68, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-size: 20px;
          font-weight: 600;
          color: var(--brand);
          line-height: 1;
          text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
        }

        .brand-tagline {
          font-size: 12px;
          color: rgba(255, 68, 68, 0.7);
          margin-top: 4px;
          font-weight: 400;
        }

        .brand-description {
          color: var(--muted);
          line-height: 1.6;
          font-size: 14px;
          max-width: 400px;
        }

        .system-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 68, 68, 0.1);
          border-radius: var(--radius);
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-label {
          color: var(--muted);
          font-size: 13px;
        }

        .stat-value {
          color: var(--brand);
          font-weight: 600;
          font-size: 13px;
          text-shadow: 0 0 6px rgba(255, 68, 68, 0.3);
        }

        /* Links Grid */
        .footer-links {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
        }

        .link-column h3 {
          color: var(--text);
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.1);
        }

        .link-column ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .link-column button {
          background: none;
          border: none;
          color: var(--muted);
          font-size: 14px;
          font-family: inherit;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 4px 0;
        }

        .link-column button:hover {
          color: var(--brand);
          text-shadow: 0 0 6px rgba(255, 68, 68, 0.4);
          transform: translateX(4px);
        }

        /* Footer Bottom */
        .footer-bottom {
          padding: 20px 0;
          border-top: 1px solid rgba(255, 68, 68, 0.1);
          background: rgba(0, 0, 0, 0.3);
        }

        .bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .copyright {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .copyright p {
          color: var(--muted);
          font-size: 13px;
        }

        .build-info {
          color: rgba(255, 68, 68, 0.6) !important;
          font-family: 'Courier New', monospace;
          font-size: 11px !important;
        }

        .social-links {
          display: flex;
          gap: 12px;
        }

        .social-link {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 68, 68, 0.2);
          border-radius: 8px;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .social-link:hover {
          background: rgba(255, 68, 68, 0.1);
          border-color: rgba(255, 68, 68, 0.4);
          color: var(--brand);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 68, 68, 0.2);
        }

        /* Back to Top Button */
        .back-to-top {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--brand), #ff6666);
          border: 1px solid rgba(255, 68, 68, 0.3);
          border-radius: 12px;
          color: white;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          z-index: 100;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 
            0 4px 12px rgba(255, 68, 68, 0.3),
            0 0 20px rgba(255, 68, 68, 0.2);
        }

        .back-to-top.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .back-to-top:hover {
          transform: translateY(-4px);
          box-shadow: 
            0 8px 20px rgba(255, 68, 68, 0.4),
            0 0 30px rgba(255, 68, 68, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .footer-main .footer-container {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .footer-links {
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
          }
        }

        @media (max-width: 768px) {
          .footer-container {
            padding: 0 16px;
          }

          .footer-main {
            padding: 40px 0 30px;
          }

          .footer-links {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .bottom-content {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .back-to-top {
            bottom: 16px;
            right: 16px;
            width: 44px;
            height: 44px;
          }

          .system-stats {
            padding: 16px;
          }
        }

        /* Focus Styles */
        .link-column button:focus-visible,
        .social-link:focus-visible,
        .back-to-top:focus-visible {
          outline: 2px solid var(--brand);
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
    </footer>
  );
};

export default Footer;