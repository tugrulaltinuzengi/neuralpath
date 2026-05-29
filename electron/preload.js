// Exposes a safe `window.api` to the renderer via contextBridge.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Database
  dbQuery: (sql, params) => ipcRenderer.invoke("db:query", sql, params),
  dbRun: (sql, params) => ipcRenderer.invoke("db:run", sql, params),

  // Config
  configGet: (key) => ipcRenderer.invoke("config:get", key),
  configSet: (key, value) => ipcRenderer.invoke("config:set", key, value),

  // Claude
  claudeTest: () => ipcRenderer.invoke("claude:test"),
  claudeQuiz: (topicId, topicTitle, keyConcepts, quizPrompt) =>
    ipcRenderer.invoke("claude:quiz", topicId, topicTitle, keyConcepts, quizPrompt),
  claudeGradeShort: (question, modelAnswer, rubric, userAnswer) =>
    ipcRenderer.invoke("claude:gradeShort", question, modelAnswer, rubric, userAnswer),
  claudeReviewProject: (spec, code, notes) =>
    ipcRenderer.invoke("claude:reviewProject", spec, code, notes),

  // Python
  pythonRun: (scriptPath, args) => ipcRenderer.invoke("python:run", scriptPath, args),

  // Filesystem
  readFile: (p) => ipcRenderer.invoke("fs:readFile", p),
  writeFile: (p, c) => ipcRenderer.invoke("fs:writeFile", p, c),
  openDialog: (opts) => ipcRenderer.invoke("fs:openDialog", opts),
  saveDialog: (opts) => ipcRenderer.invoke("fs:saveDialog", opts),

  // Shell
  openExternal: (url) => ipcRenderer.invoke("shell:openExternal", url),
  openInEditor: (dir) => ipcRenderer.invoke("shell:openInEditor", dir),

  // Export
  exportPdf: (html, fileName) => ipcRenderer.invoke("export:pdf", html, fileName),

  // Save file (portable progress)
  saveInfo: () => ipcRenderer.invoke("save:info"),
  saveSync: () => ipcRenderer.invoke("save:sync"),
  saveExportAs: () => ipcRenderer.invoke("save:exportAs"),
  saveLink: (mode) => ipcRenderer.invoke("save:link", mode),
  saveImport: (filePath) => ipcRenderer.invoke("save:import", filePath),
  saveReveal: () => ipcRenderer.invoke("save:reveal"),

  // Colab
  generateNotebook: (phase, week) => ipcRenderer.invoke("colab:generateNotebook", phase, week),
  saveNotebook: (content, week) => ipcRenderer.invoke("colab:saveNotebook", content, week),
  importResults: (filePath) => ipcRenderer.invoke("colab:importResults", filePath),

  // Meta
  appPaths: () => ipcRenderer.invoke("app:paths"),
});
