// Standalone round-trip test for the portable save file logic.
// Uses the real saveFile.js module against a real (temp) better-sqlite3 DB.
import Database from "better-sqlite3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  buildSnapshot,
  restoreSnapshot,
  validateSnapshot,
  writeSnapshotFile,
  readSnapshotFile,
  SAVE_FORMAT,
} from "../electron/saveFile.js";

// Electron-as-node is a GUI-subsystem binary on Windows, so its stdout is not
// captured by the parent console. Mirror all output into a result file.
const LOG = path.join(os.tmpdir(), "np-savetest-result.txt");
const lines = [];
function log(s) {
  lines.push(s);
}
function flush(code) {
  fs.writeFileSync(LOG, lines.join("\n") + "\n", "utf-8");
  process.exit(code);
}

let pass = 0;
let fail = 0;
function check(name, cond) {
  if (cond) {
    pass++;
    log(`  PASS ${name}`);
  } else {
    fail++;
    log(`  FAIL ${name}`);
  }
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "np-savetest-"));
const dbPath = path.join(tmp, "test.db");
const savePath = path.join(tmp, "save.json");

const SCHEMA = `
CREATE TABLE config (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE topics (id TEXT PRIMARY KEY, phase INTEGER, week INTEGER, day INTEGER, title TEXT, domain TEXT, status TEXT DEFAULT 'locked', mastery_score INTEGER DEFAULT 0, last_visited TEXT);
CREATE TABLE sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, topic_id TEXT, date TEXT, duration_secs INTEGER, completed INTEGER DEFAULT 0, notes TEXT);
CREATE TABLE quiz_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, topic_id TEXT, date TEXT, questions_json TEXT, score INTEGER, ai_feedback TEXT);
CREATE TABLE projects (id INTEGER PRIMARY KEY AUTOINCREMENT, week_id TEXT, title TEXT, submitted_at TEXT, code_path TEXT, self_notes TEXT, ai_feedback TEXT, score INTEGER, status TEXT DEFAULT 'pending');
CREATE TABLE streaks (date TEXT PRIMARY KEY, studied INTEGER DEFAULT 0, quiz_done INTEGER DEFAULT 0);
CREATE TABLE goals (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT, text TEXT, target_date TEXT, completed INTEGER DEFAULT 0);
CREATE TABLE colab_checklist (week_id TEXT PRIMARY KEY, checked INTEGER DEFAULT 0);
`;

const db = new Database(dbPath);
db.exec(SCHEMA);

// Local query/config helpers matching db.js signatures.
const query = (sql, params = []) => db.prepare(sql).all(...params);
const configGet = (key) => {
  const r = db.prepare("SELECT value FROM config WHERE key = ?").get(key);
  return r ? r.value : null;
};
const configSet = (key, value) =>
  db
    .prepare("INSERT INTO config (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
    .run(key, value);

// ── Seed a realistic progress state ──
configSet("user_name", "Ada");
configSet("onboarded", "true");
configSet("ANTHROPIC_API_KEY", "sk-ant-SECRET-should-not-leak");
db.prepare("INSERT INTO topics (id,phase,week,day,title,domain,status,mastery_score) VALUES (?,?,?,?,?,?,?,?)")
  .run("p0_w1_d1", 0, 1, 1, "Linear Algebra", "foundations", "completed", 88);
db.prepare("INSERT INTO topics (id,phase,week,day,title,domain,status,mastery_score) VALUES (?,?,?,?,?,?,?,?)")
  .run("p0_w1_d2", 0, 1, 2, "SVD & PCA", "foundations", "available", 0);
db.prepare("INSERT INTO sessions (topic_id,date,duration_secs,completed,notes) VALUES (?,?,?,?,?)")
  .run("p0_w1_d1", "2026-05-29", 540, 1, "good stuff");
db.prepare("INSERT INTO quiz_attempts (topic_id,date,questions_json,score,ai_feedback) VALUES (?,?,?,?,?)")
  .run("p0_w1_d1", "2026-05-29T10:00:00Z", '[{"q":1}]', 88, "solid");
db.prepare("INSERT INTO streaks (date,studied,quiz_done) VALUES (?,?,?)").run("2026-05-29", 1, 1);
db.prepare("INSERT INTO goals (created_at,text,target_date,completed) VALUES (?,?,?,?)")
  .run("2026-05-01", "Finish Phase 0", "2026-06-30", 0);
db.prepare("INSERT INTO colab_checklist (week_id,checked) VALUES (?,?)").run("p3_w11", 1);

console.log("\n[1] Build snapshot");
const snap = buildSnapshot(query, configGet);
check("format tag correct", snap.format === SAVE_FORMAT);
check("user_name captured", snap.user_name === "Ada");
check("topics present (2)", snap.data.topics.length === 2);
check("sessions present (1)", snap.data.sessions.length === 1);
check("goals present (1)", snap.data.goals.length === 1);
check("colab_checklist present (1)", snap.data.colab_checklist.length === 1);
check("API KEY NOT in config", !("ANTHROPIC_API_KEY" in snap.config));
check("API KEY NOT anywhere in JSON", !JSON.stringify(snap).includes("SECRET"));

console.log("\n[2] Atomic write + read back");
writeSnapshotFile(savePath, snap);
check("file exists on disk", fs.existsSync(savePath));
check("no leftover .tmp file", !fs.existsSync(savePath + ".tmp"));
const readBack = readSnapshotFile(savePath);
check("read-back round-trips topics", readBack.data.topics.length === 2);

console.log("\n[3] Mutate DB, then restore from snapshot");
db.prepare("UPDATE topics SET status='locked', mastery_score=0 WHERE id=?").run("p0_w1_d1");
db.prepare("DELETE FROM goals").run();
db.prepare("DELETE FROM sessions").run();
configSet("user_name", "WRONG");
check("pre-restore: topic regressed", query("SELECT mastery_score FROM topics WHERE id=?", ["p0_w1_d1"])[0].mastery_score === 0);
check("pre-restore: goals empty", query("SELECT * FROM goals").length === 0);

restoreSnapshot(readBack, db, configSet);
check("post-restore: topic mastery back to 88", query("SELECT mastery_score FROM topics WHERE id=?", ["p0_w1_d1"])[0].mastery_score === 88);
check("post-restore: topic status completed", query("SELECT status FROM topics WHERE id=?", ["p0_w1_d1"])[0].status === "completed");
check("post-restore: goals restored (1)", query("SELECT * FROM goals").length === 1);
check("post-restore: sessions restored (1)", query("SELECT * FROM sessions").length === 1);
check("post-restore: user_name restored to Ada", configGet("user_name") === "Ada");
check("post-restore: API key UNTOUCHED (restore never writes it)", configGet("ANTHROPIC_API_KEY") === "sk-ant-SECRET-should-not-leak");

console.log("\n[4] Restore is transactional (bad row aborts cleanly)");
const before = query("SELECT * FROM topics").length;
const broken = JSON.parse(JSON.stringify(readBack));
// Duplicate an existing primary key -> the second INSERT hits a UNIQUE
// constraint and throws mid-transaction, which must roll the whole thing back.
broken.data.topics.push({ ...broken.data.topics[0] });
let threw = false;
try {
  restoreSnapshot(broken, db, configSet);
} catch {
  threw = true;
}
check("restore threw on bad data", threw);
check("DB unchanged after failed restore (rollback)", query("SELECT * FROM topics").length === before);
check("no 'BAD' row leaked", query("SELECT * FROM topics WHERE id='BAD'").length === 0);

console.log("\n[5] Validation rejects junk files");
function rejects(obj) {
  try {
    validateSnapshot(obj);
    return false;
  } catch {
    return true;
  }
}
check("rejects non-object", rejects(null));
check("rejects wrong format tag", rejects({ format: "something-else", version: 1, data: {} }));
check("rejects future version", rejects({ format: SAVE_FORMAT, version: 999, data: {} }));
check("accepts valid snapshot", !rejects(snap));

db.close();
fs.rmSync(tmp, { recursive: true, force: true });

log(`\n${fail === 0 ? "ALL PASS" : "FAILURES"} — ${pass} passed, ${fail} failed`);
flush(fail === 0 ? 0 : 1);
