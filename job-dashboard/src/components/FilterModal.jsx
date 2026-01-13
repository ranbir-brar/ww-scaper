export default function FilterModal({
  filters,
  onFilterChange,
  onClearAll,
  onClose,
  allSkills,
  allLocations,
}) {
  const levels = ["Junior", "Intermediate", "Senior"];

  const handleSkillToggle = (skill) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter((s) => s !== skill)
      : [...filters.skills, skill];
    onFilterChange({ skills: newSkills });
  };

  const handleLocationToggle = (location) => {
    const newLocations = filters.locations.includes(location)
      ? filters.locations.filter((l) => l !== location)
      : [...filters.locations, location];
    onFilterChange({ locations: newLocations });
  };

  const handleLevelToggle = (level) => {
    const newLevels = filters.levels.includes(level)
      ? filters.levels.filter((l) => l !== level)
      : [...filters.levels, level];
    onFilterChange({ levels: newLevels });
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-content !bg-[var(--bg-surface)] !border-l !border-[var(--border-dim)] !shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="sticky top-0 bg-[var(--bg-surface)] border-b border-[var(--border-dim)] px-6 py-5 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold font-display tracking-tight text-[var(--text-main)]">
            Filter Jobs
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.1)] text-[var(--text-muted)] transition-colors"
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

        <div className="p-6 space-y-8">
          <section>
            <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
              Salary Range
            </h3>
            <div className="bg-[rgba(255,255,255,0.03)] p-4 rounded-xl border border-[var(--border-dim)]">
              <div className="flex items-center justify-between mb-2 text-sm font-mono text-[var(--text-muted)]">
                <span>${filters.salaryMin}/hr</span>
                <span>${filters.salaryMax}/hr</span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.salaryMin}
                  onChange={(e) =>
                    onFilterChange({ salaryMin: parseInt(e.target.value) })
                  }
                  className="flex-1 h-1 bg-[var(--border-dim)] rounded-full appearance-none cursor-pointer accent-[var(--color-primary)]"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.salaryMax}
                  onChange={(e) =>
                    onFilterChange({ salaryMax: parseInt(e.target.value) })
                  }
                  className="flex-1 h-1 bg-[var(--border-dim)] rounded-full appearance-none cursor-pointer accent-[var(--color-primary)]"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
              Region
            </h3>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
              {allLocations.map(([location, count]) => (
                <label
                  key={location}
                  className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[rgba(255,255,255,0.03)] transition-colors group"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      filters.locations.includes(location)
                        ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                        : "border-[var(--border-dim)] group-hover:border-[var(--text-muted)]"
                    }`}
                  >
                    {filters.locations.includes(location) && (
                      <svg
                        className="w-3 h-3 text-black"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      filters.locations.includes(location)
                        ? "text-[var(--text-main)] font-medium"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {location}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] ml-auto">
                    {count}
                  </span>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={filters.locations.includes(location)}
                    onChange={() => handleLocationToggle(location)}
                  />
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
              Max Apps / Opening
            </h3>
            <div className="bg-[rgba(255,255,255,0.03)] p-4 rounded-xl border border-[var(--border-dim)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-mono text-[var(--text-muted)]">
                  Up to {filters.maxCompetition}
                </span>
                <span className="text-xs bg-[rgba(212,255,0,0.1)] text-[var(--color-primary)] px-2 py-0.5 rounded-full">
                  Less Competition
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.maxCompetition}
                onChange={(e) =>
                  onFilterChange({ maxCompetition: parseInt(e.target.value) })
                }
                className="w-full h-1 bg-[var(--border-dim)] rounded-full appearance-none cursor-pointer accent-[var(--color-primary)]"
              />
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
              Technologies
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
              {allSkills.slice(0, 20).map(([skill, count]) => (
                <label
                  key={skill}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[rgba(255,255,255,0.03)] cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        filters.skills.includes(skill)
                          ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                          : "border-[var(--border-dim)] group-hover:border-[var(--text-muted)]"
                      }`}
                    >
                      {filters.skills.includes(skill) && (
                        <svg
                          className="w-3 h-3 text-black"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-sm transition-colors ${
                        filters.skills.includes(skill)
                          ? "text-[var(--text-main)] font-semibold"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {skill}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[var(--text-muted)] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded">
                    {count}
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 bg-[var(--bg-surface)] border-t border-[var(--border-dim)] px-6 py-5 flex gap-4 z-10">
          <button onClick={onClearAll} className="btn-secondary flex-1">
            Reset
          </button>
          <button
            onClick={onClose}
            className="btn-primary flex-1 shadow-[0_0_20px_rgba(212,255,0,0.2)]"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
