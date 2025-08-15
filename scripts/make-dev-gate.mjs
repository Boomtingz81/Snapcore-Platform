// scripts/make-dev-gate.mjs
import crypto from "crypto";
import fs from "fs";
import path from "path";

const out = path.resolve("public/dev-gate.json");

const PASS = process.env.DEV_GATE_PASS; // e.g. a 6+ word passphrase
const PIN  = process.env.DEV_GATE_PIN || ""; // optional 6–8 digits

if (!PASS || PASS.length < 16) {
  console.error("DEV_GATE_PASS missing or too short (use a long passphrase).");
  process.exit(1);
}

function pbkdf2Hash(secret, saltB64, iters = 350000) {
  const salt = saltB64 ? Buffer.from(saltB64, "base64") : crypto.randomBytes(16);
  const dk = crypto.pbkdf2Sync(secret, salt, iters, 32, "sha256");
  return { saltB64: salt.toString("base64"), iters, hashB64: dk.toString("base64") };
}

const pass = pbkdf2Hash(PASS);
const pin  = PIN ? pbkdf2Hash(PIN) : null;

const payload = {
  version: 1,
  hint: "Private",
  iters: pass.iters,
  salt: pass.saltB64,
  hash: pass.hashB64,
  pinSalt: pin?.saltB64 || null,
  pinHash: pin?.hashB64 || null
};

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(payload, null, 2));
console.log(`✅ Wrote ${out}`);
console.log("⚠️ Do NOT commit your passphrase. Commit only dev-gate.json if you accept client-side risk.");
