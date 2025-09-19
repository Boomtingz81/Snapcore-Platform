// 📄 src/components/GaragePDFTools.jsx
import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { FileText, Wrench, ClipboardList, PoundSterling } from "lucide-react";

/**
 * GaragePDFTools
 * Launch common garage PDFs (Invoice, Fault Report, Checklist, Quote).
 * - Lazy-loads each generator with Vite's import.meta.glob() for robust paths
 * - Per-button loading; accessible status (aria-live)
 * - Optional callbacks: onDone(type), onError(type, err)
 */
export default function GaragePDFTools({ data, className = "", onDone, onError }) {
  // ---- Robust lazy imports (no fragile relative paths) --------------------
  // These look for files next to THIS component:
  // ./PDFInvoiceTemplate.(js|jsx|ts|tsx)
  // ./PDFFaultReportTemplate.(js|jsx|ts|tsx)
  // ./PDFChecklistTemplate.(js|jsx|ts|tsx)
  // ./PDFQuoteTemplate.(js|jsx|ts|tsx)
  const pdfLoaders = useMemo(
    () =>
      import.meta.glob("./PDF*Template.{js,jsx,ts,tsx}", {
        import: "default",
        eager: false,
      }),
    []
  );

  // Helper to resolve a nice key → loader function from the glob map.
  // (Matches files by suffix so filenames can be JS/TS/JSX/TSX without code changes.)
  const getLoader = (type) => {
    const want =
      type === "invoice"
        ? "PDFInvoiceTemplate"
        : type === "fault"
        ? "PDFFaultReportTemplate"
        : type === "checklist"
        ? "PDFChecklistTemplate"
        : type === "quote"
        ? "PDFQuoteTemplate"
        : null;

    if (!want) return null;

    const entry = Object.entries(pdfLoaders).find(([path]) =>
      path.endsWith(`/${want}.js`) ||
      path.endsWith(`/${want}.jsx`) ||
      path.endsWith(`/${want}.ts`) ||
      path.endsWith(`/${want}.tsx`)
    );

    return entry ? entry[1] : null; // loader function (() => import(...))
  };

  // ---- Default payload (used when `data` not provided) ---------------------
  const sampleData = useMemo(
    () => ({
      logo: "/logos/snapcore-header-logo.png",
      company: "SnapCore AI Garage",
      technician: "John Doe",
      customer: "Jane Smith",
      vehicle: "Audi A4 — 2020 — Diesel",
      reg: "AB12 CDE",
      vin: "WAUZ123456789",
      date: new Date().toLocaleDateString(),
      parts: [
        { name: "Oil Filter", cost: 15 },
        { name: "Air Filter", cost: 20 },
      ],
      labour: [
        { description: "Oil Change", cost: 50 },
        { description: "Inspection", cost: 30 },
      ],
    }),
    []
  );

  const payload = data || sampleData;

  // ---- UI state ------------------------------------------------------------
  const [busy, setBusy] = useState(null); // "invoice" | "fault" | "checklist" | "quote" | null
  const isLocked = busy !== null;

  async function run(type) {
    if (isLocked) return;
    setBusy(type);
    try {
      const load = getLoader(type);
      if (!load) throw new Error(`No PDF generator found for "${type}".`);

      const generate = await load(); // loads the module's default export
      await Promise.resolve(generate(payload));

      onDone?.(type);
    } catch (err) {
      console.error(`[PDF] ${type} failed:`, err);
      onError?.(type, err);
      if (!onError) {
        alert(
          `Sorry, the ${type} PDF couldn’t be generated.\n\n${
            err?.message || String(err)
          }`
        );
      }
    } finally {
      setBusy(null);
    }
  }

  const baseBtn =
    "flex items-center gap-2 text-white font-medium px-5 py-3 rounded-lg " +
    "transition will-change-transform hover:scale-105 " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div
      className={`flex flex-col md:flex-row flex-wrap gap-4 p-6 bg-black/80 rounded-xl shadow-lg ${className}`}
      role="group"
      aria-label="Garage PDF tools"
      aria-busy={isLocked}
    >
      {/* Screen-reader live area for current status */}
      <span className="sr-only" aria-live="polite">
        {busy ? `Generating ${busy} PDF…` : "Ready"}
      </span>

      <button
        type="button"
        aria-label="Generate invoice PDF"
        className={`${baseBtn} bg-red-600 hover:bg-red-700 focus-visible:ring-red-400`}
        onClick={() => run("invoice")}
        disabled={isLocked}
        title="Create a customer invoice PDF"
      >
        <FileText size={20} />
        {busy === "invoice" ? "Generating…" : "Generate Invoice"}
      </button>

      <button
        type="button"
        aria-label="Generate fault report PDF"
        className={`${baseBtn} bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-400`}
        onClick={() => run("fault")}
        disabled={isLocked}
        title="Create a diagnostic fault report PDF"
      >
        <Wrench size={20} />
        {busy === "fault" ? "Generating…" : "Fault Report"}
      </button>

      <button
        type="button"
        aria-label="Generate job checklist PDF"
        className={`${baseBtn} bg-green-600 hover:bg-green-700 focus-visible:ring-green-400`}
        onClick={() => run("checklist")}
        disabled={isLocked}
        title="Create a technician job checklist PDF"
      >
        <ClipboardList size={20} />
        {busy === "checklist" ? "Generating…" : "Job Checklist"}
      </button>

      <button
        type="button"
        aria-label="Generate quote PDF"
        className={`${baseBtn} bg-purple-600 hover:bg-purple-700 focus-visible:ring-purple-400`}
        onClick={() => run("quote")}
        disabled={isLocked}
        title="Create a customer quote PDF"
      >
        <PoundSterling size={20} />
        {busy === "quote" ? "Generating…" : "Generate Quote"}
      </button>
    </div>
  );
}

GaragePDFTools.propTypes = {
  data: PropTypes.object,
  className: PropTypes.string,
  onDone: PropTypes.func,
  onError: PropTypes.func,
};
