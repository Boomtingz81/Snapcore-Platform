import React, { useEffect, useState } from "react";
import { Clock, Download, Trash2, Search, Filter, Calendar, Car, AlertCircle, CheckCircle, XCircle, RotateCcw } from "lucide-react";

export default function SnapHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const historyItems = [
    {
      id: 1,
      title: "Diagnostic Scan – BMW 320d",
      date: "2025-09-26",
      time: "14:32",
      vehicle: "BMW 320d (2019)",
      reg: "AB19 XYZ",
      type: "diagnostic",
      status: "completed",
      details: "OBD scan completed with SnapTech. 2 Fault codes found: P0420 (Catalyst System Efficiency), P0171 (System Too Lean Bank 1)",
      technician: "John Smith",
      duration: "12 mins",
      codes: 2,
      severity: "medium"
    },
    {
      id: 2,
      title: "Service Reset – Audi A4",
      date: "2025-09-25",
      time: "16:45",
      vehicle: "Audi A4 (2020)",
      reg: "CD20 ABC",
      type: "service",
      status: "completed",
      details: "Service light reset completed successfully. Oil service interval reset to 15,000 miles.",
      technician: "Sarah Johnson",
      duration: "3 mins",
      codes: 0,
      severity: "low"
    },
    {
      id: 3,
      title: "Live Data Session – Mercedes C200",
      date: "2025-09-24",
      time: "10:15",
      vehicle: "Mercedes C200 (2021)",
      reg: "EF21 DEF",
      type: "livedata",
      status: "completed",
      details: "Real-time monitoring session completed. All parameters within normal range.",
      technician: "Mike Wilson",
      duration: "25 mins",
      codes: 0,
      severity: "low"
    },
    {
      id: 4,
      title: "DPF Regeneration – Ford Transit",
      date: "2025-09-23",
      time: "09:30",
      vehicle: "Ford Transit (2018)",
      reg: "GH18 GHI",
      type: "regeneration",
      status: "failed",
      details: "DPF regeneration attempt failed. Manual cleaning required.",
      technician: "David Brown",
      duration: "45 mins",
      codes: 3,
      severity: "high"
    },
    {
      id: 5,
      title: "ECU Programming – Volkswagen Golf",
      date: "2025-09-22",
      time: "13:20",
      vehicle: "Volkswagen Golf (2022)",
      reg: "JK22 JKL",
      type: "programming",
      status: "in-progress",
      details: "ECU software update in progress. Estimated completion: 15 minutes.",
      technician: "Emma Davis",
      duration: "ongoing",
      codes: 0,
      severity: "medium"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#00ffaa';
      case 'failed': return '#ff4444';
      case 'in-progress': return '#ffaa00';
      default: return '#66ffcc';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'failed': return <XCircle size={16} />;
      case 'in-progress': return <RotateCcw size={16} className="animate-spin" />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'diagnostic': return '🔍';
      case 'service': return '🔧';
      case 'livedata': return '📊';
      case 'regeneration': return '🔥';
      case 'programming': return '💻';
      default: return '📋';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#00ffaa';
      default: return '#66ffcc';
    }
  };

  const filteredItems = historyItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.reg.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedItems.length > 0) {
      const confirmed = window.confirm(`Delete ${selectedItems.length} selected items?`);
      if (confirmed) {
        setSelectedItems([]);
        // Handle bulk delete logic here
      }
    }
  };

  return (
    <div className="snaphistory-page">
      {/* Particle Background */}
      <div className="particle-background" aria-hidden="true"></div>
      <div className="floating-particles" aria-hidden="true"></div>

      {/* Header Section */}
      <header className="page-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="page-title">SnapHistory</h1>
            <p className="page-subtitle">Diagnostic & Service History Archive</p>
            <div className="powered-by">Powered by SnapCore AI Systems Ltd</div>
          </div>
          
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{historyItems.length}</span>
              <span className="stat-label">Total Sessions</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{historyItems.filter(i => i.status === 'completed').length}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{historyItems.reduce((sum, item) => sum + item.codes, 0)}</span>
              <span className="stat-label">Total Codes</span>
            </div>
          </div>
        </div>
      </header>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="search-controls">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by vehicle, registration, or session..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-wrapper">
            <Filter size={18} className="filter-icon" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="diagnostic">Diagnostic</option>
              <option value="service">Service</option>
              <option value="livedata">Live Data</option>
              <option value="regeneration">Regeneration</option>
              <option value="programming">Programming</option>
            </select>
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">{selectedItems.length} selected</span>
            <button onClick={handleBulkDelete} className="bulk-delete-btn">
              <Trash2 size={16} />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* History Items */}
      <main className="history-content">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No History Found</h3>
            <p>No diagnostic sessions match your current search criteria.</p>
          </div>
        ) : (
          <div className="history-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="history-card">
                <div className="card-header">
                  <div className="card-select">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="select-checkbox"
                    />
                  </div>
                  
                  <div className="session-info">
                    <div className="session-type">
                      <span className="type-icon">{getTypeIcon(item.type)}</span>
                      <span className="type-label">{item.type.toUpperCase()}</span>
                    </div>
                    
                    <div className="session-status" style={{ color: getStatusColor(item.status) }}>
                      {getStatusIcon(item.status)}
                      <span>{item.status.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button className="action-btn download-btn" title="Download Report">
                      <Download size={16} />
                    </button>
                    <button className="action-btn delete-btn" title="Delete Session">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="card-content">
                  <h3 className="session-title">{item.title}</h3>
                  
                  <div className="vehicle-info">
                    <Car size={16} className="vehicle-icon" />
                    <span className="vehicle-text">{item.vehicle}</span>
                    <span className="registration">{item.reg}</span>
                  </div>

                  <div className="session-details">
                    <p className="details-text">{item.details}</p>
                  </div>

                  <div className="session-metadata">
                    <div className="meta-row">
                      <div className="meta-item">
                        <Calendar size={14} />
                        <span>{item.date} at {item.time}</span>
                      </div>
                      <div className="meta-item">
                        <Clock size={14} />
                        <span>{item.duration}</span>
                      </div>
                    </div>
                    
                    <div className="meta-row">
                      <div className="meta-item">
                        <span>Technician: {item.technician}</span>
                      </div>
                      {item.codes > 0 && (
                        <div className="codes-badge" style={{ backgroundColor: getSeverityColor(item.severity) }}>
                          {item.codes} Code{item.codes !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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
        }

        .snaphistory-page {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          padding: 32px 24px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
          line-height: 1.5;
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

        .page-header {
          max-width: 1200px;
          margin: 0 auto 40px;
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: var(--radius);
          padding: 32px;
          backdrop-filter: blur(10px);
          box-shadow: var(--shadow);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 32px;
        }

        .title-section {
          flex: 1;
        }

        .page-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 400;
          color: var(--brand);
          text-shadow: 0 0 15px rgba(255,68,68,.7), 0 0 25px rgba(255,68,68,.4);
          margin-bottom: 8px;
        }

        .page-subtitle {
          color: var(--accent);
          font-size: 1.25rem;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .powered-by {
          color: var(--muted);
          font-size: 0.875rem;
        }

        .header-stats {
          display: flex;
          gap: 24px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          background: rgba(0,255,170,.08);
          border: 1px solid var(--panel-border);
          border-radius: 8px;
          min-width: 80px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--accent);
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--muted);
          text-align: center;
        }

        .controls-section {
          max-width: 1200px;
          margin: 0 auto 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .search-controls {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .search-wrapper, .filter-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon, .filter-icon {
          position: absolute;
          left: 12px;
          color: var(--muted);
          z-index: 1;
        }

        .search-input, .filter-select {
          padding: 12px 12px 12px 40px;
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: 8px;
          color: var(--text);
          font-family: inherit;
          backdrop-filter: blur(10px);
          transition: all 0.2s;
          min-width: 300px;
        }

        .filter-select {
          min-width: 150px;
        }

        .search-input:focus, .filter-select:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 2px rgba(0,255,170,.2);
        }

        .search-input::placeholder {
          color: var(--muted);
        }

        .bulk-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: rgba(255,68,68,.1);
          border: 1px solid rgba(255,68,68,.3);
          border-radius: 8px;
        }

        .selected-count {
          color: var(--text);
          font-size: 0.875rem;
        }

        .bulk-delete-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--brand);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .bulk-delete-btn:hover {
          background: rgba(255,68,68,.8);
        }

        .history-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .empty-state {
          text-align: center;
          padding: 64px 32px;
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: var(--radius);
          backdrop-filter: blur(10px);
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          color: var(--accent);
          margin-bottom: 8px;
        }

        .empty-state p {
          color: var(--muted);
        }

        .history-grid {
          display: grid;
          gap: 24px;
        }

        .history-card {
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: var(--radius);
          backdrop-filter: blur(10px);
          box-shadow: var(--shadow);
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .history-card:hover {
          border-color: rgba(0,255,170,.4);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,0,0,.4);
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,.1);
          background: rgba(0,255,170,.03);
        }

        .card-select {
          margin-right: 16px;
        }

        .select-checkbox {
          width: 16px;
          height: 16px;
          accent-color: var(--accent);
        }

        .session-info {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .session-type {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: rgba(0,255,170,.1);
          border-radius: 6px;
        }

        .type-icon {
          font-size: 1.1rem;
        }

        .type-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent);
        }

        .session-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .download-btn {
          background: rgba(0,255,170,.1);
          color: var(--accent);
        }

        .download-btn:hover {
          background: rgba(0,255,170,.2);
        }

        .delete-btn {
          background: rgba(255,68,68,.1);
          color: var(--brand);
        }

        .delete-btn:hover {
          background: rgba(255,68,68,.2);
        }

        .card-content {
          padding: 20px;
        }

        .session-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 12px;
        }

        .vehicle-info {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          padding: 12px;
          background: rgba(255,255,255,.02);
          border-radius: 8px;
        }

        .vehicle-icon {
          color: var(--accent);
        }

        .vehicle-text {
          color: var(--text);
          font-weight: 500;
        }

        .registration {
          padding: 4px 8px;
          background: rgba(0,255,170,.1);
          color: var(--accent);
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-left: auto;
        }

        .session-details {
          margin-bottom: 16px;
        }

        .details-text {
          color: var(--muted);
          line-height: 1.6;
        }

        .session-metadata {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--muted);
          font-size: 0.875rem;
        }

        .codes-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            text-align: center;
          }

          .header-stats {
            justify-content: center;
          }

          .controls-section {
            flex-direction: column;
            align-items: stretch;
          }

          .search-controls {
            flex-direction: column;
          }

          .search-input {
            min-width: auto;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}