import { create } from "zustand";
import { CURRICULUM, flattenDays, getWeek, getDay, DOMAIN_LABELS } from "../curriculum/index.js";

const api = window.api;

// Today's date as ISO yyyy-mm-dd (local).
export function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export const useStore = create((set, get) => ({
  // ── App-level ──
  ready: false,
  onboarded: false,
  userName: "",
  apiKeyStatus: "unknown", // "ok" | "missing" | "error" | "unknown"

  // ── Data ──
  topics: [], // rows from topics table
  goals: [],
  streaks: [],

  curriculum: CURRICULUM,
  domainLabels: DOMAIN_LABELS,

  // ── Bootstrap: load everything from DB ──
  async init() {
    const name = await api.configGet("user_name");
    const onboarded = (await api.configGet("onboarded")) === "true";
    await get().refreshTopics();
    await get().refreshGoals();
    await get().refreshStreaks();
    await get().refreshSaveInfo();
    await get().checkApiKey();
    set({ ready: true, onboarded, userName: name || "" });
  },

  async checkApiKey() {
    const key = await api.configGet("ANTHROPIC_API_KEY");
    set({ apiKeyStatus: key ? "ok" : "missing" });
    return !!key;
  },

  async refreshTopics() {
    const topics = await api.dbQuery("SELECT * FROM topics ORDER BY phase, week, day", []);
    set({ topics });
  },

  async refreshGoals() {
    const goals = await api.dbQuery("SELECT * FROM goals ORDER BY completed, target_date", []);
    set({ goals });
  },

  async refreshStreaks() {
    const streaks = await api.dbQuery("SELECT * FROM streaks ORDER BY date", []);
    set({ streaks });
  },

  // ── Topic helpers ──
  topicById(id) {
    return get().topics.find((t) => t.id === id);
  },

  // The current topic = first available or in_progress topic in order.
  currentTopic() {
    const topics = get().topics;
    return (
      topics.find((t) => t.status === "in_progress") ||
      topics.find((t) => t.status === "available") ||
      topics[topics.length - 1]
    );
  },

  // The current week object (for the weekly project).
  currentWeekMeta() {
    const t = get().currentTopic();
    if (!t) return null;
    const phase = CURRICULUM.find((p) => p.phase === t.phase);
    const week = phase?.weeks.find((w) => w.week === t.week);
    return phase && week ? { phase, week } : null;
  },

  // ── Mark lesson read / session ──
  async logSession(topicId, durationSecs, notes, completed = 1) {
    await api.dbRun(
      "INSERT INTO sessions (topic_id, date, duration_secs, completed, notes) VALUES (?, ?, ?, ?, ?)",
      [topicId, todayISO(), durationSecs, completed, notes || ""]
    );
    await api.dbRun(
      "INSERT INTO streaks (date, studied, quiz_done) VALUES (?, 1, 0) ON CONFLICT(date) DO UPDATE SET studied = 1",
      [todayISO()]
    );
    await api.dbRun("UPDATE topics SET status = 'in_progress', last_visited = ? WHERE id = ? AND status = 'available'", [
      new Date().toISOString(),
      topicId,
    ]);
    await get().refreshTopics();
    await get().refreshStreaks();
  },

  // ── Quiz completion: update mastery + unlock next ──
  async recordQuiz(topicId, questions, score, aiFeedback) {
    await api.dbRun(
      "INSERT INTO quiz_attempts (topic_id, date, questions_json, score, ai_feedback) VALUES (?, ?, ?, ?, ?)",
      [topicId, new Date().toISOString(), JSON.stringify(questions), score, aiFeedback || ""]
    );
    await api.dbRun(
      "INSERT INTO streaks (date, studied, quiz_done) VALUES (?, 1, 1) ON CONFLICT(date) DO UPDATE SET quiz_done = 1, studied = 1",
      [todayISO()]
    );

    // Mastery = average of last 2 attempts on this topic.
    const attempts = await api.dbQuery(
      "SELECT score FROM quiz_attempts WHERE topic_id = ? ORDER BY id DESC LIMIT 2",
      [topicId]
    );
    const mastery = Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length);

    if (score >= 60) {
      await api.dbRun("UPDATE topics SET status = 'completed', mastery_score = ? WHERE id = ?", [mastery, topicId]);
      await get().unlockNext(topicId);
    } else {
      await api.dbRun("UPDATE topics SET mastery_score = ? WHERE id = ?", [mastery, topicId]);
    }
    await get().refreshTopics();
    await get().refreshStreaks();
    return { mastery, passed: score >= 60 };
  },

  // Unlock the next topic in curriculum order.
  async unlockNext(topicId) {
    const all = flattenDays();
    const idx = all.findIndex((d) => d.id === topicId);
    if (idx === -1 || idx + 1 >= all.length) return;
    const nextId = all[idx + 1].id;
    await api.dbRun("UPDATE topics SET status = 'available' WHERE id = ? AND status = 'locked'", [nextId]);
  },

  // ── Goals ──
  async addGoal(text, targetDate) {
    await api.dbRun("INSERT INTO goals (created_at, text, target_date, completed) VALUES (?, ?, ?, 0)", [
      new Date().toISOString(),
      text,
      targetDate || "",
    ]);
    await get().refreshGoals();
  },
  async toggleGoal(id, completed) {
    await api.dbRun("UPDATE goals SET completed = ? WHERE id = ?", [completed ? 1 : 0, id]);
    await get().refreshGoals();
  },
  async deleteGoal(id) {
    await api.dbRun("DELETE FROM goals WHERE id = ?", [id]);
    await get().refreshGoals();
  },

  // ── Onboarding completion ──
  async completeOnboarding(name) {
    await api.configSet("user_name", name);
    await api.configSet("onboarded", "true");
    set({ onboarded: true, userName: name });
    // Persist the new profile to the linked save file right away.
    await api.saveSync();
  },

  // ── Portable save file ──
  saveInfo: null,

  async refreshSaveInfo() {
    const info = await api.saveInfo();
    set({ saveInfo: info });
    return info;
  },

  // Reload all in-memory state from the DB. Used after restoring a save file.
  async reloadAll() {
    const name = await api.configGet("user_name");
    const onboarded = (await api.configGet("onboarded")) === "true";
    await get().refreshTopics();
    await get().refreshGoals();
    await get().refreshStreaks();
    await get().refreshSaveInfo();
    set({ onboarded, userName: name || "" });
  },

  // Write current progress to the linked save file right now.
  async syncSave() {
    await api.saveSync();
    return get().refreshSaveInfo();
  },

  // Export a standalone copy (does not change the linked file).
  async exportSaveAs() {
    return api.saveExportAs();
  },

  // Link a save file: mode "open" loads an existing file, "saveAs" creates one.
  async linkSave(mode) {
    const r = await api.saveLink(mode);
    if (r.ok && r.loaded) await get().reloadAll();
    else await get().refreshSaveInfo();
    return r;
  },

  // Import/restore progress from a save file, then refresh everything.
  async importSave(filePath) {
    const r = await api.saveImport(filePath);
    if (r.ok) await get().reloadAll();
    return r;
  },
}));

export { getWeek, getDay, flattenDays };
