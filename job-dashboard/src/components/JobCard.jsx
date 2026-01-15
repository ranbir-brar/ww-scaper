import { memo } from "react";

function JobCard({ job, searchQuery, onClick }) {
  const now = new Date();
  const deadline = new Date(job.deadline);
  const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  const isUrgent = daysUntilDeadline <= 3 && daysUntilDeadline >= 0;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const highlightText = (text) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 text-inherit rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="job-card animate-enter" onClick={onClick}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] leading-tight">
            {highlightText(job.title)}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {job.organization}
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
            <span></span> {job.city}
          </p>
        </div>

        <div className="text-right shrink-0">
          {job.salary ? (
            <span className="salary-badge">
              ${job.salary.min}-${job.salary.max}/hr
            </span>
          ) : (
            <span className="text-sm text-[var(--color-text-muted)]">
              Salary TBD
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 text-sm text-[var(--color-text-muted)]">
        <span>{job.duration}</span>
        <span>•</span>
        <span className={isUrgent ? "deadline-urgent" : ""}>
          {" "}
          {isUrgent ? `${daysUntilDeadline}d left` : formatDate(job.deadline)}
        </span>
        <span>•</span>
        <span>{job.appsPerOpening} apps/opening</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {job.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="skill-pill">
            {skill}
          </span>
        ))}
        {job.skills.length > 4 && (
          <span className="text-xs text-[var(--color-text-muted)]">
            +{job.skills.length - 4} more
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(JobCard);
