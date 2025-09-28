import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

const REPORTS_KEY = "snapcore_reports";
const LAST_ID_KEY = "snapcore_last_report_id";

const safeParse = (t, fb) => {
  try { return JSON.parse(t); } catch { return fb; }
};

const fmtWhen = (iso) => {
  try { return new Date(iso).toLocaleString(); } catch { return String(iso || "—"); }
};

export default function ReportsList() {
  const navigate = useNavigate();
  const [raw, setRaw] = useState([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ by: "createdAt", dir: "desc" });

  const load = useCallback(() => {
    if (typeof window === "undefined") return;
    const list = safeParse(localStorage.getItem(REPORTS_KEY), []);
    setRaw(Array.isArray(list) ? list : []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let rows = [...raw];
    if (term) {
      rows = rows.filter((r) => {
        const v = r?.vehicle || {};
        return (
          String(r?.id || "").toLowerCase().includes(term) ||
          String(v?.plate || "").toLowerCase().includes(term) ||
          String(v?.vin || "").toLowerCase().includes(term)
        );
      });
    }
    rows.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      const av = a?.[sort.by] || a?.meta?.[sort.by];
      const bv = b?.[sort.by] || b?.meta?.[sort.by];
      return av > bv ? dir : av < bv ? -dir : 0;
    });
    return rows;
  }, [raw, q, sort]);

  const markAsLast = (id) => {
    localStorage.setItem(LAST_ID_KEY, id);
    navigate("/reports/last");
  };

  const delOne = (id) => {
    if (!confirm("Delete this report?")) return;
    const next = raw.filter((r) => r?.id !== id);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(next));
    if (localStorage.getItem(LAST_ID_KEY) === id) {
      localStorage.removeItem(LAST_ID_KEY);
    }
    setRaw(next);
  };

  const clearAll = () => {
    if (!confirm("Delete ALL saved reports?")) return;
    localStorage.removeItem(REPORTS_KEY);
    localStorage.removeItem(LAST_ID_KEY);
    setRaw([]);
  };

  const download = (r) => {
    const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const namePlate = r?.vehicle?.plate ? `_${r.vehicle.plate}` : "";
    a.href = url;
    a.download = `snapcore_report${namePlate}_${r?.id || "report"}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const setSortBy = (by) =>
    setSort((s) => ({ by, dir: s.by === by && s.dir === "desc" ? "asc" : "desc" }));

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-gray-400">{raw.length} saved</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/scan"
            className="px-3 py-2 rounded-lg border border-white/10 bg-black/40 hover:bg-black/60 transition"
          >
            Go to Scan
          </Link>
          <button
            onClick={clearAll}
            className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by plate, VIN or ID…"
          className="w-full max-w-md px-3 py-2 rounded-lg border border-white/10 bg-black/30 outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-black/30 p-6">
          <p className="text-gray-400">No reports found.</p>
        </div>
      ) : (
        <div className="overflow-auto rounded-xl border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-black/40">
              <tr>
                <Th label="Created" sortKey="createdAt" sort={sort} onSort={setSortBy} />
                <Th label="Plate" sortKey="vehicle.plate" disabled />
                <Th label="VIN" sortKey="vehicle.vin" disabled />
                <Th label="DTCs" sortKey="dtcCount" disabled />
                <Th label="Source" sortKey="meta.source" disabled />
                <th className="text-left px-3 py-2 border-b border-white/10">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const v = r?.vehicle || {};
                const dtcCount = Array.isArray(r?.dtcs) ? r.dtcs.length : 0;
                return (
                  <tr key={r?.id} className="odd:bg-white/5">
                    <td className="px-3 py-2">{fmtWhen(r?.createdAt)}</td>
                    <td className="px-3 py-2">{v.plate || "—"}</td>
                    <td className="px-3 py-2">{v.vin || "—"}</td>
                    <td className="px-3 py-2">{dtcCount}</td>
                    <td className="px-3 py-2">{r?.meta?.source || "—"}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/reports/${encodeURIComponent(r?.id)}`}
                          className="px-2 py-1 rounded border border-white/10 hover:bg-white/10"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => markAsLast(r?.id)}
                          className="px-2 py-1 rounded border border-white/10 hover:bg-white/10"
                        >
                          Mark as Last
                        </button>
                        <button
                          onClick={() => download(r)}
                          className="px-2 py-1 rounded border border-white/10 hover:bg-white/10"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => delOne(r?.id)}
                          className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ label, sortKey, sort, onSort, disabled }) {
  const isActive = sort.by === sortKey;
  return (
    <th className="text-left px-3 py-2 border-b border-white/10 select-none">
      {disabled ? (
        <span className="text-gray-300">{label}</span>
      ) : (
        <button
          className={`inline-flex items-center gap-1 ${
            isActive ? "text-white" : "text-gray-300"
          }`}
          onClick={() => onSort(sortKey)}
          title="Sort"
        >
          {label}
          {isActive && <span className="text-xs opacity-70">({sort.dir})</span>}
        </button>
      )}
    </th>
  );
}
