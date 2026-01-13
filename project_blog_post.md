# Building a Better WaterlooWorks Experience: The Journey Behind WW-Scraper

## Inspiration

As a University of Waterloo student, WaterlooWorks is a daily ritual. We spend hours scrolling through pages of listings, opening countless tabs, and trying to mentally aggregate data about salaries, locations, and competition ratings.

The official portal, while functional, lacks the high-level insights needed to make quick, informed decisions. I wanted to answer questions like:

- _"Where are the majority of these jobs located?"_
- _"What is the actual salary distribution for my skill set?"_
- _"Which jobs have the best applicant-to-opening ratio?"_

Thus, **WW.Explorer** was born—a project to liberate job data from the paginated tables and present it in a modern, interactive dashboard.

## Tech Stack

To build a robust solution that handles everything from data extraction to visualization, I chose a modern and efficient stack:

- **Scraping Engine**: **Python + Playwright**. I needed a tool that could handle complex authentication flows and dynamic Single-Page Application (SPA) content reliability. Playwright proved superior to Selenium for its speed and auto-waiting mechanisms.
- **Data Processing**: **Node.js**. A custom processing script normalizes the raw data, extracting structured attributes like hourly wages (converting from yearly if needed), standardized skill tags, and geolocation coordinates.
- **Frontend**: **React (Vite) + TailwindCSS**. Speed was a priority. Vite ensures instant dev server starts, and Tailwind allowed for rapid UI prototyping with a premium, "dark mode" aesthetic.
- **Visualization**: **Chart.js + React-Leaflet**. For salary histograms and geographical heatmaps.

## Challenges

### 1. Authenticated Scraping

WaterlooWorks sits behind a login wall. Automating the login flow while respecting session timeouts and 2FA possibilities was tricky. I implemented a session management system that saves cookies locally, allowing the scraper to resume sessions without constant re-login.

### 2. The "Modal" Maze

The job details on the site open in dynamic modals rather than new pages. This meant the scraper had to simulate user interactions: clicking a row, waiting for the modal, extracting text, closing the modal, and handling potential UI lag. Validating that a modal had fully loaded before scraping was a frequent source of initial bugs.

### 3. Unstructured Data

Salaries are often free-text fields (e.g., "$20/hr", "45k-50k annually", "min wage"). Extracting usable numbers required complex Regular Expressions to normalize this data into a consistent hourly rate for comparison.

## What I Learned

- **Data is Messy**: 80% of the work is just cleaning the data. Building a robust taxonomy for "Skills" (mapping "React.js" and "ReactJS" to the same tag) was essential for the analytics to be meaningful.
- **User Experience Matters**: A raw list of 1000 jobs is overwhelming. Even simple additions like a map view or a salary filter transform the dataset from "information" to "insight."
- **Resilience**: Web scrapers are fragile. I learned to build clear error logging and "retry" logic to handle the unpredictable nature of network requests and DOM changes.

## Future Plans

This is just the beginning. The roadmap for WW-Scraper includes:

- **Historical Tracking**: Storing data over multiple terms to visualize trends (e.g., "Are salaries increasing for Junior Devs?").
- **Personalized Matching**: Using a local LLM to score jobs based on my specific resume and cover letter.
- **Email Alerts**: Running the scraper on a cron job to send daily digests of "High paying, low competition" jobs.

---

_Built with ❤️ for the Waterloo co-op community._
