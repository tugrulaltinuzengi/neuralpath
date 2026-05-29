import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  FolderGit2,
  BarChart3,
  Award,
  Cloud,
  Settings,
  Check,
  Loader2,
  X,
  HardDriveDownload,
} from "lucide-react";
import { useStore } from "../store/useStore.js";
import SaveFileModal from "./SaveFileModal.jsx";

const api = window.api;

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/curriculum", label: "Curriculum", icon: BookOpen },
  { to: "/quiz", label: "Quiz", icon: CheckSquare },
  { to: "/projects", label: "Projects", icon: FolderGit2 },
  { to: "/progress", label: "Progress", icon: BarChart3 },
  { to: "/portfolio", label: "Portfolio", icon: Award },
  { to: "/colab", label: "Colab Guide", icon: Cloud },
];

function currentStreak(streaks) {
  // Count consecutive studied days ending today/yesterday.
  const set = new Set(streaks.filter((s) => s.studied).map((s) => s.date));
  let count = 0;
  const d = new Date();
  // allow today not yet studied: start from today, but if today missing, start yesterday
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (set.has(d.toISOString().slice(0, 10))) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

export default function Sidebar() {
  const apiKeyStatus = useStore((s) => s.apiKeyStatus);
  const streaks = useStore((s) => s.streaks);
  const checkApiKey = useStore((s) => s.checkApiKey);
  const streak = currentStreak(streaks);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);

  return (
    <aside
      className="flex h-full w-[220px] shrink-0 flex-col border-r"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <circle cx="5" cy="6" r="2" fill="var(--accent)" />
          <circle cx="5" cy="18" r="2" fill="var(--accent)" />
          <circle cx="12" cy="12" r="2" fill="var(--accent-green)" />
          <circle cx="19" cy="7" r="2" fill="var(--accent)" />
          <circle cx="19" cy="17" r="2" fill="var(--accent)" />
          <path d="M6.8 6.8 10.4 11M6.8 17.2 10.4 13M13.6 11 17.4 7.6M13.6 13 17.4 16.4" stroke="var(--border)" strokeWidth="1" />
        </svg>
        <span className="font-display text-lg font-bold tracking-tight">NeuralPath</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="relative mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition"
            style={({ isActive }) => ({
              color: isActive ? "var(--text-primary)" : "var(--text-muted)",
              background: isActive ? "var(--bg-elevated)" : "transparent",
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r"
                    style={{ background: "var(--accent)" }}
                  />
                )}
                <Icon size={18} />
                <span className="font-display">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer: streak + API key status */}
      <div className="space-y-3 border-t px-4 py-4" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: "var(--text-muted)" }}>🔥 Streak</span>
          <span className="font-display font-semibold">{streak}d</span>
        </div>
        <button
          onClick={() => setSaveOpen(true)}
          className="-mx-1 flex w-[calc(100%+0.5rem)] items-center gap-2 rounded px-1 py-1 text-xs transition hover:brightness-125"
          style={{ background: "transparent" }}
          title="Manage your progress save file"
        >
          <HardDriveDownload size={13} color="var(--text-muted)" />
          <span className="flex-1 text-left" style={{ color: "var(--text-muted)" }}>
            Progress save file
          </span>
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className="-mx-1 flex w-[calc(100%+0.5rem)] items-center gap-2 rounded px-1 py-1 text-xs transition hover:brightness-125"
          style={{ background: "transparent" }}
          title="Change API key"
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: apiKeyStatus === "ok" ? "var(--accent-green)" : "var(--accent-red)" }}
          />
          <span className="flex-1 text-left" style={{ color: "var(--text-muted)" }}>
            {apiKeyStatus === "ok" ? "API key connected" : "API key not set"}
          </span>
          <Settings size={13} color="var(--text-muted)" />
        </button>
      </div>
      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          onSaved={() => checkApiKey()}
        />
      )}
      {saveOpen && <SaveFileModal onClose={() => setSaveOpen(false)} />}
    </aside>
  );
}

// Inline modal to update the Anthropic API key without going back through
// onboarding. Stored via the same IPC path the wizard uses.
function SettingsModal({ onClose, onSaved }) {
  const [apiKey, setApiKey] = useState("");
  const [testState, setTestState] = useState("idle"); // idle | testing | ok | error
  const [testMsg, setTestMsg] = useState("");

  useEffect(() => {
    (async () => {
      const existing = await api.configGet("ANTHROPIC_API_KEY");
      if (existing) setApiKey(existing);
    })();
  }, []);

  async function save() {
    setTestState("testing");
    await api.configSet("ANTHROPIC_API_KEY", apiKey.trim());
    const r = await api.claudeTest();
    if (r.ok) {
      setTestState("ok");
      setTestMsg("Connection successful.");
      onSaved?.();
      setTimeout(onClose, 700);
    } else {
      setTestState("error");
      setTestMsg(r.error || "Connection failed.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div className="np-card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Anthropic API key</h2>
          <button onClick={onClose} title="Close">
            <X size={16} color="var(--text-muted)" />
          </button>
        </div>
        <p className="mb-3 text-sm" style={{ color: "var(--text-muted)" }}>
          Stored locally in your user data folder. Used only for quiz generation, grading, and project review.
        </p>
        <input
          className="np-input font-code"
          placeholder="sk-ant-..."
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            setTestState("idle");
          }}
        />
        <div className="mt-4 flex items-center justify-between gap-3">
          {testState === "ok" && (
            <span className="flex items-center gap-1 text-sm" style={{ color: "var(--accent-green)" }}>
              <Check size={15} /> {testMsg}
            </span>
          )}
          {testState === "error" && (
            <span className="text-sm" style={{ color: "var(--accent-red)" }}>
              {testMsg}
            </span>
          )}
          {testState !== "ok" && testState !== "error" && <span />}
          <button
            className="np-btn np-btn-primary"
            disabled={!apiKey.trim() || testState === "testing"}
            onClick={save}
          >
            {testState === "testing" ? <Loader2 size={16} className="animate-spin" /> : null}
            Save & Test
          </button>
        </div>
      </div>
    </div>
  );
}
