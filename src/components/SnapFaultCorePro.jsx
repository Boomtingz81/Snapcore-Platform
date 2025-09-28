import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF } from '@react-three/drei';

// 3D Vehicle Component
const AudiRSQ3Model = ({ faultCodes = [], liveData = {}, onPartClick }) => {
  const { scene } = useGLTF('/models/audi-rsq3.glb');
  const modelRef = useRef();
  const [hoveredPart, setHoveredPart] = useState(null);

  // Define clickable diagnostic parts
  const diagnosticParts = {
    engine: {
      position: [0, 0.5, 1.2],
      faultCodes: ['P0420', 'P0171', 'P0174', 'P0300'],
      color: '#ff4444'
    },
    frontWheels: {
      position: [-0.8, -0.5, 0.8],
      faultCodes: ['C0035', 'C0040'],
      color: '#ff8844'
    },
    transmission: {
      position: [0, -0.2, 0],
      faultCodes: ['P0700', 'P0750'],
      color: '#ffaa44'
    },
    exhaust: {
      position: [0, -0.5, -1.5],
      faultCodes: ['P0420', 'P0430'],
      color: '#44ff44'
    }
  };

  const DiagnosticHotspot = ({ part, partKey }) => {
    const meshRef = useRef();
    
    const hasActiveFaults = part.faultCodes.some(code => 
      faultCodes.some(fault => fault.code === code)
    );

    return (
      <mesh
        ref={meshRef}
        position={part.position}
        onClick={(e) => {
          e.stopPropagation();
          onPartClick?.(partKey, part);
        }}
        onPointerEnter={() => {
          setHoveredPart(partKey);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          setHoveredPart(null);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={hasActiveFaults ? '#ff0000' : part.color}
          transparent
          opacity={hoveredPart === partKey ? 0.8 : 0.6}
          emissive={hasActiveFaults ? '#ff0000' : '#000000'}
          emissiveIntensity={hasActiveFaults ? 0.3 : 0}
        />
      </mesh>
    );
  };

  return (
    <group ref={modelRef}>
      <primitive object={scene} scale={[1, 1, 1]} />
      {Object.entries(diagnosticParts).map(([key, part]) => (
        <DiagnosticHotspot key={key} part={part} partKey={key} />
      ))}
      <Environment preset="studio" />
      <ContactShadows opacity={0.4} scale={10} blur={1} far={10} resolution={256} color="#000000" />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={3} maxDistance={8} />
    </group>
  );
};

const SnapFaultCore = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [liveDataActive, setLiveDataActive] = useState(false);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [faultCodes, setFaultCodes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalBody, setModalBody] = useState('');
  const [progressVisible, setProgressVisible] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [selectedPart, setSelectedPart] = useState(null);
  
  const floatingElementsRef = useRef(null);
  const codeBackgroundRef = useRef(null);

  const [liveDataParams, setLiveDataParams] = useState({
    'ENGINE_RPM': { value: 0, unit: 'RPM', min: 0, max: 8000 },
    'VEHICLE_SPEED': { value: 0, unit: 'km/h', min: 0, max: 200 },
    'COOLANT_TEMP': { value: 85, unit: '°C', min: -40, max: 150 },
    'THROTTLE_POS': { value: 12, unit: '%', min: 0, max: 100 },
    'FUEL_LEVEL': { value: 75, unit: '%', min: 0, max: 100 },
    'BATTERY_VOLT': { value: 12.6, unit: 'V', min: 10, max: 16 }
  });

  useEffect(() => {
    generateCodeBackground();
    startBackgroundAnimations();
    startLiveDataSimulation();
  }, []);

  const generateCodeBackground = () => {
    const diagnosticCode = `
// ECU Diagnostic Protocol - ISO 14229 UDS
void read_diagnostic_data() {
  uint8_t request[] = {0x22, 0xF1, 0x90}; // Read VIN
  if (send_uds_request(request, 3)) {
    process_positive_response();
  }
}

// CAN Bus Frame Processing
struct CANFrame {
  uint32_t id;
  uint8_t data[8];
  uint8_t dlc;
  uint32_t timestamp;
};

// Live Data PID Processing
float decode_engine_rpm(uint8_t* data) {
  return ((data[0] * 256) + data[1]) / 4.0;
}

// Fault Code Management
typedef struct {
  uint16_t dtc_code;
  uint8_t status_byte;
  uint8_t severity;
  uint32_t occurrence_count;
} DiagnosticTroubleCode;

// System Readiness Monitoring
bool check_system_readiness() {
  return (obd_monitors.catalyst && 
          obd_monitors.evap_system &&
          obd_monitors.oxygen_sensor);
}
        `;
    
    if (codeBackgroundRef.current) {
      codeBackgroundRef.current.innerHTML = (diagnosticCode + '\n\n').repeat(6);
    }
  };

  const startBackgroundAnimations = () => {
    const interval = setInterval(() => {
      createFloatingFault();
    }, 3000);
    return () => clearInterval(interval);
  };

  const createFloatingFault = () => {
    if (!floatingElementsRef.current) return;
    
    const codes = ['P0171', 'P0300', 'P0420', 'B0001', 'U0100'];
    const code = codes[Math.floor(Math.random() * codes.length)];
    
    const element = document.createElement('div');
    element.className = 'floating-fault';
    element.textContent = code;
    element.style.left = Math.random() * 90 + '%';
    element.style.color = ['#ff4444', '#ffaa00', '#0099ff'][Math.floor(Math.random() * 3)];
    
    floatingElementsRef.current.appendChild(element);
    
    setTimeout(() => {
      if (floatingElementsRef.current && floatingElementsRef.current.contains(element)) {
        floatingElementsRef.current.removeChild(element);
      }
    }, 12000);
  };

  const startLiveDataSimulation = () => {
    const interval = setInterval(() => {
      if (!liveDataActive) return;

      setLiveDataParams(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          const param = updated[key];
          let change = (Math.random() - 0.5) * 0.1;
          
          if (key === 'ENGINE_RPM') {
            change = (Math.random() - 0.5) * 200;
            param.value = Math.max(600, Math.min(6000, param.value + change));
          } else if (key === 'VEHICLE_SPEED') {
            change = (Math.random() - 0.5) * 5;
            param.value = Math.max(0, Math.min(120, param.value + change));
          } else if (key === 'COOLANT_TEMP') {
            change = (Math.random() - 0.5) * 2;
            param.value = Math.max(70, Math.min(110, param.value + change));
          } else {
            param.value = Math.max(param.min, Math.min(param.max, param.value + change));
          }
        });
        return updated;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  };

  const switchSection = (section) => {
    setCurrentSection(section);
  };

  const handlePartClick = (partKey, partData) => {
    setSelectedPart({ key: partKey, data: partData });
  };

  const getRelatedFaultCodes = () => {
    if (!selectedPart) return [];
    return faultCodes.filter(fault => 
      selectedPart.data.faultCodes.includes(fault.code)
    );
  };

  const animateProgress = (start, end, duration) => {
    return new Promise(resolve => {
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = start + (end - start) * progress;

        setProgressPercent(Math.round(currentValue));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      animate();
    });
  };

const startScan = async () => {
    if (isScanning) return;
    
    setIsScanning(true);
    setProgressVisible(true);

    const steps = [
      { label: 'Connecting to ECU...', duration: 1000 },
      { label: 'Reading fault codes...', duration: 2000 },
      { label: 'Checking system readiness...', duration: 1500 },
      { label: 'Analyzing data...', duration: 1000 },
      { label: 'Scan complete!', duration: 500 }
    ];

    let totalProgress = 0;
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setProgressLabel(step.label);
      
      await animateProgress(totalProgress, (i + 1) * 20, step.duration);
      totalProgress = (i + 1) * 20;
    }

    generateRandomFaultCodes();

    setTimeout(() => {
      setIsScanning(false);
      setProgressVisible(false);
      setProgressPercent(0);
    }, 1000);
  };

  const generateRandomFaultCodes = () => {
    const possibleCodes = [
      { code: 'P0001', desc: 'Fuel Volume Regulator Control Circuit', type: 'error' },
      { code: 'P0101', desc: 'Mass Air Flow Sensor Range/Performance', type: 'error' },
      { code: 'P0171', desc: 'System Too Lean (Bank 1)', type: 'warning' },
      { code: 'P0300', desc: 'Random/Multiple Cylinder Misfire', type: 'error' },
      { code: 'P0420', desc: 'Catalyst System Efficiency Below Threshold', type: 'warning' },
      { code: 'B0001', desc: 'Driver Airbag Squib Circuit Low', type: 'error' },
      { code: 'U0100', desc: 'Lost Communication With ECM/PCM', type: 'error' },
      { code: 'C0035', desc: 'Left Front Wheel Speed Sensor Circuit', type: 'warning' },
      { code: 'P1234', desc: 'Manufacturer Specific Code', type: 'info' },
      { code: 'P0505', desc: 'Idle Air Control System Malfunction', type: 'warning' }
    ];

    const newCodes = [];
    const numCodes = Math.floor(Math.random() * 4) + 1;
    
    for (let i = 0; i < numCodes; i++) {
      const randomCode = possibleCodes[Math.floor(Math.random() * possibleCodes.length)];
      if (!newCodes.find(code => code.code === randomCode.code)) {
        newCodes.push({
          ...randomCode,
          timestamp: new Date(),
          status: 'active'
        });
      }
    }
    setFaultCodes(newCodes);
  };

  const showFaultDetails = (code) => {
    const fault = faultCodes.find(f => f.code === code);
    if (!fault) return;

    setModalTitle(`Fault Code: ${code}`);
    setModalBody(`
      <div style="line-height: 1.6;">
        <p><strong>Description:</strong> ${fault.desc}</p>
        <p><strong>Type:</strong> ${fault.type.toUpperCase()}</p>
        <p><strong>Status:</strong> ${fault.status}</p>
        <p><strong>Detected:</strong> ${fault.timestamp.toLocaleString()}</p>
        <hr style="margin: 1rem 0; border: none; border-top: 1px solid var(--border);">
        <p><strong>Possible Causes:</strong></p>
        <ul style="margin-left: 1rem; margin-top: 0.5rem;">
          <li>Faulty sensor or wiring</li>
          <li>Mechanical component failure</li>
          <li>Software calibration issue</li>
        </ul>
        <p style="margin-top: 1rem;"><strong>Recommended Actions:</strong></p>
        <ul style="margin-left: 1rem; margin-top: 0.5rem;">
          <li>Inspect related components</li>
          <li>Check wiring and connections</li>
          <li>Perform component testing</li>
        </ul>
      </div>
    `);
    setShowModal(true);
  };

  const clearSingleCode = (code) => {
    setFaultCodes(prev => prev.filter(f => f.code !== code));
    showNotification(`Cleared fault code: ${code}`, 'success');
  };

  const clearCodes = () => {
    if (faultCodes.length === 0) {
      showNotification('No fault codes to clear', 'info');
      return;
    }

    const count = faultCodes.length;
    setFaultCodes([]);
    showNotification(`Cleared ${count} fault code(s)`, 'success');
  };

const toggleLiveData = () => {
    setLiveDataActive(!liveDataActive);

if (!liveDataActive) {
      showNotification('Live data streaming started', 'success');
    } else {
      showNotification('Live data streaming stopped', 'info');
    }
  };

  const exportReport = () => {
    setModalTitle('Export Diagnostic Report');
    setModalBody(`
      <div>
        <p style="margin-bottom: 1rem;">Generate comprehensive diagnostic report:</p>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <label style="display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" defaultChecked /> Include fault codes
          </label>
          <label style="display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" defaultChecked /> Include live data
          </label>
          <label style="display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" defaultChecked /> Include system status
          </label>
          <label style="display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" /> Include recommendations
          </label>
        </div>
        <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
          <button className="btn btn-primary" onClick={() => generatePDFReport()}>Generate PDF</button>
          <button className="btn btn-secondary" onClick={() => generateCSVReport()}>Export CSV</button>
        </div>
      </div>
    `);
    setShowModal(true);
  };

  const generatePDFReport = () => {
    showNotification('PDF report generated successfully', 'success');
    setShowModal(false);
  };

  const generateCSVReport = () => {
    showNotification('CSV report downloaded', 'success');
    setShowModal(false);
  };

  const emergencyStop = () => {
    setIsScanning(false);
    setLiveDataActive(false);
    setProgressVisible(false);
    showNotification('Emergency stop activated - all operations halted', 'error');
  };

  const showNotification = (message, type = 'info') => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const refreshFaultCodes = () => {
    generateRandomFaultCodes();
    showNotification('Fault codes refreshed', 'info');
  };

  const clearAllCodes = () => {
    clearCodes();
  };

  const refreshSystems = () => {
    showNotification('System status updated', 'info');
  };

  const toggleChart = () => {
    showNotification('Chart functionality coming soon', 'info');
  };

  const getLiveDataArray = () => {
    return [
      { name: 'Engine RPM', key: 'ENGINE_RPM' },
      { name: 'Vehicle Speed', key: 'VEHICLE_SPEED' },
      { name: 'Coolant Temp', key: 'COOLANT_TEMP' },
      { name: 'Throttle Position', key: 'THROTTLE_POS' }
    ];
  };

  const getStatus = (key, value) => {
    let status = 'OK';
    let statusClass = 'text-success';
    
    if (key === 'COOLANT_TEMP' && value > 100) {
      status = 'HIGH';
      statusClass = 'text-warning';
    } else if (key === 'ENGINE_RPM' && value > 5000) {
      status = 'HIGH';
      statusClass = 'text-warning';
    } else if (key === 'BATTERY_VOLT' && value < 12.0) {
      status = 'LOW';
      statusClass = 'text-warning';
    }

    return { status, statusClass };
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
    <div>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap');

        :root {
          --green: #00ff66; --blue: #0066ff; --red: #ff4444; --orange: #ffaa00;
          --bg: #0a0e13; --panel-bg: rgba(15, 20, 25, 0.9); --border: rgba(0, 255, 102, 0.3);
          --glow: 0 0 20px rgba(0, 255, 102, 0.3); --text-shadow: 0 0 10px rgba(0, 255, 102, 0.5);
          --header-height: 60px; --sidebar-width: 280px;
        }

        body {
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          background: var(--bg); color: var(--green); overflow-x: hidden;
          min-height: 100vh; position: relative;
        }

        .background-container {
          position: fixed; inset: 0; z-index: -10;
          background: radial-gradient(ellipse at center, #0f1419 0%, #0a0e13 70%, #000 100%);
        }

        .code-background {
          position: absolute; inset: 0; opacity: 0.15; font-size: 10px;
          line-height: 1.4; white-space: pre; overflow: hidden;
          animation: codeScroll 30s linear infinite; font-weight: 300;
        }
        @keyframes codeScroll { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }

.grid-overlay {
          position: absolute; inset: 0; opacity: 0.02;
          background-image: 
            linear-gradient(0deg, transparent 95%, var(--border) 96%, var(--border) 97%, transparent 98%),
            linear-gradient(90deg, transparent 95%, var(--border) 96%, var(--border) 97%, transparent 98%);
          background-size: 100px 100px; animation: gridDrift 20s linear infinite;
        }
        @keyframes gridDrift { 0% { transform: translate(0, 0); } 100% { transform: translate(100px, 100px); } }

        .car-silhouette {
          position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
          width: 600px; height: 200px; opacity: 0.04; z-index: -5;
          background: linear-gradient(135deg, transparent 0%, var(--green) 30%, var(--blue) 70%, transparent 100%);
          clip-path: polygon(10% 85%, 20% 75%, 30% 70%, 40% 65%, 50% 62%, 60% 65%, 70% 70%, 80% 75%, 90% 85%, 90% 95%, 10% 95%);
          animation: carGlow 8s ease-in-out infinite;
        }
        @keyframes carGlow { 0%, 100% { opacity: 0.03; } 50% { opacity: 0.06; } }

        .app-container {
          display: flex; min-height: 100vh; position: relative; z-index: 1;
        }

        .header {
          position: fixed; top: 0; left: 0; right: 0; height: var(--header-height);
          background: var(--panel-bg); border-bottom: 1px solid var(--border);
          backdrop-filter: blur(10px); z-index: 100; display: flex; align-items: center;
          padding: 0 1rem; justify-content: space-between;
        }

        .logo {
          font-size: 1.5rem; font-weight: 700; color: var(--green);
          text-shadow: var(--text-shadow);
        }

        .connection-status {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.9rem; color: var(--green);
        }

        .status-indicator {
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--green); box-shadow: var(--glow);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        .status-indicator.disconnected { background: var(--red); animation: none; }

        .sidebar {
          position: fixed; left: 0; top: var(--header-height);
          width: var(--sidebar-width); height: calc(100vh - var(--header-height));
          background: var(--panel-bg); backdrop-filter: blur(10px);
          border-right: 1px solid var(--border); z-index: 90;
          overflow-y: auto; padding: 1rem;
        }

        .nav-section {
          margin-bottom: 1.5rem;
        }

        .nav-title {
          font-size: 0.8rem; color: var(--blue); text-transform: uppercase;
          letter-spacing: 1px; margin-bottom: 0.5rem; font-weight: 500;
        }

        .nav-item {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem; border-radius: 6px; cursor: pointer;
          transition: all 0.3s ease; margin-bottom: 0.25rem;
          font-size: 0.9rem; color: rgba(255, 255, 255, 0.8);
        }

        .nav-item:hover, .nav-item.active {
          background: rgba(0, 255, 102, 0.1); color: var(--green);
          border-left: 3px solid var(--green);
        }

        .nav-icon {
          width: 16px; height: 16px; background: currentColor;
          mask-size: contain; mask-repeat: no-repeat; mask-position: center;
        }

 .main-content {
          margin-left: var(--sidebar-width); margin-top: var(--header-height);
          padding: 1.5rem; flex: 1; min-height: calc(100vh - var(--header-height));
        }

        .diagnostic-toolbar {
          display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;
        }

        .btn {
          padding: 0.75rem 1.5rem; border: none; border-radius: 8px;
          font-family: inherit; font-weight: 500; cursor: pointer;
          transition: all 0.3s ease; font-size: 0.9rem;
          text-transform: uppercase; letter-spacing: 0.5px;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--green), var(--blue));
          color: #000; box-shadow: var(--glow);
        }

        .btn-primary:hover {
          transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0, 255, 102, 0.4);
        }

        .btn-secondary {
          background: transparent; color: var(--green);
          border: 1px solid var(--border);
        }

        .btn-secondary:hover {
          background: rgba(0, 255, 102, 0.1);
        }

        .btn-danger {
          background: rgba(255, 68, 68, 0.2); color: var(--red);
          border: 1px solid rgba(255, 68, 68, 0.3);
        }

        .btn:disabled {
          opacity: 0.5; cursor: not-allowed;
        }

        .dashboard {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem; margin-bottom: 2rem;
        }

        .panel {
          background: var(--panel-bg); border: 1px solid var(--border);
          border-radius: 12px; padding: 1.5rem; backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .panel-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1rem; padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border);
        }

        .panel-title {
          font-size: 1.1rem; font-weight: 600; color: var(--green);
          text-shadow: var(--text-shadow);
        }

        .panel-actions {
          display: flex; gap: 0.5rem;
        }

        .panel-btn {
          background: none; border: none; color: var(--blue);
          cursor: pointer; padding: 0.25rem; border-radius: 4px;
          transition: all 0.3s ease; font-size: 0.8rem;
        }

        .panel-btn:hover {
          background: rgba(0, 102, 255, 0.2);
        }

        .data-table {
          width: 100%; border-collapse: collapse; font-size: 0.85rem;
        }

        .data-table th, .data-table td {
          padding: 0.75rem 1rem; text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .data-table th {
          background: rgba(0, 255, 102, 0.1); color: var(--green);
          font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;
        }

        .data-table td {
          color: rgba(255, 255, 255, 0.9);
        }

        .data-value {
          font-weight: 500; color: var(--green);
        }

        .data-unit {
          color: var(--blue); font-size: 0.8rem;
        }

        .fault-list {
          max-height: 300px; overflow-y: auto;
        }

        .fault-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.75rem; margin-bottom: 0.5rem; border-radius: 6px;
          background: rgba(255, 68, 68, 0.1); border-left: 3px solid var(--red);
        }

        .fault-item.warning {
          background: rgba(255, 170, 0, 0.1); border-left-color: var(--orange);
        }

        .fault-item.info {
          background: rgba(0, 153, 255, 0.1); border-left-color: var(--blue);
        }

        .fault-code {
          font-weight: 600; font-size: 0.9rem;
        }

        .fault-desc {
          font-size: 0.8rem; opacity: 0.8; margin-top: 0.25rem;
        }

        .fault-actions {
          display: flex; gap: 0.5rem;
        }

        .chart-container {
          height: 200px; position: relative;
          background: rgba(0, 0, 0, 0.2); border-radius: 8px;
          padding: 1rem; margin-top: 1rem;
        }

        .chart-canvas {
          width: 100%; height: 100%;
        }

        .progress-container {
          margin: 1rem 0;
        }

        .progress-label {
          display: flex; justify-content: space-between; margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .progress-bar {
          width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1);
          border-radius: 3px; overflow: hidden;
        }

        .progress-fill {
          height: 100%; background: linear-gradient(90deg, var(--green), var(--blue));
          border-radius: 3px; transition: width 0.3s ease;
          animation: progressPulse 2s ease-in-out infinite;
        }

        @keyframes progressPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .system-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }

        .system-item {
          text-align: center; padding: 1rem; border-radius: 8px;
          background: rgba(0, 0, 0, 0.2); border: 1px solid var(--border);
          transition: all 0.3s ease;
        }

        .system-item:hover {
          background: rgba(0, 255, 102, 0.05); transform: translateY(-2px);
        }

        .system-icon {
          width: 32px; height: 32px; margin: 0 auto 0.5rem;
          background: var(--green); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: bold; font-size: 0.8rem;
        }

        .system-name {
          font-size: 0.8rem; margin-bottom: 0.25rem;
        }

        .system-status {
          font-size: 0.7rem; color: var(--green);
        }

        .system-status.warning { color: var(--orange); }
        .system-status.error { color: var(--red); }

        .floating-elements {
          position: fixed; inset: 0; pointer-events: none; z-index: -1;
        }

        .floating-fault {
          position: absolute; font-size: 11px; opacity: 0.3;
          animation: floatUp 12s linear infinite;
        }

        @keyframes floatUp {
          0% { transform: translateY(100vh); opacity: 0; }
          10%, 90% { opacity: 0.3; }
          100% { transform: translateY(-10vh); opacity: 0; }
        }

        .modal {
          position: fixed; inset: 0; background: rgba(0, 0, 0, 0.8);
          display: none; align-items: center; justify-content: center; z-index: 1000;
          backdrop-filter: blur(5px);
        }

        .modal.show { display: flex; }

        .modal-content {
          background: var(--panel-bg); border: 1px solid var(--border);
          border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%;
          backdrop-filter: blur(10px);
        }

        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);
        }

        .modal-title {
          font-size: 1.2rem; font-weight: 600; color: var(--green);
        }

        .close-btn {
          background: none; border: none; color: var(--red);
          font-size: 1.5rem; cursor: pointer; padding: 0;
        }

        /* 3D Vehicle Specific Styles */
        .vehicle-3d-container {
          display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; height: calc(100vh - 140px);
        }

        .vehicle-3d-viewer {
          background: var(--panel-bg); border: 1px solid var(--border);
          border-radius: 12px; overflow: hidden; position: relative;
        }

        .vehicle-3d-viewer canvas {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
        }

        .vehicle-info-panel {
          display: flex; flex-direction: column; gap: 1rem;
        }

        .selected-component {
          background: var(--panel-bg); border: 1px solid var(--border);
          border-radius: 12px; padding: 1rem;
        }

        .component-title {
          font-size: 1rem; font-weight: 600; color: var(--blue);
          margin-bottom: 0.75rem; text-transform: capitalize;
        }

        .related-faults {
          margin-top: 1rem;
        }

        .related-fault-item {
          padding: 0.5rem; margin-bottom: 0.5rem; border-radius: 4px;
          border: 1px solid;
          font-size: 0.8rem;
        }

        .live-data-mini {
          background: var(--panel-bg); border: 1px solid var(--border);
          border-radius: 12px; padding: 1rem;
        }

        .live-param {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .live-param:last-child {
          border-bottom: none;
        }

        .param-name {
          font-size: 0.8rem; color: rgba(255, 255, 255, 0.7);
        }

        .param-value {
          font-size: 0.9rem; font-weight: 600; color: var(--green);
        }

        .quick-actions {
          background: var(--panel-bg); border: 1px solid var(--border);
          border-radius: 12px; padding: 1rem;
        }

        .action-btn {
          width: 100%; padding: 0.75rem; margin-bottom: 0.5rem;
          border: none; border-radius: 6px; cursor: pointer;
          font-family: inherit; font-size: 0.8rem; font-weight: 500;
          transition: all 0.3s ease;
        }

        .action-btn.green {
          background: rgba(0, 255, 102, 0.2); color: var(--green);
          border: 1px solid rgba(0, 255, 102, 0.3);
        }

        .action-btn.yellow {
          background: rgba(255, 170, 0, 0.2); color: var(--orange);
          border: 1px solid rgba(255, 170, 0, 0.3);
        }

        .action-btn.blue {
          background: rgba(0, 102, 255, 0.2); color: var(--blue);
          border: 1px solid rgba(0, 102, 255, 0.3);
        }

        .action-btn.red {
          background: rgba(255, 68, 68, 0.2); color: var(--red);
          border: 1px solid rgba(255, 68, 68, 0.3);
        }

        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%); transition: transform 0.3s ease;
          }
          .sidebar.show { transform: translateX(0); }
          .main-content { margin-left: 0; }
          .dashboard { grid-template-columns: 1fr; }
          .vehicle-3d-container { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .header { padding: 0 0.5rem; }
          .logo { font-size: 1.2rem; }
          .diagnostic-toolbar { flex-direction: column; }
          .main-content { padding: 1rem; }
          .panel { padding: 1rem; }
        }

        .hidden { display: none !important; }
        .loading { opacity: 0.5; pointer-events: none; }
        .text-center { text-align: center; }
        .text-success { color: var(--green); }
        .text-warning { color: var(--orange); }
        .text-error { color: var(--red); }
        .text-info { color: var(--blue); }
      `}</style>

      {/* Background */}
      <div className="background-container">
        <div className="grid-overlay"></div>
        <div className="code-background" ref={codeBackgroundRef}></div>
        <div className="car-silhouette"></div>
      </div>

      {/* Floating Elements */}
      <div className="floating-elements" ref={floatingElementsRef}></div>

      {/* Header */}
      <header className="header">
        <div className="logo">SnapFaultCore Pro</div>
        <div className="connection-status">
          <div className={`status-indicator ${!isConnected ? 'disconnected' : ''}`}></div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </header>

      {/* Sidebar */}
      <nav className="sidebar">
        <div className="nav-section">
          <div className="nav-title">Diagnostics</div>
          <div 
            className={`nav-item ${currentSection === 'dashboard' ? 'active' : ''}`} 
            onClick={() => switchSection('dashboard')}
          >
            <div className="nav-icon"></div>
            Dashboard
          </div>
          <div 
            className={`nav-item ${currentSection === 'live-data' ? 'active' : ''}`} 
            onClick={() => switchSection('live-data')}
          >
            <div className="nav-icon"></div>
            Live Data
          </div>
          <div 
            className={`nav-item ${currentSection === 'fault-codes' ? 'active' : ''}`} 
            onClick={() => switchSection('fault-codes')}
          >
            <div className="nav-icon"></div>
            Fault Codes
          </div>
          <div 
            className={`nav-item ${currentSection === '3d-vehicle' ? 'active' : ''}`} 
            onClick={() => switchSection('3d-vehicle')}
          >
            <div className="nav-icon"></div>
            3D Vehicle
          </div>
          <div 
            className={`nav-item ${currentSection === 'systems' ? 'active' : ''}`} 
            onClick={() => switchSection('systems')}
          >
            <div className="nav-icon"></div>
            Systems
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-title">Tools</div>
          <div 
            className={`nav-item ${currentSection === 'scanner' ? 'active' : ''}`} 
            onClick={() => switchSection('scanner')}
          >
            <div className="nav-icon"></div>
            Scanner
          </div>
          <div 
            className={`nav-item ${currentSection === 'reports' ? 'active' : ''}`} 
            onClick={() => switchSection('reports')}
          >
            <div className="nav-icon"></div>
            Reports
          </div>
          <div 
            className={`nav-item ${currentSection === 'settings' ? 'active' : ''}`} 
            onClick={() => switchSection('settings')}
          >
            <div className="nav-icon"></div>
            Settings
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Diagnostic Toolbar */}
        <div className="diagnostic-toolbar">
          <button
            className="btn btn-primary"
            onClick={startScan}
            disabled={isScanning}
          >
            <span>{isScanning ? 'Scanning...' : 'Scan Vehicle'}</span>
          </button>
          <button className="btn btn-secondary" onClick={clearCodes}>Clear DTCs</button>
          <button className="btn btn-secondary" onClick={toggleLiveData}>
            {liveDataActive ? 'Stop Live Data' : 'Start Live Data'}
          </button>
          <button className="btn btn-secondary" onClick={exportReport}>Export Report</button>
          <button className="btn btn-danger" onClick={emergencyStop}>Emergency Stop</button>
        </div>

        {/* Progress Indicator */}
        {progressVisible && (
          <div className="progress-container">
            <div className="progress-label">
              <span>{progressLabel}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Dashboard Section */}
        {currentSection === 'dashboard' && (
          <div className="dashboard">
            {/* Live Data Stream Panel */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Live Data Stream</div>
                <div className="panel-actions">
                  <button className="panel-btn" onClick={toggleChart}>📊</button>
                  <button className="panel-btn" onClick={toggleLiveData}>⏸️</button>
                </div>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getLiveDataArray().map(item => {
                    const param = liveDataParams[item.key];
           const { status, statusClass } = getStatus(item.key, param.value);
                    return (
                      <tr key={item.key}>
                        <td>{item.name}</td>
                        <td>
                          <span className="data-value">
                            {typeof param.value === 'number' ? param.value.toFixed(1) : param.value}
                          </span>
                          <span className="data-unit"> {param.unit}</span>
                        </td>
                        <td className={statusClass}>{status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Active Fault Codes Panel */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Active Fault Codes</div>
                <div className="panel-actions">
                  <button className="panel-btn" onClick={refreshFaultCodes}>🔄</button>
                  <button className="panel-btn" onClick={clearAllCodes}>🗑️</button>
                </div>
              </div>
              <div className="fault-list">
                {faultCodes.length === 0 ? (
                  <div className="text-center" style={{ padding: '2rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                    No active fault codes detected
                  </div>
                ) : (
                  faultCodes.map(fault => (
                    <div key={fault.code} className={`fault-item ${fault.type}`}>
                      <div>
                        <div className="fault-code">{fault.code}</div>
                        <div className="fault-desc">{fault.desc}</div>
                      </div>
                      <div className="fault-actions">
                        <button 
                          className="panel-btn" 
                          onClick={() => showFaultDetails(fault.code)}
                          title="View Details"
                        >
                          ℹ️
                        </button>
                        <button 
                          className="panel-btn" 
                          onClick={() => clearSingleCode(fault.code)}
                          title="Clear Code"
                        >
                          ✖️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* System Status Panel */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">System Status</div>
                <div className="panel-actions">
                  <button className="panel-btn" onClick={refreshSystems}>🔄</button>
                </div>
              </div>
              <div className="system-grid">
                {[
                  { name: 'Engine', status: 'OK', icon: 'E' },
                  { name: 'Transmission', status: 'OK', icon: 'T' },
                  { name: 'ABS', status: 'Warning', icon: 'A' },
                  { name: 'Airbags', status: 'OK', icon: 'B' },
                  { name: 'Climate', status: 'OK', icon: 'C' },
                  { name: 'Lighting', status: 'OK', icon: 'L' }
                ].map(system => (
                  <div key={system.name} className="system-item">
                    <div className="system-icon">{system.icon}</div>
                    <div className="system-name">{system.name}</div>
                    <div className={`system-status ${system.status.toLowerCase()}`}>
                      {system.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Monitor Panel */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Performance Monitor</div>
                <div className="panel-actions">
                  <button className="panel-btn">📈</button>
                </div>
              </div>
              <div className="chart-container">
                <canvas className="chart-canvas"></canvas>
                <div style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.9rem'
                }}>
                  Performance charts will be displayed here
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3D Vehicle Section */}
        {currentSection === '3d-vehicle' && (
          <div className="vehicle-3d-container">
            <div className="vehicle-3d-viewer">
              <div className="panel-header">
                <div className="panel-title">Vehicle Model - Audi RS Q3</div>
                <div className="panel-actions">
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    Click on highlighted areas to inspect components
                  </span>
                </div>
              </div>
              <Suspense fallback={
                <div style={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  color: 'var(--green)'
                }}>
                  Loading 3D Model...
                </div>
              }>
                <Canvas
                  camera={{ position: [5, 2, 5], fov: 50 }}
                  style={{ height: 'calc(100% - 60px)' }}
                >
                  <ambientLight intensity={0.3} />
                  <directionalLight position={[10, 10, 5]} intensity={1} />
                  <pointLight position={[-10, -10, -5]} intensity={0.5} />
                  
                  <AudiRSQ3Model
                    faultCodes={faultCodes}
                    liveData={liveDataParams}
                    onPartClick={handlePartClick}
                  />
                </Canvas>
              </Suspense>
            </div>

            <div className="vehicle-info-panel">
              {/* Selected Component Info */}
              {selectedPart && (
                <div className="selected-component">
                  <div className="component-title">
                    Selected: {selectedPart.key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div className="related-faults">
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
                      Related Fault Codes:
                    </div>
                    {getRelatedFaultCodes().map(fault => (
                      <div key={fault.code} className={`related-fault-item ${getSeverityColor(fault.type)}`}>
                        <div style={{ fontWeight: '600', fontSize: '0.8rem' }}>{fault.code}</div>
                        <div style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>{fault.desc}</div>
                      </div>
                    ))}
                    {getRelatedFaultCodes().length === 0 && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--green)' }}>
                        No active fault codes for this component
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Live Data Mini */}
              <div className="live-data-mini">
                <div className="component-title">Live Data Stream</div>
                {Object.entries(liveDataParams).slice(0, 4).map(([key, param]) => (
                  <div key={key} className="live-param">
                    <span className="param-name">{key.replace(/_/g, ' ')}</span>
                    <span className="param-value">
                      {typeof param.value === 'number' ? param.value.toFixed(1) : param.value} {param.unit}
                    </span>
                  </div>
                ))}
              </div>

              {/* Active Fault Codes Mini */}
              <div className="live-data-mini">
                <div className="component-title">Active Fault Codes</div>
                {faultCodes.slice(0, 3).map(fault => (
                  <div key={fault.code} className="live-param">
                    <span className="param-name">{fault.code}</span>
                    <span style={{ fontSize: '0.8rem', color: fault.type === 'error' ? 'var(--red)' : 'var(--orange)' }}>
                      {fault.type.toUpperCase()}
                    </span>
                  </div>
                ))}
                {faultCodes.length === 0 && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--green)', textAlign: 'center', padding: '1rem' }}>
                    No active fault codes
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <div className="component-title">Quick Actions</div>
                <button className="action-btn green" onClick={toggleLiveData}>
                  {liveDataActive ? 'Stop Live Data' : 'Start Live Diagnostics'}
                </button>
                <button className="action-btn yellow" onClick={clearCodes}>
                  Clear Fault Codes
                </button>
                <button className="action-btn blue" onClick={exportReport}>
                  Generate Report
                </button>
                <button className="action-btn red" onClick={emergencyStop}>
                  Emergency Stop
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Other sections remain the same but I'll add placeholders for live-data, fault-codes, systems, etc. */}
        {currentSection === 'live-data' && (
          <div className="dashboard">
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Live Data Stream</div>
              </div>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                Live data section - your existing content goes here
              </div>
            </div>
          </div>
        )}

        {currentSection === 'fault-codes' && (
          <div className="dashboard">
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Fault Codes</div>
              </div>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                Fault codes section - your existing content goes here
              </div>
            </div>
          </div>
        )}

        {currentSection === 'systems' && (
          <div className="dashboard">
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Systems</div>
              </div>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                Systems section - your existing content goes here
              </div>
            </div>
          </div>
        )}

        {currentSection === 'scanner' && (
          <div className="dashboard">
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Scanner</div>
              </div>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                Scanner section - your existing content goes here
              </div>
            </div>
          </div>
        )}

        {currentSection === 'reports' && (
          <div className="dashboard">
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Reports</div>
              </div>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                Reports section - your existing content goes here
              </div>
            </div>
          </div>
        )}

        {currentSection === 'settings' && (
          <div className="dashboard">
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Settings</div>
              </div>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                Settings section - your existing content goes here
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      <div className={`modal ${showModal ? 'show' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-title">{modalTitle}</div>
            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
          </div>
          <div dangerouslySetInnerHTML={{ __html: modalBody }}></div>
        </div>
      </div>
    </div>
  );
};

// Preload the 3D model (you'll need to add your actual model file)
// useGLTF.preload('/models/audi-rsq3.glb');

export default SnapFaultCore;
