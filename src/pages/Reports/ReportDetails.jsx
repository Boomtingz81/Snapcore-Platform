import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const REPORTS_KEY = "snapcore_reports";

const safeParse = (t, fb) => {
  try { return JSON.parse(t); } catch { return fb; }
};

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const list = safeParse(localStorage.getItem(REPORTS_KEY), []);
    const found = list.find((r) => String(r?.id) === String(id));
    setReport(found || null);
  }, [id]);

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Report Not Found</h1>
        <Link to="/reports" className="text-cyan-400 hover:underline">
          Back to Reports
        </Link>
      </div>
    );
  }

  const dtcs = Array.isArray(report?.dtcs) ? report.dtcs : [];
  const readings = report?.readings && typeof report.readings === "object" ? report.readings : {};

  const copyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      alert("Copied.");
    } catch {}
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const namePlate = report?.vehicle?.plate ? `_${report.vehicle.plate}` : "";
    a.href = url;
    a.download = `snapcore_report${namePlate}_${report?.id || "report"}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const createdAt = useMemo(() => {
    try { return new Date(report.createdAt).toLocaleString(); } catch { return String(report.createdAt); }
  }, [report]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Report #{report?.id}</h1>
          <p className="text-sm text-gray-400">Created: {createdAt}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate(-1)} className="px-3 py-2 rounded-lg border border-white/10 bg-black/40 hover:bg-black/60 transition">Back</button>
          <button onClick={copyJSON} className="px-3 py-2 rounded-lg border border-white/10 bg-black/40 hover:bg-black/60 transition">Copy JSON</button>
          <button onClick={downloadJSON} className="px-3 py-2 rounded-lg border border-white/10 bg-black/40 hover:bg-black/60 transition">Download</button>
          <button onClick={() => window.print()} className="px-3 py-2 rounded-lg border border-white/10 bg-black/40 hover:bg-black/60 transition">Print</button>
        </div>
      </div>

      {/* DTCs */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Diagnostic Trouble Codes</h2>
        {dtcs.length === 0 ? (
          <div className="text-gray-400 text-sm">No DTCs reported.</div>
        ) : (
          <div className="overflow-auto rounded-xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-black/40">
                <tr>
                  <th className="text-left px-3 py-2 border-b border-white/10">Code</th>
                  <th className="text-left px-3 py-2 border-b border-white/10">Description</th>
                </tr>
              </thead>
              <tbody>
                {dtcs.map((d, i) => {
                  const code = typeof d === "string" ? d : d?.code || `#${i + 1}`;
                  const desc = typeof d === "string" ? "" : d?.description || "";
                  return (
                    <tr key={i} className="odd:bg-white/5">
                      <td className="px-3 py-2 font-medium">{code}</td>
                      <td className="px-3 py-2">{desc}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Readings */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Readings Snapshot</h2>
        {Object.keys(readings).length === 0 ? (
          <div className="text-gray-400 text-sm">No readings captured.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(readings).map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="text-xs text-gray-400">{k}</p>
                <p className="text-sm font-semibold break-all">
                  {typeof v === "object" ? JSON.stringify(v) : String(v)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Raw JSON */}
      <details className="rounded-xl border border-white/10 bg-black/30">
        <summary className="cursor-pointer px-4 py-3 font-semibold">Raw JSON</summary>
        <pre className="p-4 overflow-auto text-xs">{JSON.stringify(report, null, 2)}</pre>
      </details>
    </div>
  );
}
