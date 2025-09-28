// 📂 FILE: src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import {
  useEffect,
  useState,
  createContext,
  useContext,
  useLayoutEffect,
  Suspense,
  useMemo,
  lazy,
  useCallback,
} from "react";
import { supabase } from "./lib/supabaseClient";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// Core Context and Provider
import { VehicleProvider } from "./context/VehicleContext";

// SnapCore WebSocket Bridge
import { getSnapCoreBridge } from "./services/SnapCoreWebSocketBridge";

// Layout Components (eagerly loaded for LCP)
import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingHeader from "./components/FloatingHeader";
import SnapTechChatWidget from "./components/SnapTechChatWidget";
import FuturisticNavigation from "./components/FuturisticNavigation";
import SnapFaultCorePro from "./components/SnapFaultCorePro.jsx";

// Critical pages (preloaded for immediate availability)
import SnapTech from "./pages/SnapTech";
import SnapPro from "./pages/SnapPro";
import SnapScan from "./pages/SnapScan";

// Public pages (lazy loaded)
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Features = lazy(() => import("./pages/Features"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Support = lazy(() => import("./pages/Support"));
const Faq = lazy(() => import("./pages/Faq"));
const Terms = lazy(() => import("./pages/Terms"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Auth pages (lazy loaded)
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ResendVerification = lazy(() => import("./pages/ResendVerification"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const TwoFactorSetup = lazy(() => import("./pages/TwoFactorSetup"));

// Core diagnostic modules (lazy loaded for better performance)
const SnapHistory = lazy(() => import("./pages/SnapHistory"));
const SnapDNA = lazy(() => import("./pages/SnapDNA"));
const SnapJob = lazy(() => import("./pages/SnapJob"));
const SnapGlobalTranslate = lazy(() => import("./pages/SnapGlobalTranslate"));
const SnapUpdateEngine = lazy(() => import("./pages/SnapUpdateEngine"));
const SnapAnalyticsDashboard = lazy(() => import("./pages/SnapAnalyticsDashboard"));
const SnapRelayDebugHub = lazy(() => import("./pages/SnapRelayDebugHub"));
const SnapBriefs = lazy(() => import("./pages/SnapBriefs"));
const SnapLabToolkit = lazy(() => import("./pages/SnapLabToolkit"));
const SnapLicenseManager = lazy(() => import("./pages/SnapCoreLicenseManager"));
const MOTReminderScheduler = lazy(() => import("./pages/MOTReminderScheduler"));
const GarageAdminDashboard = lazy(() => import("./pages/GarageAdminDashboard"));
const OfflineModeManager = lazy(() => import("./pages/OfflineModeManager"));
const GarageDashboard = lazy(() => import("./pages/GarageDashboard"));

// Components
const AccessRestrictionHandler = lazy(() => import("./components/AccessRestrictionHandler"));
const VehicleSwitcher = lazy(() => import("./components/VehicleSwitcher"));

// Diagnostic tools
const VinDecoder = lazy(() => import("./pages/VinDecoder"));
const PlateScanner = lazy(() => import("./pages/PlateScanner"));
const RepairGPTMode = lazy(() => import("./pages/RepairGPTMode"));

// AI and monitoring modules
const SnapSentience = lazy(() => import("./pages/SnapSentience"));
const SnapPredict = lazy(() => import("./pages/SnapPredict"));
const SnapRecall = lazy(() => import("./pages/SnapRecall"));
const SnapLive = lazy(() => import("./pages/SnapLive"));
const SnapReset = lazy(() => import("./pages/SnapReset"));
const SnapBulletin = lazy(() => import("./pages/SnapBulletin"));
const SnapNotes = lazy(() => import("./pages/SnapNotes"));
const SnapMetric = lazy(() => import("./pages/SnapMetric"));
const SnapSecure = lazy(() => import("./pages/SnapSecure"));
const SnapChatGPTUI = lazy(() => import("./pages/SnapChatGPTUI"));
const SnapTerminal = lazy(() => import("./pages/SnapTerminal"));
const SnapTrack = lazy(() => import("./pages/SnapTrack"));
const SnapReplay = lazy(() => import("./pages/SnapReplay"));
const SnapSign = lazy(() => import("./pages/SnapSign"));
const SnapLab = lazy(() => import("./pages/SnapLab"));

// Vehicle and chat modules
const VehicleLookup = lazy(() => import("./pages/VehicleLookup"));
const SnapTechChat = lazy(() => import("./pages/SnapTechChat"));
const SnapLiveHub = lazy(() => import("./pages/SnapLiveHub"));
const SnapCoreConnect = lazy(() => import("./components/SnapCoreConnect"));
const PythonDiagnostic = lazy(() => import("./pages/PythonDiagnostic"));

// ========================================
// NEW: Python Core Modules & Tools
// ========================================
const ExpectedFiles = lazy(() => import("./pages/Core/ExpectedFiles"));
const JsonToCsvConverter = lazy(() => import("./pages/Tools/JsonToCsvConverter"));
const MainCore = lazy(() => import("./pages/Core/MainCore"));
const Mic3x2xObdDataset = lazy(() => import("./pages/Datasets/Mic3x2xObdDataset"));
const MissingFilesLog = lazy(() => import("./pages/Logs/MissingFilesLog"));

// Core System Parts (part1-part9)
const Part1Core = lazy(() => import("./pages/Core/Part1Core"));
const Part2Pids = lazy(() => import("./pages/Core/Part2Pids"));
const Part3Databases = lazy(() => import("./pages/Core/Part3Databases"));
const Part4Com = lazy(() => import("./pages/Core/Part4Com"));
const Part5Database = lazy(() => import("./pages/Core/Part5Database"));
const Part6Operations = lazy(() => import("./pages/Core/Part6Operations"));
const Part7Decoders = lazy(() => import("./pages/Core/Part7Decoders"));
const Part8Persistence = lazy(() => import("./pages/Core/Part8Persistence"));
const Part9Controller = lazy(() => import("./pages/Core/Part9Controller"));

// PID and Communication
const PidMap = lazy(() => import("./pages/Core/PidMap"));
const VlinkTesla = lazy(() => import("./pages/Vehicles/VlinkTesla"));
const VlinkerInterface = lazy(() => import("./pages/Core/VlinkerInterface"));
const VlinkerMacrosPro = lazy(() => import("./pages/Core/VlinkerMacrosPro"));
const VlinkerMaster = lazy(() => import("./pages/Core/VlinkerMaster"));
const VlinkerTestScript = lazy(() => import("./pages/Core/VlinkerTestScript"));
const WebSocketServer = lazy(() => import("./pages/Core/WebSocketServer"));

// ========================================
// NEW: Vehicle-Specific EV/PHEV Policies
// ========================================
const FordEvPhevPolicy = lazy(() => import("./pages/Policies/FordEvPhevPolicy"));
const GmUltiumLegacyPolicy = lazy(() => import("./pages/Policies/GmUltiumLegacyPolicy"));
const HyundaiKiaPrecfdPolicy = lazy(() => import("./pages/Policies/HyundaiKiaPrecfdPolicy"));
const MitsubishiPhevEvPolicy = lazy(() => import("./pages/Policies/MitsubishiPhevEvPolicy"));
const NissanLeafPolicy = lazy(() => import("./pages/Policies/NissanLeafPolicy"));
const PsaStellantisPrecfdPolicy = lazy(() => import("./pages/Policies/PsaStellantisPrecfdPolicy"));
const RenaultZoePolicy = lazy(() => import("./pages/Policies/RenaultZoePolicy"));
const TeslaCybertruckRoadsterPolicy = lazy(() => import("./pages/Policies/TeslaCybertruckRoadsterPolicy"));
const TeslaModelSXYPolicy = lazy(() => import("./pages/Policies/TeslaModelSXYPolicy"));
const ToyotaLexusCompletePolicy = lazy(() => import("./pages/Policies/ToyotaLexusCompletePolicy"));
const VagUnifiedEvPhevPolicy = lazy(() => import("./pages/Policies/VagUnifiedEvPhevPolicy"));
const VlinkEvTemplatePolicy = lazy(() => import("./pages/Policies/VlinkEvTemplatePolicy"));

// ========================================
// NEW: Advanced Tools & Utilities
// ========================================
const MsStream = lazy(() => import("./pages/Tools/MsStream"));
const GitIgnore = lazy(() => import("./pages/Tools/GitIgnore"));
const CheckFiles = lazy(() => import("./pages/Tools/CheckFiles"));
const CommandReferenceMap = lazy(() => import("./pages/Tools/CommandReferenceMap"));

// ========================================
// NEW: Advanced AI Modules
// ========================================
const SnapAITrainer = lazy(() => import("./pages/AI/SnapAITrainer"));
const SnapAlertSystem = lazy(() => import("./pages/AI/SnapAlertSystem"));
const SnapJobAI = lazy(() => import("./pages/AI/SnapJobAI"));
const SnapGlobalAI = lazy(() => import("./pages/AI/SnapGlobalAI"));
const SnapUpdateAI = lazy(() => import("./pages/AI/SnapUpdateAI"));
const SnapRelayAI = lazy(() => import("./pages/AI/SnapRelayAI"));
const SnapBriefsAI = lazy(() => import("./pages/AI/SnapBriefsAI"));
const SnapLabAI = lazy(() => import("./pages/AI/SnapLabAI"));
const SnapLicenseAI = lazy(() => import("./pages/AI/SnapLicenseAI"));
const SnapMOTAI = lazy(() => import("./pages/AI/SnapMOTAI"));
const SnapGarageAI = lazy(() => import("./pages/AI/SnapGarageAI"));
const SnapOfflineAI = lazy(() => import("./pages/AI/SnapOfflineAI"));

// ========================================
// NEW: Charging & Energy Analytics
// ========================================
const ChargingAnalytics = lazy(() => import("./pages/Energy/ChargingAnalytics"));
const EnergyManagement = lazy(() => import("./pages/Energy/EnergyManagement"));
const BatteryDiagnostics = lazy(() => import("./pages/Energy/BatteryDiagnostics"));
const ChargingStationLocator = lazy(() => import("./pages/Energy/ChargingStationLocator"));
const EnergyEfficiencyReports = lazy(() => import("./pages/Energy/EnergyEfficiencyReports"));

// Reports system
const ReportsList = lazy(() => import("./pages/Reports/ReportList"));
const ReportDetails = lazy(() => import("./pages/Reports/ReportDetails"));
const LastReport = lazy(() => import("./pages/Reports/LastReport"));
const ReportGenerator = lazy(() => import("./pages/Reports/ReportGenerator"));
const ReportTemplates = lazy(() => import("./pages/Reports/ReportTemplates"));
const ReportScheduler = lazy(() => import("./pages/Reports/ReportScheduler"));
const ReportArchive = lazy(() => import("./pages/Reports/ReportArchive"));

// Development tools (conditionally loaded)
const DevInventory = lazy(() => import("./pages/DevInventory"));
const DevLogin = lazy(() => import("./pages/DevLogin"));

// Constants and Configuration
const DEV_MODE = import.meta.env.MODE === "development";
const ALLOW_DEV_IN_PROD = import.meta.env.VITE_DEV_DASH_ENABLED === "true";
const DEFAULT_TIER = "lite";

// Enhanced route configuration with all new modules
const FUTURISTIC_ROUTES = new Set([
  "/", "/scan", "/live", "/analytics", "/terminal", "/lab", "/pro", "/snaptech",
  "/snaplive-hub", "/connect", "/diagnostics", "/python-diagnostic", "/history",
  "/vin", "/plate", "/snapdna", "/repairgpt", "/snapjob", "/snaptranslate",
  "/snapupdate", "/relaydebug", "/briefs", "/labtoolkit", "/license-manager",
  "/mot-reminders", "/garage-dashboard", "/garage", "/offline", "/sentience",
  "/predict", "/recall", "/reset", "/bulletin", "/notes", "/metrics", "/secure",
  "/gptui", "/track", "/replay", "/sign", "/vehicle-lookup", "/snaptech-chat",
  "/reports",
  
  // Core System Routes
  "/core/expected-files", "/core/main", "/core/mic3x2x-dataset", "/core/missing-log",
  "/core/part1", "/core/part2", "/core/part3", "/core/part4", "/core/part5",
  "/core/part6", "/core/part7", "/core/part8", "/core/part9", "/core/pid-map",
  "/core/vlinker-interface", "/core/vlinker-macros", "/core/vlinker-master",
  "/core/vlinker-test", "/core/websocket-server",
  
  // Vehicle Policies
  "/policies/ford-ev", "/policies/gm-ultium", "/policies/hyundai-kia",
  "/policies/mitsubishi-phev", "/policies/nissan-leaf", "/policies/psa-stellantis",
  "/policies/renault-zoe", "/policies/tesla-cybertruck", "/policies/tesla-model-sxy",
  "/policies/toyota-lexus", "/policies/vag-unified", "/policies/vlink-ev-template",
  
  // Vehicle Specific
  "/vehicles/tesla", "/vehicles/ford", "/vehicles/gm", "/vehicles/hyundai",
  "/vehicles/kia", "/vehicles/mitsubishi", "/vehicles/nissan", "/vehicles/psa",
  "/vehicles/stellantis", "/vehicles/renault", "/vehicles/toyota", "/vehicles/lexus",
  "/vehicles/volkswagen", "/vehicles/audi", "/vehicles/porsche",
  
  // Tools & Utilities
  "/tools/json-converter", "/tools/ms-stream", "/tools/git-ignore", "/tools/check-files",
  "/tools/command-reference",
  
  // AI Modules
  "/ai/trainer", "/ai/alerts", "/ai/job", "/ai/global", "/ai/update", "/ai/relay",
  "/ai/briefs", "/ai/lab", "/ai/license", "/ai/mot", "/ai/garage", "/ai/offline",
  
  // Energy & Charging
  "/energy/charging-analytics", "/energy/management", "/energy/battery",
  "/energy/charging-stations", "/energy/efficiency"
]);

// Theme configuration
const THEME_CONFIG = {
  variables: {
    "--bg": "#06080f",
    "--neon": "#e5f4ff",
    "--primary-glow": "#00d4ff",
    "--secondary-glow": "#7c3aed",
    "--accent-glow": "#06ffa5",
    "--danger-glow": "#ff0844",
    "--warning-glow": "#ffb800",
    "--particle-primary": "#00d4ff33",
    "--particle-secondary": "#7c3aed33",
    "--glass-bg": "rgba(255,255,255,0.02)",
    "--glass-border": "rgba(255,255,255,0.1)",
  },
  background: "#06080f",
  textColor: "#e5f4ff"
};

// Enhanced localStorage utility with error handling
const safeStorage = {
  get: (key, fallback = null) => {
    if (typeof window === "undefined") return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      console.warn(`Failed to read ${key} from localStorage:`, error);
      return fallback;
    }
  },
  
  set: (key, value) => {
    if (typeof window === "undefined") return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Failed to save ${key} to localStorage:`, error);
      return false;
    }
  },
  
  remove: (key) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error);
    }
  }
};

// Auth Context with enhanced error handling
export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Enhanced loading components
const LoadingFallback = ({ label = "Loading...", size = "default" }) => {
  const sizeClasses = {
    small: "text-xs p-2",
    default: "text-sm p-4",
    large: "text-lg p-6"
  };
  
  return (
    <div className="flex items-center justify-center">
      <div className={`text-gray-400 bg-black/30 border border-white/10 rounded ${sizeClasses[size]}`}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin" />
          {label}
        </div>
      </div>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#06080f] text-[#e5f4ff] flex items-center justify-center relative overflow-hidden">
    <div className="relative z-10 text-center">
      <div className="w-24 h-24 mx-auto mb-8 relative">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" />
        <div className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-purple-500 border-r-transparent animate-spin-reverse" />
        <div className="absolute inset-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-black font-bold text-lg">SC</span>
        </div>
      </div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
        SnapCore
      </h1>
      <p className="text-gray-400 animate-pulse">Initializing diagnostic systems...</p>
    </div>
  </div>
);

// Enhanced chat FAB with state management
const ChatFAB = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button 
        className="relative w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 p-0.5 hover:from-purple-500 hover:to-cyan-400 transition-all duration-300 group shadow-lg hover:shadow-cyan-400/25"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Open SnapTech Chat"
      >
        <div className="w-full h-full rounded-full bg-black flex items-center justify-center relative overflow-hidden">
          <svg
            className={`w-7 h-7 text-white transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-full" />
          )}
        </div>
      </button>
    </div>
  );
};

// Enhanced debug shell
const DebugShell = ({ location, user, tier }) => {
  const envInfo = {
    mode: import.meta.env.MODE,
    nodeEnv: import.meta.env.NODE_ENV,
    devMode: DEV_MODE,
    allowDevInProd: ALLOW_DEV_IN_PROD,
    viteEnvKeys: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-mono">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-cyan-400">SnapCore Debug Shell</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Route Information</h2>
            <div className="space-y-2">
              <p><span className="text-cyan-400">Path:</span> {location.pathname}</p>
              <p><span className="text-cyan-400">Search:</span> {location.search || "None"}</p>
              <p><span className="text-cyan-400">Hash:</span> {location.hash || "None"}</p>
              <p><span className="text-cyan-400">State:</span> {location.state ? JSON.stringify(location.state) : "None"}</p>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Authentication</h2>
            <div className="space-y-2">
              <p><span className="text-cyan-400">User ID:</span> {user?.id || "Not authenticated"}</p>
              <p><span className="text-cyan-400">Email:</span> {user?.email || "N/A"}</p>
              <p><span className="text-cyan-400">Tier:</span> {tier}</p>
              <p><span className="text-cyan-400">Last Sign In:</span> {user?.last_sign_in_at || "N/A"}</p>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Environment</h2>
            <div className="space-y-2">
              <p><span className="text-cyan-400">Mode:</span> {envInfo.mode}</p>
              <p><span className="text-cyan-400">Node Env:</span> {envInfo.nodeEnv}</p>
              <p><span className="text-cyan-400">Dev Mode:</span> {envInfo.devMode ? "Enabled" : "Disabled"}</p>
              <p><span className="text-cyan-400">Dev in Prod:</span> {envInfo.allowDevInProd ? "Allowed" : "Disabled"}</p>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Performance</h2>
            <div className="space-y-2">
              <p><span className="text-cyan-400">User Agent:</span> {navigator.userAgent.slice(0, 50)}...</p>
              <p><span className="text-cyan-400">Screen:</span> {screen.width}x{screen.height}</p>
              <p><span className="text-cyan-400">Viewport:</span> {window.innerWidth}x{window.innerHeight}</p>
              <p><span className="text-cyan-400">Local Storage:</span> {typeof Storage !== "undefined" ? "Available" : "Not Available"}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">Actions</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.search = ""}
              className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded transition-colors"
            >
              Exit Debug Mode
            </button>
            <button 
              onClick={() => safeStorage.remove("user-tier")}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
            >
              Reset Tier
            </button>
            <button 
              onClick={() => console.clear()}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors"
            >
              Clear Console
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Theme setup component
const GlobalThemeSetup = () => {
  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    
    // Apply base classes
    html.classList.add("dark");
    body.style.backgroundColor = THEME_CONFIG.background;
    body.classList.add("bg-texture", "noise-blue-red");
    
    // Apply CSS variables
    Object.entries(THEME_CONFIG.variables).forEach(([key, value]) => {
      html.style.setProperty(key, value);
    });
    
    // Cleanup function
    return () => {
      body.classList.remove("bg-texture", "noise-blue-red");
    };
  }, []);
  
  return null;
};

// Noise pattern switcher
const NoiseSwitcher = () => {
  const noiseOptions = [
    { key: "noise-default", label: "Default" },
    { key: "noise-blue", label: "Blue" },
    { key: "noise-blue-red", label: "Blue-Red" }
  ];

  const setNoise = useCallback((className) => {
    const body = document.body;
    noiseOptions.forEach(option => body.classList.remove(option.key));
    body.classList.add(className);
  }, []);

  if (!DEV_MODE) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex gap-2">
      {noiseOptions.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setNoise(key)}
          className="glass px-3 py-1 rounded-full text-xs hover:bg-white/10 transition-colors"
        >
          {label}
        </button>
      ))}
    </div>
  );
};

// Route components
const FuturisticRoutes = () => (
  <Routes>
    {/* Core routes */}
    <Route path="/" element={<Home />} />
    <Route path="/scan" element={<SnapScan />} />
    <Route path="/live" element={<SnapLive />} />
    <Route path="/analytics" element={<SnapAnalyticsDashboard />} />
    <Route path="/terminal" element={<SnapTerminal />} />
    <Route path="/lab" element={<SnapLab />} />
    <Route path="/pro" element={<SnapPro />} />
    <Route path="/snaptech" element={<SnapTech />} />
    
    {/* Diagnostic tools */}
    <Route path="/history" element={<SnapHistory />} />
    <Route path="/vin" element={<VinDecoder />} />
    <Route path="/plate" element={<PlateScanner />} />
    <Route path="/snapdna" element={<SnapDNA />} />
    <Route path="/repairgpt" element={<RepairGPTMode />} />
    <Route path="/python-diagnostic" element={<PythonDiagnostic />} />
    <Route path="/diagnostics" element={<SnapFaultCorePro />} />
    
    {/* ========================================
         NEW: Core System Routes (Python Backend)
         ======================================== */}
    <Route path="/core/expected-files" element={<ExpectedFiles />} />
    <Route path="/core/main" element={<MainCore />} />
    <Route path="/core/mic3x2x-dataset" element={<Mic3x2xObdDataset />} />
    <Route path="/core/missing-log" element={<MissingFilesLog />} />
    <Route path="/core/part1" element={<Part1Core />} />
    <Route path="/core/part2" element={<Part2Pids />} />
    <Route path="/core/part3" element={<Part3Databases />} />
    <Route path="/core/part4" element={<Part4Com />} />
    <Route path="/core/part5" element={<Part5Database />} />
    <Route path="/core/part6" element={<Part6Operations />} />
    <Route path="/core/part7" element={<Part7Decoders />} />
    <Route path="/core/part8" element={<Part8Persistence />} />
    <Route path="/core/part9" element={<Part9Controller />} />
    <Route path="/core/pid-map" element={<PidMap />} />
    <Route path="/core/vlinker-interface" element={<VlinkerInterface />} />
    <Route path="/core/vlinker-macros" element={<VlinkerMacrosPro />} />
    <Route path="/core/vlinker-master" element={<VlinkerMaster />} />
    <Route path="/core/vlinker-test" element={<VlinkerTestScript />} />
    <Route path="/core/websocket-server" element={<WebSocketServer />} />

    {/* ========================================
         NEW: Vehicle-Specific EV/PHEV Policies
         ======================================== */}
    <Route path="/policies/ford-ev" element={<FordEvPhevPolicy />} />
    <Route path="/policies/gm-ultium" element={<GmUltiumLegacyPolicy />} />
    <Route path="/policies/hyundai-kia" element={<HyundaiKiaPrecfdPolicy />} />
    <Route path="/policies/mitsubishi-phev" element={<MitsubishiPhevEvPolicy />} />
    <Route path="/policies/nissan-leaf" element={<NissanLeafPolicy />} />
    <Route path="/policies/psa-stellantis" element={<PsaStellantisPrecfdPolicy />} />
    <Route path="/policies/renault-zoe" element={<RenaultZoePolicy />} />
    <Route path="/policies/tesla-cybertruck" element={<TeslaCybertruckRoadsterPolicy />} />
    <Route path="/policies/tesla-model-sxy" element={<TeslaModelSXYPolicy />} />
    <Route path="/policies/toyota-lexus" element={<ToyotaLexusCompletePolicy />} />
    <Route path="/policies/vag-unified" element={<VagUnifiedEvPhevPolicy />} />
    <Route path="/policies/vlink-ev-template" element={<VlinkEvTemplatePolicy />} />

    {/* ========================================
         NEW: Vehicle-Specific Routes
         ======================================== */}
    <Route path="/vehicles/tesla" element={<VlinkTesla />} />
    <Route path="/vehicles/ford" element={<FordEvPhevPolicy />} />
    <Route path="/vehicles/gm" element={<GmUltiumLegacyPolicy />} />
    <Route path="/vehicles/hyundai" element={<HyundaiKiaPrecfdPolicy />} />
    <Route path="/vehicles/kia" element={<HyundaiKiaPrecfdPolicy />} />
    <Route path="/vehicles/mitsubishi" element={<MitsubishiPhevEvPolicy />} />
    <Route path="/vehicles/nissan" element={<NissanLeafPolicy />} />
    <Route path="/vehicles/psa" element={<PsaStellantisPrecfdPolicy />} />
    <Route path="/vehicles/stellantis" element={<PsaStellantisPrecfdPolicy />} />
    <Route path="/vehicles/renault" element={<RenaultZoePolicy />} />
    <Route path="/vehicles/toyota" element={<ToyotaLexusCompletePolicy />} />
    <Route path="/vehicles/lexus" element={<ToyotaLexusCompletePolicy />} />
    <Route path="/vehicles/volkswagen" element={<VagUnifiedEvPhevPolicy />} />
    <Route path="/vehicles/audi" element={<VagUnifiedEvPhevPolicy />} />
    <Route path="/vehicles/porsche" element={<VagUnifiedEvPhevPolicy />} />

    {/* ========================================
         NEW: Tools & Utilities
         ======================================== */}
    <Route path="/tools/json-converter" element={<JsonToCsvConverter />} />
    <Route path="/tools/ms-stream" element={<MsStream />} />
    <Route path="/tools/git-ignore" element={<GitIgnore />} />
    <Route path="/tools/check-files" element={<CheckFiles />} />
    <Route path="/tools/command-reference" element={<CommandReferenceMap />} />

    {/* ========================================
         NEW: Advanced AI Modules
         ======================================== */}
    <Route path="/ai/trainer" element={<SnapAITrainer />} />
    <Route path="/ai/alerts" element={<SnapAlertSystem />} />
    <Route path="/ai/job" element={<SnapJobAI />} />
    <Route path="/ai/global" element={<SnapGlobalAI />} />
    <Route path="/ai/update" element={<SnapUpdateAI />} />
    <Route path="/ai/relay" element={<SnapRelayAI />} />
    <Route path="/ai/briefs" element={<SnapBriefsAI />} />
    <Route path="/ai/lab" element={<SnapLabAI />} />
    <Route path="/ai/license" element={<SnapLicenseAI />} />
    <Route path="/ai/mot" element={<SnapMOTAI />} />
    <Route path="/ai/garage" element={<SnapGarageAI />} />
    <Route path="/ai/offline" element={<SnapOfflineAI />} />

    {/* ========================================
         NEW: Energy & Charging Analytics
         ======================================== */}
    <Route path="/energy/charging-analytics" element={<ChargingAnalytics />} />
    <Route path="/energy/management" element={<EnergyManagement />} />
    <Route path="/energy/battery" element={<BatteryDiagnostics />} />
    <Route path="/energy/charging-stations" element={<ChargingStationLocator />} />
    <Route path="/energy/efficiency" element={<EnergyEfficiencyReports />} />
    
    {/* Management tools */}
    <Route path="/snapjob" element={<SnapJob />} />
    <Route path="/snaptranslate" element={<SnapGlobalTranslate />} />
    <Route path="/snapupdate" element={<SnapUpdateEngine />} />
    <Route path="/relaydebug" element={<SnapRelayDebugHub />} />
    <Route path="/briefs" element={<SnapBriefs />} />
    <Route path="/labtoolkit" element={<SnapLabToolkit />} />
    <Route path="/license-manager" element={<SnapLicenseManager />} />
    <Route path="/mot-reminders" element={<MOTReminderScheduler />} />
    
    {/* Garage and admin */}
    <Route path="/garage-dashboard" element={<GarageAdminDashboard />} />
    <Route path="/garage" element={<GarageDashboard />} />
    <Route path="/offline" element={<OfflineModeManager />} />
    
    {/* AI modules */}
    <Route path="/sentience" element={<SnapSentience />} />
    <Route path="/predict" element={<SnapPredict />} />
    <Route path="/recall" element={<SnapRecall />} />
    <Route path="/reset" element={<SnapReset />} />
    <Route path="/bulletin" element={<SnapBulletin />} />
    <Route path="/notes" element={<SnapNotes />} />
    <Route path="/metrics" element={<SnapMetric />} />
    <Route path="/secure" element={<SnapSecure />} />
    <Route path="/gptui" element={<SnapChatGPTUI />} />
    <Route path="/track" element={<SnapTrack />} />
    <Route path="/replay" element={<SnapReplay />} />
    <Route path="/sign" element={<SnapSign />} />
    
    {/* Vehicle and connectivity */}
    <Route path="/vehicle-lookup" element={<VehicleLookup />} />
    <Route path="/snaptech-chat" element={<SnapTechChat />} />
    <Route path="/snaplive-hub" element={<SnapLiveHub />} />
    <Route path="/connect" element={<SnapCoreConnect />} />
    
    {/* ========================================
         Enhanced Reports System
         ======================================== */}
    <Route path="/reports" element={<ReportsList />} />
    <Route path="/reports/last" element={<LastReport />} />
    <Route path="/reports/generator" element={<ReportGenerator />} />
    <Route path="/reports/templates" element={<ReportTemplates />} />
    <Route path="/reports/scheduler" element={<ReportScheduler />} />
    <Route path="/reports/archive" element={<ReportArchive />} />
    <Route path="/reports/:id" element={<ReportDetails />} />
    
    {/* Development routes */}
    {(DEV_MODE || ALLOW_DEV_IN_PROD) && (
      <>
        <Route path="/_dev/login" element={<DevLogin />} />
        <Route path="/_dev/inventory" element={<DevInventory />} />
      </>
    )}
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const TraditionalRoutes = () => (
  <Routes>
    {/* Public pages */}
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/features" element={<Features />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/support" element={<Support />} />
    <Route path="/faq" element={<Faq />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    
    {/* Authentication */}
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/verify-email" element={<VerifyEmail />} />
    <Route path="/resend-verification" element={<ResendVerification />} />
    <Route path="/change-password" element={<ChangePassword />} />
    <Route path="/2fa" element={<TwoFactorSetup />} />
    
    {/* Access restriction demo */}
    <Route
      path="/restrictions"
      element={
        <AccessRestrictionHandler
          allowedTiers={["pro", "garage", "owner"]}
          redirectTo="/pricing"
        >
          <div className="p-6 text-center">
            <h2 className="text-2xl font-semibold mb-4">Restricted Area</h2>
            <p className="text-gray-400">
              This page is protected by tier restrictions. Only Pro, Garage, and Owner tiers can access this content.
            </p>
          </div>
        </AccessRestrictionHandler>
      }
    />
    
    {/* Reports (also accessible from traditional layout) */}
    <Route path="/reports" element={<ReportsList />} />
    <Route path="/reports/last" element={<LastReport />} />
    <Route path="/reports/:id" element={<ReportDetails />} />
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

// Custom hooks
const useRouteConfiguration = (pathname) => {
  return useMemo(() => {
    const isFuturistic = FUTURISTIC_ROUTES.has(pathname) || pathname.startsWith("/snap") || 
                        pathname.startsWith("/core") || pathname.startsWith("/policies") || 
                        pathname.startsWith("/vehicles") || pathname.startsWith("/tools") || 
                        pathname.startsWith("/ai") || pathname.startsWith("/energy");
    const shouldShowParticles = !pathname.startsWith("/diagnostics");
    
    return { isFuturistic, shouldShowParticles };
  }, [pathname]);
};

const useAuthState = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let unsubscribe;
    
    const initAuth = async () => {
      try {
        setAuthError(null);
        const { data, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        setUser(data?.user ?? null);
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            setUser(session?.user ?? null);
            if (DEV_MODE) {
              console.info("[Auth Event]", event, session?.user?.id);
            }
          }
        );
        
        unsubscribe = () => subscription?.unsubscribe();
        
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setAuthError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
    return () => unsubscribe?.();
  }, []);

  return { user, setUser, isLoading, authError };
};

const useErrorHandling = () => {
  useEffect(() => {
    const handleError = (event) => {
      console.error("[Global Error]", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    };
    
    const handleRejection = (event) => {
      console.error("[Unhandled Rejection]", event.reason);
    };
    
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);
};

// Main App component
export default function App() {
  const location = useLocation();
  const [tier, setTier] = useState(() => safeStorage.get("user-tier", DEFAULT_TIER));
  const { user, setUser, isLoading, authError } = useAuthState();
  const { isFuturistic, shouldShowParticles } = useRouteConfiguration(location.pathname);
  
  // Setup hooks
  useErrorHandling();
  
  // Initialize SnapCore WebSocket Bridge
  useEffect(() => {
    const bridge = getSnapCoreBridge();
    
    // Set up global event listeners for bridge
    const handleBridgeConnected = (data) => {
      if (DEV_MODE) {
        console.info("[SnapCore Bridge] Connected:", data);
      }
    };
    
    const handleBridgeDisconnected = (data) => {
      if (DEV_MODE) {
        console.info("[SnapCore Bridge] Disconnected:", data);
      }
    };
    
    const handleBridgeError = (error) => {
      console.error("[SnapCore Bridge] Error:", error);
    };
    
    bridge.on('connected', handleBridgeConnected);
    bridge.on('disconnected', handleBridgeDisconnected);
    bridge.on('error', handleBridgeError);
    
    // Cleanup listeners on unmount
    return () => {
      bridge.removeListener('connected', handleBridgeConnected);
      bridge.removeListener('disconnected', handleBridgeDisconnected);
      bridge.removeListener('error', handleBridgeError);
    };
  }, []);
  
  // Setup hooks
  useErrorHandling();
  
  // Debug mode check
  const isDebugMode = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).has("debug");
  }, []);
  
  // Route change logging
  useEffect(() => {
    if (DEV_MODE) {
      console.info("[Route Change]", {
        pathname: location.pathname,
        search: location.search,
        isFuturistic,
        shouldShowParticles
      });
    }
  }, [location.pathname, location.search, isFuturistic, shouldShowParticles]);
  
  // Sync tier with localStorage
  useEffect(() => {
    safeStorage.set("user-tier", tier);
  }, [tier]);
  
  // Debug shell
  if (isDebugMode) {
    return <DebugShell location={location} user={user} tier={tier} />;
  }
  
  // Loading state
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  // Auth error state (dev-friendly: ignore and continue rendering)
if (authError) {
  if (import.meta.env.MODE === "development") {
    console.warn("[Auth] Ignoring auth error in dev:", authError);
  }
  // do NOT return here—let the app continue
}

  return (
    <AuthContext.Provider value={{ user, setUser, tier, setTier }}>
      <VehicleProvider>
        <ErrorBoundary>
          <div 
            className="min-h-screen relative overflow-hidden bg-[#06080f] text-[#e5f4ff] dark"
            style={THEME_CONFIG.variables}
          >
            <GlobalThemeSetup />
            <NoiseSwitcher />

            {isFuturistic ? (
              <div className="relative z-10 min-h-screen flex flex-col">
                <Suspense fallback={<LoadingFallback label="Loading navigation..." />}>
                  <FuturisticNavigation user={user} tier={tier} />
                </Suspense>
                
                <main className="flex-1 p-6 pt-24">
                  <div className="max-w-7xl mx-auto">
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingFallback label="Loading page..." />}>
                        <FuturisticRoutes />
                      </Suspense>
                    </ErrorBoundary>
                  </div>
                </main>
                
                <ChatFAB />
              </div>
            ) : (
              <div className="flex flex-col min-h-screen">
                <Header darkMode={true} setDarkMode={() => {}} />
                <FloatingHeader />
                <main className="flex-1">
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingFallback label="Loading content..." />}>
                      <TraditionalRoutes />
                    </Suspense>
                  </ErrorBoundary>
                </main>
                <Footer />
                <ErrorBoundary>
                  <Suspense fallback={null}>
                    <SnapTechChatWidget tier={tier} />
                  </Suspense>
                </ErrorBoundary>
              </div>
            )}
          </div>
        </ErrorBoundary>
      </VehicleProvider>
    </AuthContext.Provider>
  );
}