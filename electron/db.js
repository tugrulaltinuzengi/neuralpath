// SQLite initialization and query helpers (better-sqlite3, synchronous).
// All queries are parameterized — never interpolate user values into SQL.
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

let db = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS config (
  key   TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS topics (
  id            TEXT PRIMARY KEY,
  phase         INTEGER,
  week          INTEGER,
  day           INTEGER,
  title         TEXT,
  domain        TEXT,
  status        TEXT DEFAULT 'locked',
  mastery_score INTEGER DEFAULT 0,
  last_visited  TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id      TEXT,
  date          TEXT,
  duration_secs INTEGER,
  completed     INTEGER DEFAULT 0,
  notes         TEXT
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id       TEXT,
  date           TEXT,
  questions_json TEXT,
  score          INTEGER,
  ai_feedback    TEXT
);

CREATE TABLE IF NOT EXISTS projects (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  week_id       TEXT,
  title         TEXT,
  submitted_at  TEXT,
  code_path     TEXT,
  self_notes    TEXT,
  ai_feedback   TEXT,
  score         INTEGER,
  status        TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS streaks (
  date      TEXT PRIMARY KEY,
  studied   INTEGER DEFAULT 0,
  quiz_done INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS goals (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT,
  text        TEXT,
  target_date TEXT,
  completed   INTEGER DEFAULT 0
);

-- Cache of the last few generated quizzes per topic (offline fallback).
CREATE TABLE IF NOT EXISTS quiz_cache (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id       TEXT,
  questions_json TEXT,
  created_at     TEXT
);

-- Colab week checklist (Section 16.9).
CREATE TABLE IF NOT EXISTS colab_checklist (
  week_id   TEXT PRIMARY KEY,
  checked   INTEGER DEFAULT 0
);
`;

export function initDb(userDataPath) {
  const dbPath = path.join(userDataPath, "neuralpath.db");
  fs.mkdirSync(userDataPath, { recursive: true });
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);
  return db;
}

export function getDb() {
  if (!db) throw new Error("DB not initialized — call initDb first.");
  return db;
}

// Generic SELECT — returns rows.
export function query(sql, params = []) {
  return getDb()
    .prepare(sql)
    .all(...params);
}

// Generic INSERT/UPDATE/DELETE — returns metadata.
export function run(sql, params = []) {
  const info = getDb()
    .prepare(sql)
    .run(...params);
  return { changes: info.changes, lastInsertRowid: Number(info.lastInsertRowid) };
}

export function configGet(key) {
  const row = getDb().prepare("SELECT value FROM config WHERE key = ?").get(key);
  return row ? row.value : null;
}

export function configSet(key, value) {
  getDb()
    .prepare(
      "INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
    .run(key, value);
}

// Seed the topics table from the curriculum on first launch.
// Idempotent: existing rows are left untouched so progress is preserved.
export function seedTopics(curriculum) {
  const existing = getDb().prepare("SELECT COUNT(*) AS n FROM topics").get();
  if (existing.n > 0) return;

  const insert = getDb().prepare(
    `INSERT INTO topics (id, phase, week, day, title, domain, status, mastery_score)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`
  );

  const insertMany = getDb().transaction((rows) => {
    for (const r of rows) insert.run(r.id, r.phase, r.week, r.day, r.title, r.domain, r.status);
  });

  const rows = [];
  let first = true;
  for (const phase of curriculum) {
    for (const wk of phase.weeks) {
      for (const d of wk.days) {
        rows.push({
          id: `p${phase.phase}_w${wk.week}_d${d.day}`,
          phase: phase.phase,
          week: wk.week,
          day: d.day,
          title: d.title,
          domain: d.domain,
          // Only the very first topic is available at start; rest locked.
          status: first ? "available" : "locked",
        });
        first = false;
      }
    }
  }
  insertMany(rows);
}
