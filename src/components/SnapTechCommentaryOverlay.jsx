// 📁 src/components/SnapTechCommentaryOverlay.jsx

import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Bot, Mic, Volume2, VolumeX, X } from "lucide-react";

// ---------------- Local LLM or Mock ----------------
const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434/api/generate";
const MOCK_ENABLED = import.meta.env.VITE_MOCK === "true";

async function fetchCommentaryLocal(faultCode, context) {
  const prompt = `Explain the fault code ${faultCode} in ≤40 words. Context: ${context || "none"}.`;
  try {
    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt,
        stream: false,
        options: { temperature: 0.6 }
      })
    });
    if (!res.ok) throw new Error("Ollama unreachable");
    const data = await res.json();
    return data.response.trim();
  } catch (err) {
    return MOCK_ENABLED
      ? `Mock: ${faultCode} – rich mixture detected.`
      : "SnapTech offline.";
  }
}

// ---------------- TTS Helper ----------------
const speak = (text) => {
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1;
  utter.pitch = 1;
  utter.lang = "en-US";
  speechSynthesis.speak(utter);
};

// ---------------- Cache ----------------
const CACHE_KEY = "snaptech_cache_v1";

function getCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setCache(code, text) {
  const cache = getCache();
  cache[code] = text;
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

// ---------------- Component ----------------
export default function SnapTechCommentaryOverlay({ faultCode, context }) {
  const [commentary, setCommentary] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [show, setShow] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(
    () => localStorage.getItem("snaptech-voice") === "true"
  );

  useEffect(() => {
    if (!faultCode) return;

    (async () => {
      const cache = getCache();
      if (cache[faultCode]) {
        setCommentary(cache[faultCode]);
      } else {
        const text = await fetchCommentaryLocal(faultCode, context);
        setCommentary(text);
        setCache(faultCode, text);
      }
      if (voiceEnabled) speak(commentary);
    })();
  }, [faultCode, context, voiceEnabled]);

  const toggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    localStorage.setItem("snaptech-voice", next);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[320px] max-w-full bg-gray-100 dark:bg-gray-900 border dark:border-gray-700 shadow-xl rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-semibold">SnapTech Commentary</h2>
        </div>
        <button onClick={() => setShow(false)} aria-label="Close">
          <X className="w-4 h-4 text-gray-500 hover:text-red-600" />
        </button>
      </div>

      <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words">
        {commentary || "Loading diagnostic commentary…"}
      </p>

      <div className="flex justify-end items-center gap-3">
        <button onClick={toggleVoice} className="text-xs text-gray-600 dark:text-gray-300 hover:text-indigo-600">
          {voiceEnabled ? (
            <>
              <Volume2 className="w-4 h-4 inline-block mr-1" /> Voice On
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 inline-block mr-1" /> Voice Off
            </>
          )}
        </button>
        {isSpeaking && <Mic className="w-4 h-4 animate-pulse text-red-500" />}
      </div>
    </div>
  );
}

SnapTechCommentaryOverlay.propTypes = {
  faultCode: PropTypes.string.isRequired,
  context: PropTypes.string,
};
