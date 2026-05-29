import { useEffect, useMemo, useState } from "react";
import { useStore } from "../store/useStore.js";
import { DOMAIN_LABELS, PAPERS, getDay } from "../curriculum/index.js";
import RadarChart from "../components/RadarChart.jsx";
import { FileDown, Copy, Braces, ExternalLink, Check, BookMarked, FlaskConical } from "lucide-react";

const api = window.api;

// Suggested reading order for the research roadmap (Section 17.5).
const READING_ORDER = ["edge", "deepjscc", "dsgd", "tcs", "hfl"];

export default function Portfolio() {
  const userName = useStore((s) => s.userName);
  const topics = useStore((s) => s.topics);
  const goals = useStore((s) => s.goals);
  const curriculum = useStore((s) => s.curriculum);

  const [projects, setProjects] = useState([]);
  const [agg, setAgg] = useState({ hours: 0, avgQuiz: 0 });
  const [githubLinks, setGithubLinks] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const proj = await api.dbQuery("SELECT * FROM projects WHERE status = 'graded' ORDER BY week_id", []);
      setProjects(proj);
      const dur = await api.dbQuery("SELECT COALESCE(SUM(duration_secs),0) AS s FROM sessions", []);
      const avg = await api.dbQuery("SELECT COALESCE(AVG(score),0) AS a FROM quiz_attempts", []);
      setAgg({ hours: (dur[0]?.s || 0) / 3600, avgQuiz: Math.round(avg[0]?.a || 0) });
      const saved = await api.configGet("portfolio_github_links");
      if (saved) try { setGithubLinks(JSON.parse(saved)); } catch { /* ignore */ }
    })();
  }, []);

  const completed = topics.filter((t) => t.status === "completed");
  const weeksTouched = new Set(topics.filter((t) => t.status === "completed").map((t) => `${t.phase}_${t.week}`)).size;

  const radarData = useMemo(
    () =>
      Object.entries(DOMAIN_LABELS).map(([key, label]) => {
        const inDomain = completed.filter((t) => t.domain === key);
        const score = inDomain.length
          ? Math.round(inDomain.reduce((s, t) => s + t.mastery_score, 0) / inDomain.length)
          : 0;
        return { domain: label, score };
      }),
    [topics]
  );

  // Knowledge coverage: key concepts from completed days.
  const concepts = useMemo(() => {
    const out = [];
    for (const t of completed) {
      const day = getDay(t.id);
      if (day?.key_concepts) out.push(...day.key_concepts);
    }
    return [...new Set(out)];
  }, [topics]);

  // Papers engaged: any paper referenced by a week the user has started.
  const startedWeeks = new Set(
    topics.filter((t) => t.status !== "locked").map((t) => `${t.phase}_${t.week}`)
  );
  const engagedPapers = useMemo(() => {
    const ids = new Set();
    for (const p of curriculum) {
      for (const w of p.weeks) {
        if (startedWeeks.has(`${p.phase}_${w.week}`)) {
          for (const rp of w.research_papers || []) ids.add(rp.id);
        }
      }
    }
    return [...ids].map((id) => PAPERS[id]).filter(Boolean);
  }, [topics]);

  async function setLink(weekId, url) {
    const next = { ...githubLinks, [weekId]: url };
    setGithubLinks(next);
    await api.configSet("portfolio_github_links", JSON.stringify(next));
  }

  function buildMarkdown() {
    const lines = [
      `# AI/ML Learning Portfolio — ${userName || "Student"}`,
      "",
      `- **Hours studied:** ${agg.hours.toFixed(1)}`,
      `- **Weeks completed:** ${weeksTouched}/21`,
      `- **Topics mastered:** ${completed.length}/${topics.length}`,
      `- **Average quiz score:** ${agg.avgQuiz}%`,
      `- **Projects built:** ${projects.length}`,
      "",
      "## Skill Coverage",
      ...radarData.map((d) => `- ${d.domain}: ${d.score}/100`),
      "",
      "## Completed Projects",
      ...projects.map((p) => `- **${p.title}** — ${p.score}/100${githubLinks[p.week_id] ? ` ([code](${githubLinks[p.week_id]}))` : ""}`),
      "",
      "## Research Papers Engaged (PhD-trajectory)",
      ...engagedPapers.map((p) => `- ${p.title} (${p.authors}) — arXiv:${p.arxiv}`),
    ];
    return lines.join("\n");
  }

  async function copyMarkdown() {
    await navigator.clipboard.writeText(buildMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function exportJson() {
    const data = {
      user: userName,
      generated_at: new Date().toISOString(),
      stats: { hours: agg.hours, weeksTouched, completed: completed.length, total: topics.length, avgQuiz: agg.avgQuiz },
      skills: radarData,
      projects: projects.map((p) => ({ ...p, github: githubLinks[p.week_id] || null })),
      goals,
      concepts,
      research_papers: engagedPapers,
    };
    const dest = await api.saveDialog({
      defaultPath: "neuralpath_portfolio.json",
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (dest) await api.writeFile(dest, JSON.stringify(data, null, 2));
  }

  async function exportPdf() {
    const html = buildHtml({ userName, agg, weeksTouched, completed, topics, radarData, projects, githubLinks, concepts, engagedPapers });
    await api.exportPdf(html, `neuralpath_portfolio_${Date.now()}.pdf`);
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">AI/ML Learning Portfolio</h1>
          <p style={{ color: "var(--text-muted)" }}>{userName || "Student"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="np-btn np-btn-primary" onClick={exportPdf}><FileDown size={16} /> Export PDF</button>
          <button className="np-btn np-btn-secondary" onClick={copyMarkdown}>
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy Markdown"}
          </button>
          <button className="np-btn np-btn-secondary" onClick={exportJson}><Braces size={16} /> Export JSON</button>
        </div>
      </header>

      {/* Summary stats */}
      <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-5">
        <Stat label="Hours" value={agg.hours.toFixed(1)} />
        <Stat label="Weeks" value={`${weeksTouched}/21`} />
        <Stat label="Topics" value={`${completed.length}/${topics.length}`} />
        <Stat label="Avg quiz" value={`${agg.avgQuiz}%`} />
        <Stat label="Projects" value={projects.length} />
      </div>

      {/* Skill radar */}
      <section className="np-card mb-5 p-5">
        <h2 className="mb-2 font-display text-sm uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Skill Radar</h2>
        <RadarChart data={radarData} />
      </section>

      {/* Completed projects */}
      <section className="np-card mb-5 p-5">
        <h2 className="mb-3 font-display text-sm uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Completed Projects</h2>
        {projects.length ? (
          <div className="space-y-3">
            {projects.map((p) => {
              const fb = parseVerdict(p.ai_feedback);
              return (
                <div key={p.id} className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold">{p.title}</span>
                    <span className="font-display" style={{ color: "var(--accent-green)" }}>{p.score}/100</span>
                  </div>
                  {fb && <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{fb}</p>}
                  <input
                    className="np-input mt-2 text-xs"
                    placeholder="Paste GitHub link…"
                    value={githubLinks[p.week_id] || ""}
                    onChange={(e) => setLink(p.week_id, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No graded projects yet.</p>
        )}
      </section>

      {/* Knowledge coverage */}
      <section className="np-card mb-5 p-5">
        <h2 className="mb-3 font-display text-sm uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          Knowledge Coverage ({concepts.length} concepts)
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {concepts.length ? concepts.map((c) => (
            <span key={c} className="np-tag" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>{c}</span>
          )) : <p className="text-sm" style={{ color: "var(--text-muted)" }}>Complete lessons to build coverage.</p>}
        </div>
      </section>

      {/* Learning goals */}
      <section className="np-card mb-5 p-5">
        <h2 className="mb-3 font-display text-sm uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Learning Goals</h2>
        {goals.length ? (
          <ul className="space-y-1 text-sm">
            {goals.map((g) => (
              <li key={g.id} style={{ color: g.completed ? "var(--accent-green)" : "var(--text-muted)" }}>
                {g.completed ? "✓" : "○"} {g.text}
              </li>
            ))}
          </ul>
        ) : <p className="text-sm" style={{ color: "var(--text-muted)" }}>No goals set.</p>}
      </section>

      {/* Research papers engaged */}
      <section className="np-card mb-5 p-5" style={{ borderColor: "var(--accent-orange)" }}>
        <h2 className="mb-1 flex items-center gap-2 font-display text-sm uppercase tracking-wide" style={{ color: "var(--accent-orange)" }}>
          <FlaskConical size={15} /> Research Papers Engaged · PhD-trajectory
        </h2>
        <p className="mb-3 text-xs" style={{ color: "var(--text-muted)" }}>
          Communication-aware ML, after the work of Prof. Deniz Gündüz &amp; Emre Ozfatura (Imperial College London).
        </p>
        {engagedPapers.length ? (
          <div className="space-y-2">
            {engagedPapers.map((p) => (
              <div key={p.id} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs" style={{ color: "var(--text-dim)" }}>{p.authors}</div>
                </div>
                <button
                  className="inline-flex shrink-0 items-center gap-1 text-xs"
                  style={{ color: "var(--accent)" }}
                  onClick={() => api.openExternal(`https://arxiv.org/abs/${p.arxiv}`)}
                >
                  arXiv:{p.arxiv} <ExternalLink size={11} />
                </button>
              </div>
            ))}
          </div>
        ) : <p className="text-sm" style={{ color: "var(--text-muted)" }}>Reach the research-track weeks to populate this section.</p>}
      </section>

      {/* Research roadmap / further reading */}
      <section className="np-card p-5">
        <h2 className="mb-3 flex items-center gap-2 font-display text-sm uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          <BookMarked size={15} /> Research Roadmap · Further Reading
        </h2>
        <ol className="space-y-1 text-sm" style={{ listStyle: "decimal", paddingLeft: "1.4em" }}>
          {READING_ORDER.map((id) => {
            const p = PAPERS[id];
            return (
              <li key={id} style={{ color: "var(--text-muted)" }}>
                <button className="text-left" style={{ color: "var(--accent)" }} onClick={() => api.openExternal(`https://arxiv.org/abs/${p.arxiv}`)}>
                  {p.title}
                </button>{" "}
                <span className="text-xs" style={{ color: "var(--text-dim)" }}>(arXiv:{p.arxiv})</span>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="np-card p-4">
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

function parseVerdict(raw) {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    return obj.verdict || null;
  } catch {
    return raw.startsWith("Completed on Google Colab") ? raw : null;
  }
}

// Build a light-themed, print-friendly HTML document for PDF export.
function buildHtml({ userName, agg, weeksTouched, completed, topics, radarData, projects, githubLinks, concepts, engagedPapers }) {
  const esc = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:Helvetica,Arial,sans-serif;color:#14171f;margin:40px;line-height:1.5}
    h1{font-size:24px;margin:0 0 4px} h2{font-size:15px;border-bottom:1px solid #ddd;padding-bottom:4px;margin-top:24px}
    .muted{color:#666} .stats{display:flex;gap:24px;margin:12px 0}
    .stat b{font-size:20px;display:block} table{width:100%;border-collapse:collapse;font-size:13px}
    td,th{border-bottom:1px solid #eee;padding:6px 4px;text-align:left} .tag{display:inline-block;background:#eef2fb;color:#2b5bb5;border-radius:4px;padding:2px 6px;font-size:11px;margin:2px}
  </style></head><body>
    <h1>AI/ML Learning Portfolio</h1>
    <div class="muted">${esc(userName || "Student")} · generated ${new Date().toLocaleDateString()}</div>
    <div class="stats">
      <div class="stat"><b>${agg.hours.toFixed(1)}</b><span class="muted">Hours</span></div>
      <div class="stat"><b>${weeksTouched}/21</b><span class="muted">Weeks</span></div>
      <div class="stat"><b>${completed.length}/${topics.length}</b><span class="muted">Topics</span></div>
      <div class="stat"><b>${agg.avgQuiz}%</b><span class="muted">Avg quiz</span></div>
      <div class="stat"><b>${projects.length}</b><span class="muted">Projects</span></div>
    </div>
    <h2>Skill Coverage</h2>
    <table>${radarData.map((d) => `<tr><td>${esc(d.domain)}</td><td>${d.score}/100</td></tr>`).join("")}</table>
    <h2>Completed Projects</h2>
    <table>${projects.map((p) => `<tr><td>${esc(p.title)}</td><td>${p.score}/100</td><td>${esc(githubLinks[p.week_id] || "")}</td></tr>`).join("") || '<tr><td class="muted">None yet</td></tr>'}</table>
    <h2>Knowledge Coverage</h2>
    <div>${concepts.map((c) => `<span class="tag">${esc(c)}</span>`).join("") || '<span class="muted">None yet</span>'}</div>
    <h2>Research Papers Engaged (PhD-trajectory)</h2>
    <table>${engagedPapers.map((p) => `<tr><td>${esc(p.title)}</td><td>arXiv:${esc(p.arxiv)}</td></tr>`).join("") || '<tr><td class="muted">None yet</td></tr>'}</table>
  </body></html>`;
}
