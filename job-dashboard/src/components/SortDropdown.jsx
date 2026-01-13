export default function SortDropdown({ value, onChange }) {
  const options = [
    { value: "deadline", label: "Deadline (Soonest)" },
    { value: "salary", label: "Salary (Highest)" },
    { value: "competition", label: "Competition (Lowest)" },
    { value: "alphabetical", label: "Alphabetical (A-Z)" },
  ];

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 pr-10 text-sm text-[var(--color-text-primary)] cursor-pointer hover:border-[var(--color-accent-blue)] focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
}
