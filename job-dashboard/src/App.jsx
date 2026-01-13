import { useState, useEffect, useMemo, useCallback } from "react";
import debounce from "lodash/debounce";
import jobData from "./data/jobs.json";

import FilterPanel from "./components/FilterPanel";
import JobList from "./components/JobList";
import MetricsCards from "./components/MetricsCards";
import SkillsChart from "./components/SkillsChart";
import JobMap from "./components/JobMap";
import SearchBar from "./components/SearchBar";
import SortDropdown from "./components/SortDropdown";

function App() {
  const [jobs] = useState(jobData.jobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("deadline");
  const [filters, setFilters] = useState({
    salaryMin: 0,
    salaryMax: 100,
    skills: [],
    locations: [],
    levels: [],
    deadlineFilter: "all",
    maxCompetition: 50,
  });

  const debouncedSearch = useMemo(
    () => debounce((query) => setSearchQuery(query), 300),
    []
  );

  const handleSearchChange = useCallback(
    (query) => {
      debouncedSearch(query);
    },
    [debouncedSearch]
  );

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.organization.toLowerCase().includes(query) ||
          job.skills.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    if (filters.skills.length > 0) {
      result = result.filter((job) =>
        filters.skills.every((skill) => job.skills.includes(skill))
      );
    }

    if (filters.locations.length > 0) {
      result = result.filter((job) => filters.locations.includes(job.city));
    }

    if (filters.levels.length > 0) {
      result = result.filter((job) =>
        job.level.some((lvl) => filters.levels.includes(lvl))
      );
    }

    if (filters.salaryMin > 0 || filters.salaryMax < 100) {
      result = result.filter((job) => {
        if (!job.salary) return filters.salaryMin === 0;
        return (
          job.salary.min >= filters.salaryMin &&
          job.salary.max <= filters.salaryMax
        );
      });
    }

    if (filters.maxCompetition < 50) {
      result = result.filter(
        (job) => parseFloat(job.appsPerOpening) <= filters.maxCompetition
      );
    }

    const now = new Date();
    if (filters.deadlineFilter === "week") {
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      result = result.filter((job) => new Date(job.deadline) <= weekFromNow);
    } else if (filters.deadlineFilter === "month") {
      const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      result = result.filter((job) => new Date(job.deadline) <= monthFromNow);
    }

    switch (sortBy) {
      case "deadline":
        result.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        break;
      case "salary":
        result.sort((a, b) => {
          const salaryA = a.salary?.max || 0;
          const salaryB = b.salary?.max || 0;
          return salaryB - salaryA;
        });
        break;
      case "competition":
        result.sort(
          (a, b) => parseFloat(a.appsPerOpening) - parseFloat(b.appsPerOpening)
        );
        break;
      case "alphabetical":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return result;
  }, [jobs, searchQuery, filters, sortBy]);

  const allSkills = useMemo(() => {
    const skillCount = {};
    jobs.forEach((job) => {
      job.skills.forEach((skill) => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    });
    return Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
  }, [jobs]);

  const allLocations = useMemo(() => {
    const locationCount = {};
    jobs.forEach((job) => {
      locationCount[job.city] = (locationCount[job.city] || 0) + 1;
    });
    return Object.entries(locationCount).sort((a, b) => b[1] - a[1]);
  }, [jobs]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      salaryMin: 0,
      salaryMax: 100,
      skills: [],
      locations: [],
      levels: [],
      deadlineFilter: "all",
      maxCompetition: 50,
    });
    setSearchQuery("");
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-[var(--color-bg-primary)]/80 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-emerald)] flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
                  WaterlooWorks Explorer
                </h1>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Find your next co-op opportunity
                </p>
              </div>
            </div>
            <div className="flex-1 max-w-2xl">
              <SearchBar onSearch={handleSearchChange} />
            </div>
            <div className="flex items-center gap-4">
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto px-6 py-6">
        <MetricsCards jobs={filteredJobs} totalJobs={jobs.length} />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6">
          <aside className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-120px)] overflow-y-auto">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearAll={clearAllFilters}
              allSkills={allSkills}
              allLocations={allLocations}
              filteredCount={filteredJobs.length}
              totalCount={jobs.length}
            />
          </aside>

          <section>
            <JobList jobs={filteredJobs} searchQuery={searchQuery} />
          </section>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <SkillsChart
              skills={allSkills}
              onSkillClick={(skill) => {
                if (!filters.skills.includes(skill)) {
                  handleFilterChange({ skills: [...filters.skills, skill] });
                }
              }}
            />
            <JobMap jobs={filteredJobs} />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;
