// src/pages/DevLogin.jsx
import { useState } from "react";

export default function DevLogin() {
  const [passphrase, setPassphrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handleLogin = async () => {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/dev-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });
      if (!res.ok) throw new Error("Invalid passphrase");
      window.location.href = "/_dev/inventory";
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-gray-200 px-6">
      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-xl p-6">
        <h1 className="text-xl font-semibold mb-2">Developer Login</h1>
        <p className="text-xs text-gray-400 mb-4">Private area. Authorized personnel only.</p>
        <input
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          placeholder="Enter passphrase"
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 outline-none focus:border-cyan-400 mb-3"
        />
        {!!err && <div className="text-red-300 text-sm mb-3">{err}</div>}
        <button
          onClick={handleLogin}
          disabled={busy || !passphrase}
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 rounded px-3 py-2"
        >
          {busy ? "Authorizing…" : "Login"}
        </button>
      </div>
    </main>
  );
}
