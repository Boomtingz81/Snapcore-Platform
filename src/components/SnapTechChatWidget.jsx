// src/components/SnapTechChatWidget.jsx
import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, X, Bot, Loader2 } from "lucide-react";

export default function SnapTechChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi, I'm SnapTech. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const messagesEndRef = useRef(null);

  // ✅ Auto-scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Send message to backend
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/snaptech-chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        }
      );

      if (!res.ok) throw new Error("Server Error");

      const data = await res.json();
      const reply = data?.reply || "⚠️ No response received.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      speak(reply);
    } catch (err) {
      setErrorMsg("⚠️ Unable to reach SnapTech. Check your connection.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error: Unable to connect to AI." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Voice input
  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-GB";
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) =>
      setInput(event.results[0][0].transcript);

    recognition.start();
  };

  // ✅ Text-to-Speech
  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-GB";
    speechSynthesis.speak(utterance);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 p-4 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 focus:outline-none z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isOpen ? "Close SnapTech Chat" : "Open SnapTech Chat"}
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-6 w-80 bg-white dark:bg-gray-900 shadow-xl rounded-xl flex flex-col z-50 overflow-hidden border border-gray-300 dark:border-gray-700"
            role="dialog"
            aria-label="SnapTech Chat Widget"
          >
            {/* Header */}
            <div className="bg-red-600 text-white p-3 font-bold flex justify-between items-center">
              SnapTech Assistant
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Chat"
                className="hover:opacity-80"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 overflow-y-auto max-h-96 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg text-sm max-w-[85%] ${
                    msg.role === "assistant"
                      ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
                      : "bg-red-500 text-white self-end ml-auto"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Error Display */}
            {errorMsg && (
              <p className="text-xs text-red-500 px-3 py-1">{errorMsg}</p>
            )}

            {/* Input */}
            <div className="flex p-2 border-t border-gray-300 dark:border-gray-700">
              <button
                onClick={handleVoiceInput}
                className={`p-2 mr-2 rounded-lg ${
                  listening ? "bg-green-500 text-white" : "bg-gray-200"
                }`}
                aria-label="Voice Input"
              >
                <Mic size={18} />
              </button>

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask SnapTech..."
                className="flex-1 p-2 text-sm border rounded-lg focus:outline-none dark:bg-gray-800 dark:text-white"
                aria-label="Chat Input"
              />

              <button
                onClick={handleSend}
                disabled={loading}
                className="p-2 ml-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                aria-label="Send Message"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

SnapTechChatWidget.propTypes = {};
