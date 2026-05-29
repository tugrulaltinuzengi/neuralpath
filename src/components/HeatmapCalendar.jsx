// Calendar heatmap of the last 30 days.
// green = studied, red = missed (past, no activity), gray = future/today untouched.
export default function HeatmapCalendar({ streaks = [] }) {
  const byDate = new Map(streaks.map((s) => [s.date, s]));
  const today = new Date();
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const rec = byDate.get(iso);
    let color = "var(--bg-elevated)"; // missed (past) default
    let title = `${iso}: no activity`;
    if (rec && rec.studied) {
      color = rec.quiz_done ? "var(--accent-green)" : "var(--accent)";
      title = `${iso}: studied${rec.quiz_done ? " + quiz" : ""}`;
    } else if (i === 0) {
      color = "var(--bg-elevated)";
      title = `${iso}: today`;
    } else {
      color = "rgba(239,68,68,0.35)"; // faint red for missed past days
      title = `${iso}: missed`;
    }
    days.push({ iso, color, title });
  }
  return (
    <div className="grid grid-cols-10 gap-1.5">
      {days.map((d) => (
        <div
          key={d.iso}
          title={d.title}
          className="aspect-square rounded"
          style={{ background: d.color, border: "1px solid var(--border)" }}
        />
      ))}
    </div>
  );
}
