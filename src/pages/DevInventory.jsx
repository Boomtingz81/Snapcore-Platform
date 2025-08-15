// 📂 FILE: src/pages/DevInventory.jsx
import { useEffect, useMemo, useState, useCallback } from "react";

// Gates: dev-only unless explicitly enabled via VITE_DEV_DASH_ENABLED
// Optional pass key (prompt or ?key=): VITE_DEV_DASH_KEY
const DEV_MODE = import.meta.env.MODE === "development";
const ALLOW_IN_PROD = import.meta.env.VITE_DEV_DASH_ENABLED === "true";
const PASS_KEY = import.meta.env.VITE_DEV_DASH_KEY || "";
const INVENTORY_URL = "/dev-inventory.json";

export default function DevInventory() {
  const [ok, setOk] = useState(false);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState({
    warnings: false,
    routes: false,
    pages: false,
    components: false,
  });

  const gate = useMemo(() => DEV_MODE || ALLOW_IN_PROD, []);

  // Pass check (URL ?key= or prompt); cached in session
  useEffect(() => {
    if (!gate) return;
    const urlKey = new URLSearchParams(location.search).get("key");
    const cached = sessionStorage.getItem("dev_dash_ok") === "1";
    if (cached) {
      setOk(true);
      return;
    }
    if (PASS_KEY) {
      if (urlKey && urlKey === PASS_KEY) {
        sessionStorage.setItem("dev_dash_ok", "1");
        setOk(true);
        return;
      }
      const input = window.prompt("Enter dev dash key:");
      if (input !== PASS_KEY) {
        setOk(false);
        return;
      }
      sessionStorage.setItem("dev_dash_ok", "1");
    }
    setOk(true);
  }, [gate]);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${INVENTORY_URL}?_=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setPayload(json || null);
    } catch (e) {
      setPayload(null);
      setErr(
        "Failed to load dev-inventory.json. Run `npm run inventory` to generate public/dev-inventory.json."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!gate || !ok) return;
    fetchInventory();
  }, [gate, ok, fetchInventory]);

  if (!gate || !ok) return null;

  const totals = payload?.totals || { pages: 0, components: 0, routes: 0, sizeKB: 0 };
  const warnings = payload?.warnings || {};
  const routes = payload?.routes || [];
  const pages = payload?.pages || [];
  const components = payload?.components || [];

  const q = query.trim().toLowerCase();
  const match = (s) => (q ? String(s).toLowerCase().includes(q) : true);

  const filteredRoutes = routes.filter((r) => match(r.path) || match(r.element) || match(r.file));
  const filteredPages = pages.filter((p) => match(p.file));
  const filteredComponents = components.filter((c) => match(c.file));

  const formatKB = (kb = 0) => (kb >= 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb} KB`);
  const toggle = (key) => setCollapsed((s) => ({ ...s, [key]: !s[key] }));

  const copyJSON = async (obj, label = "JSON") => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
      alert(`${label} copied to clipboard`);
    } catch {
      alert("Clipboard copy failed");
    }
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(payload || {}, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `dev-inventory-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <main className="min-h-screen px-4 md:px-6 py-8 bg-black text-gray-200">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dev Inventory</h1>
            <p className="text-xs text-gray-400">
              Generated snapshot of pages, components and inferred routes. Private & dev-only.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, components, routes…"
              className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm outline-none focus:border-cyan-400"
            />
            <div className="flex gap-2">
              <button
                onClick={fetchInventory}
                className="bg-white/10 hover:bg-white/15 border border-white/10 rounded px-3 py-2 text-sm"
              >
                Refresh
              </button>
              <button
                onClick={downloadJSON}
                className="bg-cyan-600 hover:bg-cyan-700 rounded px-3 py-2 text-sm"
              >
                Download JSON
              </button>
            </div>
          </div>
        </header>

        {loading && <Skeleton />}
        {!!err && (
          <div className="mb-6 bg-red-900/30 border border-red-800 rounded p-3 text-sm text-red-200">
            {err}
          </div>
        )}

        {!payload && !loading && !err && (
          <p className="text-sm text-gray-400">
            No inventory available. Run <code>npm run inventory</code> to generate{" "}
            <code>public/dev-inventory.json</code>.
          </p>
        )}

        {!!payload && (
          <>
            <section className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Pages" value={totals.pages} />
              <Stat label="Components" value={totals.components} />
              <Stat label="Routes" value={totals.routes} />
              <Stat label="Size" value={formatKB(totals.sizeKB)} />
            </section>

            <Block
              title="Warnings"
              collapsed={collapsed.warnings}
              onToggle={() => toggle("warnings")}
              actions={
                <button
                  onClick={() => copyJSON(warnings, "Warnings JSON")}
                  className="text-xs bg-white/10 border border-white/10 px-2 py-1 rounded"
                >
                  Copy JSON
                </button>
              }
            >
              {!warnings?.duplicatePages?.length &&
              !warnings?.duplicateComponents?.length &&
              !warnings?.missingRoutes?.length ? (
                <p className="text-green-400 text-sm">No warnings 🎉</p>
              ) : (
                <div className="space-y-4 text-sm">
                  {!!warnings?.duplicatePages?.length && (
                    <Warn title="Duplicate Pages" items={warnings.duplicatePages} />
                  )}
                  {!!warnings?.duplicateComponents?.length && (
                    <Warn title="Duplicate Components" items={warnings.duplicateComponents} />
                  )}
                  {!!warnings?.missingRoutes?.length && (
                    <List title="Pages Missing Routes" items={warnings.missingRoutes} />
                  )}
                </div>
              )}
            </Block>

            <Block
              title={`Routes (${filteredRoutes.length}/${routes.length})`}
              collapsed={collapsed.routes}
              onToggle={() => toggle("routes")}
              actions={
                <button
                  onClick={() => copyJSON(filteredRoutes, "Routes JSON")}
                  className="text-xs bg-white/10 border border-white/10 px-2 py-1 rounded"
                >
                  Copy JSON
                </button>
              }
            >
              <pre className="bg-gray-900 p-3 rounded overflow-auto text-xs">
                {JSON.stringify(filteredRoutes, null, 2)}
              </pre>
            </Block>

            <Block
              title={`Pages (${filteredPages.length}/${pages.length})`}
              collapsed={collapsed.pages}
              onToggle={() => toggle("pages")}
              actions={
                <button
                  onClick={() => copyJSON(filteredPages, "Pages JSON")}
                  className="text-xs bg-white/10 border border-white/10 px-2 py-1 rounded"
                >
                  Copy JSON
                </button>
              }
            >
              <pre className="bg-gray-900 p-3 rounded overflow-auto text-xs">
                {JSON.stringify(filteredPages, null, 2)}
              </pre>
            </Block>

            <Block
              title={`Components (${filteredComponents.length}/${components.length})`}
              collapsed={collapsed.components}
              onToggle={() => toggle("components")}
              actions={
                <button
                  onClick={() => copyJSON(filteredComponents, "Components JSON")}
                  className="text-xs bg-white/10 border border-white/10 px-2 py-1 rounded"
                >
                  Copy JSON
                </button>
              }
            >
              <pre className="bg-gray-900 p-3 rounded overflow-auto text-xs">
                {JSON.stringify(filteredComponents, null, 2)}
              </pre>
            </Block>
          </>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded p-3">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function Block({ title, children, collapsed, onToggle, actions }) {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onToggle}
          className="text-left text-lg font-semibold hover:text-cyan-300 transition"
          aria-expanded={!collapsed}
        >
          {collapsed ? "▸" : "▾"} {title}
        </button>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      {!collapsed && children}
    </section>
  );
}

function Warn({ title, items }) {
  return (
    <div>
      <h3 className="font-semibold text-red-400 mb-1">{title}</h3>
      <ul className="list-disc pl-5 space-y-1">
        {items.map((it, i) => (
          <li key={i}>
            <span className="text-gray-300">{it.base}</span>
            <div className="text-xs text-gray-400">
              {it.files.map((f) => (
                <div key={f}>{f}</div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function List({ title, items }) {
  return (
    <div>
      <h3 className="font-semibold text-yellow-400 mb-1">{title}</h3>
      <ul className="list-disc pl-5 space-y-1">
        {items.map((f) => (
          <li key={f} className="text-gray-300">
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3 mb-6">
      <div className="h-6 bg-white/5 rounded w-1/3" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="h-16 bg-white/5 rounded" />
        <div className="h-16 bg-white/5 rounded" />
        <div className="h-16 bg-white/5 rounded" />
        <div className="h-16 bg-white/5 rounded" />
      </div>
      <div className="h-40 bg-white/5 rounded" />
    </div>
  );
}
