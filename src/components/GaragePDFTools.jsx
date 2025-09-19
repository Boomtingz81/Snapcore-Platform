// src/components/GaragePDFTools.jsx

import React, { useMemo, useState } from "react";
import { FileText, Wrench, ClipboardList, PoundSterling } from "lucide-react";
import generateInvoicePDF from "./PDFInvoiceTemplate";
import generateFaultReportPDF from "./PDFFaultReportTemplate";
import generateChecklistPDF from "./PDFChecklistTemplate";
import generateQuotePDF from "./PDFQuoteTemplate";

/**
 * GaragePDFTools
 * - Small launcher for common garage PDFs (Invoice, Fault Report, Checklist, Quote)
 * - Accepts optional `data` so you can pass real job info
 * - Shows per-button loading + basic error handling
 */
export default function GaragePDFTools({ data, className = "" }) {
  // Default sample data (used when `data` prop not provided)
  const sampleData = useMemo(
    () => ({
      logo: "/logos/snapcore-header-logo.png",
      company: "SnapCore AI Garage",
      technician: "John Doe",
      customer: "Jane Smith",
      vehicle: "Audi A4 - 2020 - Diesel",
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

  // track which doc is generating
  const [busy, setBusy] = useState(null); // "invoice" | "fault" | "checklist" | "quote" | null

  const withBusy = async (key, fn) => {
    if (busy) return;
    setBusy(key);
    try {
      await Promise.resolve(fn());
    } catch (err) {
      console.error(`[PDF] ${key} failed:`, err);
      alert(`Sorry, failed to generate the ${key} PDF.\n\n${err?.message || err}`);
    } finally {
      setBusy(null);
    }
  };

  const baseBtn =
    "flex items-center gap-2 text-white font-medium px-5 py-3 rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div
      className={`flex flex-col md:flex-row flex-wrap gap-4 p-6 bg-black/80 rounded-xl shadow-lg ${className}`}
      role="group"
      aria-label="Garage PDF tools"
    >
      {/* Invoice */}
      <button
        type="button"
        aria-label="Generate Invoice"
        className={`${baseBtn} bg-red-600 hover:bg-red-700`}
        onClick={() => withBusy("invoice", () => generateInvoicePDF(payload))}
        disabled={busy !== null}
      >
        <FileText size={20} />
        {busy === "invoice" ? "Generating…" : "Generate Invoice"}
      </button>

      {/* Fault Report */}
      <button
        type="button"
        aria-label="Generate Fault Report"
        className={`${baseBtn} bg-blue-600 hover:bg-blue-700`}
        onClick={() => withBusy("fault", () => generateFaultReportPDF(payload))}
        disabled={busy !== null}
      >
        <Wrench size={20} />
        {busy === "fault" ? "Generating…" : "Fault Report"}
      </button>

      {/* Checklist */}
      <button
        type="button"
        aria-label="Generate Job Checklist"
        className={`${baseBtn} bg-green-600 hover:bg-green-700`}
        onClick={() => withBusy("checklist", () => generateChecklistPDF(payload))}
        disabled={busy !== null}
      >
        <ClipboardList size={20} />
        {busy === "checklist" ? "Generating…" : "Job Checklist"}
      </button>

      {/* Quote */}
      <button
        type="button"
        aria-label="Generate Job Quote"
        className={`${baseBtn} bg-purple-600 hover:bg-purple-700`}
        onClick={() => withBusy("quote", () => generateQuotePDF(payload))}
        disabled={busy !== null}
      >
        <PoundSterling size={20} />
        {busy === "quote" ? "Generating…" : "Generate Quote"}
      </button>
    </div>
  );
}
