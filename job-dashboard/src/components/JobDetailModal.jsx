export default function JobDetailModal({ job, onClose }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#000]/80 backdrop-blur-sm animate-enter"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-dim)] rounded-2xl shadow-2xl overflow-hidden animate-enter delay-1 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[var(--bg-surface)]/95 backdrop-blur border-b border-[var(--border-dim)] px-8 py-6 flex items-start justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold font-display tracking-tight text-[var(--text-main)] pr-8 leading-tight">
              {job.title}
            </h2>
            <p className="text-[var(--text-muted)] mt-2 font-medium text-lg">
              {job.organization}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-white transition-colors shrink-0 border border-[var(--border-dim)]"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-5 border border-[var(--border-dim)]">
              <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest mb-2">
                Location
              </p>
              <p className="text-base font-medium text-[var(--text-main)] flex items-center gap-2">
                {job.city}
              </p>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-5 border border-[var(--border-dim)]">
              <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest mb-2">
                Compensation
              </p>
              <p className="text-base font-medium text-[var(--text-main)] flex items-center gap-2">
                {" "}
                {job.salary
                  ? `$${job.salary.min}-${job.salary.max}/hr`
                  : "Not specified"}
              </p>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-5 border border-[var(--border-dim)]">
              <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest mb-2">
                Duration
              </p>
              <p className="text-base font-medium text-[var(--text-main)] flex items-center gap-2">
                {job.duration}
              </p>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-5 border border-[var(--border-dim)]">
              <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest mb-2">
                Deadline
              </p>
              <p className="text-base font-medium text-[var(--text-main)] flex items-center gap-2">
                {formatDate(job.deadline)}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">
              Job Level
            </p>
            <div className="flex flex-wrap gap-2">
              {job.level.map((lvl) => (
                <span
                  key={lvl}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-dim)] text-sm font-medium text-[var(--text-main)] bg-[rgba(255,255,255,0.05)]"
                >
                  {lvl}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">
              Tech Stack
            </p>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span key={skill} className="skill-pill">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-8 p-5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--border-dim)]">
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">
              Competition Analysis
            </p>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-1 bg-[rgba(255,255,255,0.1)] rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--color-primary)] to-emerald-400 rounded-full shadow-[0_0_10px_var(--color-primary)]"
                  style={{
                    width: `${Math.min(
                      parseFloat(job.appsPerOpening) * 5,
                      100
                    )}%`,
                  }}
                />
              </div>
              <span className="text-sm font-mono text-[var(--text-main)]">
                {job.apps} apps / {job.openings} spot
                {job.openings > 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Approx. {job.appsPerOpening} applicants per opening
            </p>
          </div>
        </div>

        <div className="border-t border-[var(--border-dim)] p-6 bg-[var(--bg-surface)] flex gap-4 items-center">
          <button
            onClick={onClose}
            className="btn-secondary flex-1 py-3 text-base"
          >
            Close Details
          </button>
          <div className="flex-1 py-3 text-base text-center font-mono text-[var(--text-muted)] border border-[var(--border-dim)] rounded-lg bg-[rgba(255,255,255,0.03)] selection:bg-[var(--color-primary)] selection:text-black">
            Job ID:{" "}
            <span className="text-[var(--text-main)] font-bold select-all">
              {job.id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
