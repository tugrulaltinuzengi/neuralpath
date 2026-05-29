import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore, todayISO } from "../store/useStore.js";
import { CURRICULUM, getDay, DOMAIN_LABELS } from "../curriculum/index.js";
import ProjectCard from "../components/ProjectCard.jsx";
import RadarChart from "../components/RadarChart.jsx";
import HeatmapCalendar from "../components/HeatmapCalendar.jsx";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell, LabelList } from "recharts";
import { Play, Plus, Trash2 } from "lucide-react";

const api = window.api;

export default function Dashboard() {
  const nav = useNavigate();
  const userName = useStore((s) => s.userName);
  const topics = useStore((s) => s.topics);
  const streaks = useStore((s) => s.streaks);
  const goals = useStore((s) => s.goals);
  const addGoal = useStore((s) => s.addGoal);
  const toggleGoal = useStore((s) => s.toggleGoal);
  const deleteGoal = useStore((s) => s.deleteGoal);

  // Derive locally with useMemo — passing a method that returns a fresh
  // object to a Zustand selector triggers infinite re-renders because
  // Object.is(prev, next) is always false.
  const currentTopic = useMemo(
    () =>
      topics.find((t) => t.status === "in_progress") ||
      topics.find((t) => t.status === "available") ||
      topics[topics.length - 1],
    [topics]
  );
  const weekMeta = useMemo(() => {
    if (!currentTopic) return null;
    const phase = CURRICULUM.find((p) => p.phase === currentTopic.phase);
    const week = phase?.weeks.find((w) => w.week === currentTopic.week);
    return phase && week ? { phase, week } : null;
  }, [currentTopic]);

  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [projectRecord, setProjectRecord] = useState(null);
  const [newGoal, setNewGoal] = useState("");

  useEffect(() => {
    (async () => {
      const q = await api.dbQuery(
        "SELECT topic_id, score, date FROM quiz_attempts ORDER BY id DESC LIMIT 5",
        []
      );
      setRecentQuizzes(q.reverse().map((r, i) => ({ ...r, name: `#${i + 1}` })));
      if (weekMeta) {
        const wid = `p${weekMeta.phase.phase}_w${weekMeta.week.week}`;
        const rec = await api.dbQuery("SELECT * FROM projects WHERE week_id = ? ORDER BY id DESC LIMIT 1", [wid]);
        setProjectRecord(rec[0] || null);
      }
    })();
  }, [weekMeta, topics]);

  // Phase progress
  const phaseProgress = [0, 1, 2, 3, 4, 5].map((p) => {
    const inPhase = topics.filter((t) => t.phase === p);
    const done = inPhase.filter((t) => t.status === "completed").length;
    return { phase: p, pct: inPhase.length ? Math.round((done / inPhase.length) * 100) : 0 };
  });

  // Mastery radar per domain
  const radarData = Object.entries(DOMAIN_LABELS).map(([key, label]) => {
    const inDomain = topics.filter((t) => t.domain === key && t.status === "completed");
    const score = inDomain.length
      ? Math.round(inDomain.reduce((s, t) => s + t.mastery_score, 0) / inDomain.length)
      : 0;
    return { domain: label, score };
  });

  const dayInfo = currentTopic ? getDay(currentTopic.id) : null;
  const totalTopics = topics.length;
  const completed = topics.filter((t) => t.status === "completed").length;

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold">Welcome back, {userName}</h1>
        <p style={{ color: "var(--text-muted)" }}>
          {completed} of {totalTopics} topics complete · keep the streak alive.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Today's topic */}
        <div className="np-card p-5 lg:col-span-2">
          <div className="mb-1 font-display text-xs" style={{ color: "var(--text-muted)" }}>
            Today's Topic
          </div>
          {dayInfo ? (
            <>
              <h2 className="mb-1 font-display text-xl font-semibold">{dayInfo.title}</h2>
              <div className="mb-3 flex flex-wrap gap-2 text-xs">
                <span className="np-tag" style={{ background: "var(--bg-elevated)", color: "var(--accent)" }}>
                  Phase {dayInfo.phase} · {dayInfo.phaseTitle}
                </span>
                <span className="np-tag" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                  Week {dayInfo.week} · Day {dayInfo.day}
                </span>
                <span className="np-tag" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                  {DOMAIN_LABELS[dayInfo.domain]}
                </span>
                <span className="np-tag" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                  ~15 min read
                </span>
              </div>
              <button className="np-btn np-btn-primary" onClick={() => nav(`/lesson/${dayInfo.id}`)}>
                <Play size={16} /> Start Lesson
              </button>
            </>
          ) : (
            <p style={{ color: "var(--text-muted)" }}>🎉 You've completed the entire curriculum!</p>
          )}
        </div>

        {/* Streak + heatmap */}
        <div className="np-card p-5">
          <div className="mb-3 font-display text-xs" style={{ color: "var(--text-muted)" }}>
            Last 30 Days
          </div>
          <HeatmapCalendar streaks={streaks} />
          <div className="mt-3 flex gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
            <span><span style={{ color: "var(--accent-green)" }}>■</span> studied+quiz</span>
            <span><span style={{ color: "var(--accent)" }}>■</span> studied</span>
          </div>
        </div>

        {/* Weekly project */}
        {weekMeta && (
          <div className="lg:col-span-2">
            <ProjectCard
              weekMeta={weekMeta}
              record={projectRecord}
              onOpen={() => nav(`/projects/${weekMeta.phase.phase}/${weekMeta.week.week}`)}
            />
          </div>
        )}

        {/* Mastery radar */}
        <div className="np-card p-5">
          <div className="mb-2 font-display text-xs" style={{ color: "var(--text-muted)" }}>
            Mastery Radar
          </div>
          <RadarChart data={radarData} />
        </div>

        {/* Phase progress */}
        <div className="np-card p-5 lg:col-span-2">
          <div className="mb-3 font-display text-xs" style={{ color: "var(--text-muted)" }}>
            Phase Progress
          </div>
          <div className="space-y-2">
            {phaseProgress.map((p) => (
              <div key={p.phase} className="flex items-center gap-3">
                <span className="w-28 shrink-0 font-display text-xs" style={{ color: "var(--text-muted)" }}>
                  Phase {p.phase}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded" style={{ background: "var(--bg-elevated)" }}>
                  <div
                    className="h-full rounded"
                    style={{ width: `${p.pct}%`, background: "var(--accent)", transition: "width .5s" }}
                  />
                </div>
                <span className="w-10 text-right font-display text-xs">{p.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent quiz history */}
        <div className="np-card p-5">
          <div className="mb-2 font-display text-xs" style={{ color: "var(--text-muted)" }}>
            Recent Quiz Scores
          </div>
          {recentQuizzes.length ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={recentQuizzes} margin={{ top: 18 }}>
                <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                  labelStyle={{ color: "var(--text-primary)" }}
                  itemStyle={{ color: "var(--text-primary)" }}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  <LabelList
                    dataKey="score"
                    position="top"
                    fill="var(--text-primary)"
                    fontSize={11}
                    fontFamily="var(--font-display)"
                  />
                  {recentQuizzes.map((q, i) => (
                    <Cell key={i} fill={q.score >= 60 ? "var(--accent-green)" : "var(--accent-orange)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No quizzes yet — take your first one!
            </p>
          )}
        </div>

        {/* Active goals */}
        <div className="np-card p-5 lg:col-span-3">
          <div className="mb-3 font-display text-xs" style={{ color: "var(--text-muted)" }}>
            Active Goals
          </div>
          <div className="space-y-2">
            {goals.map((g) => (
              <div key={g.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!g.completed}
                  onChange={(e) => toggleGoal(g.id, e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                <span
                  className="flex-1 text-sm"
                  style={{
                    textDecoration: g.completed ? "line-through" : "none",
                    color: g.completed ? "var(--text-muted)" : "var(--text-primary)",
                  }}
                >
                  {g.text}
                  {g.target_date && (
                    <span className="ml-2 text-xs" style={{ color: "var(--text-dim)" }}>
                      ({g.target_date})
                    </span>
                  )}
                </span>
                <button onClick={() => deleteGoal(g.id)} title="Delete goal">
                  <Trash2 size={15} color="var(--text-muted)" />
                </button>
              </div>
            ))}
            <form
              className="flex gap-2 pt-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (newGoal.trim()) {
                  addGoal(newGoal.trim(), "");
                  setNewGoal("");
                }
              }}
            >
              <input
                className="np-input"
                placeholder="Add a goal…"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
              />
              <button className="np-btn np-btn-secondary" type="submit">
                <Plus size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
