// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "./lib/supabaseClient";

// ✅ Layout Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingHeader from "./components/FloatingHeader";
import SnapTechChatWidget from "./components/SnapTechChatWidget";

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

export default function App() {
  const [tier, setTier] = useState("lite");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [user, setUser] = useState(null);

  // ✅ Load tier and auth session
  useEffect(() => {
    const savedTier = localStorage.getItem("user-tier");
    if (savedTier) setTier(savedTier);

    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener?.subscription?.unsubscribe();
  }, []);

  // ✅ Handle Dark Mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <div className={`flex flex-col min-h-screen ${darkMode ? "dark bg-gray-900" : "bg-white"}`}>
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />
        <FloatingHeader />

        <main className="flex-1">
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Home />} />
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

            {/* Core Modules */}
            <Route path="/snaptech" element={<SnapTech />} />
            <Route path="/pro" element={<SnapPro />} />
            <Route path="/scan" element={<SnapScan />} />
            <Route path="/history" element={<SnapHistory />} />
            <Route path="/vin" element={<VinDecoder />} />
            <Route path="/plate" element={<PlateScanner />} />
            <Route path="/snapdna" element={<SnapDNA />} />
            <Route path="/repairgpt" element={<RepairGPTMode />} />
            <Route path="/snapjob" element={<SnapJob />} />
            <Route path="/snaptranslate" element={<SnapGlobalTranslate />} />
            <Route path="/snapupdate" element={<SnapUpdateEngine />} />
            <Route path="/analytics" element={<SnapAnalyticsDashboard />} />
            <Route path="/relaydebug" element={<SnapRelayDebugHub />} />
            <Route path="/briefs" element={<SnapBriefs />} />
            <Route path="/labtoolkit" element={<SnapLabToolkit />} />
            <Route path="/license-manager" element={<SnapLicenseManager />} />
            <Route path="/mot-reminders" element={<MOTReminderScheduler />} />
            <Route path="/garage-dashboard" element={<GarageAdminDashboard />} />
            <Route path="/garage" element={<GarageDashboard />} />
            <Route path="/offline" element={<OfflineModeManager />} />

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
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This page is intentionally protected by tier restrictions.
                    </p>
                  </div>
                </AccessRestrictionHandler>
              }
            />

            {/* AI & Utilities */}
            <Route path="/sentience" element={<SnapSentience />} />
            <Route path="/predict" element={<SnapPredict />} />
            <Route path="/recall" element={<SnapRecall />} />
            <Route path="/live" element={<SnapLive />} />
            <Route path="/reset" element={<SnapReset />} />
            <Route path="/bulletin" element={<SnapBulletin />} />
            <Route path="/notes" element={<SnapNotes />} />
            <Route path="/metrics" element={<SnapMetric />} />
            <Route path="/secure" element={<SnapSecure />} />
            <Route path="/gptui" element={<SnapChatGPTUI />} />
            <Route path="/terminal" element={<SnapTerminal />} />
            <Route path="/track" element={<SnapTrack />} />
            <Route path="/replay" element={<SnapReplay />} />
            <Route path="/sign" element={<SnapSign />} />
            <Route path="/lab" element={<SnapLab />} />

            {/* Vehicle Lookup */}
            <Route path="/vehicle-lookup" element={<VehicleLookup />} />

            {/* SnapTech Chat */}
            <Route path="/snaptech-chat" element={<SnapTechChat />} />

            {/* ✅ NEW: SnapLive Hub */}
            <Route path="/snaplive-hub" element={<SnapLiveHub />} />

            {/* 🔒 Dev routes (only if dev or explicitly enabled) */}
            {(DEV_MODE || ALLOW_IN_PROD) && (
              <>
                <Route path="/_dev/login" element={<DevLogin />} />
                <Route path="/_dev/inventory" element={<DevInventory />} />
              </>
            )}

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
        <SnapTechChatWidget tier={tier} />
      </div>
    </AuthContext.Provider>
  );
}
