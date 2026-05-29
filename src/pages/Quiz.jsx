import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore.js";
import { getDay } from "../curriculum/index.js";
import QuizCard from "../components/QuizCard.jsx";
import { Loader2, ArrowRight, ArrowLeft, RotateCcw, Check, X, AlertCircle } from "lucide-react";

const api = window.api;

export default function Quiz() {
  const { topicId: paramId } = useParams();
  const nav = useNavigate();
  const topics = useStore((s) => s.topics);
  // Derive locally — calling a store method inside useStore selector returns
  // a fresh object each render and causes an infinite update loop.
  const currentTopic = useMemo(
    () =>
      topics.find((t) => t.status === "in_progress") ||
      topics.find((t) => t.status === "available") ||
      topics[topics.length - 1],
    [topics]
  );
  const topicId = paramId || currentTopic?.id;
  const day = topicId ? getDay(topicId) : null;
  const recordQuiz = useStore((s) => s.recordQuiz);

  const [phase, setPhase] = useState("loading"); // loading | answering | grading | results | error
  const [questions, setQuestions] = useState([]);
  const [source, setSource] = useState("ai");
  const [warning, setWarning] = useState("");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  async function loadQuiz() {
    if (!day) return;
    setPhase("loading");
    setAnswers({});
    setIdx(0);
    setResults(null);
    const res = await api.claudeQuiz(day.id, day.title, day.key_concepts, day.quiz_prompt);
    if (!res.ok) {
      setError(res.error || "Failed to generate quiz.");
      setPhase("error");
      return;
    }
    setSource(res.source);
    setWarning(res.warning || "");
    setQuestions(res.questions || []);
    setPhase("answering");
  }

  useEffect(() => {
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  async function submit() {
    setPhase("grading");
    const graded = [];
    let earned = 0;
    let possible = 0;

    for (const q of questions) {
      if (q.type === "mcq") {
        possible += 1;
        const userIdx = answers[q.id];
        const correct = userIdx === q.correct_index;
        if (correct) earned += 1;
        graded.push({
          ...q,
          user_answer: userIdx != null ? q.options[userIdx] : "(no answer)",
          correct_answer: q.options[q.correct_index],
          is_correct: correct,
          feedback: q.explanation,
        });
      } else {
        possible += 2;
        const userAns = answers[q.id] || "";
        let sc = 0;
        let fb = "Not answered.";
        if (userAns.trim()) {
          const g = await api.claudeGradeShort(q.question, q.model_answer, q.grading_rubric, userAns);
          if (g.ok) {
            sc = g.score ?? 0;
            fb = g.feedback || "";
          } else {
            // Fallback heuristic grading if AI unavailable
            sc = userAns.trim().length > 40 ? 1 : 0;
            fb = "AI grading unavailable — provisional score.";
          }
        }
        earned += sc;
        graded.push({
          ...q,
          user_answer: userAns || "(no answer)",
          correct_answer: q.model_answer,
          is_correct: sc >= 2,
          partial: sc === 1,
          feedback: fb,
        });
      }
    }

    const score = possible ? Math.round((earned / possible) * 100) : 0;

    // Weak concepts: from incorrect questions, surface day key concepts.
    const anyWrong = graded.some((g) => !g.is_correct);
    const weak = anyWrong ? (day.key_concepts || []).slice(0, 3) : [];

    const aiFeedback = `Scored ${score}/100 (${earned}/${possible} points).${weak.length ? " Review: " + weak.join(", ") : ""}`;
    const { passed } = await recordQuiz(day.id, graded, score, aiFeedback);

    setResults({ score, graded, weak, passed });
    setPhase("results");
  }

  if (!day) {
    return (
      <div className="p-8" style={{ color: "var(--text-muted)" }}>
        No topic selected. Pick a lesson from the Curriculum.
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <Center>
        <Loader2 size={28} className="animate-spin" color="var(--accent)" />
        <p className="font-display">Generating personalized questions…</p>
      </Center>
    );
  }

  if (phase === "error") {
    return (
      <Center>
        <AlertCircle size={28} color="var(--accent-red)" />
        <p className="font-display">AI unavailable</p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{error}</p>
        <button className="np-btn np-btn-secondary" onClick={loadQuiz}>
          <RotateCcw size={16} /> Retry
        </button>
      </Center>
    );
  }

  if (phase === "grading") {
    return (
      <Center>
        <Loader2 size={28} className="animate-spin" color="var(--accent)" />
        <p className="font-display">Grading with AI…</p>
      </Center>
    );
  }

  if (phase === "results") {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <div className="np-card mb-6 flex items-center justify-between p-6">
          <div>
            <div className="font-display text-xs" style={{ color: "var(--text-muted)" }}>
              {day.title}
            </div>
            <h1 className="font-display text-2xl font-bold">
              {results.score}/100 {results.passed ? "✓ Passed" : "— Needs ≥60 to advance"}
            </h1>
            {results.weak.length > 0 && (
              <p className="mt-1 text-sm" style={{ color: "var(--accent-orange)" }}>
                You should review: {results.weak.join(", ")}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button className="np-btn np-btn-secondary" onClick={loadQuiz}>
              <RotateCcw size={16} /> Retry
            </button>
            <button
              className="np-btn np-btn-primary"
              onClick={() => nav(results.passed ? "/" : `/lesson/${day.id}`)}
            >
              {results.passed ? "Continue" : "Re-study"} <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {results.graded.map((g, i) => (
            <div key={i} className="np-card p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5">
                  {g.is_correct ? (
                    <Check size={18} color="var(--accent-green)" />
                  ) : g.partial ? (
                    <AlertCircle size={18} color="var(--accent-orange)" />
                  ) : (
                    <X size={18} color="var(--accent-red)" />
                  )}
                </span>
                <div className="flex-1">
                  <p className="mb-2 font-medium">
                    {i + 1}. {g.question}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    <span style={{ color: "var(--text-dim)" }}>Your answer: </span>
                    {g.user_answer}
                  </p>
                  {!g.is_correct && (
                    <p className="text-sm" style={{ color: "var(--accent-green)" }}>
                      <span style={{ color: "var(--text-dim)" }}>Correct: </span>
                      {g.correct_answer}
                    </p>
                  )}
                  <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                    {g.feedback}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // answering
  const q = questions[idx];
  const answered = questions.filter((qq) => answers[qq.id] != null && answers[qq.id] !== "").length;
  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-4">
        {source === "cache" && (
          <div
            className="mb-3 rounded-lg border p-2 text-xs"
            style={{ borderColor: "var(--accent-orange)", color: "var(--accent-orange)" }}
          >
            AI unavailable — using cached questions.
          </div>
        )}
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-sm" style={{ color: "var(--text-muted)" }}>
            {day.title}
          </span>
          <span className="font-display text-sm" style={{ color: "var(--text-muted)" }}>
            {answered}/{questions.length} answered
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded" style={{ background: "var(--bg-elevated)" }}>
          <div
            className="h-full rounded"
            style={{ width: `${((idx + 1) / questions.length) * 100}%`, background: "var(--accent)" }}
          />
        </div>
      </div>

      <QuizCard
        question={q}
        index={idx}
        total={questions.length}
        answer={answers[q.id]}
        onAnswer={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
      />

      <div className="mt-4 flex items-center justify-between">
        <button
          className="np-btn np-btn-secondary"
          disabled={idx === 0}
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
        >
          <ArrowLeft size={16} /> Previous
        </button>
        {idx < questions.length - 1 ? (
          <button className="np-btn np-btn-primary" onClick={() => setIdx((i) => i + 1)}>
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button className="np-btn np-btn-primary" onClick={submit}>
            Submit Quiz <Check size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function Center({ children }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3" style={{ color: "var(--text-primary)" }}>
      {children}
    </div>
  );
}
