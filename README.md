# WaterlooWorks Job Explorer

A powerful Python-based scraper and React dashboard to visualize and filter job listings from WaterlooWorks.

## New Features

### Stunning UI Redesign

- **theme**: "Obsidian & Electric Lime" dark mode aesthetic.
- **Glass-morphism**: Modern, translucent UI elements with smooth animations.
- **Responsive**: Fully optimized for desktop and tablet viewing.

### Interactive Analytics Dashboard

- **Consolidated View**: Scrollable dashboard integrating Skills and Salary insights.
- **Interactive Charts**: Click on any skill or salary bar to instantly filter job listings.
- **Salary Distribution**: Visual breakdown of pay ranges.

### Advanced Filtering

- **Salary Chips**: Filter by pay range with dismissible chips (e.g., `$20-30/hr`).
- **Region Filter**: Select specific cities/regions.
- **Competition Filter**: Slider to filter by "Apps Per Opening" (e.g., find hidden gems with <10 applicants).
- **Smart Search**: Real-time searching by title, company, or skills.

### Optimized Scraper

- **Early Stop**: Automatically detects when no new jobs are being found (after 3 empty pages) and stops to save time.
- **State Management**: Preserves session cookies to avoid repeated logins.

---

## Installation

1. **Prerequisites**

   - Python 3.x
   - Node.js & npm

2. **Setup Scraper**

   ```bash
   pip install playwright
   playwright install chromium
   ```

3. **Setup Dashboard**
   ```bash
   cd job-dashboard
   npm install
   ```

## Usage

### 1. Scrape Data

Run the scraper to fetch the latest jobs:

```bash
python scraper.py
```

- **First Run**: A browser window will open. Log in to WaterlooWorks manually. The script will take over once you reach the dashboard.
- **Subsequent Runs**: Session is saved (`ww_session.json`), so login is automatic.
- The scraper will automatically process the data (`process_jobs.js`) and update the dashboard.

### 2. Launch Dashboard

Start the visualization interface:

```bash
cd job-dashboard
npm run dev
```

Open your browser to the local URL (usually `http://localhost:5173`).

## Project Structure

- `scraper.py`: Main scraping logic (Playwright).
- `process_jobs.js`: Data cleaning and extraction script.
- `job-dashboard/`: React application (Vite + Tailwind).
  - `src/pages/`: `JobsBrowser` and `AnalyticsDashboard`.
  - `src/components/`: Reusable UI components (`JobCard`, `SalaryChart`, `FilterModal`).

## Notes

- The dashboard uses **Chart.js** for high-performance data visualization.
- Data is stored locally in `jobs.json`.
