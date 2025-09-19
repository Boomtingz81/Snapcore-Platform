// ✅ FILE: src/api/openaiClient.js
import OpenAI from "openai";

/* ──────────────────────────────────────────────────────────────
   Env + small helpers
   ────────────────────────────────────────────────────────────── */
const API_KEY    = (import.meta?.env?.VITE_OPENAI_API_KEY ?? "").trim();
const MODEL_ENV  = (import.meta?.env?.VITE_OPENAI_MODEL ?? "").trim();  // optional override
const USE_MOCK   = String(import.meta?.env?.VITE_MOCK ?? "").toLowerCase() === "true";

const mask = (s = "") => (s.length > 10 ? `${s.slice(0, 4)}…${s.slice(-4)}` : s || "unset");

/** Choose a sensible default model; env override wins. */
export function getAIModel(tier = "lite") {
  if (MODEL_ENV) return MODEL_ENV;
  switch ((tier || "").toLowerCase()) {
    case "owner":
    case "garage":
    case "pro":
      return "gpt-4o";
    default:
      return "gpt-4o-mini";
  }
}

/** True if we can call OpenAI (or mock mode is enabled). */
export function validateAPIKey() {
  return Boolean(API_KEY) || USE_MOCK;
}

/** Ensure a system prompt exists. */
function withSystem(messages = [], tier = "lite") {
  const hasSystem = messages?.some((m) => m?.role === "system");
  if (hasSystem) return messages;
  return [
    {
      role: "system",
      content:
        `You are SnapTech, an automotive diagnostic assistant. ` +
        `Be concise, practical, and avoid speculation. Tier: ${tier}.`,
    },
    ...(messages || []),
  ];
}

/** Normalize/trim messages to avoid odd shapes & overlong payloads. */
function normalizeMessages(messages = []) {
  const asList = Array.isArray(messages) ? messages : [messages];
  const normalized = asList
    .map((m) => ({
      role: m?.role === "assistant" || m?.role === "system" ? m.role : "user",
      content: typeof m?.content === "string" ? m.content : JSON.stringify(m?.content ?? ""),
    }))
    .filter((m) => m.content && m.content.trim().length > 0);

  // Hard cap (#msgs + size) to stay safe client-side
  const MAX_MSGS = 20;
  const MAX_CHARS = 8_000;
  const trimmed = normalized.slice(-MAX_MSGS);
  let total = 0;
  return trimmed.filter((m) => {
    total += m.content.length;
    return total <= MAX_CHARS;
  });
}

/* ──────────────────────────────────────────────────────────────
   OpenAI client (lazy singleton so import never explodes)
   ────────────────────────────────────────────────────────────── */
let _client = null;
let _clientErr = null;

function getClient() {
  if (_client || _clientErr) return { client: _client, error: _clientErr };

  if (!API_KEY) {
    _clientErr = new Error("Missing OpenAI API key (set VITE_OPENAI_API_KEY) or enable VITE_MOCK=true.");
    return { client: null, error: _clientErr };
  }

  try {
    _client = new OpenAI({
      apiKey: API_KEY,
      // ⚠️ Browser usage is okay for prototyping. In production, proxy via your backend.
      dangerouslyAllowBrowser: true,
    });

    // One-time, safe log
    // eslint-disable-next-line no-console
    console.info("[openai] client ready", { model: MODEL_ENV || "auto", key: mask(API_KEY) });
    return { client: _client, error: null };
  } catch (e) {
    _clientErr = e instanceof Error ? e : new Error(String(e));
    return { client: null, error: _clientErr };
  }
}

/* ──────────────────────────────────────────────────────────────
   Public API
   ────────────────────────────────────────────────────────────── */

/**
 * Ask SnapTech AI and get a reply string.
 * @param {"lite"|"pro"|"garage"|"owner"} tier
 * @param {Array<{role:"system"|"user"|"assistant",content:string}>} messages
 * @returns {Promise<string>} reply text (or a clear error string)
 */
export async function askSnapTech(tier = "lite", messages = []) {
  if (!validateAPIKey()) {
    return "❌ OpenAI API key missing. Set VITE_OPENAI_API_KEY or enable VITE_MOCK=true.";
  }

  // Mock path keeps UI working without a network call
  if (USE_MOCK) {
    const last = Array.isArray(messages) && messages.length ? messages[messages.length - 1].content : "";
    return (
      `🔧 [Mock] SnapTech suggestion for: "${last}".\n` +
      `• Check battery/grounds/fuses first\n` +
      `• Reproduce the symptom, read codes, re-scan\n` +
      `• Inspect connectors/wiring on the affected circuit\n` +
      `• Compare live data against spec; confirm with a known-good`
    );
  }

  const { client, error } = getClient();
  if (!client) {
    // Don’t throw; return a friendly message so UI never crashes
    return `❌ AI unavailable: ${error?.message || error || "Unknown error"}`;
  }

  const primaryModel = getAIModel(tier);
  const fallbackModel = primaryModel === "gpt-4o" ? "gpt-4o-mini" : "gpt-4o";
  const convo = withSystem(normalizeMessages(messages), tier);

  // Primary → fallback
  try {
    const res = await client.chat.completions.create({
      model: primaryModel,
      messages: convo,
      temperature: 0.3,
    });
    const text = res?.choices?.[0]?.message?.content?.trim();
    if (text) return text;
    // fallthrough to fallback
    // eslint-disable-next-line no-console
    console.warn(`[openai] Empty response from ${primaryModel}, attempting fallback…`);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`[openai] ${primaryModel} failed:`, e?.message || e);
  }

  try {
    const res2 = await client.chat.completions.create({
      model: fallbackModel,
      messages: convo,
      temperature: 0.3,
    });
    return res2?.choices?.[0]?.message?.content?.trim() || "⚠️ Fallback returned no response.";
  } catch (e2) {
    // eslint-disable-next-line no-console
    console.error(`[openai] Fallback (${fallbackModel}) failed:`, e2?.message || e2);
    return "⚠️ AI temporarily unavailable. Please try again later.";
  }
}

/**
 * Like askSnapTech but returns a structured result you can branch on without parsing text.
 * Won’t break any existing calls; it’s an optional helper.
 * @returns {Promise<{ok:true,text:string}|{ok:false,error:string}>}
 */
export async function askSnapTechSafe(tier = "lite", messages = []) {
  const reply = await askSnapTech(tier, messages);
  if (reply.startsWith("❌") || reply.startsWith("⚠️")) {
    return { ok: false, error: reply };
  }
  return { ok: true, text: reply };
}
