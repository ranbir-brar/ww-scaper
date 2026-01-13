# Job Dashboard Web App - Core Features Implementation

## Project Overview

Build a single-page web application to explore and filter job postings from WaterlooWorks. The app should provide an intuitive interface for students to discover opportunities based on skills, salary, location, and other criteria.

## Tech Stack

- **React** with hooks (useState, useEffect, useMemo)
- **Tailwind CSS** for styling
- **Recharts** for data visualizations
- **Leaflet** (react-leaflet) for the interactive map
- **lodash** for data processing utilities

## Data Format

You'll be working with processed job data in this format:

```javascript
{
  "jobs": [
    {
      "id": "446800",
      "title": "Full Stack developer/Digital Marketing",
      "organization": "1783040 Alberta Ltd",
      "city": "Calgary",
      "province": "Alberta",
      "country": "Canada",
      "location": {
        "lat": 51.0447,
        "lng": -114.0719
      },
      "level": ["Intermediate", "Senior"],
      "salary": {
        "min": 20,
        "max": 22,
        "currency": "CAD",
        "type": "hourly"
      },
      "skills": ["React", "Flask", "Docker", "Python", "JavaScript"],
      "deadline": "2026-01-20T09:00:00Z",
      "apps": 8,
      "openings": 1,
      "duration": "8 months",
      "workArrangement": "In-person",
      "full_description": "..."
    }
  ],
  "metrics": {
    "skillFrequency": {
      "Python": 45,
      "JavaScript": 38,
      "React": 32
    }
  }
}
```

## Core Features to Implement

### 1. Main Job List View

- Display all jobs as cards in a responsive grid
- Each card shows:
  - Job title
  - Company name
  - Location (city, province)
  - Salary range
  - Top 3-5 skills as badges
  - Application deadline with urgency indicator (red if < 3 days)
  - Competition metric (apps per opening)
  - Job level badges
- Click to expand card and see full description
- Smooth animations for expand/collapse

### 2. Advanced Filtering Panel (Sidebar)

**Salary Filter**

- Dual-handle range slider (min/max)
- Display current selected range
- Show number of jobs in range in real-time

**Skills Filter**

- Multi-select dropdown or checkbox list
- Show top 15-20 skills with counts
- "AND" logic (must have ALL selected skills)
- Clear all button

**Location Filter**

- Multi-select dropdown grouped by province
- Show city (province) format
- Include "Remote" option if applicable

**Job Level Filter**

- Checkboxes for Junior, Intermediate, Senior
- Multi-select support

**Deadline Filter**

- Predefined options:
  - Due this week
  - Due this month
  - Due in 3 months
  - Show expired (checkbox)

**Competition Filter**

- Slider for max apps-per-opening ratio
- Label: "Show jobs with competition ≤ X applicants per opening"

**Active Filters Display**

- Show all active filters as removable tags
- "Clear all filters" button
- Show count: "Showing X of Y jobs"

### 3. Search Bar

- Full-text search across job titles, company names, and descriptions
- Search as you type (debounced)
- Highlight matching text in results
- Clear search button (X icon)

### 4. Sort Options

Dropdown with options:

- Deadline (soonest first)
- Salary (highest first)
- Competition (lowest first - easiest to get)
- Most recent
- Alphabetical (A-Z)

### 5. Skills Analytics Dashboard

**Top Skills Bar Chart**

- Horizontal bar chart showing top 20 skills by frequency
- Bars colored by category (Frontend, Backend, AI/ML, Tools, etc.)
- Click bar to filter jobs by that skill
- Show percentage and count on bars

**Skill Category Breakdown**

- Pie chart or donut chart
- Categories: Frontend, Backend, AI/ML, DevOps, Databases, Other
- Show percentage distribution

### 6. Interactive Map

**Map Features**

- Display all job locations as markers
- Cluster markers when zoomed out
- Custom marker colors based on salary (green = high, yellow = medium, red = low)
- Click marker to show popup with:
  - Job title
  - Company
  - Salary
  - "View Details" button to scroll to job card

**Map Filters**

- Map reflects current filter state
- Only show jobs matching active filters

### 7. Metrics Cards (Top of Page)

Display 4-5 key metrics:

- **Total Jobs**: Count of filtered jobs
- **Avg Salary**: Average hourly rate across filtered jobs
- **Closing Soon**: Jobs with deadline < 7 days
- **Low Competition**: Jobs with apps/opening < 5
- **Top Location**: Most common city in filtered results

Each card should be visually appealing with icons and color-coded.

## UI/UX Requirements

**Layout**

- Header with logo/title and search bar
- Left sidebar (20-25% width) for filters - sticky/scrollable
- Main content area (50-60% width) for job cards
- Right sidebar (20-25% width) for metrics and charts
- Responsive: collapse sidebars on mobile, show filter button

**Design Principles**

- Clean, modern interface
- Use Tailwind's default color palette
- Smooth transitions and hover effects
- Loading states for async operations
- Empty states with helpful messages
- Accessible (keyboard navigation, proper ARIA labels)

**Performance**

- Use React.memo for job cards
- useMemo for filtered/sorted data
- Virtualize job list if > 100 jobs (optional)
- Debounce search input (300ms)

## File Structure Suggestion

```
src/
├── components/
│   ├── JobCard.jsx
│   ├── JobList.jsx
│   ├── FilterPanel.jsx
│   ├── SearchBar.jsx
│   ├── SkillsChart.jsx
│   ├── JobMap.jsx
│   ├── MetricsCards.jsx
│   └── SortDropdown.jsx
├── hooks/
│   ├── useJobFilters.js
│   └── useJobData.js
├── utils/
│   ├── filterJobs.js
│   └── jobMetrics.js
├── data/
│   └── jobs.json
├── App.jsx
└── index.js
```

## Implementation Steps

1. **Setup Project**

   - Create React app
   - Install dependencies: `npm install recharts react-leaflet leaflet lodash`
   - Import Tailwind CSS
   - Load sample job data

2. **Build Core Components** (in order)

   - MetricsCards (static first)
   - JobCard with expand/collapse
   - JobList displaying all cards
   - SearchBar with debounce
   - SortDropdown

3. **Implement Filtering**

   - Create useJobFilters hook to manage filter state
   - FilterPanel with all filter controls
   - Wire up filters to JobList
   - Active filters display

4. **Add Visualizations**
   - SkillsChart with Recharts
   - Make bars clickable to filter
5. **Integrate Map**

   - JobMap with Leaflet
   - Marker clustering
   - Popups with job info
   - Sync with filters

6. **Polish**
   - Loading states
   - Empty states
   - Responsive design
   - Animations
   - Accessibility

## Sample Data to Use

For initial development, use the provided jobs.json file. If you need sample data generated, create at least 30-50 diverse job postings covering various cities, salary ranges, and skill combinations.

## Deliverable

A fully functional React application with all core features implemented, styled with Tailwind CSS, and ready to deploy. The app should be intuitive, performant, and visually appealing.

## Nice-to-Haves (if time permits)

- Dark mode toggle
- Export filtered results to CSV
- Job comparison (select 2-3 jobs to compare side-by-side)
- Keyboard shortcuts (/ to focus search, Esc to clear filters)
- URL state persistence (filters reflected in URL params)

DISTILLED_AESTHETICS_PROMPT = """
<frontend_aesthetics>
You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight. Focus on:

Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.

Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration.

Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.

Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

Avoid generic AI-generated aesthetics:

- Overused font families (Inter, Roboto, Arial, system fonts)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box, and use inspiration from awwards.com!
</frontend_aesthetics>
"""
