// 📂 FILE: src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState, createContext, useContext, useLayoutEffect } from "react"; // 🔹 ADDED useLayoutEffect
import { supabase } from "./lib/supabaseClient";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// ✅ Layout Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingHeader from "./components/FloatingHeader";
import SnapTechChatWidget from "./components/SnapTechChatWidget";
import ParticleBackground from "./components/ParticleBackground";
import FuturisticNavigation from "./components/FuturisticNavigation";

// ✅ Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Support from "./pages/Support";
import Faq from "./pages/Faq";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

// ✅ Auth Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import ResendVerification from "./pages/ResendVerification";
import ChangePassword from "./pages/ChangePassword";
import TwoFactorSetup from "./pages/TwoFactorSetup";

// ✅ Core Modules
import SnapTech from "./pages/SnapTech";
import SnapPro from "./pages/SnapPro";
import SnapScan from "./pages/SnapScan";
import SnapHistory from "./pages/SnapHistory";
import SnapDNA from "./pages/SnapDNA";
import SnapJob from "./pages/SnapJob";
import SnapGlobalTranslate from "./pages/SnapGlobalTranslate";
import SnapUpdateEngine from "./pages/SnapUpdateEngine";
import SnapAnalyticsDashboard from "./pages/SnapAnalyticsDashboard";
import SnapRelayDebugHub from "./pages/SnapRelayDebugHub";
import SnapBriefs from "./pages/SnapBriefs";
import SnapLabToolkit from "./pages/SnapLabToolkit";
import SnapLicenseManager from "./pages/SnapLicenseManager";
import MOTReminderScheduler from "./pages/MOTReminderScheduler";
import GarageAdminDashboard from "./pages/GarageAdminDashboard";
import OfflineModeManager from "./pages/OfflineModeManager";
import AccessRestrictionHandler from "./components/AccessRestrictionHandler";
import GarageDashboard from "./pages/GarageDashboard";

// ✅ Diagnostic Tools
import VinDecoder from "./pages/VinDecoder";
import PlateScanner from "./pages/PlateScanner";
import RepairGPTMode from "./pages/RepairGPTMode";

// ✅ AI & Monitoring
import SnapSentience from "./pages/SnapSentience";
import SnapPredict from "./pages/SnapPredict";
import SnapRecall from "./pages/SnapRecall";
import SnapLive from "./pages/SnapLive";
import SnapReset from "./pages/SnapReset";
import SnapBulletin from "./pages/SnapBulletin";
import SnapNotes from "./pages/SnapNotes";
import SnapMetric from "./pages/SnapMetric";
import SnapSecure from "./pages/SnapSecure";
import SnapChatGPTUI from "./pages/SnapChatGPTUI";
import SnapTerminal from "./pages/SnapTerminal";
import SnapTrack from "./pages/SnapTrack";
import SnapReplay from "./pages/SnapReplay";
import SnapSign from "./pages/SnapSign";
import SnapLab from "./pages/SnapLab";

// ✅ Vehicle Lookup & Chat
import VehicleLookup from "./pages/VehicleLookup";
import SnapTechChat from "./pages/SnapTechChat";

// ✅ NEW: SnapLive Hub
import SnapLiveHub from "./pages/SnapLiveHub";

// ✅ NEW: SnapCore Connect
import SnapCoreConnect from "./components/SnapCoreConnect";

// ✅ NEW: Diagnostic Session (ADDED)
import DiagnosticSession from "./pages/DiagnosticSession"; // ← ADDED

// ✅ Dev tools (hidden)
import DevInventory from "./pages/DevInventory";
import DevLogin from "./pages/DevLogin";

// ✅ Gate flags for dev routes
const DEV_MODE = import.meta.env.MODE === "development";
const ALLOW_IN_PROD = import.meta.env.VITE_DEV_DASH_ENABLED === "true";

// ✅ Auth Context
export const AuthContext = createContext(null);
export function useAuth() {
  return useContext(AuthContext);
}

/* --------------------- 🔹 ADDED: Global theme + noise injectors --------------------- */

/** Forces `dark` class and your neon/noise classes on <body> before first paint. */
function GlobalThemeInjector() {
  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Force Tailwind dark variants
    html.classList.add("dark");
    // Ensure no white flash
    body.style.backgroundColor = "#06080f";

    // Attach your background helpers (defined in your CSS):
    // - bg-texture : your radial/linear gradients
    // - noise-* : one of noise-default / noise-blue / noise-blue-red
    // - noise-normal: optional density token if you added it
    body.classList.add("bg-texture", "noise-blue-red");

    return () => {
      body.classList.remove("bg-texture", "noise-blue-red");
    };
  }, []);

  return null;
}

/** Small dev-only toggle to try different noise textures at runtime. */
function NoiseSwitcher() {
  const setNoise = (cls) => {
    document.body.classList.remove("noise-default", "noise-blue", "noise-blue-red");
    document.body.classList.add(cls);
  };
  return (
    <div className="fixed bottom-6 left-6 z-50 flex gap-2 pointer-events-auto">
      <button className="glass px-3 py-1 rounded-full text-xs" onClick={() => setNoise("noise-default")}>
        Noise
      </button>
      <button className="glass px-3 py-1 rounded-full text-xs" onClick={() => setNoise("noise-blue")}>
        Blue
      </button>
      <button className="glass px-3 py-1 rounded-full text-xs" onClick={() => setNoise("noise-blue-red")}>
        Blue-Red
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------------------------ */

/* 🔐 ADDED: Safe localStorage helper (SSR/preview-safe) */
const safeLocalStorage = {
  get: (k) => (typeof window !== "undefined" ? localStorage.getItem(k) : null),
  set: (k, v) => {
    if (typeof window !== "undefined") localStorage.setItem(k, v);
  },
};

/* 🚀 ADDED: O(1) lookup set for futuristic routes (keeps your original array too) */
const FUTURISTIC_SET = new Set([
  "/",
  "/scan",
  "/live",
  "/analytics",
  "/terminal",
  "/lab",
  "/pro",
  "/snaptech",
  "/snaplive-hub",
  "/connect",
  "/diagnostics", // include diagnostics
]);

export default function App() {
  const [tier, setTier] = useState("lite");
  const [darkMode] = useState(true); // force dark so tailwind's `dark:` variants apply
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // ✅ Load tier and auth session (with safe guards)
  useEffect(() => {
    /* 🔧 REFACTOR: safer read of savedTier */
    const savedTierSafe = safeLocalStorage.get("user-tier") || localStorage.getItem("user-tier");
    if (savedTierSafe) setTier(savedTierSafe);

    // (kept original lines commented to avoid duplicate variable declaration)
    // const savedTier = localStorage.getItem("user-tier");
    // if (savedTier) setTier(savedTier);

    let unsub = null;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data?.user ?? null);
      } catch (e) {
        console.warn("supabase.auth.getUser() failed:", e);
      }
      const listener = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      unsub = () => listener?.data?.subscription?.unsubscribe?.();
      setIsLoading(false);
    })();

    return () => {
      try {
        unsub?.();
      } catch {}
    };
  }, []);

  // ✅ Force dark + register theme CSS variables on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    /* 🔧 REFACTOR: keep your original write and add safe write */
    localStorage.setItem("darkMode", "true"); // kept
    safeLocalStorage.set("darkMode", "true"); // added safe version

    root.style.setProperty("--primary-glow", "#00d4ff");
    root.style.setProperty("--secondary-glow", "#7c3aed");
    root.style.setProperty("--accent-glow", "#06ffa5");
    root.style.setProperty("--danger-glow", "#ff0844");
    root.style.setProperty("--warning-glow", "#ffb800");
    root.style.setProperty("--particle-primary", "#00d4ff33");
    root.style.setProperty("--particle-secondary", "#7c3aed33");
    root.style.setProperty("--glass-bg", "rgba(255,255,255,0.02)");
    root.style.setProperty("--glass-border", "rgba(255,255,255,0.1)");
  }, []);

  // Which routes use the futuristic chrome
  const isFuturisticRoute = () => {
    const futuristicPaths = [
      "/",
      "/scan",
      "/live",
      "/analytics",
      "/terminal",
      "/lab",
      "/pro",
      "/snaptech",
      "/snaplive-hub",
      "/connect", // Add connect to futuristic routes
      "/diagnostics", // ← ADDED here too (keeps your original array useful)
    ];

    // NEW quick check (additive, keeps your original logic intact)
    if (FUTURISTIC_SET.has(location.pathname)) return true;

    return (
      futuristicPaths.includes(location.pathname) ||
      location.pathname.startsWith("/snap")
    );
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--neon)] flex items-center justify-center relative overflow-hidden">
        <ParticleBackground />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" />
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-purple-500 border-r-transparent animate-spin-reverse" />
            <div className="absolute inset-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">SC</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            SnapCore
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Initializing diagnostic systems...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, tier, setTier }}>
      <ErrorBoundary>
        {/* 🔥 Global theme wrapper: no white fallback anywhere */}
        <div
          className={[
            "min-h-screen relative overflow-hidden",
            "bg-[var(--bg)] text-[var(--neon)]",
            darkMode ? "dark" : "",
          ].join(" ")}
        >
          {/* 🔹 ADDED: force theme + noise on <body> */}
          <GlobalThemeInjector />

          {/* 🔹 ADDED: quick dev switcher for the three noise textures (optional) */}
          <NoiseSwitcher />

          {/* Particle layer always under content */}
          <ParticleBackground />

          {/* Futuristic chrome or classic shell */}
          {isFuturisticRoute() ? (
            <div className="relative z-10 min-h-screen flex flex-col">
              <FuturisticNavigation user={user} tier={tier} />

              <main className="flex-1 p-6 pt-24">
                <div className="max-w-7xl mx-auto">
                  <ErrorBoundary>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/scan" element={<SnapScan />} />
                      <Route path="/live" element={<SnapLive />} />
                      <Route path="/analytics" element={<SnapAnalyticsDashboard />} />
                      <Route path="/terminal" element={<SnapTerminal />} />
                      <Route path="/lab" element={<SnapLab />} />
                      <Route path="/pro" element={<SnapPro />} />
                      <Route path="/snaptech" element={<SnapTech />} />
                      <Route path="/history" element={<SnapHistory />} />
                      <Route path="/vin" element={<VinDecoder />} />
                      <Route path="/plate" element={<PlateScanner />} />
                      <Route path="/snapdna" element={<SnapDNA />} />
                      <Route path="/repairgpt" element={<RepairGPTMode />} />
                      <Route path="/snapjob" element={<SnapJob />} />
                      <Route path="/snaptranslate" element={<SnapGlobalTranslate />} />
                      <Route path="/snapupdate" element={<SnapUpdateEngine />} />
                      <Route path="/relaydebug" element={<SnapRelayDebugHub />} />
                      <Route path="/briefs" element={<SnapBriefs />} />
                      <Route path="/labtoolkit" element={<SnapLabToolkit />} />
                      <Route path="/license-manager" element={<SnapLicenseManager />} />
                      <Route path="/mot-reminders" element={<MOTReminderScheduler />} />
                      <Route path="/garage-dashboard" element={<GarageAdminDashboard />} />
                      <Route path="/garage" element={<GarageDashboard />} />
                      <Route path="/offline" element={<OfflineModeManager />} />
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
                      <Route path="/vehicle-lookup" element={<VehicleLookup />} />
                      <Route path="/snaptech-chat" element={<SnapTechChat />} />
                      <Route path="/snaplive-hub" element={<SnapLiveHub />} />
                      <Route path="/connect" element={<SnapCoreConnect />} />

                      {/* 🔥 ADDED: Diagnostic Session route in futuristic shell */}
                      <Route path="/diagnostics" element={<DiagnosticSession />} />

                      {(DEV_MODE || ALLOW_IN_PROD) && (
                        <>
                          <Route path="/_dev/login" element={<DevLogin />} />
                          <Route path="/_dev/inventory" element={<DevInventory />} />
                        </>
                      )}

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ErrorBoundary>
                </div>
              </main>

              {/* Floating chat trigger */}
              <ErrorBoundary>
                <div className="fixed bottom-6 right-6 z-50">
                  <button className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 p-0.5 hover:from-purple-500 hover:to-cyan-400 transition-all duration-300 group">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white group-hover:scale-110 transition-transform"
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
                    </div>
                  </button>
                </div>
              </ErrorBoundary>
            </div>
          ) : (
            // Traditional layout for non-futuristic routes (still uses neon theme)
            <div className="flex flex-col min-h-screen">
              <Header darkMode={true} setDarkMode={() => {}} />
              <FloatingHeader />

              <main className="flex-1">
                <ErrorBoundary>
                  <Routes>
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/faq" element={<Faq />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                    {/* Auth Pages */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/resend-verification" element={<ResendVerification />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/2fa" element={<TwoFactorSetup />} />

                    {/* Restriction showcase route */}
                    <Route
                      path="/restrictions"
                      element={
                        <AccessRestrictionHandler
                          allowedTiers={["pro", "garage", "owner"]}
                          redirectTo="/pricing"
                        >
                          <div className="p-6">
                            <h2 className="text-xl font-semibold mb-2">Restricted Area</h2>
                            <p className="text-sm text-gray-400">
                              This page is intentionally protected by tier restrictions.
                            </p>
                          </div>
                        </AccessRestrictionHandler>
                      }
                    />
                  </Routes>
                </ErrorBoundary>
              </main>

              <Footer />

              <ErrorBoundary>
                <SnapTechChatWidget tier={tier} />
              </ErrorBoundary>
            </div>
          )}
        </div>
      </ErrorBoundary>
    </AuthContext.Provider>
  );
}

/* ------------------------------------------------------------------
   SCRATCH / DUPLICATES FROM YOUR ORIGINAL MESSAGE — KEPT AS COMMENTS
   (Leaving these active would cause syntax errors or duplicates.)
------------------------------------------------------------------- */
// <Route path="/diagnostics" element={<DiagnosticSession />} />
// const futuristicPaths = [ ... "/diagnostics", ];
// import DiagnosticSession from "./pages/DiagnosticSession";

// Duplicate additions retained for traceability:
// <Route path="/diagnostics" element={<DiagnosticSession />} />
// const futuristicPaths = [
// "/",
// "/scan",
// "/live",
// "/analytics",
// "/terminal",
// "/lab",
// "/pro",
// "/snaptech",
// "/snaplive-hub",
// "/connect",
// "/diagnostics", // ← ADDED: diagnostics uses the futuristic chrome
// ];
// import DiagnosticSession from "./pages/DiagnosticSession";

// Another scratch copy:
// <Route path="/diagnostics" element={<DiagnosticSession />} />

// Another scratch copy with improved isFuturisticRoute is already integrated above.

/* End scratch */
// trigger CI
// kick CI
