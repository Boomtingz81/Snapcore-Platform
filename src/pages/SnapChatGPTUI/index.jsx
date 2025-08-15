// src/pages/ChatGPTUI.jsx

import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Bot, SendHorizonal, Lock } from "lucide-react";

export default function ChatGPTUI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tier] = useState("pro"); // Simulated tier access
  const chatRef = useRef(null);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput("");

    // Simulated AI response
    setTimeout(() => {
      const aiReply = {
        sender: "ai",
        text: `🤖 SnapTech reply to: "${userMessage.text}"`,
      };
      setMessages((prev) => [...prev, aiReply]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  if (!["pro", "garage", "owner"].includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">This tool is for Pro, Garage, and Owner tiers only.</p>
          <button
            onClick={() => (window.location.href = "/pricing")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Upgrade Now
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>ChatGPT UI – SnapCore Assistant</title>
        <meta name="description" content="Chat with SnapTech using a ChatGPT-style interface." />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <Bot className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
            <h1 className="text-3xl font-bold">ChatGPT UI Mode</h1>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div
              ref={chatRef}
              className="h-80 overflow-y-auto flex flex-col gap-3 mb-4 scroll-smooth pr-2"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg max-w-[75%] ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white self-end"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white self-start"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {loading && (
                <div className="text-sm text-gray-400">SnapTech is thinking...</div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                placeholder="Ask SnapTech anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                disabled={loading}
              />
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg"
              >
                <SendHorizonal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}
