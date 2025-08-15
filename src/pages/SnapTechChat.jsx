// ✅ File: /src/pages/SnapTechChat.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Send, Bot, User } from "lucide-react";
import { askSnapTech } from "../api/openaiClient";

export default function SnapTechChat() {
  const [tier] = useState(localStorage.getItem("user-tier") || "pro");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I’m SnapTech. Ask me about vehicle diagnostics, fault codes, or repairs!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const updatedMessages = [...messages, { role: "user", content: input }];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const aiResponse = await askSnapTech(tier, updatedMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error) {
      console.error("❌ SnapTech error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error connecting to SnapTech AI. Try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>SnapTech Chat – AI Vehicle Assistant</title>
        <meta
          name="description"
          content="Chat with SnapTech – your AI-powered vehicle diagnostic assistant."
        />
      </Helmet>

      <main className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* ✅ Header */}
        <header className="p-4 bg-blue-600 text-white text-center font-bold text-xl shadow">
          🔧 SnapTech AI Assistant
        </header>

        {/* ✅ Chat Window */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 p-4 overflow-y-auto max-w-3xl mx-auto w-full"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-start gap-2 max-w-[80%] p-3 rounded-xl ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow"
                }`}
              >
                {msg.role === "assistant" ? <Bot size={20} /> : <User size={20} />}
                <p>{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <p className="text-gray-500 text-center mt-2 animate-pulse">
              ⏳ SnapTech is thinking...
            </p>
          )}
        </motion.div>

        {/* ✅ Input Box */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask SnapTech about a fault code or repair..."
            className="flex-1 p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </main>
    </>
  );
}
