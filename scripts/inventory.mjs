// 📂 FILE: scripts/inventory.mjs
// Generates a developer inventory of all pages, components, and routes in the project.
// Output is written to /public/dev-inventory.json for hidden diagnostic use.

import fs from "fs";
import path from "path";
import url from "url";

// ------------------------
// ✅ Path Setup
// ------------------------
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "src");
const pagesDir = path.join(srcDir, "pages");
const componentsDir = path.join(srcDir, "components");
const appFile = path.join(srcDir, "App.jsx");
const outFile = path.join(root, "public", "dev-inventory.json"); // served via /dev-inventory.json

// File extensions to scan
const exts = [".jsx", ".tsx", ".js", ".ts"];

// ------------------------
// 📂 File System Helpers
// ------------------------
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(p));
    } else if (exts.includes(path.extname(entry.name))) {
      out.push(p);
    }
  }
  return out;
}

function toRel(p) {
  return p.replace(root + path.sep, "").replaceAll("\\", "/");
}

function getStats(file) {
  try {
    const s = fs.statSync(file);
    return { bytes: s.size, kb: +(s.size / 1024).toFixed(1) };
  } catch {
    return { bytes: 0, kb: 0 };
  }
}

function getBaseLower(p) {
  return path.parse(p).name.toLowerCase();
}

// ------------------------
// 📜 Route Parsing
// ------------------------
function parseRoutes(appJsx) {
  const text = fs.existsSync(appJsx) ? fs.readFileSync(appJsx, "utf8") : "";

  // Regex to capture: path="..." element={<Component .../>}
  const routeRegex =
    /<Route\s+path=["'`](.*?)["'`]\s+element={<\s*([A-Za-z0-9_]+)[^>]*>?\s*\/?>}\s*\/?>/g;

  // Regex to map imports: import Component from "./pages/..."
  const importRegex =
    /import\s+([A-Za-z0-9_{},\s*]+)\s+from\s+["'`](.*?)["'`];?/g;

  // Build map of component name → source file
  const importMap = new Map();
  let im;
  while ((im = importRegex.exec(text))) {
    const names = im[1];
    const spec = im[2];
    names
      .replace(/[{}]/g, " ")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((name) => importMap.set(name, spec));
  }

  // Extract route definitions
  const out = [];
  let m;
  while ((m = routeRegex.exec(text))) {
    const pathStr = m[1];
    const element = m[2];
    const fileGuess = importMap.get(element) || null;
    out.push({ path: pathStr, element, file: fileGuess });
  }
  return out;
}

// ------------------------
// ⚠️ Warnings & Checks
// ------------------------
function findDuplicates(files) {
  const map = new Map();
  for (const f of files) {
    const base = getBaseLower(f);
    if (!map.has(base)) map.set(base, []);
    map.get(base).push(f);
  }
  return [...map.entries()]
    .filter(([, arr]) => arr.length > 1)
    .map(([name, arr]) => ({ base: name, files: arr.map(toRel) }));
}

function findMissingRoutes(pageFiles, routes) {
  const routeElements = new Set(routes.map((r) => (r.element || "").toLowerCase()));
  return pageFiles
    .filter((f) => !routeElements.has(getBaseLower(f)))
    .map(toRel);
}

// ------------------------
// 🚀 Main Execution
// ------------------------
function main() {
  console.log("🔍 Scanning project for Dev Inventory...");

  const pages = walk(pagesDir);
  const components = walk(componentsDir);
  const routes = parseRoutes(appFile);

  const pagesInfo = pages.map((p) => ({ file: toRel(p), ...getStats(p) }));
  const componentsInfo = components.map((p) => ({ file: toRel(p), ...getStats(p) }));

  const duplicatePages = findDuplicates(pages);
  const duplicateComponents = findDuplicates(components);
  const missingRoutes = findMissingRoutes(pages, routes);

  const payload = {
    scannedAt: new Date().toISOString(),
    totals: {
      pages: pages.length,
      components: components.length,
      routes: routes.length,
      sizeKB: [...pages, ...components].reduce((sum, f) => sum + getStats(f).kb, 0),
    },
    routes,
    pages: pagesInfo,
    components: componentsInfo,
    warnings: {
      duplicatePages,
      duplicateComponents,
      missingRoutes,
    },
  };

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2));

  console.log(
    `✅ Dev Inventory generated → public/dev-inventory.json (${payload.totals.pages} pages, ${payload.totals.components} components)`
  );
}

main();
