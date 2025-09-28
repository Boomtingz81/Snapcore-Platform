import React, { useState, useEffect } from "react";

const NotFound = () => {
  const [scanProgress, setScanProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);

  // Animated scan progress
  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          setScanComplete(true);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 200);
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, []);

  const handleGoHome = () => {
    console.log('Navigate to home');
    // In a real app: navigate('/')
  };

  const handleRunDiagnostic = () => {
    console.log('Run diagnostic scan');
    setScanProgress(0);
    setScanComplete(false);
  };

  const handleContactSupport = () => {
    console.log('Contact support');
  };

  const diagnosticCodes = [
    'ERR_404_PAGE_NOT_FOUND',
    'SYS_ROUTE_UNDEFINED', 
    'NAV_PATH_INVALID',
    'ADDR_RESOLUTION_FAILED'
  ];

  const suggestedRoutes = [
    { path: '/', name: 'Home Dashboard', icon: '🏠' },
    { path: '/snap-scan', name: 'Vehicle Scanner', icon: '🔍' },
    { path: '/snap-live-dashboard', name: 'Live Data', icon: '📊' },
    { path: '/snap-analytics-dashboard', name: 'Analytics', icon: '📈' },
    { path: '/snap-terminal', name: 'Diagnostic Terminal', icon: '💻' },
    { path: '/login', name: 'User Login', icon: '👤' }
  ];

  return (
    <div className="notfound-page">
      {/* Skip Link */}
      <a className="skip-link" href="#main">Skip to main content</a>

      {/* Animated Background */}
      <div className="background-container" aria-hidden="true">
        <div className="bg-grid"></div>
        <div className="bg-scanner"></div>
        <div className="floating-particles" id="particleContainer"></div>
      </div>

      <main id="main" className="main-content">
        <div className="content-container">
          {/* Error Display */}
          <div className={`error-display ${glitchEffect ? 'glitch' : ''}`}>
            <div className="error-code">404</div>
            <div className="error-title">System Route Not Found</div>
            <div className="error-subtitle">The requested diagnostic path could not be located</div>
          </div>

          {/* Diagnostic Panel */}
          <div className="diagnostic-panel">
            <div className="panel-header">
              <div className="status-indicator">
                <div className="status-dot error"></div>
                <span>Route Resolution Failed</span>
              </div>
              <div className="system-time">
                {new Date().toLocaleString()}
              </div>
            </div>

            {/* Error Codes */}
            <div className="error-codes">
              <h3>Diagnostic Trouble Codes</h3>
              <div className="code-list">
                {diagnosticCodes.map((code, index) => (
                  <div key={index} className="error-code-item">
                    <span className="code-id">DTC{String(index + 1).padStart(3, '0')}</span>
                    <span className="code-description">{code}</span>
                    <span className="code-status">ACTIVE</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scan Progress */}
            <div className="scan-section">
              <div className="scan-header">
                <h3>System Diagnostic Scan</h3>
                <span className="scan-percentage">{Math.round(scanProgress)}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
              <div className="scan-status">
                {scanComplete ? 
                  'Scan Complete - Route not found in system registry' : 
                  'Scanning available routes...'
                }
              </div>
            </div>

            {/* Suggested Routes */}
            <div className="suggested-routes">
              <h3>Available Navigation Routes</h3>
              <div className="routes-grid">
                {suggestedRoutes.map((route, index) => (
                  <button
                    key={index}
                    className="route-card"
                    onClick={() => console.log(`Navigate to ${route.path}`)}
                  >
                    <div className="route-icon">{route.icon}</div>
                    <div className="route-info">
                      <span className="route-name">{route.name}</span>
                      <span className="route-path">{route.path}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className="action-btn primary"
                onClick={handleGoHome}
              >
                <span className="btn-icon">🏠</span>
                Return to Dashboard
              </button>
              <button 
                className="action-btn secondary"
                onClick={handleRunDiagnostic}
              >
                <span className="btn-icon">🔍</span>
                Re-scan Routes
              </button>
              <button 
                className="action-btn outline"
                onClick={handleContactSupport}
              >
                <span className="btn-icon">📞</span>
                Contact Support
              </button>
            </div>

            {/* System Information */}
            <div className="system-info">
              <div className="info-section">
                <h4>System Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Platform:</span>
                    <span className="info-value">SnapFaultCore v2.1.4</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Build:</span>
                    <span className="info-value">20240925.1847</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">User Agent:</span>
                    <span className="info-value">Diagnostic Terminal</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Session:</span>
                    <span className="info-value">Active</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h4>Troubleshooting</h4>
                <ul className="troubleshooting-list">
                  <li>Verify the URL path is correct</li>
                  <li>Check if the diagnostic module is loaded</li>
                  <li>Clear browser cache and refresh</li>
                  <li>Contact system administrator if issue persists</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .notfound-page {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
          position: relative;
          overflow-x: hidden;
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

        .background-container {
          position: fixed;
          inset: 0;
          z-index: -1;
          overflow: hidden;
        }

        .bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 68, 68, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 68, 68, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: gridMove 25s linear infinite;
        }

        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }

        .bg-scanner {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--brand), transparent);
          animation: scannerMove 4s ease-in-out infinite;
        }

        @keyframes scannerMove {
          0%, 100% { 
            left: -100%; 
            opacity: 0; 
          }
          50% { 
            left: 100%; 
            opacity: 1; 
          }
        }

        .floating-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .main-content {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 40px 20px;
        }

        .content-container {
          max-width: 1000px;
          width: 100%;
        }

        .error-display {
          text-align: center;
          margin-bottom: 48px;
          position: relative;
        }

        .error-display.glitch {
          animation: glitchEffect 0.2s ease-in-out;
        }

        @keyframes glitchEffect {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }

        .error-code {
          font-size: clamp(4rem, 12vw, 8rem);
          font-weight: 300;
          color: var(--brand);
          text-shadow: 
            0 0 20px rgba(255, 68, 68, 0.8),
            0 0 40px rgba(255, 68, 68, 0.6),
            0 0 60px rgba(255, 68, 68, 0.4);
          animation: errorGlow 3s ease-in-out infinite alternate;
          line-height: 1;
          margin-bottom: 16px;
        }

        @keyframes errorGlow {
          from {
            text-shadow: 
              0 0 20px rgba(255, 68, 68, 0.8),
              0 0 40px rgba(255, 68, 68, 0.6),
              0 0 60px rgba(255, 68, 68, 0.4);
          }
          to {
            text-shadow: 
              0 0 30px rgba(255, 68, 68, 1),
              0 0 60px rgba(255, 68, 68, 0.8),
              0 0 90px rgba(255, 68, 68, 0.6);
          }
        }

        .error-title {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 600;
          color: var(--text);
          margin-bottom: 12px;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
        }

        .error-subtitle {
          font-size: 18px;
          color: var(--muted);
          margin-bottom: 24px;
        }

        .diagnostic-panel {
          background: var(--panel);
          border: 1px solid rgba(255, 68, 68, 0.2);
          border-radius: 16px;
          backdrop-filter: blur(20px);
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.3),
            0 0 30px rgba(255, 68, 68, 0.1);
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px;
          border-bottom: 1px solid rgba(255, 68, 68, 0.1);
          background: linear-gradient(135deg, rgba(255, 68, 68, 0.05), rgba(255, 68, 68, 0.02));
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .status-dot.error {
          background: var(--brand);
          box-shadow: 0 0 8px rgba(255, 68, 68, 0.6);
        }

        @keyframes pulse {
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        .system-time {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: var(--muted);
        }

        .error-codes {
          padding: 28px;
          border-bottom: 1px solid rgba(255, 68, 68, 0.1);
        }

        .error-codes h3 {
          color: var(--brand);
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          text-shadow: 0 0 8px rgba(255, 68, 68, 0.4);
        }

        .code-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .error-code-item {
          display: grid;
          grid-template-columns: 80px 1fr 80px;
          gap: 16px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 68, 68, 0.1);
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          align-items: center;
        }

        .code-id {
          color: var(--brand);
          font-weight: 600;
        }

        .code-description {
          color: var(--text);
        }

        .code-status {
          color: #ff6666;
          text-align: right;
          font-weight: 600;
        }

        .scan-section {
          padding: 28px;
          border-bottom: 1px solid rgba(255, 68, 68, 0.1);
        }

        .scan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .scan-header h3 {
          color: var(--brand);
          font-size: 18px;
          font-weight: 600;
          text-shadow: 0 0 8px rgba(255, 68, 68, 0.4);
        }

        .scan-percentage {
          color: var(--accent);
          font-weight: 600;
          font-size: 16px;
        }

        .progress-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--brand), #ff6666, var(--accent));
          border-radius: 4px;
          transition: width 0.3s ease;
          position: relative;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 20px;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3));
          animation: progressShimmer 1s ease-in-out infinite;
        }

        @keyframes progressShimmer {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }

        .scan-status {
          color: var(--muted);
          font-size: 14px;
          font-style: italic;
        }

        .suggested-routes {
          padding: 28px;
          border-bottom: 1px solid rgba(255, 68, 68, 0.1);
        }

        .suggested-routes h3 {
          color: var(--brand);
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          text-shadow: 0 0 8px rgba(255, 68, 68, 0.4);
        }

        .routes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .route-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          color: var(--text);
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          font-family: inherit;
        }

        .route-card:hover {
          background: rgba(255, 68, 68, 0.08);
          border-color: rgba(255, 68, 68, 0.2);
          transform: translateX(4px);
        }

        .route-icon {
          font-size: 20px;
          width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .route-info {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .route-name {
          font-weight: 500;
          font-size: 14px;
          color: var(--text);
        }

        .route-path {
          font-size: 12px;
          color: var(--muted);
          font-family: 'Courier New', monospace;
          margin-top: 2px;
        }

        .action-buttons {
          padding: 28px;
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
          border-bottom: 1px solid rgba(255, 68, 68, 0.1);
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
          min-width: 160px;
          justify-content: center;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, var(--brand), #ff6666);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(255, 68, 68, 0.3);
        }

        .action-btn.primary:hover {
          background: linear-gradient(135deg, #ff6666, #ff8888);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 68, 68, 0.4);
        }

        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 68, 68, 0.3);
          color: var(--brand);
        }

        .action-btn.outline {
          background: transparent;
          color: var(--brand);
          border: 2px solid var(--brand);
        }

        .action-btn.outline:hover {
          background: rgba(255, 68, 68, 0.1);
          transform: translateY(-1px);
        }

        .btn-icon {
          font-size: 16px;
        }

        .system-info {
          padding: 28px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .info-section h4 {
          color: var(--accent);
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .info-label {
          color: var(--muted);
        }

        .info-value {
          color: var(--text);
          font-weight: 500;
          font-family: 'Courier New', monospace;
        }

        .troubleshooting-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .troubleshooting-list li {
          font-size: 13px;
          color: var(--muted);
          padding-left: 16px;
          position: relative;
        }

        .troubleshooting-list li::before {
          content: '▶';
          position: absolute;
          left: 0;
          color: var(--brand);
          font-size: 10px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .main-content {
            padding: 20px 16px;
          }

          .error-code-item {
            grid-template-columns: 1fr;
            gap: 8px;
            text-align: left;
          }

          .code-status {
            text-align: left;
          }

          .action-buttons {
            flex-direction: column;
            align-items: stretch;
          }

          .action-btn {
            min-width: auto;
          }

          .system-info {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .routes-grid {
            grid-template-columns: 1fr;
          }

          .panel-header {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
        }

        /* Focus Styles */
        .route-card:focus-visible,
        .action-btn:focus-visible {
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
    </div>
  );
};

export default NotFound;