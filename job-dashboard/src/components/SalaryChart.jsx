import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function SalaryChart({ jobs }) {
  const data = useMemo(() => {
    const ranges = {
      "$0-15": 0,
      "$15-20": 0,
      "$20-25": 0,
      "$25-30": 0,
      "$30-40": 0,
      "$40+": 0,
      "Not specified": 0,
    };

    jobs.forEach((job) => {
      if (!job.salary) {
        ranges["Not specified"]++;
      } else {
        const avg = job.salary.avg;
        if (avg < 15) ranges["$0-15"]++;
        else if (avg < 20) ranges["$15-20"]++;
        else if (avg < 25) ranges["$20-25"]++;
        else if (avg < 30) ranges["$25-30"]++;
        else if (avg < 40) ranges["$30-40"]++;
        else ranges["$40+"]++;
      }
    });

    return Object.entries(ranges).map(([range, count]) => ({ range, count }));
  }, [jobs]);

  const colors = [
    "#fee2e2",
    "#fef3c7",
    "#dcfce7",
    "#d1fae5",
    "#99f6e4",
    "#5eead4",
    "#e2e8f0",
  ];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
        >
          <XAxis
            dataKey="range"
            tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "white",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.range} fill={colors[index] || "#0f766e"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
