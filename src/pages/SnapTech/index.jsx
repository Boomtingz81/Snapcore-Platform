import React, { useState, useEffect } from "react";

const SnapTech = () => {
  const [selectedTool, setSelectedTool] = useState(0);
  const [systemMetrics, setSystemMetrics] = useState({
    temperature: 42,
    memory: 68,
    cpu: 34,
    network: 95
  });
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, time: "14:32", action: "Diagnostic scan completed", status: "success" },
    { id: 2, time: "14:28", action: "Vehicle connection established", status: "info" },
    { id: 3, time: "14:25", action: "System calibration updated", status: "warning" },
    { id: 4, time: "14:22", action: "Database sync completed", status: "success" }
  ]);

  const techTools = [
    {
      name: "System Monitor",
      icon: "📊",
      description: "Real-time system performance monitoring",
      status: "Online",
      lastUpdate: "2 seconds ago"
    },
    {
      name: "Hardware Diagnostics",
      icon: "🔧",
      description: "OBD-II adapter and sensor status",
      status: "Connected",
      lastUpdate: "5 seconds ago"
    },
    {
      name: "Network Analysis",
      icon: "🌐",
      description: "Connection quality and latency monitoring",
      status: "Optimal",
      lastUpdate: "1 second ago"
    },
    {
      name: "Data Pipeline",
      icon: "🔄",
      description: "Data flow and processing pipeline status",
      status: "Processing",
      lastUpdate: "3 seconds ago"
    }
  ];

  const quickActions = [
    { name: "Run System Check", icon: "⚡", action: "system-check" },
    { name: "Calibrate Sensors", icon: "⚙️", action: "calibrate" },
    { name: "Update Firmware", icon: "📱", action: "update" },
    { name: "Export Logs", icon: "📋", action: "export" },
    { name: "Reset Connections", icon: "🔄", action: "reset" },
    { name: "Backup Config", icon: "💾", action: "backup" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        temperature: Math.max(35, Math.min(65, prev.temperature + (Math.random() - 0.5) * 4)),
        memory: Math.max(45, Math.min(85, prev.memory + (Math.random() - 0.5) * 6)),
        cpu: Math.max(15, Math.min(75, prev.cpu + (Math.random() - 0.5) * 8)),
        network: Math.max(85, Math.min(100, prev.network + (Math.random() - 0.5) * 2))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleToolSelect = (index) => {
    setSelectedTool(index);
  };

  const handleQuickAction = (action) => {
    console.log(`Executing action: ${action}`);
    // Simulate action execution
    alert(`Executing: ${quickActions.find(a => a.action === action)?.name}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      success: 'var(--accent)',
      info: '#4488ff',
      warning: '#ff8800',
      error: 'var(--brand)'
    };
    return colors[status] || 'var(--muted)';
  };

  return (
    <div className="snaptech-page">
      {/* Skip Link */}
      <a className="skip-link" href="#main">Skip to main content</a>

      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="page-title">SnapTech</h1>
            <p className="page-subtitle">Advanced Technical Diagnostics & System Management</p>
          </div>
          <div className="header-status">
            <div className="status-indicator online">
              <div className="status-dot"></div>
              <span>System Operational</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main" className="main-content">
        <div className="content-container">
          
          {/* System Metrics Dashboard */}
          <section className="metrics-section">
            <div className="section-header">
              <h2>System Metrics</h2>
              <button className="refresh-btn" onClick={() => window.location.reload()}>
                <span>🔄</span> Refresh
              </button>
            </div>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">🌡️</div>
                <div className="metric-info">
                  <span className="metric-label">Temperature</span>
                  <span className="metric-value">{Math.round(systemMetrics.temperature)}°C</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill temperature"
                    style={{ width: `${(systemMetrics.temperature / 70) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">💾</div>
                <div className="metric-info">
                  <span className="metric-label">Memory Usage</span>
                  <span className="metric-value">{Math.round(systemMetrics.memory)}%</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill memory"
                    style={{ width: `${systemMetrics.memory}%` }}
                  ></div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">⚡</div>
                <div className="metric-info">
                  <span className="metric-label">CPU Load</span>
                  <span className="metric-value">{Math.round(systemMetrics.cpu)}%</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill cpu"
                    style={{ width: `${systemMetrics.cpu}%` }}
                  ></div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">🌐</div>
                <div className="metric-info">
                  <span className="metric-label">Network</span>
                  <span className="metric-value">{Math.round(systemMetrics.network)}%</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill network"
                    style={{ width: `${systemMetrics.network}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </section>

          {/* Tools Grid */}
          <section className="tools-section">
            <div className="section-grid">
              <div className="tools-list">
                <h2>Technical Tools</h2>
                <div className="tools-grid">
                  {techTools.map((tool, index) => (
                    <button
                      key={index}
                      className={`tool-card ${index === selectedTool ? 'active' : ''}`}
                      onClick={() => handleToolSelect(index)}
                    >
                      <div className="tool-icon">{tool.icon}</div>
                      <div className="tool-info">
                        <h3>{tool.name}</h3>
                        <p>{tool.description}</p>
                        <div className="tool-status">
                          <span className="status-badge">{tool.status}</span>
                          <span className="last-update">{tool.lastUpdate}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="tool-detail">
                <div className="detail-header">
                  <h3>{techTools[selectedTool].name}</h3>
                  <span className="tool-status-large">{techTools[selectedTool].status}</span>
                </div>
                <div className="detail-content">
                  <p>{techTools[selectedTool].description}</p>
                  <div className="detail-stats">
                    <div className="stat-item">
                      <span className="stat-label">Status:</span>
                      <span className="stat-value">{techTools[selectedTool].status}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Last Update:</span>
                      <span className="stat-value">{techTools[selectedTool].lastUpdate}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Performance:</span>
                      <span className="stat-value">Optimal</span>
                    </div>
                  </div>
                  <div className="detail-actions">
                    <button className="action-btn primary">Configure</button>
                    <button className="action-btn secondary">View Logs</button>
                    <button className="action-btn secondary">Export Data</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions & Activity */}
          <section className="actions-activity-section">
            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="actions-grid">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="action-card"
                    onClick={() => handleQuickAction(action.action)}
                  >
                    <div className="action-icon">{action.icon}</div>
                    <span className="action-name">{action.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="recent-activity">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-time">{activity.time}</div>
                    <div className="activity-content">
                      <span className="activity-action">{activity.action}</span>
                      <div 
                        className="activity-status"
                        style={{ color: getStatusColor(activity.status) }}
                      >
                        {activity.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <style jsx>{`
        .snaptech-page {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
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

        .page-header {
          padding: 32px 0 24px;
          border-bottom: 1px solid rgba(255, 68, 68, 0.2);
          background: linear-gradient(135deg, rgba(15, 25, 40, 0.3), rgba(0, 0, 0, 0.2));
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .page-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 300;
          color: var(--brand);
          text-shadow: 0 0 15px rgba(255, 68, 68, 0.7), 0 0 25px rgba(255, 68, 68, 0.4);
          margin-bottom: 8px;
        }

        .page-subtitle {
          color: var(--muted);
          font-size: 16px;
        }

        .header-status {
          display: flex;
          align-items: center;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(0, 255, 170, 0.08);
          border: 1px solid rgba(0, 255, 170, 0.2);
          border-radius: 20px;
          font-size: 14px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: var(--accent);
          border-radius: 50%;
          box-shadow: 0 0 6px var(--ring);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        .main-content {
          padding: 40px 0;
        }

        .content-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-header h2 {
          color: var(--accent);
          font-size: 20px;
          font-weight: 600;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .refresh-btn:hover {
          background: var(--panel-hover);
          color: var(--accent);
          border-color: var(--panel-border);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .metric-card {
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: var(--radius);
          padding: 20px;
          backdrop-filter: blur(10px);
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .metric-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .metric-icon {
          font-size: 24px;
          width: 40px;
          text-align: center;
        }

        .metric-label {
          color: var(--muted);
          font-size: 14px;
        }

        .metric-value {
          color: var(--accent);
          font-weight: 600;
          font-size: 18px;
        }

        .metric-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .metric-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .metric-fill.temperature { background: linear-gradient(90deg, var(--accent), #ffaa00); }
        .metric-fill.memory { background: linear-gradient(90deg, var(--accent), var(--brand)); }
        .metric-fill.cpu { background: linear-gradient(90deg, var(--accent), #4488ff); }
        .metric-fill.network { background: linear-gradient(90deg, var(--accent), #00ff88); }

        .section-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        .tools-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .tool-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: var(--radius);
          text-align: left;
          cursor: pointer;
          transition: all 0.25s ease;
          backdrop-filter: blur(10px);
          box-shadow: var(--shadow);
          font-family: inherit;
          color: var(--text);
        }

        .tool-card:hover {
          background: var(--panel-hover);
          border-color: rgba(255, 68, 68, 0.3);
          transform: translateY(-2px);
        }

        .tool-card.active {
          background: rgba(255, 68, 68, 0.1);
          border-color: rgba(255, 68, 68, 0.4);
        }

        .tool-icon {
          font-size: 28px;
          width: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tool-info h3 {
          color: var(--text);
          font-size: 16px;
          margin-bottom: 8px;
        }

        .tool-info p {
          color: var(--muted);
          font-size: 14px;
          margin-bottom: 12px;
        }

        .tool-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-badge {
          background: rgba(0, 255, 170, 0.1);
          color: var(--accent);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .last-update {
          color: var(--muted);
          font-size: 12px;
        }

        .tool-detail {
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: var(--radius);
          padding: 24px;
          backdrop-filter: blur(10px);
          box-shadow: var(--shadow);
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .detail-header h3 {
          color: var(--text);
          font-size: 20px;
        }

        .tool-status-large {
          background: rgba(0, 255, 170, 0.1);
          color: var(--accent);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .detail-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 20px 0;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
        }

        .stat-label {
          color: var(--muted);
        }

        .stat-value {
          color: var(--accent);
          font-weight: 500;
        }

        .detail-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .action-btn {
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .action-btn.primary {
          background: var(--brand);
          color: white;
          border: 1px solid var(--brand);
        }

        .action-btn.primary:hover {
          background: #ff6666;
          transform: translateY(-1px);
        }

        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.05);
          color: var(--muted);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .action-btn.secondary:hover {
          background: var(--panel-hover);
          color: var(--accent);
          border-color: var(--panel-border);
        }

        .actions-activity-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: var(--radius);
          cursor: pointer;
          transition: all 0.25s ease;
          backdrop-filter: blur(10px);
          box-shadow: var(--shadow);
          font-family: inherit;
          color: var(--text);
        }

        .action-card:hover {
          background: var(--panel-hover);
          border-color: rgba(255, 68, 68, 0.3);
          transform: translateY(-2px);
        }

        .action-icon {
          font-size: 24px;
        }

        .action-name {
          font-size: 13px;
          font-weight: 500;
          text-align: center;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: var(--radius);
          backdrop-filter: blur(10px);
        }

        .activity-time {
          color: var(--muted);
          font-size: 12px;
          font-family: 'Courier New', monospace;
          min-width: 60px;
        }

        .activity-content {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .activity-action {
          color: var(--text);
          font-size: 14px;
        }

        .activity-status {
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .section-grid,
          .actions-activity-section {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .content-container {
            padding: 0 16px;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .detail-actions {
            flex-direction: column;
          }
        }

        /* Focus Styles */
        .tool-card:focus-visible,
        .action-card:focus-visible,
        .action-btn:focus-visible,
        .refresh-btn:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default SnapTech;