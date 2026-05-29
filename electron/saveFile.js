// Portable progress "save file" (Section: user-owned progress export/import).
//
// The working copy of all progress lives in the SQLite DB inside Electron's
// userData folder. That file is opaque and tied to one machine. This module
// mirrors the progress into a single, human-readable JSON file the user owns:
// they can copy it, back it up, move it to another machine, or share it. The
// app keeps the linked file in sync automatically and can re-import it.
//
// SECURITY: the Anthropic API key is intentionally NOT included in the save
// file, so a user can move/share their progress without leaking their key.

import fs from "node:fs";
import path from "node:path";

export const SAVE_FORMAT = "neuralpath-save";
export const SAVE_VERSION = 1;

// Tables whose rows are part of the user's progress and get mirrored.
const PROGRESS_TABLES = [
  "topics",
  "sessions",
  "quiz_attempts",
  "projects",
  "streaks",
  "goals",
  "colab_checklist",
];

// Config keys that describe the user (safe to move between machines).
// Excludes ANTHROPIC_API_KEY and window_state by design.
const PORTABLE_CONFIG_KEYS = ["user_name", "onboarded", "goals_text", "target_date"];

// Build a full snapshot object from the current DB state.
// `query` is the parameterized SELECT helper from db.js.
export function buildSnapshot(query, configGet) {
  const data = {};
  for (const table of PROGRESS_TABLES) {
    data[table] = query(`SELECT * FROM ${table}`);
  }

  const config = {};
  for (const key of PORTABLE_CONFIG_KEYS) {
    const v = configGet(key);
    if (v !== null && v !== undefined) config[key] = v;
  }

  return {
    format: SAVE_FORMAT,
    version: SAVE_VERSION,
    saved_at: new Date().toISOString(),
    app: "NeuralPath",
    user_name: config.user_name || "",
    config,
    data,
  };
}

// Validate a parsed snapshot before trusting it. Throws on bad input.
export function validateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") {
    throw new Error("Save file is empty or not valid JSON.");
  }
  if (snapshot.format !== SAVE_FORMAT) {
    throw new Error("This file is not a NeuralPath save file.");
  }
  if (typeof snapshot.version !== "number" || snapshot.version > SAVE_VERSION) {
    throw new Error(
      `Save file version ${snapshot.version} is newer than this app supports (${SAVE_VERSION}). Update NeuralPath.`
    );
  }
  if (!snapshot.data || typeof snapshot.data !== "object") {
    throw new Error("Save file is missing its progress data.");
  }
  return true;
}

// Replace all progress in the DB with the snapshot's contents.
// Runs inside a single transaction so a failure leaves the DB untouched.
// `db` is the better-sqlite3 instance; `configSet` from db.js.
export function restoreSnapshot(snapshot, db, configSet) {
  validateSnapshot(snapshot);

  const apply = db.transaction(() => {
    for (const table of PROGRESS_TABLES) {
      const rows = snapshot.data[table];
      if (!Array.isArray(rows)) continue; // table absent in older saves — skip
      db.prepare(`DELETE FROM ${table}`).run();
      if (rows.length === 0) continue;

      // Derive columns from the first row; insert every row positionally.
      const cols = Object.keys(rows[0]);
      const placeholders = cols.map(() => "?").join(", ");
      const insert = db.prepare(
        `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`
      );
      for (const row of rows) {
        insert.run(...cols.map((c) => (row[c] === undefined ? null : row[c])));
      }
    }

    // Restore portable config (never the API key).
    if (snapshot.config && typeof snapshot.config === "object") {
      for (const key of PORTABLE_CONFIG_KEYS) {
        if (snapshot.config[key] !== undefined) {
          configSet(key, String(snapshot.config[key]));
        }
      }
    }
  });

  apply();
  return { tables: PROGRESS_TABLES.length, saved_at: snapshot.saved_at };
}

// Write a snapshot to disk atomically (write temp file, then rename) so an
// interrupted write can never corrupt the user's existing save.
export function writeSnapshotFile(filePath, snapshot) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(snapshot, null, 2), "utf-8");
  fs.renameSync(tmp, filePath);
  return filePath;
}

// Read and parse a snapshot from disk.
export function readSnapshotFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Save file is not valid JSON — it may be corrupted.");
  }
  validateSnapshot(parsed);
  return parsed;
}
