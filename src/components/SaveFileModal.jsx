import { useEffect, useState } from "react";
import {
  X,
  Save,
  FolderOpen,
  Download,
  Upload,
  FolderSearch,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useStore } from "../store/useStore.js";

function fmtTime(iso) {
  if (!iso) return "never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "unknown";
  return d.toLocaleString();
}

function fmtSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

// Manages the user's portable progress save file: where it lives, saving now,
// exporting a copy, switching to another file, and restoring from one.
export default function SaveFileModal({ onClose }) {
  const saveInfo = useStore((s) => s.saveInfo);
  const refreshSaveInfo = useStore((s) => s.refreshSaveInfo);
  const syncSave = useStore((s) => s.syncSave);
  const exportSaveAs = useStore((s) => s.exportSaveAs);
  const linkSave = useStore((s) => s.linkSave);
  const importSave = useStore((s) => s.importSave);

  const [busy, setBusy] = useState(null); // which action is running
  const [msg, setMsg] = useState(null); // { kind: "ok"|"err", text }
  const [confirm, setConfirm] = useState(null); // { action, label }

  useEffect(() => {
    refreshSaveInfo();
  }, [refreshSaveInfo]);

  async function withBusy(key, fn) {
    setBusy(key);
    setMsg(null);
    try {
      return await fn();
    } catch (err) {
      setMsg({ kind: "err", text: err?.message || "Something went wrong." });
      return null;
    } finally {
      setBusy(null);
    }
  }

  const reveal = () => window.api.saveReveal();

  async function doSaveNow() {
    await withBusy("sync", async () => {
      await syncSave();
      setMsg({ kind: "ok", text: "Progress saved to your file." });
    });
  }

  async function doExport() {
    await withBusy("export", async () => {
      const p = await exportSaveAs();
      if (p) setMsg({ kind: "ok", text: `Copy exported to ${p}` });
    });
  }

  async function doChangeLocation() {
    await withBusy("saveAs", async () => {
      const r = await linkSave("saveAs");
      if (r?.ok) setMsg({ kind: "ok", text: `Save file is now ${r.path}` });
    });
  }

  // Destructive actions go through a confirmation step.
  async function runConfirmed() {
    const c = confirm;
    setConfirm(null);
    if (!c) return;
    await withBusy(c.key, async () => {
      const r = await c.action();
      if (r?.canceled) return;
      if (r?.ok) setMsg({ kind: "ok", text: c.success });
      else if (r) setMsg({ kind: "err", text: r.error || "Failed." });
    });
  }

  const info = saveInfo || {};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div className="np-card w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Progress save file</h2>
          <button onClick={onClose} title="Close">
            <X size={16} color="var(--text-muted)" />
          </button>
        </div>
        <p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
          Your progress is mirrored to a single portable file you own. The app keeps it in
          sync automatically — copy it to back up or move your progress to another machine.
          Your API key is never stored in it.
        </p>

        {/* Current file panel */}
        <div
          className="mb-4 rounded-lg border p-3 text-xs"
          style={{ borderColor: "var(--border)", background: "var(--bg-base)" }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span style={{ color: "var(--text-muted)" }}>Linked file</span>
            <button
              className="flex items-center gap-1 hover:brightness-125"
              style={{ color: "var(--accent)" }}
              onClick={reveal}
              title="Reveal in file manager"
            >
              <FolderSearch size={13} /> Reveal
            </button>
          </div>
          <div className="font-code break-all" style={{ color: "var(--text-primary)" }}>
            {info.path || "…"}
            {info.isDefault && (
              <span className="ml-2" style={{ color: "var(--text-dim)" }}>
                (default location)
              </span>
            )}
          </div>
          <div className="mt-2 flex gap-4" style={{ color: "var(--text-muted)" }}>
            <span>Last saved: {fmtTime(info.lastSynced || info.modified)}</span>
            <span>Size: {fmtSize(info.size)}</span>
            <span>{info.exists ? "✓ on disk" : "not created yet"}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button className="np-btn np-btn-primary justify-start" disabled={busy} onClick={doSaveNow}>
            {busy === "sync" ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save now
          </button>
          <button className="np-btn np-btn-secondary justify-start" disabled={busy} onClick={doExport}>
            {busy === "export" ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            Export a copy…
          </button>
          <button className="np-btn np-btn-secondary justify-start" disabled={busy} onClick={doChangeLocation}>
            {busy === "saveAs" ? <Loader2 size={15} className="animate-spin" /> : <FolderOpen size={15} />}
            Change location…
          </button>
          <button
            className="np-btn np-btn-secondary justify-start"
            disabled={busy}
            onClick={() =>
              setConfirm({
                key: "open",
                label: "Open another save file",
                success: "Save file loaded — progress restored.",
                action: () => linkSave("open"),
              })
            }
          >
            {busy === "open" ? <Loader2 size={15} className="animate-spin" /> : <FolderOpen size={15} />}
            Open existing…
          </button>
          <button
            className="np-btn np-btn-secondary justify-start col-span-2"
            disabled={busy}
            onClick={() =>
              setConfirm({
                key: "import",
                label: "Import & restore from a file",
                success: "Progress restored from the imported file.",
                action: () => importSave(),
              })
            }
          >
            {busy === "import" ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            Import / Restore from a file…
          </button>
        </div>

        {/* Confirmation for destructive actions */}
        {confirm && (
          <div
            className="mt-4 rounded-lg border p-3 text-sm"
            style={{ borderColor: "var(--accent-orange)", background: "var(--bg-elevated)" }}
          >
            <div className="mb-2 flex items-center gap-2" style={{ color: "var(--accent-orange)" }}>
              <AlertTriangle size={15} />
              <span className="font-semibold">{confirm.label}</span>
            </div>
            <p className="mb-3" style={{ color: "var(--text-muted)" }}>
              This replaces your current in-app progress with the contents of the chosen file.
              Your current progress is saved to its file first, so you can switch back.
            </p>
            <div className="flex justify-end gap-2">
              <button className="np-btn np-btn-secondary" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button className="np-btn np-btn-primary" onClick={runConfirmed}>
                Continue
              </button>
            </div>
          </div>
        )}

        {msg && (
          <div
            className="mt-4 flex items-start gap-2 text-sm"
            style={{ color: msg.kind === "ok" ? "var(--accent-green)" : "var(--accent-red)" }}
          >
            {msg.kind === "ok" ? <Check size={15} /> : <AlertTriangle size={15} />}
            <span className="break-all">{msg.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
