import { useMemo } from "react";

export default function MetricsCards({ jobs, totalJobs }) {
  const metrics = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const jobsWithSalary = jobs.filter((j) => j.salary);
    const avgSalary =
      jobsWithSalary.length > 0
        ? (
            jobsWithSalary.reduce((sum, j) => sum + j.salary.avg, 0) /
            jobsWithSalary.length
          ).toFixed(0)
        : null;

    const closingSoon = jobs.filter(
      (j) => new Date(j.deadline) <= weekFromNow
    ).length;
    const lowCompetition = jobs.filter(
      (j) => parseFloat(j.appsPerOpening) < 5
    ).length;

    return { avgSalary, closingSoon, lowCompetition };
  }, [jobs]);

  const cards = [
    {
      label: "Jobs Found",
      value: jobs.length,
      icon: (
        <svg
          className="w-5 h-5 text-[var(--color-primary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      glow: "rgba(212, 255, 0, 0.1)",
    },
    {
      label: "Avg Rate/Hr",
      value: metrics.avgSalary ? `$${metrics.avgSalary}` : "--",
      icon: (
        <svg
          className="w-5 h-5 text-emerald-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      glow: "rgba(52, 211, 153, 0.1)",
    },
    {
      label: "Closing Soon",
      value: metrics.closingSoon,
      icon: (
        <svg
          className="w-5 h-5 text-amber-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      glow: "rgba(251, 191, 36, 0.1)",
    },
    {
      label: "Low Competition",
      value: metrics.lowCompetition,
      icon: (
        <svg
          className="w-5 h-5 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      glow: "rgba(96, 165, 250, 0.1)",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-enter delay-1">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-[var(--bg-surface)] border border-[var(--border-dim)] rounded-xl p-5 hover:border-[var(--border-highlight)] transition-colors group relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${card.glow}, transparent 70%)`,
            }}
          />
          <div className="relative flex items-center justify-between mb-2">
            <span className="text-[var(--text-muted)] text-sm font-medium">
              {card.label}
            </span>
            <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[var(--border-dim)]">
              {card.icon}
            </div>
          </div>
          <div className="relative text-2xl font-bold font-display tracking-tight text-[var(--text-main)]">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
