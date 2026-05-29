import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore.js";
import { getWeek } from "../curriculum/index.js";
import MarkdownRenderer from "../components/MarkdownRenderer.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import {
  Loader2, Copy, Check, FolderOpen, Upload, Cloud, Download,
  CheckCircle2, AlertTriangle, Lightbulb, FileCode2,
} from "lucide-react";

const api = window.api;

export default function Project() {
  const { phase, week } = useParams();
  // No specific week selected → show the projects list.
  if (phase == null || week == null) return <ProjectList />;
  return <ProjectDetail phaseNum={Number(phase)} weekNum={Number(week)} />;
}

// ── List view: every week's project ──
function ProjectList() {
  const nav = useNavigate();
  const curriculum = useStore((s) => s.curriculum);
  const [records, setRecords] = useState({});

  useEffect(() => {
    (async () => {
      const rows = await api.dbQuery("SELECT * FROM projects ORDER BY id DESC", []);
      const byWeek = {};
      for (const r of rows) if (!byWeek[r.week_id]) byWeek[r.week_id] = r;
      setRecords(byWeek);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold">Weekly Projects</h1>
        <p style={{ color: "var(--text-muted)" }}>
          One medium-sized project per week. Submit your code and get AI feedback, or complete heavy weeks on Colab.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {curriculum.flatMap((p) =>
          p.weeks.map((wk) => (
            <ProjectCard
              key={`p${p.phase}_w${wk.week}`}
              weekMeta={{ phase: p, week: wk }}
              record={records[`p${p.phase}_w${wk.week}`] || null}
              onOpen={() => nav(`/projects/${p.phase}/${wk.week}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Detail view ──
function ProjectDetail({ phaseNum, weekNum }) {
  const week = getWeek(phaseNum, weekNum);
  const weekId = `p${phaseNum}_w${weekNum}`;
  const isColab = week?.compute === "colab";

  const [record, setRecord] = useState(null);
  const [copied, setCopied] = useState(false);
  const [filePath, setFilePath] = useState(null);
  const [selfNotes, setSelfNotes] = useState("");
  const [busy, setBusy] = useState("");      // "review" | "notebook" | "import"
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    const rows = await api.dbQuery(
      "SELECT * FROM projects WHERE week_id = ? ORDER BY id DESC LIMIT 1",
      [weekId]
    );
    setRecord(rows[0] || null);
    if (rows[0]?.self_notes) setSelfNotes(rows[0].self_notes);
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekId]);

  if (!week) {
    return <div className="p-8" style={{ color: "var(--text-muted)" }}>Project not found.</div>;
  }
  const project = week.project;

  function flash(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  }

  async function copyStarter() {
    await navigator.clipboard.writeText(project.starter_code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function pickFile() {
    const p = await api.openDialog({ filters: [{ name: "Python", extensions: ["py"] }] });
    if (p) setFilePath(p);
  }

  async function submitForReview() {
    if (!filePath) return;
    setError("");
    setBusy("review");
    try {
      const code = await api.readFile(filePath);
      const res = await api.claudeReviewProject(
        { title: project.title, description: project.description, evaluation_criteria: project.evaluation_criteria },
        code,
        selfNotes
      );
      if (!res.ok) throw new Error(res.error || "Review failed");
      const aiFeedback = JSON.stringify({
        strengths: res.strengths, gaps: res.gaps, improvements: res.improvements, verdict: res.verdict,
      });
      await api.dbRun(
        `INSERT INTO projects (week_id, title, submitted_at, code_path, self_notes, ai_feedback, score, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'graded')`,
        [weekId, project.title, new Date().toISOString(), filePath, selfNotes, aiFeedback, res.score]
      );
      await refresh();
      flash(`Reviewed — scored ${res.score}/100`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }

  // ── Colab actions ──
  async function openInColab() {
    setBusy("notebook");
    try {
      const nb = await api.generateNotebook(phaseNum, weekNum);
      await api.saveNotebook(nb, weekNum);
      await api.openExternal("https://colab.research.google.com/");
      flash("Notebook saved. Upload the downloaded .ipynb to Colab to begin.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }

  async function downloadNotebook() {
    setBusy("notebook");
    try {
      const nb = await api.generateNotebook(phaseNum, weekNum);
      const dest = await api.saveDialog({
        defaultPath: `week_${weekNum}.ipynb`,
        filters: [{ name: "Jupyter Notebook", extensions: ["ipynb"] }],
      });
      if (dest) {
        await api.writeFile(dest, nb);
        flash("Notebook downloaded.");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }

  async function importResults() {
    const p = await api.openDialog({ filters: [{ name: "JSON", extensions: ["json"] }] });
    if (!p) return;
    setBusy("import");
    setError("");
    try {
      const res = await api.importResults(p);
      await refresh();
      flash(`Results imported — scored ${res.score}/100`);
    } catch (e) {
      setError("Import failed: " + e.message);
    } finally {
      setBusy("");
    }
  }

  const feedback = parseFeedback(record?.ai_feedback);

  return (
    <div className="mx-auto max-w-4xl p-8">
      {/* Header */}
      <header className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-display text-xs" style={{ color: "var(--text-muted)" }}>
            Week {weekNum} · {week.title}
          </span>
          <span
            className="np-tag"
            style={{
              background: isColab ? "rgba(245,158,11,0.15)" : "var(--bg-elevated)",
              color: isColab ? "var(--accent-orange)" : "var(--text-muted)",
            }}
          >
            {isColab ? "GPU · Colab recommended" : "CPU · Run locally"}
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold">{project.title}</h1>
      </header>

      {toast && (
        <div className="np-card mb-4 p-3 text-sm" style={{ borderColor: "var(--accent-green)", color: "var(--accent-green)" }}>
          {toast}
        </div>
      )}
      {error && (
        <div className="np-card mb-4 p-3 text-sm" style={{ borderColor: "var(--accent-red)", color: "var(--accent-red)" }}>
          {error}
        </div>
      )}

      {/* Brief */}
      <section className="np-card mb-5 p-5">
        <h2 className="mb-2 font-display text-sm uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          Brief
        </h2>
        <p className="text-sm" style={{ lineHeight: 1.7 }}>{project.description}</p>
      </section>

      {/* Evaluation criteria rubric */}
      <section className="np-card mb-5 p-5">
        <h2 className="mb-3 font-display text-sm uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          Evaluation Criteria
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: "var(--text-dim)" }}>
              <th className="pb-2 text-left font-display font-normal">Criterion</th>
              <th className="pb-2 text-right font-display font-normal">Weight</th>
            </tr>
          </thead>
          <tbody>
            {(project.evaluation_criteria || []).map((c, i) => (
              <tr key={i} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="py-2 pr-4">{c}</td>
                <td className="py-2 text-right" style={{ color: "var(--text-muted)" }}>
                  {Math.round(100 / project.evaluation_criteria.length)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Starter code */}
      <section className="np-card mb-5 p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-sm uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            <FileCode2 size={14} className="mr-1 inline" /> Starter Code
          </h2>
          <button className="np-btn np-btn-secondary !py-1 !text-xs" onClick={copyStarter}>
            {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <MarkdownRenderer>{"```python\n" + (project.starter_code || "# (no starter code)") + "\n```"}</MarkdownRenderer>
        <button className="np-btn np-btn-secondary mt-3" onClick={() => api.openInEditor()}>
          <FolderOpen size={16} /> Open Folder in VS Code
        </button>
      </section>

      {/* Submission */}
      <section className="np-card mb-5 p-5">
        <h2 className="mb-3 font-display text-sm uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          {isColab ? "Run on Google Colab" : "Submit Your Solution"}
        </h2>

        {isColab ? (
          <div className="flex flex-wrap gap-2">
            <button className="np-btn np-btn-primary" disabled={busy === "notebook"} onClick={openInColab}>
              {busy === "notebook" ? <Loader2 size={16} className="animate-spin" /> : <Cloud size={16} />}
              Open in Google Colab
            </button>
            <button className="np-btn np-btn-secondary" disabled={busy === "notebook"} onClick={downloadNotebook}>
              <Download size={16} /> Download .ipynb
            </button>
            <button className="np-btn np-btn-secondary" disabled={busy === "import"} onClick={importResults}>
              {busy === "import" ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Import Results
            </button>
          </div>
        ) : (
          <>
            <textarea
              className="np-input mb-3 min-h-[90px] resize-y"
              placeholder="Self-assessment: What did you build? What was hard? What would you improve?"
              value={selfNotes}
              onChange={(e) => setSelfNotes(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button className="np-btn np-btn-secondary" onClick={pickFile}>
                <Upload size={16} /> {filePath ? "Change file" : "Choose .py file"}
              </button>
              {filePath && (
                <span className="truncate text-xs" style={{ color: "var(--text-muted)", maxWidth: 280 }}>
                  {filePath}
                </span>
              )}
              <button
                className="np-btn np-btn-primary ml-auto"
                disabled={!filePath || busy === "review"}
                onClick={submitForReview}
              >
                {busy === "review" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Submit & Get AI Feedback
              </button>
            </div>
          </>
        )}
      </section>

      {/* Feedback / result */}
      {record?.status === "graded" && (
        <section className="np-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Feedback
            </h2>
            <span className="font-display text-xl font-bold">{record.score}/100</span>
          </div>

          {feedback ? (
            <div className="space-y-4 text-sm">
              {feedback.verdict && <p style={{ lineHeight: 1.7 }}>{feedback.verdict}</p>}
              <FeedbackList Icon={CheckCircle2} color="var(--accent-green)" title="Strengths" items={feedback.strengths} />
              <FeedbackList Icon={AlertTriangle} color="var(--accent-orange)" title="Gaps" items={feedback.gaps} />
              <FeedbackList Icon={Lightbulb} color="var(--accent)" title="Improvements" items={feedback.improvements} />
            </div>
          ) : (
            // Colab-imported or plain-text feedback
            <p className="text-sm" style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
              {record.ai_feedback}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function FeedbackList({ Icon, color, title, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 font-display text-sm font-semibold" style={{ color }}>
        <Icon size={15} /> {title}
      </div>
      <ul className="space-y-1 pl-6" style={{ listStyle: "disc", color: "var(--text-muted)" }}>
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}

// AI feedback is stored as JSON for local reviews; Colab imports store plain text.
function parseFeedback(raw) {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    if (obj && (obj.strengths || obj.verdict || obj.gaps)) return obj;
    return null;
  } catch {
    return null;
  }
}
