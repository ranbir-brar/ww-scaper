import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = {
  Python: "#3776ab",
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Java: "#ed8b00",
  React: "#61dafb",
  SQL: "#336791",
  Git: "#f05032",
  Docker: "#2496ed",
  AWS: "#ff9900",
  Azure: "#0078d4",
  "Node.js": "#339933",
  HTML: "#e34f26",
  CSS: "#1572b6",
  Angular: "#dd0031",
  Flask: "#000000",
  Django: "#092e20",
  default: "#3b82f6",
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2 shadow-xl">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">
          {payload[0].payload.name}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {payload[0].value} jobs
        </p>
      </div>
    );
  }
  return null;
};

export default function SkillsChart({ skills, onSkillClick }) {
  const data = skills.map(([name, count]) => ({ name, count }));

  return (
    <div className="glass-card p-5">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
        Top Skills
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
            />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              cursor="pointer"
              onClick={(data) => onSkillClick(data.name)}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name] || COLORS.default}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mt-2 text-center">
        Click a bar to filter by skill
      </p>
    </div>
  );
}
