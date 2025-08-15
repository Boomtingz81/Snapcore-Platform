// src/pages/FAQ.jsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
const faqData = [
  {
    question: "What is SnapCore AI?",
    answer:
      "SnapCore AI is a cutting-edge diagnostic and automation platform for the automotive industry. It merges AI-guided repairs, fault scanning, service tools, and garage workflow features into one powerful system.",
  },
  {
    question: "Who is SnapTech?",
    answer:
      "SnapTech is your technician-style AI assistant built directly into SnapCore. It guides you through fault scans, part lookups, live repair steps, and system resets — like having an expert mechanic on demand.",
  },
  {
    question: "Can SnapCore work without OBD tools?",
    answer:
      "Yes. SnapCore supports both tool-free manual fault entry and live diagnostics via approved OBD tools like ThinkDiag 2. If no tool is connected, SnapTech runs in Manual Mode.",
  },
  {
    question: "Is SnapCore for garages or personal use?",
    answer:
      "Both. Individuals can use SnapCore Lite or Pro, while garages benefit from the Garage Dashboard, team licensing, and full repair data toolkits.",
  },
  {
    question: "Is the AI actually reliable?",
    answer:
      "SnapCore AI is trained on real-world fault data, repair history, TSBs, and predictive logic. SnapTech gives high-confidence answers, but human review is always advised before repairs.",
  },
  {
    question: "What works offline?",
    answer:
      "Offline mode includes your scan history, repair data packs, vehicle notes, and SnapTech prompts — perfect for use in low-signal environments or underground garages.",
  },
  {
    question: "Will SnapCore work on any car?",
    answer:
      "SnapCore supports most cars from 2000+, with best accuracy on EU/UK models. Support is always growing — and VIN or reg scans help detect your exact spec.",
  },
];
export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedAll, setExpandedAll] = useState(false);
  const [feedback, setFeedback] = useState({});
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  const toggleAll = () => {
    setExpandedAll(!expandedAll);
    setOpenIndex(expandedAll ? null : "all");
  };
  const handleHelpful = (index, value) => {
    setFeedback((prev) => ({ ...prev, [index]: value }));
  };
  const filteredFAQs = faqData.filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    window.scrollTo(0, 0);
    const hash = window.location.hash;
    if (hash.startsWith("#faq-")) {
      const index = parseInt(hash.replace("#faq-", ""));
      if (!isNaN(index)) {
        setOpenIndex(index);
        setTimeout(() => {
          const el = document.getElementById(`faq-${index}`);
          el?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }
  }, []);
  return (
    <>
      <Helmet>
        <title>FAQs – SnapCore AI</title>
        <meta
          name="description"
          content="Answers to the most common SnapCore AI and SnapTech assistant questions. Learn about features, tools, compatibility, and support."
        />
        <link rel="canonical" href="https://snapcore.ai/faq" />
        <meta property="og:title" content="FAQs – SnapCore AI" />
        <meta
          property="og:description"
          content="Everything you need to know about using SnapCore and SnapTech AI."
        />
        <meta property="og:url" content="https://snapcore.ai/faq" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen px-6 py-20 bg-white dark:bg-gray-900"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
              SnapCore FAQs
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Got questions? SnapTech has the answers. Here’s what users ask
              most.
            </p>
          </div>
          {/* Search + Expand Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <input
              type="text"
              placeholder="Search FAQs..."
              className="w-full sm:w-2/3 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={toggleAll}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {expandedAll ? "Collapse All" : "Expand All"}
            </button>
          </div>
          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => {
              const isOpen = openIndex === index || openIndex === "all";
              return (
                <div
                  key={index}
                  id={`faq-${index}`}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex justify-between items-center px-5 py-4 text-lg font-medium text-left text-gray-800 dark:text-white"
                    aria-expanded={isOpen}
                    aria-controls={`faq-content-${index}`}
                  >
                    {faq.question}
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                  {isOpen && (
                    <div
                      className="px-5 pb-5 text-gray-700 dark:text-gray-300"
                      id={`faq-content-${index}`}
                    >
                      <p className="mb-4">{faq.answer}</p>
                      {feedback[index] ? (
                        <p className="text-sm text-green-600">
                          {feedback[index] === "yes"
                            ? "✅ Thanks for the feedback!"
                            : "📝 Noted. We'll improve this."}
                        </p>
                      ) : (
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          Was this helpful?
                          <button
                            onClick={() => handleHelpful(index, "yes")}
                            className="hover:text-green-600"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => handleHelpful(index, "no")}
                            className="hover:text-red-600"
                          >
                            No
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredFAQs.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No FAQs matched your search.
              </p>
            )}
          </div>
          <div className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
            Still have questions?{" "}
            <a
              href="/contact"
              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700"
            >
              Contact SnapTech
            </a>
          </div>
        </div>
      </motion.section>
    </>
  );
}
