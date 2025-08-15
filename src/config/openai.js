// ✅ File: /src/config/openai.js

// ✅ Import Vite environment variables
export const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// ✅ Model preferences per user tier
export const MODELS = {
  lite: "gpt-4o-mini", // Fast + Cheap
  pro: "gpt-4o",       // Balanced performance
  garage: "gpt-4.1",   // Higher reasoning power
  owner: "gpt-4.1",    // Highest reasoning power
};

/**
 * ✅ Get the best model for a given tier, with fallback
 * @param {string} tier - lite | pro | garage | owner
 * @returns {string} - Model name to use
 */
export function getAIModel(tier) {
  if (!tier || !MODELS[tier]) {
    console.warn(`⚠️ Unknown tier "${tier}". Defaulting to gpt-4o-mini.`);
    return MODELS.lite;
  }
  return MODELS[tier];
}

/**
 * ✅ Check if API Key is set
 * Logs error in dev if missing
 */
export function validateAPIKey() {
  if (!OPENAI_API_KEY) {
    console.error(
      "❌ Missing OpenAI API key! Add it in your .env file as VITE_OPENAI_API_KEY"
    );
    return false;
  }
  return true;
}