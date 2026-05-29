// One-shot helper: write a new ANTHROPIC_API_KEY into the live userData store
// (DB config table + config.json) without going through the UI. Stop the dev
// server first so the DB lock is free.
//
// Usage:  node scripts/setApiKey.mjs <sk-ant-...>
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const key = process.argv[2];
if (!key || !key.startsWith("sk-ant-")) {
  console.error("Pass a key starting with sk-ant-…");
  process.exit(1);
}

// Electron's userData on Windows = %APPDATA%/<package.name>.
const userData = path.join(os.homedir(), "AppData", "Roaming", "neuralpath");
const dbPath = path.join(userData, "neuralpath.db");

const db = new Database(dbPath);
db.prepare(
  "INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
).run("ANTHROPIC_API_KEY", key);
db.close();

const cfgPath = path.join(userData, "config.json");
let cfg = {};
try {
  cfg = JSON.parse(fs.readFileSync(cfgPath, "utf-8"));
} catch {
  /* fresh */
}
cfg.ANTHROPIC_API_KEY = key;
fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), "utf-8");

console.log("wrote API key to:");
console.log("  ", dbPath, "(config row)");
console.log("  ", cfgPath);
