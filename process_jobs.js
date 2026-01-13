const fs = require("fs");
const path = require("path");

const RAW_DATA_PATH = path.join(__dirname, "jobs.json");
const OUTPUT_PATH = path.join(__dirname, "processed_jobs.json");

const SKILLS_TAXONOMY = {
  languages: [
    "Python",
    "JavaScript",
    "TypeScript",
    "Java",
    "C++",
    "C#",
    "Go",
    "Rust",
    "Ruby",
    "PHP",
    "Swift",
    "Kotlin",
    "HTML",
    "CSS",
    "SQL",
    "R",
    "Matlab",
  ],
  frameworks: [
    "React",
    "Angular",
    "Vue",
    "Node.js",
    "Express",
    "Django",
    "Flask",
    "Spring",
    "ASP.NET",
    "Rails",
    "Next.js",
    "React Native",
    "Flutter",
  ],
  tools: [
    "Git",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "Jenkins",
    "CircleCI",
    "Terraform",
    "Ansible",
    "Jira",
    "Figma",
  ],
  databases: [
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Redis",
    "Elasticsearch",
    "Oracle",
    "DynamoDB",
    "Cassandra",
  ],
  ai_ml: [
    "TensorFlow",
    "PyTorch",
    "Keras",
    "Scikit-learn",
    "Pandas",
    "NumPy",
    "OpenCV",
    "NLP",
    "LLM",
    "Generative AI",
    "Transformer",
  ],
};

const CITY_COORDS = {
  Toronto: { lat: 43.6532, lng: -79.3832 },
  Waterloo: { lat: 43.4643, lng: -80.5204 },
  Vancouver: { lat: 49.2827, lng: -123.1207 },
  Montreal: { lat: 45.5017, lng: -73.5673 },
  Ottawa: { lat: 45.4215, lng: -75.6972 },
  Calgary: { lat: 51.0447, lng: -114.0719 },
  "New York": { lat: 40.7128, lng: -74.006 },
  "San Francisco": { lat: 37.7749, lng: -122.4194 },
  London: { lat: 42.9849, lng: -81.2453 },
  Seattle: { lat: 47.6062, lng: -122.3321 },
  Austin: { lat: 30.2672, lng: -97.7431 },
  Markham: { lat: 43.8561, lng: -79.337 },
  Mississauga: { lat: 43.589, lng: -79.6441 },
};

function extractSalary(text) {
  if (!text) return null;

  const hourlyRegex =
    /\$(\d{2,3})(?:(?:\s*-\s*|\s*to\s*)\$(\d{2,3}))?\s*(?:\/|per\s)?\s*hou?r/i;
  const hourlyMatch = text.match(hourlyRegex);

  if (hourlyMatch) {
    const min = parseFloat(hourlyMatch[1]);
    const max = hourlyMatch[2] ? parseFloat(hourlyMatch[2]) : min;
    return {
      min,
      max,
      avg: (min + max) / 2,
      type: "hourly",
      currency: "CAD",
    };
  }

  const yearlyRegex =
    /\$(\d{2,3}(?:,\d{3})*)(?:(?:\s*-\s*|\s*to\s*)\$(\d{2,3}(?:,\d{3})*))?\s*(?:\/|per\s)?\s*(?:year|annum)/i;
  const yearlyMatch = text.match(yearlyRegex);

  if (yearlyMatch) {
    const min = parseFloat(yearlyMatch[1].replace(/,/g, ""));
    const max = yearlyMatch[2]
      ? parseFloat(yearlyMatch[2].replace(/,/g, ""))
      : min;
    return {
      min: parseFloat((min / 2000).toFixed(2)),
      max: parseFloat((max / 2000).toFixed(2)),
      avg: parseFloat(((min + max) / 4000).toFixed(2)),
      type: "hourly (converted)",
      currency: "CAD",
    };
  }

  return null;
}

function extractSkills(text, taxonomy) {
  if (!text) return [];
  const skills = new Set();
  const normalizedText = text.toLowerCase();

  Object.values(taxonomy)
    .flat()
    .forEach((skill) => {
      const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedSkill}\\b`, "i");
      if (regex.test(normalizedText)) {
        skills.add(skill);
      }
    });

  if (normalizedText.includes("node.js") || normalizedText.includes("nodejs"))
    skills.add("Node.js");
  if (normalizedText.includes("react.js") || normalizedText.includes("reactjs"))
    skills.add("React");

  return Array.from(skills);
}

function processJobs() {
  try {
    const rawData = fs.readFileSync(RAW_DATA_PATH, "utf8");
    const jobs = JSON.parse(rawData);

    const processedJobs = [];
    const metrics = {
      skillFrequency: {},
      salaryStats: {
        hourly: { min: Infinity, max: -Infinity, sum: 0, count: 0 },
      },
      locationDistribution: {},
      jobLevelDistribution: {},
      totalJobs: 0,
    };

    jobs.forEach((job) => {
      const combinedText =
        (job.full_description || "") + " " + (job.application_info || "");

      const salary = extractSalary(combinedText);

      const skills = extractSkills(combinedText, SKILLS_TAXONOMY);

      let location = { lat: null, lng: null };
      if (job.city && CITY_COORDS[job.city]) {
        location = CITY_COORDS[job.city];
      }

      const levels = job.level ? job.level.split(",").map((l) => l.trim()) : [];
      const appsCount = parseInt(job.apps, 10) || 0;
      const openingsCount = parseInt(job.openings, 10) || 1;

      const processedJob = {
        id: job.id,
        title: job.title,
        organization: job.organization,
        city: job.city || "Unknown",
        country: "Canada",
        location: location,
        level: levels,
        salary: salary,
        skills: skills,
        deadline: job.deadline ? new Date(job.deadline).toISOString() : null,
        apps: appsCount,
        openings: openingsCount,
        appsPerOpening:
          openingsCount > 0
            ? (appsCount / openingsCount).toFixed(2)
            : appsCount,
        duration:
          job.full_description && job.full_description.match(/(\d)\s*month/i)
            ? `${job.full_description.match(/(\d)\s*month/i)[1]} months`
            : "4 months",
      };

      processedJobs.push(processedJob);

      metrics.totalJobs++;

      skills.forEach((skill) => {
        metrics.skillFrequency[skill] =
          (metrics.skillFrequency[skill] || 0) + 1;
      });

      if (salary) {
        metrics.salaryStats.hourly.min = Math.min(
          metrics.salaryStats.hourly.min,
          salary.min
        );
        metrics.salaryStats.hourly.max = Math.max(
          metrics.salaryStats.hourly.max,
          salary.max
        );
        metrics.salaryStats.hourly.sum += salary.avg;
        metrics.salaryStats.hourly.count++;
      }

      const city = processedJob.city;
      metrics.locationDistribution[city] =
        (metrics.locationDistribution[city] || 0) + 1;

      levels.forEach((lvl) => {
        metrics.jobLevelDistribution[lvl] =
          (metrics.jobLevelDistribution[lvl] || 0) + 1;
      });
    });

    if (metrics.salaryStats.hourly.count > 0) {
      metrics.salaryStats.hourly.avg = parseFloat(
        (
          metrics.salaryStats.hourly.sum / metrics.salaryStats.hourly.count
        ).toFixed(2)
      );
    } else {
      metrics.salaryStats.hourly = null;
    }

    const output = {
      jobs: processedJobs,
      metrics: metrics,
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    console.log(`Successfully processed ${processedJobs.length} jobs.`);
    console.log(`Output saved to ${OUTPUT_PATH}`);
  } catch (error) {
    console.error("Error processing jobs:", error);
  }
}

processJobs();
