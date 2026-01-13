import { useState, memo } from "react";

function JobCard({ job, searchQuery }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const now = new Date();
  const deadline = new Date(job.deadline);
  const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  const isUrgent = daysUntilDeadline <= 3 && daysUntilDeadline >= 0;

  const highlightText = (text) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-[var(--color-accent-blue)]/30 text-[var(--color-text-primary)] rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className={`glass-card p-5 cursor-pointer animate-fade-in ${
        isExpanded ? "ring-2 ring-[var(--color-accent-blue)]" : ""
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] truncate">
            {highlightText(job.title)}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {highlightText(job.organization)}
          </p>
          <div className="flex items-center gap-2 mt-2 text-sm text-[var(--color-text-muted)]">
            <svg
              className="w-4 h-4"
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
            </svg>
            <span>{job.city}</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          {job.salary ? (
            <div className="text-lg font-bold text-[var(--color-accent-emerald)]">
              ${job.salary.min}-${job.salary.max}/hr
            </div>
          ) : (
            <div className="text-sm text-[var(--color-text-muted)]">
              Salary TBD
            </div>
          )}
          <div
            className={`text-sm mt-1 ${
              isUrgent
                ? "text-[var(--color-accent-rose)] urgency-warning font-semibold"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            {isUrgent ? `${daysUntilDeadline}d left` : formatDate(job.deadline)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <div className="flex flex-wrap gap-1.5">
          {job.level.map((lvl) => (
            <span
              key={lvl}
              className={`level-badge level-${lvl.toLowerCase()}`}
            >
              {lvl}
            </span>
          ))}
        </div>
        <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {job.appsPerOpening} apps/opening
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {job.skills.slice(0, 5).map((skill) => (
          <span key={skill} className="skill-badge">
            {skill}
          </span>
        ))}
        {job.skills.length > 5 && (
          <span className="text-xs text-[var(--color-text-muted)] self-center">
            +{job.skills.length - 5} more
          </span>
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border)] animate-slide-down">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[var(--color-text-muted)]">Duration:</span>
              <span className="ml-2 text-[var(--color-text-secondary)]">
                {job.duration}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Openings:</span>
              <span className="ml-2 text-[var(--color-text-secondary)]">
                {job.openings}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">
                Applications:
              </span>
              <span className="ml-2 text-[var(--color-text-secondary)]">
                {job.apps}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">ID:</span>
              <span className="ml-2 text-[var(--color-text-secondary)]">
                {job.id}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-[var(--color-text-muted)] text-sm">
              All Skills:
            </span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {job.skills.map((skill) => (
                <span key={skill} className="skill-badge">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(JobCard);
