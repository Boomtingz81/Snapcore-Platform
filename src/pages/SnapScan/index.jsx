<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SnapScan - SnapFaultCore</title>
    <style>
        :root {
            --bg: #0a1420;
            --accent: #00ffaa;
            --brand: #ff4444;
            --text: #ffffff;
            --muted: rgba(255,255,255,.75);
            --panel: rgba(15,25,40,.4);
            --panel-border: rgba(0,255,170,.25);
            --panel-hover: rgba(0,255,170,.08);
            --shadow: 0 8px 32px rgba(0,0,0,.35);
            --radius: 12px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            position: relative;
        }

        .background-effects {
            position: fixed;
            inset: 0;
            z-index: -1;
            overflow: hidden;
        }

        .scan-lines {
            position: absolute;
            inset: 0;
            background-image: linear-gradient(rgba(255, 68, 68, 0.03) 1px, transparent 1px);
            background-size: 100% 20px;
            animation: scanMove 3s linear infinite;
        }

        @keyframes scanMove {
            0% { transform: translateY(-20px); }
            100% { transform: translateY(20px); }
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px 24px;
        }

        .page-header {
            margin-bottom: 40px;
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 32px;
            background: var(--panel);
            border: 1px solid rgba(255, 68, 68, 0.2);
            border-radius: 16px;
            backdrop-filter: blur(20px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .page-title {
            font-size: 3rem;
            font-weight: 300;
            color: var(--brand);
            text-shadow: 0 0 15px rgba(255, 68, 68, 0.7), 0 0 25px rgba(255, 68, 68, 0.4);
            margin-bottom: 8px;
        }

        .page-subtitle {
            color: var(--muted);
            font-size: 16px;
        }

        .connection-status {
            display: flex;
            align-items: center;
        }

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
        }

        .status-indicator.connected {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            color: #10b981;
        }

        .status-indicator.disconnected {
            background: rgba(107, 114, 128, 0.1);
            border: 1px solid rgba(107, 114, 128, 0.2);
            color: #9ca3af;
        }

        .status-indicator.connecting {
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid rgba(245, 158, 11, 0.2);
            color: #f59e0b;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: pulse 2s ease-in-out infinite;
        }

        .status-indicator.connected .status-dot {
            background: #10b981;
            box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
        }

        .status-indicator.disconnected .status-dot {
            background: #9ca3af;
            box-shadow: 0 0 6px rgba(156, 163, 175, 0.6);
        }

        .status-indicator.connecting .status-dot {
            background: #f59e0b;
            box-shadow: 0 0 6px rgba(245, 158, 11, 0.6);
        }

        @keyframes pulse {
            50% { transform: scale(1.2); opacity: 0.8; }
        }

        .scan-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 32px;
            margin-bottom: 40px;
        }

        .scan-control-panel,
        .results-panel {
            background: var(--panel);
            border: 1px solid var(--panel-border);
            border-radius: 16px;
            backdrop-filter: blur(20px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }

        .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px 28px;
            border-bottom: 1px solid rgba(255, 68, 68, 0.1);
            background: linear-gradient(135deg, rgba(255, 68, 68, 0.02), rgba(255, 68, 68, 0.01));
        }

        .panel-header h2 {
            color: var(--brand);
            font-size: 20px;
            font-weight: 600;
            text-shadow: 0 0 10px rgba(255, 68, 68, 0.4);
        }

        .advanced-toggle {
            padding: 6px 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            color: var(--text);
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
        }

        .advanced-toggle:hover {
            background: rgba(255, 68, 68, 0.1);
            border-color: rgba(255, 68, 68, 0.3);
            color: var(--brand);
        }

        .scan-progress-section {
            padding: 28px;
            border-bottom: 1px solid rgba(255, 68, 68, 0.1);
        }

        .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .progress-header h3 {
            color: var(--accent);
            font-size: 16px;
            font-weight: 600;
        }

        .progress-percentage {
            color: var(--brand);
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

        .control-buttons {
            padding: 28px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .scan-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 20px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
            width: 100%;
        }

        .scan-btn.primary {
            background: linear-gradient(135deg, var(--brand), #ff6666);
            color: white;
            border: none;
            box-shadow: 0 4px 12px rgba(255, 68, 68, 0.3);
        }

        .scan-btn.primary:hover {
            background: linear-gradient(135deg, #ff6666, #ff8888);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 68, 68, 0.4);
        }

        .scan-btn.secondary {
            background: rgba(255, 255, 255, 0.05);
            color: var(--text);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .scan-btn.outline {
            background: transparent;
            color: var(--brand);
            border: 2px solid var(--brand);
        }

        .scan-btn.success {
            background: linear-gradient(135deg, var(--accent), #66ffcc);
            color: var(--bg);
            border: none;
            box-shadow: 0 4px 12px rgba(0, 255, 170, 0.3);
        }

        .btn-icon {
            font-size: 16px;
        }

        .vehicle-info-section {
            padding: 28px;
            border-bottom: 1px solid rgba(255, 68, 68, 0.1);
        }

        .vehicle-info-section h3 {
            color: var(--accent);
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
        }

        .vehicle-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }

        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
        }

        .info-label {
            color: var(--muted);
            font-size: 13px;
        }

        .info-value {
            color: var(--text);
            font-weight: 500;
            font-size: 13px;
            font-family: 'Courier New', monospace;
        }

        .dtc-section {
            padding: 28px;
            flex: 1;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .section-header h3 {
            color: var(--accent);
            font-size: 16px;
            font-weight: 600;
        }

        .code-count {
            color: var(--muted);
            font-size: 14px;
        }

        .dtc-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .dtc-item {
            padding: 16px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 10px;
            transition: all 0.2s ease;
        }

        .dtc-item:hover {
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(255, 68, 68, 0.2);
        }

        .dtc-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .dtc-code {
            font-weight: 600;
            font-family: 'Courier New', monospace;
            font-size: 14px;
        }

        .dtc-status {
            font-size: 12px;
            font-weight: 600;
        }

        .dtc-description {
            color: var(--text);
            font-size: 14px;
            line-height: 1.4;
            margin-bottom: 12px;
        }

        .dtc-severity {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .severity-label {
            color: var(--muted);
            font-size: 12px;
        }

        .severity-badge {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            color: white;
        }

        .no-codes {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 40px;
            text-align: center;
        }

        .success-message {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
        }

        .success-icon {
            font-size: 48px;
            opacity: 0.8;
        }

        .no-codes p {
            color: var(--muted);
            font-size: 16px;
            line-height: 1.5;
        }

        .scan-history-section {
            background: var(--panel);
            border: 1px solid var(--panel-border);
            border-radius: 16px;
            backdrop-filter: blur(20px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }

        .scan-history-section h3 {
            color: var(--brand);
            font-size: 20px;
            font-weight: 600;
            text-shadow: 0 0 10px rgba(255, 68, 68, 0.4);
            padding: 24px 28px 16px;
            border-bottom: 1px solid rgba(255, 68, 68, 0.1);
            background: linear-gradient(135deg, rgba(255, 68, 68, 0.02), rgba(255, 68, 68, 0.01));
        }

        .history-list {
            padding: 20px 28px 28px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .history-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 10px;
            transition: all 0.2s ease;
        }

        .history-item:hover {
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(255, 68, 68, 0.2);
            transform: translateX(4px);
        }

        .history-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .history-vehicle {
            color: var(--text);
            font-weight: 500;
            font-size: 14px;
        }

        .history-timestamp {
            color: var(--muted);
            font-size: 12px;
            font-family: 'Courier New', monospace;
        }

        .history-results {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .history-results .code-count {
            color: var(--accent);
            font-weight: 500;
            font-size: 13px;
        }

        .scan-status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .scan-status.complete {
            background: rgba(16, 185, 129, 0.1);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.2);
        }

        @media (max-width: 1200px) {
            .scan-grid {
                grid-template-columns: 1fr;
                gap: 24px;
            }
        }

        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 20px;
                text-align: center;
                padding: 24px;
            }

            .vehicle-info-grid {
                grid-template-columns: 1fr;
            }

            .history-item {
                flex-direction: column;
                gap: 12px;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="background-effects">
        <div class="scan-lines"></div>
    </div>

    <div class="container">
        <!-- Header -->
        <header class="page-header">
            <div class="header-content">
                <div class="title-section">
                    <h1 class="page-title">SnapScan</h1>
                    <p class="page-subtitle">Advanced Vehicle Diagnostic Scanner</p>
                </div>
                <div class="connection-status">
                    <div class="status-indicator connected" id="connection-status">
                        <div class="status-dot"></div>
                        <span id="status-text">OBD-II Connected</span>
                    </div>
                </div>
            </div>
        </header>

        <div class="scan-grid">
            <!-- Scan Control Panel -->
            <div class="scan-control-panel">
                <div class="panel-header">
                    <h2>Scan Control</h2>
                    <button class="advanced-toggle" onclick="toggleAdvanced()">Advanced Mode</button>
                </div>

                <!-- Scan Progress -->
                <div class="scan-progress-section">
                    <div class="progress-header">
                        <h3>Scan Progress</h3>
                        <span class="progress-percentage" id="progress-percentage">0%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="scan-status" id="scan-status">Ready to scan</div>
                </div>

                <!-- Control Buttons -->
                <div class="control-buttons">
                    <button class="scan-btn primary" id="start-scan-btn" onclick="startScan()">
                        <span class="btn-icon">🔍</span>
                        Start Scan
                    </button>
                    <button class="scan-btn outline" onclick="clearCodes()" style="display: none;" id="clear-btn">
                        <span class="btn-icon">🗑</span>
                        Clear Codes
                    </button>
                    <button class="scan-btn success" onclick="exportReport()" style="display: none;" id="export-btn">
                        <span class="btn-icon">📄</span>
                        Export Report
                    </button>
                </div>
            </div>

            <!-- Results Panel -->
            <div class="results-panel">
                <!-- Vehicle Information -->
                <div class="vehicle-info-section" id="vehicle-info" style="display: none;">
                    <h3>Vehicle Information</h3>
                    <div class="vehicle-info-grid">
                        <div class="info-item">
                            <span class="info-label">VIN:</span>
                            <span class="info-value">1HGBH41JXMN109186</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Vehicle:</span>
                            <span class="info-value">2021 Honda Civic</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Engine:</span>
                            <span class="info-value">1.5L Turbo</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Transmission:</span>
                            <span class="info-value">CVT</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Odometer:</span>
                            <span class="info-value">45,230 miles</span>
                        </div>
                    </div>
                </div>

                <!-- Diagnostic Trouble Codes -->
                <div class="dtc-section">
                    <div class="section-header">
                        <h3>Diagnostic Trouble Codes</h3>
                        <span class="code-count" id="code-count">0 Codes Found</span>
                    </div>
                    
                    <div class="no-codes" id="no-codes">
                        <div class="success-message">
                            <span class="success-icon">🔍</span>
                            <p>Start a scan to check for diagnostic trouble codes.</p>
                        </div>
                    </div>

                    <div class="dtc-list" id="dtc-list" style="display: none;">
                        <!-- DTCs will be populated here -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Scan History -->
        <div class="scan-history-section">
            <h3>Recent Scans</h3>
            <div class="history-list">
                <div class="history-item">
                    <div class="history-info">
                        <span class="history-vehicle">2021 Honda Civic</span>
                        <span class="history-timestamp">12/26/2024 at 2:30 PM</span>
                    </div>
                    <div class="history-results">
                        <span class="code-count">2 codes</span>
                        <span class="scan-status complete">complete</span>
                    </div>
                </div>
                <div class="history-item">
                    <div class="history-info">
                        <span class="history-vehicle">2019 Toyota Camry</span>
                        <span class="history-timestamp">12/24/2024 at 10:15 AM</span>
                    </div>
                    <div class="history-results">
                        <span class="code-count">0 codes</span>
                        <span class="scan-status complete">complete</span>
                    </div>
                </div>
                <div class="history-item">
                    <div class="history-info">
                        <span class="history-vehicle">2020 Ford F-150</span>
                        <span class="history-timestamp">12/22/2024 at 4:45 PM</span>
                    </div>
                    <div class="history-results">
                        <span class="code-count">1 codes</span>
                        <span class="scan-status complete">complete</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let scanState = 'idle'; // idle, connecting, scanning, complete
        let scanProgress = 0;
        let progressInterval;

        const mockDTCs = [
            {
                code: 'P0171',
                description: 'System Too Lean (Bank 1)',
                severity: 'warning',
                status: 'pending',
                color: '#f59e0b'
            },
            {
                code: 'P0420',
                description: 'Catalyst System Efficiency Below Threshold',
                severity: 'error',
                status: 'confirmed',
                color: '#ef4444'
            },
            {
                code: 'B1234',
                description: 'ABS Wheel Speed Sensor Circuit',
                severity: 'info',
                status: 'intermittent',
                color: '#3b82f6'
            }
        ];

        function updateProgress(percentage) {
            scanProgress = percentage;
            document.getElementById('progress-percentage').textContent = Math.round(percentage) + '%';
            document.getElementById('progress-fill').style.width = percentage + '%';
        }

        function updateScanStatus(status) {
            document.getElementById('scan-status').textContent = status;
        }

        function updateConnectionStatus(status, text) {
            const statusEl = document.getElementById('connection-status');
            const textEl = document.getElementById('status-text');
            
            statusEl.className = `status-indicator ${status}`;
            textEl.textContent = text;
        }

        function startScan() {
            if (scanState !== 'idle') return;

            scanState = 'connecting';
            updateConnectionStatus('connecting', 'Connecting...');
            updateScanStatus('Establishing connection...');
            updateProgress(0);

            const startBtn = document.getElementById('start-scan-btn');
            startBtn.innerHTML = '<span class="btn-icon">⏹</span>Stop Scan';
            startBtn.className = 'scan-btn secondary';
            startBtn.onclick = stopScan;

            // Simulate connection
            setTimeout(() => {
                scanState = 'scanning';
                updateConnectionStatus('connected', 'OBD-II Connected');
                updateScanStatus('Scanning vehicle systems...');

                // Start progress animation
                progressInterval = setInterval(() => {
                    scanProgress += Math.random() * 8 + 2;
                    
                    if (scanProgress >= 100) {
                        scanProgress = 100;
                        completeScan();
                    }
                    
                    updateProgress(scanProgress);
                }, 200);
            }, 2000);
        }

        function stopScan() {
            scanState = 'idle';
            updateConnectionStatus('disconnected', 'Not Connected');
            updateScanStatus('Ready to scan');
            updateProgress(0);

            const startBtn = document.getElementById('start-scan-btn');
            startBtn.innerHTML = '<span class="btn-icon">🔍</span>Start Scan';
            startBtn.className = 'scan-btn primary';
            startBtn.onclick = startScan;

            if (progressInterval) {
                clearInterval(progressInterval);
            }

            // Hide results
            document.getElementById('vehicle-info').style.display = 'none';
            document.getElementById('dtc-list').style.display = 'none';
            document.getElementById('no-codes').style.display = 'block';
            document.getElementById('clear-btn').style.display = 'none';
            document.getElementById('export-btn').style.display = 'none';
            document.getElementById('code-count').textContent = '0 Codes Found';
        }

        function completeScan() {
            scanState = 'complete';
            updateScanStatus('Scan completed successfully');
            
            if (progressInterval) {
                clearInterval(progressInterval);
            }

            const startBtn = document.getElementById('start-scan-btn');
            startBtn.innerHTML = '<span class="btn-icon">🔍</span>Start Scan';
            startBtn.className = 'scan-btn primary';
            startBtn.onclick = startScan;

            // Show vehicle info
            document.getElementById('vehicle-info').style.display = 'block';

            // Show DTCs
            displayDTCs();

            // Show action buttons
            document.getElementById('clear-btn').style.display = 'block';
            document.getElementById('export-btn').style.display = 'block';
        }

        function displayDTCs() {
            const dtcList = document.getElementById('dtc-list');
            const noCodes = document.getElementById('no-codes');
            const codeCount = document.getElementById('code-count');

            if (mockDTCs.length > 0) {
                // Hide no codes message
                noCodes.style.display = 'none';
                dtcList.style.display = 'block';
                codeCount.textContent = `${mockDTCs.length} Codes Found`;

                // Clear existing DTCs
                dtcList.innerHTML = '';

                // Add DTCs
                mockDTCs.forEach(dtc => {
                    const dtcItem = document.createElement('div');
                    dtcItem.className = 'dtc-item';
                    dtcItem.innerHTML = `
                        <div class="dtc-header">
                            <span class="dtc-code" style="color: ${dtc.color}">${dtc.code}</span>
                            <span class="dtc-status" style="color: ${dtc.color}">${dtc.status.toUpperCase()}</span>
                        </div>
                        <p class="dtc-description">${dtc.description}</p>
                        <div class="dtc-severity">
                            <span class="severity-label">Severity:</span>
                            <span class="severity-badge" style="background-color: ${dtc.color}">${dtc.severity.toUpperCase()}</span>
                        </div>
                    `;
                    dtcList.appendChild(dtcItem);
                });
            } else {
                // Show success message
                noCodes.innerHTML = `
                    <div class="success-message">
                        <span class="success-icon">✅</span>
                        <p>No diagnostic trouble codes found. All systems operating normally.</p>
                    </div>
                `;
                dtcList.style.display = 'none';
                codeCount.textContent = '0 Codes Found';
            }
        }

        function