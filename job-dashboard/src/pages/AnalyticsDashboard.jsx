import SkillsChart from "../components/SkillsChart";
import JobMap from "../components/JobMap";
import SalaryChart from "../components/SalaryChart";

export default function AnalyticsDashboard({ jobs, allSkills, onFilterApply }) {
  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8 animate-enter">
        <h1 className="text-3xl font-bold font-display text-[var(--text-main)] mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-[var(--text-muted)] text-lg">
          Market insights and trends overview
        </p>
      </div>

      <div className="space-y-6 animate-enter delay-1">
        {/* Top Row: Skills & Salary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skills Summary List */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-xl font-bold font-display mb-6 text-[var(--color-primary)] flex items-center gap-2">
              <span className="w-2 h-8 rounded-full bg-[var(--color-primary)]"></span>
              Skills Summary
            </h3>
            <div className="space-y-3 custom-scrollbar max-h-[400px] overflow-y-auto pr-2">
              {allSkills.slice(0, 20).map(([skill, count], i) => (
                <div
                  key={skill}
                  onClick={() => onFilterApply && onFilterApply("skill", skill)}
                  className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-dim)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] transition-all group cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-mono text-[var(--color-primary)] w-6 opacity-70">
                      #{i + 1}
                    </span>
                    <span className="text-base font-bold text-[var(--text-main)]">
                      {skill}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-primary)] rounded-full shadow-[0_0_10px_var(--color-primary)] transition-all duration-1000 ease-out"
                        style={{
                          width: `${(count / allSkills[0][1]) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-mono text-[var(--text-muted)] w-8 text-right group-hover:text-white transition-colors">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Salary Distribution Chart */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-xl font-bold font-display mb-6 text-[var(--color-primary)] flex items-center gap-2">
              <span className="w-2 h-8 rounded-full bg-[var(--color-primary)]"></span>
              Salary Distribution
            </h3>
            <div className="h-[400px] flex items-center justify-center">
              <SalaryChart
                jobs={jobs}
                onBarClick={(range) =>
                  onFilterApply && onFilterApply("salary", range)
                }
              />
            </div>
          </div>
        </div>

        {/* Bottom Row: Geographic Map */}
        <div className="glass-panel rounded-xl p-6 animate-enter delay-2">
          <h3 className="text-xl font-bold font-display mb-6 text-[var(--color-primary)] flex items-center gap-2">
            <span className="w-2 h-8 rounded-full bg-[var(--color-primary)]"></span>
            Geographic View
          </h3>
          <div className="h-[600px] rounded-xl overflow-hidden border border-[var(--border-dim)] relative group">
            <JobMap jobs={jobs} fullPage />
            <div className="absolute inset-0 border-4 border-[var(--color-primary)] opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
