// ✅ File: /src/api/openaiClient.js

import OpenAI from "openai";
import { OPENAI_API_KEY, getAIModel, validateAPIKey } from "../config/openai";

// ✅ Initialize OpenAI client safely
const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // ✅ Use only for client-side apps (secure environments)
});

/**
 * ✅ Ask SnapTech AI and get a response
 * @param {string} tier - "lite" | "pro" | "garage" | "owner"
 * @param {Array} messages - Chat messages [{ role: "system" | "user" | "assistant", content: "text" }]
 * @returns {Promise<string>} AI-generated response text
 */
export async function askSnapTech(tier, messages) {
  if (!validateAPIKey()) {
    return "❌ OpenAI API Key is missing. Please configure your .env file.";
  }

  const model = getAIModel(tier);

  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
    });

    return response.choices?.[0]?.message?.content || "⚠️ No response from AI.";
  } catch (err) {
    console.error(`❌ Error using ${model}:`, err.message);

    // ✅ Fallback Logic: If gpt-4.1 fails, fallback to gpt-4o → gpt-4o-mini
    const fallback = model === "gpt-4.1" ? "gpt-4o" : "gpt-4o-mini";
    console.warn(`⚠️ Retrying with fallback model: ${fallback}`);

    try {
      const retry = await client.chat.completions.create({
        model: fallback,
        messages,
        temperature: 0.7,
      });

      return retry.choices?.[0]?.message?.content || "⚠️ Fallback returned no response.";
    } catch (err2) {
      console.error("🚨 Fallback also failed:", err2.message);
      return "⚠️ AI temporarily unavailable. Please try again later.";
    }
  }
}
