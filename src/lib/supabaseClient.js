// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

/**
 * Pull from env first; fall back to the values you supplied.
 * NOTE: Your original key remains intact below as requested.
 */
const SUPABASE_URL =
  import.meta?.env?.VITE_SUPABASE_URL ??
  "https://xmjvykfyjeeptiwbkfbi.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta?.env?.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtanZ5a2Z5amVlcHRpd2JrZmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODg1MzcsImV4cCI6MjA2Nzg2NDUzN30.IV2ZrkBl4OpaZjhjkq1v0qG5lIdoxmsAbXbAAFAlMLM";

/** Toggle safe console logging with VITE_SUPABASE_DEBUG="true" */
const DEBUG = String(import.meta?.env?.VITE_SUPABASE_DEBUG || "").toLowerCase() === "true";

/** Mask helper for any optional debugging */
const mask = (s = "") => (s && s.length > 12 ? `${s.slice(0, 4)}…${s.slice(-4)}` : "unset");

/** HMR/iframe singleton key */
const G = globalThis;
const GLOBAL_KEY = "__snapcore_supabase__";

/** Minimal validation so we don’t start with blank creds by mistake */
function assertCreds() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "[supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY. Provide env vars or keep the fallbacks."
    );
  }
}

/** Create a single client instance */
function initClient() {
  assertCreds();

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "snapcore.sb.auth", // namespaced storage key
    },
    db: { schema: "public" },
    // You can tune fetch if you ever proxy through your backend:
    // global: { fetch: (url, opts) => fetch(url, { ...opts, credentials: "omit" }) },
  });

  if (DEBUG && !client.__logged) {
    console.info("[supabase] client initialised", {
      url: SUPABASE_URL,
      anonKey: mask(SUPABASE_ANON_KEY),
    });
    client.__logged = true; // avoid spam on HMR
  }

  return client;
}

/** Reuse an existing instance across HMR/iframes; otherwise create one */
export const supabase = (G[GLOBAL_KEY] ||= initClient());

/* -------------------------------------------------------------------------- */
/* Convenience helpers */
/* -------------------------------------------------------------------------- */

/** Get the current user (null if not signed in) */
export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data?.user ?? null;
}

/**
 * Subscribe to auth state changes.
 * @returns {() => void} unsubscribe function
 */
export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    try {
      callback?.(event, session);
    } catch (e) {
      if (DEBUG) console.warn("[supabase] onAuthChange handler error:", e);
    }
  });
  return () => data?.subscription?.unsubscribe?.();
}

/** Email + password sign-in */
export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Magic-link sign-in (email OTP/link) */
export async function signInWithMagicLink(email, redirectTo) {
  const fallback = typeof window !== "undefined"
    ? `${window.location.origin}/dashboard`
    : undefined;

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo || fallback },
  });
  if (error) throw error;
  return data;
}

/** Sign out current session */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Quick table helper:
 * supa("profiles").select("*")
 */
export const supa = (table) => supabase.from(table);
