import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore.js";
import CurriculumTree from "../components/CurriculumTree.jsx";
import { Lock, Circle, CheckCircle2, AlertTriangle } from "lucide-react";

// Browse the full curriculum. Clicking an unlocked day routes to its lesson.
export default function Curriculum() {
  const nav = useNavigate();
  const topics = useStore((s) => s.topics);

  const completed = topics.filter((t) => t.status === "completed").length;
  const available = topics.filter((t) => t.status === "available" || t.status === "in_progress").length;
  const locked = topics.filter((t) => t.status === "locked").length;

  return (
    <div className="mx-auto max-w-5xl p-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold">Curriculum</h1>
        <p style={{ color: "var(--text-muted)" }}>
          21 weeks · 6 phases · foundations → research level. Click any unlocked day to open its lesson.
        </p>
      </header>

      {/* Legend */}
      <div className="np-card mb-6 flex flex-wrap items-center gap-5 p-4 text-sm">
        <Legend Icon={CheckCircle2} color="var(--accent-green)" label={`Completed (${completed})`} />
        <Legend Icon={Circle} color="var(--accent)" label={`Available (${available})`} />
        <Legend Icon={AlertTriangle} color="var(--accent-orange)" label="Weak (mastery < 70)" />
        <Legend Icon={Lock} color="var(--text-dim)" label={`Locked (${locked})`} />
      </div>

      <div className="np-card p-6">
        <CurriculumTree onSelectDay={(id) => nav(`/lesson/${id}`)} />
      </div>
    </div>
  );
}

function Legend({ Icon, color, label }) {
  return (
    <span className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
      <Icon size={15} color={color} /> {label}
    </span>
  );
}
