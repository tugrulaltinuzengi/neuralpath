import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore.js";
import { getDay, getWeek, DOMAIN_LABELS } from "../curriculum/index.js";
import MarkdownRenderer from "../components/MarkdownRenderer.jsx";
import { ArrowRight, StickyNote, FlaskConical, ExternalLink, Clock } from "lucide-react";

const api = window.api;
const MIN_SECONDS = 180; // anti-skip: 3 minutes

export default function Lesson() {
  const { topicId } = useParams();
  const nav = useNavigate();
  const day = getDay(topicId);
  const week = day ? getWeek(day.phase, day.week) : null;
  const logSession = useStore((s) => s.logSession);

  const [seconds, setSeconds] = useState(0);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [checked, setChecked] = useState({});
  const saveTimer = useRef(null);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Load any existing notes for today's session of this topic
  useEffect(() => {
    (async () => {
      const rows = await api.dbQuery(
        "SELECT notes FROM sessions WHERE topic_id = ? ORDER BY id DESC LIMIT 1",
        [topicId]
      );
      if (rows[0]?.notes) setNotes(rows[0].notes);
    })();
  }, [topicId]);

  // Debounced notes save (writes a draft session row; final logged on Mark as Read)
  function onNotesChange(v) {
    setNotes(v);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      api.dbRun(
        "INSERT INTO sessions (topic_id, date, duration_secs, completed, notes) VALUES (?, ?, ?, 0, ?)",
        [topicId, new Date().toISOString().slice(0, 10), seconds, v]
      );
    }, 500);
  }

  async function markRead() {
    await logSession(topicId, seconds, notes, 1);
    nav(`/quiz/${topicId}`);
  }

  if (!day) {
    return <div className="p-8" style={{ color: "var(--text-muted)" }}>Lesson not found.</div>;
  }

  const readyToQuiz = seconds >= MIN_SECONDS;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const concepts = day.key_concepts || [];

  return (
    <div className="flex h-full flex-col">
      {/* Sticky header */}
      <div
        className="sticky top-0 z-10 border-b px-8 py-4"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-xs" style={{ color: "var(--text-muted)" }}>
              Phase {day.phase} · {day.phaseTitle} → Week {day.week} → Day {day.day}
            </div>
            <h1 className="font-display text-xl font-bold">{day.title}</h1>
          </div>
          <div className="flex items-center gap-2 font-display text-sm" style={{ color: "var(--text-muted)" }}>
            <Clock size={15} /> {mm}:{ss}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Lesson content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto max-w-3xl">
            <MarkdownRenderer>{day.lesson_markdown}</MarkdownRenderer>

            {/* Research extension panel */}
            {week?.research_papers?.length > 0 && (
              <div className="mt-8">
                {week.research_papers.map((p) => (
                  <details key={p.id} className="np-card mb-3 p-4">
                    <summary className="flex cursor-pointer items-center gap-2 font-display text-sm font-semibold">
                      <FlaskConical size={16} color="var(--accent-orange)" />
                      Research Extension — {p.title}
                    </summary>
                    <div className="mt-3 space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
                      <div style={{ color: "var(--text-dim)" }}>{p.authors} · arXiv:{p.arxiv}</div>
                      <p>{p.relevance}</p>
                      <button
                        className="inline-flex items-center gap-1"
                        style={{ color: "var(--accent)" }}
                        onClick={() => api.openExternal(`https://arxiv.org/abs/${p.arxiv}`)}
                      >
                        Read on arXiv <ExternalLink size={12} />
                      </button>
                      {p.project_extension && (
                        <div className="mt-3 rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
                          <div className="mb-1 flex items-center gap-2">
                            <span
                              className="np-tag"
                              style={{ background: "rgba(245,158,11,0.15)", color: "var(--accent-orange)" }}
                            >
                              Research Track — optional
                            </span>
                            <span className="font-display text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                              {p.project_extension.title}
                            </span>
                          </div>
                          <p>{p.project_extension.description}</p>
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar: key concepts */}
        <div
          className="w-64 shrink-0 overflow-y-auto border-l px-5 py-6"
          style={{ borderColor: "var(--border)", background: "var(--bg-surface)" }}
        >
          <div className="mb-3 font-display text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Key Concepts
          </div>
          <div className="space-y-2">
            {concepts.map((c) => (
              <label key={c} className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!checked[c]}
                  onChange={(e) => setChecked((m) => ({ ...m, [c]: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 accent-[var(--accent-green)]"
                />
                <span style={{ color: checked[c] ? "var(--text-muted)" : "var(--text-primary)" }}>{c}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Notes panel */}
      {showNotes && (
        <div className="border-t px-8 py-4" style={{ borderColor: "var(--border)", background: "var(--bg-surface)" }}>
          <textarea
            className="np-input min-h-[80px] resize-y"
            placeholder="Your notes (saved automatically)…"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
          />
        </div>
      )}

      {/* Bottom bar */}
      <div
        className="flex items-center justify-between border-t px-8 py-4"
        style={{ borderColor: "var(--border)", background: "var(--bg-surface)" }}
      >
        <button className="np-btn np-btn-secondary" onClick={() => setShowNotes((v) => !v)}>
          <StickyNote size={16} /> {showNotes ? "Hide Notes" : "Notes"}
        </button>
        <div className="flex items-center gap-3">
          {!readyToQuiz && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Available in {Math.ceil((MIN_SECONDS - seconds) / 60)} min (anti-skip)
            </span>
          )}
          <button className="np-btn np-btn-primary" disabled={!readyToQuiz} onClick={markRead}>
            Mark as Read → Take Quiz <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
