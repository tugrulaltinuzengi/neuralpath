import { Cloud, CheckCircle2, Clock, FolderGit2 } from "lucide-react";

const STATUS_META = {
  pending: { label: "Not started", color: "var(--text-muted)", Icon: Clock },
  submitted: { label: "Submitted", color: "var(--accent)", Icon: FolderGit2 },
  graded: { label: "Graded", color: "var(--accent-green)", Icon: CheckCircle2 },
};

// Weekly project summary card (used on Dashboard and Projects list).
export default function ProjectCard({ weekMeta, record, daysRemaining, onOpen }) {
  const { phase, week } = weekMeta;
  const status = record?.status || "pending";
  const meta = STATUS_META[status] || STATUS_META.pending;
  const isColab = week.compute === "colab";
  const viaColab = record?.ai_feedback?.startsWith?.("Completed on Google Colab");

  return (
    <button
      onClick={onOpen}
      className="np-card w-full p-5 text-left transition hover:brightness-110"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="font-display text-xs" style={{ color: "var(--text-muted)" }}>
            Week {week.week} Project
          </div>
          <h3 className="font-display text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            {week.project.title}
          </h3>
        </div>
        <span
          className="np-tag shrink-0"
          style={{
            background: isColab ? "rgba(245,158,11,0.15)" : "var(--bg-elevated)",
            color: isColab ? "var(--accent-orange)" : "var(--text-muted)",
          }}
        >
          {isColab ? "GPU · Colab recommended" : "CPU · Run locally"}
        </span>
      </div>

      <p className="mb-3 line-clamp-2 text-sm" style={{ color: "var(--text-muted)" }}>
        {week.project.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm" style={{ color: meta.color }}>
          {viaColab ? <Cloud size={16} color="var(--accent)" /> : <meta.Icon size={16} />}
          <span className="font-display">{viaColab ? "Completed via Colab" : meta.label}</span>
          {status === "graded" && record?.score != null && (
            <span className="font-display font-bold" style={{ color: "var(--text-primary)" }}>
              · {record.score}/100
            </span>
          )}
        </div>
        {typeof daysRemaining === "number" && status === "pending" && (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {daysRemaining} days left
          </span>
        )}
      </div>
    </button>
  );
}
