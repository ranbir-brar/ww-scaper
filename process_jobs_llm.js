require("dotenv").config();
const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const RAW_DATA_PATH = path.join(__dirname, "jobs.json");
const OUTPUT_PATH = path.join(__dirname, "processed_jobs.json");
const DASHBOARD_PATH = path.join(
  __dirname,
  "job-dashboard",
  "src",
  "data",
  "jobs.json"
);

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
    "MATLAB",
  ],
  frameworks: [
    "React",
    "Angular",
    "Vue",
    "Node.js",
    "Express",
    "Django",
    "Flask",
    "Spring Boot",
    "Spring Framework",
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

async function extractSalaryWithLLM(fullText, retries = 2) {
  if (!fullText) return null;

  // First, try to extract just the "Compensation and Benefits:" section
  let text = fullText;
  const compMatch = fullText.match(
    /Compensation\s*(?:and|&)?\s*Benefits?:?\s*([\s\S]*?)(?:\n\n|\n[A-Z][a-z]+:|Targeted Degrees|$)/i
  );
  if (compMatch) {
    text = compMatch[1];
  }

  // If no compensation section found, skip LLM call for this job
  if (text === fullText) {
    return null;
  }

  // Limit text length to save tokens
  const truncatedText = text.slice(0, 1000);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `Extract hourly salary from text. Convert: weekly/40, monthly/173, yearly/2000.
Reply ONLY with JSON: {"min":X,"max":Y} or {"min":null,"max":null} if none found.`,
          },
          {
            role: "user",
            content: truncatedText,
          },
        ],
        temperature: 0,
        max_tokens: 30,
      });

      let content = response.choices[0]?.message?.content?.trim();
      if (!content) return null;

      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        content = jsonMatch[1];
      }

      // Try to find JSON object in the response
      const jsonObjMatch = content.match(/\{[^}]+\}/);
      if (jsonObjMatch) {
        content = jsonObjMatch[0];
      }

      const parsed = JSON.parse(content);

      if (parsed.min === null || parsed.max === null) {
        return null;
      }

      const min = parseFloat(parsed.min);
      const max = parseFloat(parsed.max);

      if (isNaN(min) || isNaN(max) || min <= 0 || max <= 0) {
        return null;
      }

      return {
        min: parseFloat(min.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        avg: parseFloat(((min + max) / 2).toFixed(2)),
        type: "hourly",
        currency: "CAD",
      };
    } catch (error) {
      if (attempt < retries) {
        // Wait before retry
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (attempt + 1))
        );
        continue;
      }
      // Silent fail on last attempt
      return null;
    }
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

  if (
    /\br\b/.test(normalizedText) &&
    (normalizedText.includes("r programming") ||
      normalizedText.includes("r language") ||
      normalizedText.includes("rstudio") ||
      /\br\s+and\s+python\b/.test(normalizedText) ||
      /\bpython\s+and\s+r\b/.test(normalizedText))
  ) {
    skills.add("R");
  }

  if (
    normalizedText.includes("spring boot") ||
    normalizedText.includes("spring framework") ||
    normalizedText.includes("spring mvc") ||
    normalizedText.includes("springframework")
  ) {
    skills.add("Spring");
  }

  return Array.from(skills);
}

// Process jobs in batches to respect rate limits
async function processJobsBatch(jobs, startIdx, batchSize) {
  const results = [];
  const endIdx = Math.min(startIdx + batchSize, jobs.length);

  for (let i = startIdx; i < endIdx; i++) {
    const job = jobs[i];
    const combinedText =
      (job.full_description || "") + " " + (job.application_info || "");

    const salary = await extractSalaryWithLLM(combinedText);

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));

    const skills = extractSkills(combinedText, SKILLS_TAXONOMY);

    let location = { lat: null, lng: null };
    if (job.city && CITY_COORDS[job.city]) {
      location = CITY_COORDS[job.city];
    }

    const levels = job.level ? job.level.split(",").map((l) => l.trim()) : [];
    const appsCount = parseInt(job.apps, 10) || 0;
    const openingsCount = parseInt(job.openings, 10) || 1;

    results.push({
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
        openingsCount > 0 ? (appsCount / openingsCount).toFixed(2) : appsCount,
      duration:
        job.full_description && job.full_description.match(/(\d)\s*month/i)
          ? `${job.full_description.match(/(\d)\s*month/i)[1]} months`
          : "4 months",
    });

    // Progress indicator
    if ((i + 1) % 50 === 0) {
      console.log(`Processed ${i + 1}/${jobs.length} jobs...`);
    }
  }

  return results;
}

async function processJobs() {
  try {
    console.log("Starting job processing with LLM salary extraction...");

    const rawData = fs.readFileSync(RAW_DATA_PATH, "utf8");
    const jobs = JSON.parse(rawData);

    console.log(`Processing ${jobs.length} jobs...`);

    const processedJobs = await processJobsBatch(jobs, 0, jobs.length);

    const metrics = {
      skillFrequency: {},
      salaryStats: {
        hourly: { min: Infinity, max: -Infinity, sum: 0, count: 0 },
      },
      locationDistribution: {},
      jobLevelDistribution: {},
      totalJobs: processedJobs.length,
    };

    processedJobs.forEach((job) => {
      job.skills.forEach((skill) => {
        metrics.skillFrequency[skill] =
          (metrics.skillFrequency[skill] || 0) + 1;
      });

      if (job.salary) {
        metrics.salaryStats.hourly.min = Math.min(
          metrics.salaryStats.hourly.min,
          job.salary.min
        );
        metrics.salaryStats.hourly.max = Math.max(
          metrics.salaryStats.hourly.max,
          job.salary.max
        );
        metrics.salaryStats.hourly.sum += job.salary.avg;
        metrics.salaryStats.hourly.count++;
      }

      metrics.locationDistribution[job.city] =
        (metrics.locationDistribution[job.city] || 0) + 1;

      job.level.forEach((lvl) => {
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
    console.log(`\nSuccessfully processed ${processedJobs.length} jobs.`);
    console.log(`Jobs with salary: ${metrics.salaryStats?.hourly?.count || 0}`);
    console.log(`Output saved to ${OUTPUT_PATH}`);

    try {
      fs.mkdirSync(path.dirname(DASHBOARD_PATH), { recursive: true });
      fs.copyFileSync(OUTPUT_PATH, DASHBOARD_PATH);
      console.log(`Copied to ${DASHBOARD_PATH}`);
    } catch (copyError) {
      console.log(`Note: Could not copy to dashboard: ${copyError.message}`);
    }
  } catch (error) {
    console.error("Error processing jobs:", error);
  }
}

processJobs();
