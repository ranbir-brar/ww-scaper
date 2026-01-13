import JobCard from "./JobCard";

export default function JobList({ jobs, searchQuery }) {
  if (jobs.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
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
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
          No jobs found
        </h3>
        <p className="text-[var(--color-text-muted)]">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job, index) => (
        <div key={job.id} style={{ animationDelay: `${index * 0.05}s` }}>
          <JobCard job={job} searchQuery={searchQuery} />
        </div>
      ))}
    </div>
  );
}
