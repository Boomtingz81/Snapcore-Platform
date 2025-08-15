// src/components/DevAccessGate.jsx
import { useEffect, useMemo, useState } from "react";

/**
 * Client-side “God Gate”:
 * - Verifies passphrase (and optional PIN) by PBKDF2 against public/dev-gate.json
 * - Exponential backoff + lockout after failures
 * - Session grant stored with short expiry
 * NOTE: This is the strongest client-only gate, but not equal to server auth.
 */

const STORE_KEY = "dev_gate_session_v1";
const FAIL_KEY  = "dev_gate_fail_v1";

function now() { return Date.now(); }
function inMinutes(min) { return now() + min * 60_000; }

async function pbkdf2(pass, saltB64, iters) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(pass),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: Uint8Array.from(atob(saltB64), c => c.charCodeAt(0)), iterations: iters, hash: "SHA-256" },
    key,
    256
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export default function DevAccessGate({
  children,
  title = "Restricted Area",
  sessionMinutes = 90,
  maxFails = 6,
}) {
  const [cfg, setCfg] = useState(null);
  const [ready, setReady] = useState(false);
  const [granted, setGranted] = useState(false);
  const [pass, setPass] = useState("");
  const [pin, setPin] = useState("");

  const [error, setError] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [remaining, setRemaining] = useState(0);

  // load config
  useEffect(() => {
    fetch("/dev-gate.json?_=" + Date.now())
      .then(r => (r.ok ? r.json() : null))
      .then(setCfg)
      .finally(() => setReady(true));
  }, []);

  // check existing session
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.exp > now()) setGranted(true);
    } catch {}
  }, []);

  // manage cooldown ticker
  useEffect(() => {
    if (!cooldownUntil) return;
    const t = setInterval(() => {
      const rem = Math.max(0, Math.ceil((cooldownUntil - now()) / 1000));
      setRemaining(rem);
      if (rem <= 0) {
        setCooldownUntil(0);
        setError("");
      }
    }, 250);
    return () => clearInterval(t);
  }, [cooldownUntil]);

  const blocked = useMemo(() => {
    try {
      const raw = localStorage.getItem(FAIL_KEY);
      if (!raw) return { n: 0, until: 0 };
      const o = JSON.parse(raw);
      return o;
    } catch { return { n: 0, until: 0 }; }
  }, [cooldownUntil]);

  useEffect(() => {
    if (blocked.until && blocked.until > now()) {
      setCooldownUntil(blocked.until);
      setError("Too many attempts. Cooling down…");
    }
  }, [blocked]);

  async function verify(e) {
    e?.preventDefault();
    setError("");

    if (!cfg) { setError("Gate config not loaded"); return; }
    if (blocked.until && blocked.until > now()) return;

    try {
      const passHash = await pbkdf2(pass, cfg.salt, cfg.iters);
      const okPass = constantTimeEqual(passHash, cfg.hash);

      let okPin = true;
      if (cfg.pinHash && cfg.pinSalt) {
        if (!/^\d{4,10}$/.test(pin)) {
          setError("Enter your PIN");
          return;
        }
        const pinHash = await pbkdf2(pin, cfg.pinSalt, cfg.iters);
        okPin = constantTimeEqual(pinHash, cfg.pinHash);
      }

      if (okPass && okPin) {
        sessionStorage.setItem(
          STORE_KEY,
          JSON.stringify({ exp: inMinutes(sessionMinutes), at: now() })
        );
        localStorage.setItem(FAIL_KEY, JSON.stringify({ n: 0, until: 0 }));
        setGranted(true);
        setPass(""); setPin("");
        return;
      }

      // handle failure
      const nextN = (blocked.n || 0) + 1;
      // exponential backoff (seconds): 2, 4, 8, 16, 32, 64…
      const seconds = Math.min(300, 2 ** Math.min(10, nextN));
      const until = now() + seconds * 1000;
      localStorage.setItem(FAIL_KEY, JSON.stringify({ n: nextN, until }));
      setCooldownUntil(until);
      setError("Invalid credentials. Please wait and try again.");
    } catch (err) {
      console.error(err);
      setError("Verification error.");
    }
  }

  function resetLock() {
    localStorage.removeItem(FAIL_KEY);
    setCooldownUntil(0);
    setError("");
  }

  if (!ready) return null;
  if (granted) return children || null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10 bg-black text-gray-100">
      <form
        onSubmit={verify}
        className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl"
      >
        <h2 className="text-xl font-semibold mb-4">{title}</h2>

        <label className="block text-sm mb-1">Passphrase</label>
        <input
          type="password"
          className="w-full mb-3 px-3 py-2 rounded bg-black/40 border border-white/10"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          autoComplete="off"
        />

        {cfg?.pinHash && (
          <>
            <label className="block text-sm mb-1">PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full mb-3 px-3 py-2 rounded bg-black/40 border border-white/10"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoComplete="off"
            />
          </>
        )}

        {error && (
          <div className="text-sm text-red-400 mb-2">{error}{remaining ? ` (${remaining}s)` : ""}</div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!!cooldownUntil}
            className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
          >
            Unlock
          </button>
          {cooldownUntil ? (
            <button type="button" onClick={resetLock} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20">
              Reset
            </button>
          ) : null}
        </div>

        <p className="mt-3 text-xs text-gray-400">
          Tip: use a long multi-word passphrase. Session auto-expires in {sessionMinutes}m.
        </p>
      </form>
    </div>
  );
}
