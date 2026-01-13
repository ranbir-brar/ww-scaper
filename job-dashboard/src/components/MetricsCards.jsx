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

    const locationCounts = {};
    jobs.forEach((j) => {
      locationCounts[j.city] = (locationCounts[j.city] || 0) + 1;
    });
    const topLocation = Object.entries(locationCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return { avgSalary, closingSoon, lowCompetition, topLocation };
  }, [jobs]);

  const cards = [
    {
      label: "Total Jobs",
      value: jobs.length,
      subtext: `of ${totalJobs} total`,
      icon: (
        <svg
          className="w-6 h-6"
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
      color: "var(--color-accent-blue)",
    },
    {
      label: "Avg Salary",
      value: metrics.avgSalary ? `$${metrics.avgSalary}/hr` : "N/A",
      subtext: "hourly rate",
      icon: (
        <svg
          className="w-6 h-6"
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
      color: "var(--color-accent-emerald)",
    },
    {
      label: "Closing Soon",
      value: metrics.closingSoon,
      subtext: "within 7 days",
      icon: (
        <svg
          className="w-6 h-6"
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
      color: "var(--color-accent-amber)",
    },
    {
      label: "Low Competition",
      value: metrics.lowCompetition,
      subtext: "<5 apps/opening",
      icon: (
        <svg
          className="w-6 h-6"
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
      color: "var(--color-accent-rose)",
    },
    {
      label: "Top Location",
      value: metrics.topLocation ? metrics.topLocation[0] : "N/A",
      subtext: metrics.topLocation ? `${metrics.topLocation[1]} jobs` : "",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      color: "var(--color-accent-blue)",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="metric-card animate-fade-in"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${card.color}20`, color: card.color }}
            >
              {card.icon}
            </div>
          </div>
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">
            {card.value}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">
            {card.label}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {card.subtext}
          </div>
        </div>
      ))}
    </div>
  );
}
