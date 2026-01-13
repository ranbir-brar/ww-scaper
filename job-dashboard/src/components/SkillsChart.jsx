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
  default: "#0f766e",
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[var(--color-border)] rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-medium">{payload[0].payload.name}</p>
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
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(15, 118, 110, 0.05)" }}
          />
          <Bar
            dataKey="count"
            radius={[0, 4, 4, 0]}
            cursor="pointer"
            onClick={(data) => onSkillClick && onSkillClick(data.name)}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name] || COLORS.default}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
