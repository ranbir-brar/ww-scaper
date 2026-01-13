import { Routes, Route, NavLink, useSearchParams } from "react-router-dom";
import { useState, useMemo, useCallback } from "react";
import debounce from "lodash/debounce";
import jobData from "./data/jobs.json";

import JobsBrowser from "./pages/JobsBrowser";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

function App() {
  const [jobs] = useState(jobData.jobs || []);
  const [searchQuery, setSearchQuery] = useState("");
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

    result.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    return result;
  }, [jobs, searchQuery, filters]);

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
    <div className="min-h-screen font-sans">
      <header className="sticky top-0 z-50 glass-panel border-b-0">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shadow-[0_0_15px_rgba(212,255,0,0.3)] transition-transform group-hover:scale-110">
                <svg
                  className="w-6 h-6 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-[var(--color-primary)] transition-colors font-display">
                WW<span className="text-[var(--color-primary)]">.Explorer</span>
              </span>
            </NavLink>

            <nav className="flex items-center gap-2 p-1 rounded-full border border-[var(--border-dim)] bg-[rgba(255,255,255,0.03)]">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-5 py-2 rounded-full text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[var(--color-primary)] text-black shadow-lg shadow-[rgba(212,255,0,0.2)]"
                      : "text-[var(--text-muted)] hover:text-white"
                  }`
                }
              >
                Jobs
              </NavLink>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `px-5 py-2 rounded-full text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[var(--color-primary)] text-black shadow-lg shadow-[rgba(212,255,0,0.2)]"
                      : "text-[var(--text-muted)] hover:text-white"
                  }`
                }
              >
                Analytics
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <JobsBrowser
              jobs={filteredJobs}
              totalJobs={jobs.length}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearAllFilters}
              allSkills={allSkills}
              allLocations={allLocations}
            />
          }
        />
        <Route
          path="/analytics"
          element={
            <AnalyticsDashboard
              jobs={filteredJobs}
              allSkills={allSkills}
              allLocations={allLocations}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
