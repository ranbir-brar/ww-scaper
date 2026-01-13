import { useState } from "react";
import SearchBar from "../components/SearchBar";
import MetricsCards from "../components/MetricsCards";
import JobCard from "../components/JobCard";
import JobDetailModal from "../components/JobDetailModal";
import FilterModal from "../components/FilterModal";

export default function JobsBrowser({
  jobs,
  totalJobs,
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
  allSkills,
  allLocations,
}) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount =
    filters.skills.length +
    filters.locations.length +
    filters.levels.length +
    (filters.salaryMin > 0 || filters.salaryMax < 100 ? 1 : 0) +
    (filters.deadlineFilter !== "all" ? 1 : 0) +
    (filters.maxCompetition < 50 ? 1 : 0);

  return (
    <main className="max-w-6xl mx-auto px-6 py-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <SearchBar onSearch={onSearchChange} />
        </div>
        <button onClick={() => setShowFilters(true)} className="btn-secondary">
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
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-[var(--color-accent-primary)] text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(filters.salaryMin > 0 || filters.salaryMax < 100) && (
            <span className="filter-chip">
              ${filters.salaryMin}-${filters.salaryMax}/hr
              <button
                onClick={() =>
                  onFilterChange({
                    salaryMin: 0,
                    salaryMax: 100,
                  })
                }
              >
                ×
              </button>
            </span>
          )}

          {filters.maxCompetition < 50 && (
            <span className="filter-chip">
              &lt;{filters.maxCompetition} apps
              <button
                onClick={() =>
                  onFilterChange({
                    maxCompetition: 50,
                  })
                }
              >
                ×
              </button>
            </span>
          )}

          {filters.skills.map((skill) => (
            <span key={skill} className="filter-chip">
              {skill}
              <button
                onClick={() =>
                  onFilterChange({
                    skills: filters.skills.filter((s) => s !== skill),
                  })
                }
              >
                ×
              </button>
            </span>
          ))}
          {filters.locations.map((loc) => (
            <span key={loc} className="filter-chip">
              {loc}
              <button
                onClick={() =>
                  onFilterChange({
                    locations: filters.locations.filter((l) => l !== loc),
                  })
                }
              >
                ×
              </button>
            </span>
          ))}
          {/* Levels removed as per user request */}

          <button
            onClick={onClearFilters}
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      <MetricsCards jobs={jobs} totalJobs={totalJobs} />

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Showing {jobs.length} of {totalJobs} jobs
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="w-16 h-16 mx-auto text-[var(--color-text-muted)] mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              No jobs found
            </h3>
            <p className="text-[var(--color-text-muted)]">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                searchQuery={searchQuery}
                onClick={() => setSelectedJob(job)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}

      {showFilters && (
        <FilterModal
          filters={filters}
          onFilterChange={onFilterChange}
          onClearAll={onClearFilters}
          onClose={() => setShowFilters(false)}
          allSkills={allSkills}
          allLocations={allLocations}
        />
      )}
    </main>
  );
}
