// src/pages/TwoFactorSetup.jsx

import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { ShieldCheck, KeyRound, Copy, Loader2 } from "lucide-react";

export default function TwoFactorSetup() {
  const [secret] = useState("JBSWY3DPEHPK3PXP"); // Simulated static secret – replace with backend-generated
  const [qrUrl, setQrUrl] = useState("");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef();
  const appName = "SnapCore AI";

  useEffect(() => {
    const otpAuthUrl = `otpauth://totp/${appName}?secret=${secret}&issuer=${appName}`;
    const encoded = encodeURIComponent(otpAuthUrl);
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encoded}`);
    inputRef.current?.focus(); // Autofocus on mount
  }, [secret]);

  const handleCopy = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Simulate backend check — replace with real API call:
      // POST to /2fa/verify with: { code, userId or token }
      await new Promise((res) => setTimeout(res, 1200));

      if (code === "123456") {
        setVerified(true);
      } else {
        throw new Error("Invalid code.");
      }
    } catch (err) {
      setError("Invalid code. Please check your authenticator app.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Two-Factor Authentication Setup – SnapCore AI</title>
        <meta name="description" content="Set up 2FA for added SnapCore AI account security." />
      </Helmet>

      <main className="min-h-screen flex items-center justify-center px-6 py-20 bg-white dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800"
        >
          <div className="text-center mb-6">
            <KeyRound className="mx-auto h-10 w-10 text-blue-600 dark:text-blue-400 mb-3" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Two-Factor Authentication
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Protect your account with a second layer of security.
            </p>
          </div>

          {verified ? (
            <div className="text-green-600 text-center text-sm font-medium">
              <ShieldCheck className="mx-auto h-6 w-6 mb-2" />
              2FA is now enabled. You're secured.
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-4 mb-6">
                <img
                  src={qrUrl}
                  alt="QR Code for 2FA"
                  className="rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                  Scan with <strong>Google Authenticator</strong> or similar.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mb-4 text-sm flex items-center justify-between text-gray-700 dark:text-gray-200">
                <span className="font-mono">{secret}</span>
                <button
                  onClick={handleCopy}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                >
                  <Copy className="inline h-4 w-4 mr-1" />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <form onSubmit={handleVerify} className="space-y-5">
                <div>
                  <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm">
                    Enter 6-digit code
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none tracking-widest text-center font-mono"
                    placeholder="123456"
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm font-medium text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 font-semibold rounded-xl text-white transition transform ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:scale-105"
                  }`}
                >
                  {loading ? (
                    <span className="flex justify-center items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                    </span>
                  ) : (
                    "Verify & Enable 2FA"
                  )}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </main>
    </>
  );
}