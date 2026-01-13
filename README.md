# ww-scraper

A Python-based web scraper for WaterlooWorks with a React dashboard.

## Features

- Scrapes job listings from WaterlooWorks using Playwright
- Processes raw data to extract salary, skills, and location info
- React dashboard with filtering, search, and visualizations

## Requirements

- Python 3.x
- Node.js
- Playwright

## Installation

```bash
pip install playwright
playwright install
cd job-dashboard && npm install
```

## Usage

1. Run the scraper:
   ```bash
   python scraper.py
   ```
2. Log in manually on first run. Session is saved to `ww_session.json`.
3. After scraping, the script automatically:

   - Runs `process_jobs.js` to extract structured data
   - Copies output to `job-dashboard/src/data/jobs.json`

4. Start the dashboard:
   ```bash
   cd job-dashboard && npm run dev
   ```

## Output Files

- `jobs.json` - Raw scraped data
- `processed_jobs.json` - Structured data with extracted fields
- `job-dashboard/` - React dashboard app
