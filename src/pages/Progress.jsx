import { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore.js";
import { getDay, DOMAIN_LABELS } from "../curriculum/index.js";
import CurriculumTree from "../components/CurriculumTree.jsx";
import ProgressRing from "../components/ProgressRing.jsx";
import { Clock, BookCheck, Target, FolderGit2, X } from "lucide-react";

const api = window.api;
const TABS = ["Overview", "Curriculum Map", "Weaknesses", "Quiz History"];

export default function Progress() {
  const [tab, setTab] = useState("Overview");

  return (
    <div className="mx-auto max-w-5xl p-8">
      <header className="mb-5">
        <h1 className="font-display text-2xl font-bold">Progress</h1>
      </header>

      <div className="mb-6 flex gap-1 border-b" style={{ borderColor: "var(--border)" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative px-4 py-2 font-display text-sm transition"
            style={{ color: tab === t ? "var(--text-primary)" : "var(--text-muted)" }}
          >
            {t}
            {tab === t && (
              <span className="absolute inset-x-0 -bottom-px h-0.5" style={{ background: "var(--accent)" }} />
            )}
          </button>
        ))}
      </div>

      {tab === "Overview" && <Overview />}
      {tab === "Curriculum Map" && <CurriculumMap />}
      {tab === "Weaknesses" && <Weaknesses />}
      {tab === "Quiz History" && <QuizHistory />}
    </div>
  );
}

// ── Overview ──
function Overview() {
  const topics = useStore((s) => s.topics);
  const [stats, setStats] = useState({ hours: 0, avgQuiz: 0, projects: 0 });

  useEffect(() => {
    (async () => {
      const dur = await api.dbQuery("SELECT COALESCE(SUM(duration_secs),0) AS s FROM sessions", []);
      const avg = await api.dbQuery("SELECT COALESCE(AVG(score),0) AS a FROM quiz_attempts", []);
      const proj = await api.dbQuery("SELECT COUNT(*) AS n FROM projects WHERE status != 'pending'", []);
      setStats({
        hours: (dur[0]?.s || 0) / 3600,
        avgQuiz: Math.round(avg[0]?.a || 0),
        projects: proj[0]?.n || 0,
      });
    })();
  }, []);

  const completed = topics.filter((t) => t.status === "completed").length;
  const total = topics.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Stat Icon={Clock} label="Hours studied" value={stats.hours.toFixed(1)} />
      <Stat Icon={BookCheck} label="Topics completed" value={`${completed}/${total}`} />
      <Stat Icon={Target} label="Avg quiz score" value={`${stats.avgQuiz}%`} />
      <Stat Icon={FolderGit2} label="Projects done" value={stats.projects} />
      <div className="np-card col-span-2 flex items-center gap-5 p-5 md:col-span-4">
        <ProgressRing value={pct} size={88} stroke={8} color="var(--accent-green)" />
        <div>
          <div className="font-display text-lg font-semibold">{pct}% of curriculum complete</div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {completed} of {total} daily topics mastered across all six phases.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ Icon, label, value }) {
  return (
    <div className="np-card p-4">
      <Icon size={18} color="var(--accent)" />
      <div className="mt-2 font-display text-2xl font-bold">{value}</div>
      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

// ── Curriculum Map (with per-topic quiz history drawer) ──
function CurriculumMap() {
  const [detail, setDetail] = useState(null); // { topicId, attempts }

  async function openDay(topicId) {
    const attempts = await api.dbQuery(
      "SELECT id, date, score FROM quiz_attempts WHERE topic_id = ? ORDER BY id DESC",
      [topicId]
    );
    setDetail({ topicId, attempts });
  }

  const day = detail ? getDay(detail.topicId) : null;

  return (
    <div className="np-card p-6">
      <CurriculumTree onSelectDay={openDay} />
      {detail && (
        <div className="mt-6 rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-display text-sm font-semibold">{day?.title} — quiz history</span>
            <button onClick={() => setDetail(null)}><X size={16} color="var(--text-muted)" /></button>
          </div>
          {detail.attempts.length ? (
            <ul className="space-y-1 text-sm">
              {detail.attempts.map((a) => (
                <li key={a.id} className="flex justify-between" style={{ color: "var(--text-muted)" }}>
                  <span>{a.date?.slice(0, 10)}</span>
                  <span style={{ color: a.score >= 60 ? "var(--accent-green)" : "var(--accent-orange)" }}>
                    {a.score}/100
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No quiz attempts yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Weaknesses ──
function Weaknesses() {
  const nav = useNavigate();
  const topics = useStore((s) => s.topics);
  const [domain, setDomain] = useState("all");

  const rows = topics
    .filter((t) => t.status === "completed")
    .filter((t) => domain === "all" || t.domain === domain)
    .sort((a, b) => a.mastery_score - b.mastery_score);

  return (
    <div className="np-card p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className="font-display text-sm" style={{ color: "var(--text-muted)" }}>Filter by domain</span>
        <select
          className="np-input w-auto"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        >
          <option value="all">All domains</option>
          {Object.entries(DOMAIN_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {rows.length ? (
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: "var(--text-dim)" }}>
              <th className="pb-2 text-left font-display font-normal">Topic</th>
              <th className="pb-2 text-left font-display font-normal">Mastery</th>
              <th className="pb-2 text-left font-display font-normal">Last attempted</th>
              <th className="pb-2 text-right font-display font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              const day = getDay(t.id);
              const weak = t.mastery_score < 70;
              return (
                <tr key={t.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="py-2 pr-4">{day?.title || t.id}</td>
                  <td className="py-2">
                    <span style={{ color: weak ? "var(--accent-orange)" : "var(--accent-green)" }}>
                      {t.mastery_score}%
                    </span>
                  </td>
                  <td className="py-2" style={{ color: "var(--text-muted)" }}>
                    {t.last_visited ? t.last_visited.slice(0, 10) : "—"}
                  </td>
                  <td className="py-2 text-right">
                    <button className="np-btn np-btn-secondary !py-1 !text-xs" onClick={() => nav(`/lesson/${t.id}`)}>
                      Re-study
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No completed topics yet — finish a few quizzes to see your weak areas.
        </p>
      )}
    </div>
  );
}

// ── Quiz History ──
function QuizHistory() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(null); // attempt id

  useEffect(() => {
    (async () => {
      const r = await api.dbQuery(
        "SELECT id, topic_id, date, score, questions_json FROM quiz_attempts ORDER BY id DESC",
        []
      );
      setRows(r);
    })();
  }, []);

  if (!rows.length) {
    return (
      <div className="np-card p-5 text-sm" style={{ color: "var(--text-muted)" }}>
        No quizzes taken yet.
      </div>
    );
  }

  return (
    <div className="np-card p-5">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ color: "var(--text-dim)" }}>
            <th className="pb-2 text-left font-display font-normal">Date</th>
            <th className="pb-2 text-left font-display font-normal">Topic</th>
            <th className="pb-2 text-left font-display font-normal">Score</th>
            <th className="pb-2 text-right font-display font-normal"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const day = getDay(r.topic_id);
            const isOpen = open === r.id;
            let questions = [];
            try { questions = JSON.parse(r.questions_json || "[]"); } catch { /* ignore */ }
            return (
              <Fragment key={r.id}>
                <tr className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="py-2" style={{ color: "var(--text-muted)" }}>{r.date?.slice(0, 10)}</td>
                  <td className="py-2 pr-4">{day?.title || r.topic_id}</td>
                  <td className="py-2" style={{ color: r.score >= 60 ? "var(--accent-green)" : "var(--accent-orange)" }}>
                    {r.score}/100
                  </td>
                  <td className="py-2 text-right">
                    <button
                      className="np-btn np-btn-secondary !py-1 !text-xs"
                      onClick={() => setOpen(isOpen ? null : r.id)}
                    >
                      {isOpen ? "Hide" : "View details"}
                    </button>
                  </td>
                </tr>
                {isOpen && (
                  <tr>
                    <td colSpan={4} className="pb-3">
                      <div className="space-y-2 rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
                        {questions.map((q, i) => (
                          <div key={i} className="text-sm">
                            <span style={{ color: q.is_correct ? "var(--accent-green)" : "var(--accent-red)" }}>
                              {q.is_correct ? "✓" : "✗"}
                            </span>{" "}
                            <span>{q.question}</span>
                            <div className="pl-4 text-xs" style={{ color: "var(--text-muted)" }}>
                              Your answer: {q.user_answer}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
