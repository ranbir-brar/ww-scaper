import { useState } from "react";
import SkillsChart from "../components/SkillsChart";
import JobMap from "../components/JobMap";
import SalaryChart from "../components/SalaryChart";

export default function AnalyticsDashboard({ jobs, allSkills, allLocations }) {
  const [activeTab, setActiveTab] = useState("skills");

  const tabs = [
    { id: "skills", label: "Skills Analysis" },
    { id: "salary", label: "Salary Insights" },
    { id: "map", label: "Geographic View" },
  ];

  return (
    <main className="max-w-6xl mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-[var(--color-text-muted)]">
          Explore job market insights and trends
        </p>
      </div>

      <div className="border-b border-[var(--color-border)] mb-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[500px]">
        {activeTab === "skills" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">
                Top Skills by Frequency
              </h3>
              <SkillsChart skills={allSkills} onSkillClick={() => {}} />
            </div>
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Skills Summary</h3>
              <div className="space-y-3">
                {allSkills.slice(0, 10).map(([skill, count], i) => (
                  <div
                    key={skill}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[var(--color-text-muted)] w-5">
                        {i + 1}.
                      </span>
                      <span className="text-sm font-medium">{skill}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-[var(--color-bg-primary)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--color-accent-primary)] rounded-full"
                          style={{
                            width: `${(count / allSkills[0][1]) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-[var(--color-text-muted)] w-8">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "salary" && (
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Salary Distribution</h3>
            <SalaryChart jobs={jobs} />
          </div>
        )}

        {activeTab === "map" && (
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Job Locations</h3>
            <div className="h-[500px]">
              <JobMap jobs={jobs} fullPage />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
