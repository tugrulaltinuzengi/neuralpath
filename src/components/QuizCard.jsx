// Renders a single quiz question (MCQ or short answer) in answering mode.
export default function QuizCard({ question, index, total, answer, onAnswer }) {
  if (!question) return null;
  const options = Array.isArray(question.options) ? question.options : [];
  // Treat as MCQ only when we actually have options to render.
  const isMcq = question.type === "mcq" && options.length > 0;
  // For MCQ, `answer` is the selected option index (a number); only short-answer
  // answers are strings. Coerce before calling string methods so a numeric MCQ
  // answer can't throw `.trim is not a function` and blank the screen.
  const textAnswer = typeof answer === "string" ? answer : "";
  const words = textAnswer.trim() ? textAnswer.trim().split(/\s+/).length : 0;

  return (
    <div className="np-card p-6">
      <div className="mb-1 font-display text-xs" style={{ color: "var(--text-muted)" }}>
        Question {index + 1} of {total} · {isMcq ? "Multiple choice" : "Short answer"}
      </div>
      <h3 className="mb-4 text-lg font-medium">{question.question}</h3>

      {isMcq ? (
        <div className="space-y-2">
          {options.map((opt, i) => {
            const selected = answer === i;
            return (
              <button
                key={i}
                onClick={() => onAnswer(i)}
                className="flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition"
                style={{
                  borderColor: selected ? "var(--accent)" : "var(--border)",
                  background: selected ? "rgba(79,142,247,0.12)" : "transparent",
                }}
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full font-display text-xs"
                  style={{
                    background: selected ? "var(--accent)" : "var(--bg-elevated)",
                    color: selected ? "#fff" : "var(--text-muted)",
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          <textarea
            className="np-input min-h-[120px] resize-y"
            placeholder="Type your answer…"
            value={textAnswer}
            onChange={(e) => onAnswer(e.target.value)}
          />
          <div className="mt-1 text-right text-xs" style={{ color: "var(--text-muted)" }}>
            {words} words
          </div>
        </div>
      )}
    </div>
  );
}
