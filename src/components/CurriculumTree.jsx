import { useStore } from "../store/useStore.js";
import { Lock, Circle, CheckCircle2, AlertTriangle, FlaskConical } from "lucide-react";

const STATUS_COLOR = {
  locked: "var(--text-dim)",
  available: "var(--accent)",
  in_progress: "var(--accent)",
  completed: "var(--accent-green)",
};

// Vertical phase → week → day tree. onSelectDay(topicId) is optional.
export default function CurriculumTree({ onSelectDay }) {
  const curriculum = useStore((s) => s.curriculum);
  const topics = useStore((s) => s.topics);
  const topicMap = new Map(topics.map((t) => [t.id, t]));

  return (
    <div className="space-y-6">
      {curriculum.map((phase) => (
        <div key={phase.phase}>
          <h3 className="mb-2 font-display text-sm uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Phase {phase.phase} · {phase.title}
          </h3>
          <div className="space-y-3 border-l pl-4" style={{ borderColor: "var(--border)" }}>
            {phase.weeks.map((wk) => (
              <div key={wk.week}>
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-display text-sm font-semibold">
                    Week {wk.week}: {wk.title}
                  </span>
                  {wk.research_papers?.length > 0 && (
                    <FlaskConical size={13} color="var(--accent-orange)" title="Research extension available" />
                  )}
                  <span
                    className="np-tag"
                    style={{
                      background: wk.compute === "colab" ? "rgba(245,158,11,0.15)" : "var(--bg-elevated)",
                      color: wk.compute === "colab" ? "var(--accent-orange)" : "var(--text-muted)",
                    }}
                  >
                    {wk.compute === "colab" ? "GPU · Colab" : "CPU · Local"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {wk.days.map((d) => {
                    const id = `p${phase.phase}_w${wk.week}_d${d.day}`;
                    const t = topicMap.get(id);
                    const status = t?.status || "locked";
                    const weak = status === "completed" && (t?.mastery_score ?? 0) < 70;
                    const color = weak ? "var(--accent-orange)" : STATUS_COLOR[status];
                    const Icon =
                      status === "locked"
                        ? Lock
                        : status === "completed"
                          ? weak
                            ? AlertTriangle
                            : CheckCircle2
                          : Circle;
                    return (
                      <button
                        key={id}
                        disabled={status === "locked"}
                        onClick={() => status !== "locked" && onSelectDay?.(id)}
                        title={`${d.title}${t ? ` — ${status} (${t.mastery_score}%)` : ""}`}
                        className="flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition disabled:cursor-not-allowed"
                        style={{
                          borderColor: "var(--border)",
                          color,
                          opacity: status === "locked" ? 0.5 : 1,
                        }}
                      >
                        <Icon size={13} color={color} />
                        <span style={{ color: "var(--text-primary)" }}>D{d.day}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
