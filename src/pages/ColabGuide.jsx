import { useEffect, useState } from "react";
import { useStore } from "../store/useStore.js";
import MarkdownRenderer from "../components/MarkdownRenderer.jsx";
import { ExternalLink } from "lucide-react";

const api = window.api;

const GUIDE = `## Running NeuralPath Projects on Google Colab

### First-time setup (do this once)
1. Go to https://colab.research.google.com
2. Sign in with your Google account
3. Go to Runtime → Change runtime type → Select **T4 GPU** → Save
4. Connect your Google Drive when prompted by the notebook

### Per-project workflow
1. Open the heavy project week in NeuralPath
2. Click **Download .ipynb**
3. In Colab: File → Upload notebook → select the downloaded file
4. Run all cells in order (Ctrl+F9 runs all)
5. Fill in the [USER WORK ZONE] cell with your implementation
6. Run the Results Export cell (Cell 7) when done
7. Cell 8 will auto-download results.json to your machine
8. Back in NeuralPath: click **Import Results** → select results.json
9. Your score and progress are now recorded ✅

### Free tier limits to know
- **GPU session:** 12 hours max per session (T4 GPU)
- **Idle timeout:** ~90 minutes of inactivity disconnects you
- **Storage:** Files in /content are deleted when session ends — always save to Drive
- **Tip:** Save model checkpoints every N epochs to Drive, not just at the end

### Saving your work mid-session
The generated notebooks include Drive mounting in Cell 3.
All checkpoints and the final model are saved to:
\`MyDrive/NeuralPath/Week{N}/\`

If your session disconnects, re-mount Drive and load from the last checkpoint.`;

export default function ColabGuide() {
  const curriculum = useStore((s) => s.curriculum);
  const [checked, setChecked] = useState({});

  // Heavy (GPU) weeks across the curriculum.
  const colabWeeks = curriculum.flatMap((p) =>
    p.weeks
      .filter((w) => w.compute === "colab")
      .map((w) => ({ weekId: `p${p.phase}_w${w.week}`, week: w.week, title: w.project?.title || w.title, packages: w.colab_installs || [] }))
  );

  useEffect(() => {
    (async () => {
      const rows = await api.dbQuery("SELECT week_id, checked FROM colab_checklist", []);
      const map = {};
      for (const r of rows) map[r.week_id] = !!r.checked;
      setChecked(map);
    })();
  }, []);

  async function toggle(weekId) {
    const next = !checked[weekId];
    setChecked((m) => ({ ...m, [weekId]: next }));
    await api.dbRun(
      "INSERT INTO colab_checklist (week_id, checked) VALUES (?, ?) ON CONFLICT(week_id) DO UPDATE SET checked = excluded.checked",
      [weekId, next ? 1 : 0]
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <header className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Colab Guide</h1>
        <button className="np-btn np-btn-primary" onClick={() => api.openExternal("https://colab.research.google.com/")}>
          Open Colab <ExternalLink size={15} />
        </button>
      </header>

      <section className="np-card mb-6 p-6">
        <MarkdownRenderer>{GUIDE}</MarkdownRenderer>
      </section>

      <section className="np-card p-5">
        <h2 className="mb-3 font-display text-sm uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          GPU Week Checklist
        </h2>
        <div className="space-y-2">
          {colabWeeks.map((w) => (
            <label key={w.weekId} className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={!!checked[w.weekId]}
                onChange={() => toggle(w.weekId)}
                className="h-4 w-4 accent-[var(--accent-green)]"
              />
              <span className="font-display" style={{ color: "var(--text-muted)" }}>Week {w.week}</span>
              <span
                className="flex-1"
                style={{
                  color: checked[w.weekId] ? "var(--text-muted)" : "var(--text-primary)",
                  textDecoration: checked[w.weekId] ? "line-through" : "none",
                }}
              >
                {w.title}
              </span>
              {w.packages.length > 0 && (
                <span className="text-xs" style={{ color: "var(--text-dim)" }}>{w.packages.join(", ")}</span>
              )}
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
