export default function FilterPanel({
  filters,
  onFilterChange,
  onClearAll,
  allSkills,
  allLocations,
  filteredCount,
  totalCount,
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

  const activeFilterCount =
    filters.skills.length +
    filters.locations.length +
    filters.levels.length +
    (filters.salaryMin > 0 || filters.salaryMax < 100 ? 1 : 0) +
    (filters.deadlineFilter !== "all" ? 1 : 0) +
    (filters.maxCompetition < 50 ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Filters
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            {filteredCount} of {totalCount} jobs
          </p>
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-[var(--color-accent-blue)] hover:text-[var(--color-accent-emerald)] transition-colors"
          >
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      <div className="filter-section">
        <label className="filter-label">Salary Range ($/hr)</label>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-sm text-[var(--color-text-secondary)]">
            ${filters.salaryMin}
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.salaryMin}
            onChange={(e) =>
              onFilterChange({ salaryMin: parseInt(e.target.value) })
            }
            className="range-slider flex-1"
          />
          <input
            type="range"
            min="0"
            max="100"
            value={filters.salaryMax}
            onChange={(e) =>
              onFilterChange({ salaryMax: parseInt(e.target.value) })
            }
            className="range-slider flex-1"
          />
          <span className="text-sm text-[var(--color-text-secondary)]">
            ${filters.salaryMax}
          </span>
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-label">Competition (Apps/Opening)</label>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--color-text-secondary)]">0</span>
          <input
            type="range"
            min="0"
            max="50"
            value={filters.maxCompetition}
            onChange={(e) =>
              onFilterChange({ maxCompetition: parseInt(e.target.value) })
            }
            className="range-slider flex-1"
          />
          <span className="text-sm text-[var(--color-text-secondary)]">
            {filters.maxCompetition === 50
              ? "Any"
              : `≤${filters.maxCompetition}`}
          </span>
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-label">Job Level</label>
        <div className="space-y-1">
          {levels.map((level) => (
            <label key={level} className="checkbox-item">
              <input
                type="checkbox"
                checked={filters.levels.includes(level)}
                onChange={() => handleLevelToggle(level)}
              />
              <span className={`level-badge level-${level.toLowerCase()}`}>
                {level}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-label">Deadline</label>
        <div className="space-y-1">
          {[
            { value: "all", label: "All deadlines" },
            { value: "week", label: "Due this week" },
            { value: "month", label: "Due this month" },
          ].map((opt) => (
            <label key={opt.value} className="checkbox-item">
              <input
                type="radio"
                name="deadline"
                checked={filters.deadlineFilter === opt.value}
                onChange={() => onFilterChange({ deadlineFilter: opt.value })}
                className="w-4 h-4 accent-[var(--color-accent-blue)]"
              />
              <span className="text-sm text-[var(--color-text-secondary)]">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section max-h-60 overflow-y-auto">
        <label className="filter-label">Skills ({allSkills.length})</label>
        <div className="space-y-1">
          {allSkills.slice(0, 15).map(([skill, count]) => (
            <label key={skill} className="checkbox-item">
              <input
                type="checkbox"
                checked={filters.skills.includes(skill)}
                onChange={() => handleSkillToggle(skill)}
              />
              <span className="text-sm text-[var(--color-text-secondary)] flex-1">
                {skill}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {count}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section max-h-48 overflow-y-auto">
        <label className="filter-label">Location</label>
        <div className="space-y-1">
          {allLocations.slice(0, 10).map(([location, count]) => (
            <label key={location} className="checkbox-item">
              <input
                type="checkbox"
                checked={filters.locations.includes(location)}
                onChange={() => handleLocationToggle(location)}
              />
              <span className="text-sm text-[var(--color-text-secondary)] flex-1">
                {location}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {count}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
