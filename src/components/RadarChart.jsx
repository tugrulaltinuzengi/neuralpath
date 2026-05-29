import {
  Radar,
  RadarChart as ReRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

// Mastery radar over the 6 domains. `data` = [{ domain: "Foundations", score: 80 }, ...]
export default function RadarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ReRadar data={data} outerRadius="75%">
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="domain"
          tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "JetBrains Mono" }}
        />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "var(--text-dim)", fontSize: 9 }} stroke="var(--border)" />
        <Radar
          dataKey="score"
          stroke="var(--accent)"
          fill="var(--accent)"
          fillOpacity={0.35}
          isAnimationActive
        />
      </ReRadar>
    </ResponsiveContainer>
  );
}
