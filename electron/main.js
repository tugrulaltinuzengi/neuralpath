import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

import { initDb, getDb, seedTopics, query, run, configGet, configSet } from "./db.js";
import { testConnection, generateQuiz, gradeShortAnswer, reviewProject, normalizeQuiz } from "./claude.js";
import { generateNotebook } from "./notebookGenerator.js";
import {
  buildSnapshot,
  restoreSnapshot,
  writeSnapshotFile,
  readSnapshotFile,
} from "./saveFile.js";
import { CURRICULUM } from "../src/curriculum/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

let mainWindow = null;

// ── Window state persistence (Section 15) ──
function loadWindowState() {
  try {
    const raw = configGet("window_state");
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { width: 1400, height: 900 };
}

function saveWindowState() {
  if (!mainWindow) return;
  const b = mainWindow.getBounds();
  configSet("window_state", JSON.stringify({ width: b.width, height: b.height, x: b.x, y: b.y }));
}

function createWindow() {
  const state = loadWindowState();
  mainWindow = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: "#0d0f14",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
    // Forward renderer console messages to the main process stdout so they
    // appear in `npm run dev` output — critical for debugging blank screens.
    const LEVELS = ["VERBOSE", "INFO", "WARNING", "ERROR"];
    mainWindow.webContents.on("console-message", (_e, level, message, line, source) => {
      console.log(`[renderer ${LEVELS[level] || level}] ${source}:${line} ${message}`);
    });
    mainWindow.webContents.on("render-process-gone", (_e, details) => {
      console.error("[renderer crashed]", details);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("close", saveWindowState);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ── Config helpers stored in userData/config.json (for non-DB settings) ──
function configJsonPath() {
  return path.join(app.getPath("userData"), "config.json");
}
function readConfigJson() {
  try {
    return JSON.parse(fs.readFileSync(configJsonPath(), "utf-8"));
  } catch {
    return {};
  }
}
function writeConfigJson(obj) {
  fs.writeFileSync(configJsonPath(), JSON.stringify(obj, null, 2), "utf-8");
}

function getApiKey() {
  // Prefer DB config; fall back to config.json then env.
  return configGet("ANTHROPIC_API_KEY") || readConfigJson().ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || null;
}

// ── Quiz cache helpers ──
function cacheQuiz(topicId, questions) {
  run("INSERT INTO quiz_cache (topic_id, questions_json, created_at) VALUES (?, ?, ?)", [
    topicId,
    JSON.stringify(questions),
    new Date().toISOString(),
  ]);
  // Keep only the latest 3 per topic.
  const rows = query("SELECT id FROM quiz_cache WHERE topic_id = ? ORDER BY id DESC", [topicId]);
  if (rows.length > 3) {
    const toDelete = rows.slice(3).map((r) => r.id);
    for (const id of toDelete) run("DELETE FROM quiz_cache WHERE id = ?", [id]);
  }
}
function latestCachedQuiz(topicId) {
  const row = query("SELECT questions_json FROM quiz_cache WHERE topic_id = ? ORDER BY id DESC LIMIT 1", [topicId])[0];
  return row ? JSON.parse(row.questions_json) : null;
}

// ── Portable save file ──────────────────────────────────────────────
// The linked save-file path lives in config. On first run it defaults to a
// file in userData so progress is always mirrored somewhere the user can find.
function defaultSavePath() {
  return path.join(app.getPath("userData"), "neuralpath_save.json");
}
function linkedSavePath() {
  return configGet("save_file_path") || defaultSavePath();
}

// Write the current DB state to the linked save file.
function writeLinkedSave() {
  const snapshot = buildSnapshot(query, configGet);
  const out = writeLinkedSavePath(snapshot);
  return out;
}
function writeLinkedSavePath(snapshot) {
  const out = linkedSavePath();
  writeSnapshotFile(out, snapshot);
  configSet("save_last_synced", snapshot.saved_at);
  return out;
}

// Debounced auto-sync: any DB mutation schedules a write to the linked file a
// short time later, coalescing bursts of writes into one. This is what makes
// the separate save file stay "linked" to the app without manual saving.
let syncTimer = null;
function scheduleSync() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = null;
    try {
      writeLinkedSave();
    } catch (err) {
      console.error("[save sync failed]", err.message);
    }
  }, 1500);
}

function registerIpc() {
  // ── Database ──
  ipcMain.handle("db:query", (_e, sql, params) => query(sql, params || []));
  ipcMain.handle("db:run", (_e, sql, params) => {
    const result = run(sql, params || []);
    // Mirror any progress change to the linked save file (debounced).
    if (result.changes > 0) scheduleSync();
    return result;
  });

  // ── Config ──
  // For the API key we resolve through the same fallback chain getApiKey()
  // uses (DB → config.json → env) so the onboarding wizard can prefill the
  // input when the key was set out-of-band (e.g. via a recovery script).
  ipcMain.handle("config:get", (_e, key) => {
    if (key === "ANTHROPIC_API_KEY") return getApiKey();
    return configGet(key);
  });
  ipcMain.handle("config:set", (_e, key, value) => {
    configSet(key, value);
    // Mirror the API key into config.json as required by the spec.
    if (key === "ANTHROPIC_API_KEY") {
      const c = readConfigJson();
      c.ANTHROPIC_API_KEY = value;
      writeConfigJson(c);
    }
    return true;
  });

  // ── Claude ──
  ipcMain.handle("claude:test", async () => {
    try {
      const r = await testConnection(getApiKey());
      return { ok: true, ...r };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle("claude:quiz", async (_e, topicId, topicTitle, keyConcepts, quizPrompt) => {
    try {
      const data = await generateQuiz(getApiKey(), topicTitle, keyConcepts, quizPrompt);
      const questions = normalizeQuiz(data);
      if (questions.length === 0) throw new Error("Model returned no usable questions.");
      cacheQuiz(topicId, questions);
      return { ok: true, source: "ai", questions };
    } catch (err) {
      const cached = latestCachedQuiz(topicId);
      if (cached) return { ok: true, source: "cache", questions: normalizeQuiz(cached), warning: err.message };
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle("claude:gradeShort", async (_e, question, modelAnswer, rubric, userAnswer) => {
    try {
      const r = await gradeShortAnswer(getApiKey(), question, modelAnswer, rubric, userAnswer);
      return { ok: true, ...r };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle("claude:reviewProject", async (_e, projectSpec, userCode, selfNotes) => {
    try {
      const r = await reviewProject(getApiKey(), projectSpec, userCode, selfNotes);
      return { ok: true, ...r };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  // ── Python bridge ──
  ipcMain.handle("python:run", async (_e, scriptPath, args) => {
    const runnerPath = app.isPackaged
      ? path.join(process.resourcesPath, "python", "runner.py")
      : path.join(__dirname, "../python/runner.py");
    const target = scriptPath || runnerPath;
    return new Promise((resolve) => {
      const pyCmd = process.platform === "win32" ? "python" : "python3";
      const child = spawn(pyCmd, [target, ...(args || [])]);
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (d) => (stdout += d.toString()));
      child.stderr.on("data", (d) => (stderr += d.toString()));
      child.on("error", (err) => resolve({ stdout, stderr: stderr + err.message, exitCode: -1 }));
      child.on("close", (code) => resolve({ stdout, stderr, exitCode: code }));
    });
  });

  // ── Filesystem ──
  ipcMain.handle("fs:readFile", (_e, filePath) => fs.readFileSync(filePath, "utf-8"));
  ipcMain.handle("fs:writeFile", (_e, filePath, content) => {
    fs.writeFileSync(filePath, content, "utf-8");
    return true;
  });
  ipcMain.handle("fs:openDialog", async (_e, opts) => {
    const res = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile"],
      filters: opts?.filters || [{ name: "Python", extensions: ["py"] }],
    });
    return res.canceled ? null : res.filePaths[0];
  });
  ipcMain.handle("fs:saveDialog", async (_e, opts) => {
    const res = await dialog.showSaveDialog(mainWindow, {
      defaultPath: opts?.defaultPath,
      filters: opts?.filters || [{ name: "All", extensions: ["*"] }],
    });
    return res.canceled ? null : res.filePath;
  });

  // ── Open external / editor ──
  ipcMain.handle("shell:openExternal", (_e, url) => shell.openExternal(url));
  ipcMain.handle("shell:openInEditor", (_e, dirPath) => {
    const target = dirPath || app.getPath("userData");
    const child = spawn("code", [target], { shell: true });
    child.on("error", () => shell.openPath(target));
    return true;
  });

  // ── PDF export (Section 5 / Portfolio) ──
  ipcMain.handle("export:pdf", async (_e, htmlContent, fileName) => {
    const pdfWin = new BrowserWindow({ show: false, webPreferences: { sandbox: true } });
    await pdfWin.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(htmlContent));
    const data = await pdfWin.webContents.printToPDF({ printBackground: true, pageSize: "A4" });
    pdfWin.destroy();
    const outPath = path.join(app.getPath("downloads"), fileName || `neuralpath_export_${Date.now()}.pdf`);
    fs.writeFileSync(outPath, data);
    return outPath;
  });

  // ── Colab: generate notebook ──
  ipcMain.handle("colab:generateNotebook", (_e, phaseNum, weekNum) => {
    const phase = CURRICULUM.find((p) => p.phase === phaseNum);
    const week = phase?.weeks.find((w) => w.week === weekNum);
    if (!week) throw new Error(`Week ${weekNum} not found`);
    return generateNotebook(phase, week);
  });

  ipcMain.handle("colab:saveNotebook", (_e, content, weekNum) => {
    const dir = path.join(app.getPath("userData"), "notebooks");
    fs.mkdirSync(dir, { recursive: true });
    const out = path.join(dir, `week_${weekNum}.ipynb`);
    fs.writeFileSync(out, content, "utf-8");
    return out;
  });

  // ── Colab: import results (Section 16.5) ──
  ipcMain.handle("colab:importResults", async (_e, filePath) => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const results = JSON.parse(raw);

    const required = ["week_id", "completed_at", "metrics"];
    for (const field of required) {
      if (!results[field]) throw new Error(`Missing field: ${field}`);
    }

    const metricNormalization = {
      val_accuracy: (v) => Math.round(v * 100),
      "mAP@50": (v) => Math.round(v * 100),
      val_iou: (v) => Math.round(v * 100),
      FID: (v) => Math.max(0, 100 - Math.round(v / 3)),
      val_loss: (v) => Math.max(0, 100 - Math.round(v * 20)),
      reward: (v) => Math.min(100, Math.round(v / 5)),
    };

    const normalize = metricNormalization[results.metrics.primary_metric_name];
    const score = normalize ? normalize(results.metrics.primary_metric_value) : 75;

    run(
      `INSERT OR REPLACE INTO projects
       (week_id, title, submitted_at, self_notes, score, status, ai_feedback)
       VALUES (?, ?, ?, ?, ?, 'graded', ?)`,
      [
        results.week_id,
        results.week_title,
        results.completed_at,
        results.self_notes || "",
        score,
        `Completed on Google Colab. Primary metric (${results.metrics.primary_metric_name}): ${results.metrics.primary_metric_value}. Secondary metrics: ${JSON.stringify(results.metrics.secondary_metrics)}`,
      ]
    );

    scheduleSync();
    return { score, metrics: results.metrics };
  });

  // ── Save file (portable progress) ──
  // Info about the currently linked save file.
  ipcMain.handle("save:info", () => {
    const p = linkedSavePath();
    let exists = false;
    let size = 0;
    let mtime = null;
    try {
      const st = fs.statSync(p);
      exists = true;
      size = st.size;
      mtime = st.mtime.toISOString();
    } catch {
      /* not created yet */
    }
    return {
      path: p,
      isDefault: !configGet("save_file_path"),
      exists,
      size,
      modified: mtime,
      lastSynced: configGet("save_last_synced"),
    };
  });

  // Force an immediate write of the current state to the linked file.
  ipcMain.handle("save:sync", () => {
    if (syncTimer) {
      clearTimeout(syncTimer);
      syncTimer = null;
    }
    return writeLinkedSave();
  });

  // Export a copy to a user-chosen path WITHOUT changing the linked file.
  ipcMain.handle("save:exportAs", async () => {
    const res = await dialog.showSaveDialog(mainWindow, {
      title: "Export progress save file",
      defaultPath: path.join(app.getPath("documents"), "neuralpath_save.json"),
      filters: [{ name: "NeuralPath Save", extensions: ["json"] }],
    });
    if (res.canceled || !res.filePath) return null;
    writeSnapshotFile(res.filePath, buildSnapshot(query, configGet));
    return res.filePath;
  });

  // Choose a file to use as the linked save going forward.
  // If the file exists it is loaded; otherwise the current state is written to it.
  ipcMain.handle("save:link", async (_e, mode) => {
    // mode: "open" (link to an existing file & load it) | "saveAs" (link a new file)
    if (mode === "open") {
      const res = await dialog.showOpenDialog(mainWindow, {
        title: "Open a NeuralPath save file",
        properties: ["openFile"],
        filters: [{ name: "NeuralPath Save", extensions: ["json"] }],
      });
      if (res.canceled || !res.filePaths[0]) return { ok: false, canceled: true };
      const filePath = res.filePaths[0];
      const snapshot = readSnapshotFile(filePath); // throws if invalid
      // Preserve current progress at its current path before switching away.
      try {
        writeLinkedSave();
      } catch {
        /* best effort */
      }
      restoreSnapshot(snapshot, getDb(), configSet);
      configSet("save_file_path", filePath);
      configSet("save_last_synced", new Date().toISOString());
      return { ok: true, path: filePath, loaded: true, savedAt: snapshot.saved_at };
    }
    // saveAs
    const res = await dialog.showSaveDialog(mainWindow, {
      title: "Choose where to keep your save file",
      defaultPath: path.join(app.getPath("documents"), "neuralpath_save.json"),
      filters: [{ name: "NeuralPath Save", extensions: ["json"] }],
    });
    if (res.canceled || !res.filePath) return { ok: false, canceled: true };
    configSet("save_file_path", res.filePath);
    const out = writeLinkedSave();
    return { ok: true, path: out, loaded: false };
  });

  // Import (restore) from a chosen file into the current linked save.
  ipcMain.handle("save:import", async (_e, filePath) => {
    let target = filePath;
    if (!target) {
      const res = await dialog.showOpenDialog(mainWindow, {
        title: "Import a NeuralPath save file",
        properties: ["openFile"],
        filters: [{ name: "NeuralPath Save", extensions: ["json"] }],
      });
      if (res.canceled || !res.filePaths[0]) return { ok: false, canceled: true };
      target = res.filePaths[0];
    }
    const snapshot = readSnapshotFile(target);
    // Back up the current linked file before overwriting it, so the user can
    // recover the pre-import progress.
    let backupPath = null;
    try {
      const cur = linkedSavePath();
      if (fs.existsSync(cur)) {
        backupPath = `${cur}.bak-${Date.now()}`;
        fs.copyFileSync(cur, backupPath);
      }
    } catch {
      /* best effort */
    }
    const info = restoreSnapshot(snapshot, getDb(), configSet);
    writeLinkedSave(); // keep the linked file consistent with restored state
    return { ok: true, backupPath, ...info };
  });

  // Reveal the linked save file in the OS file manager.
  ipcMain.handle("save:reveal", () => {
    const p = linkedSavePath();
    if (fs.existsSync(p)) shell.showItemInFolder(p);
    else shell.openPath(path.dirname(p));
    return true;
  });

  // ── App meta ──
  ipcMain.handle("app:paths", () => ({
    userData: app.getPath("userData"),
    downloads: app.getPath("downloads"),
    appRoot: app.isPackaged ? process.resourcesPath : path.join(__dirname, ".."),
  }));
}

app.whenReady().then(() => {
  initDb(app.getPath("userData"));
  seedTopics(CURRICULUM);
  registerIpc();

  // Make sure a linked save file exists so progress is always mirrored to a
  // file the user can find, copy, and back up from day one.
  try {
    if (!fs.existsSync(linkedSavePath())) writeLinkedSave();
  } catch (err) {
    console.error("[initial save write failed]", err.message);
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
