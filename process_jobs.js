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

function extractSalary(fullText) {
  if (!fullText) return null;

  // First, try to extract just the "Compensation and Benefits:" section
  // This section is more reliable and focused
  let text = fullText;
  const compMatch = fullText.match(
    /Compensation\s*(?:and|&)?\s*Benefits?:?\s*([\s\S]*?)(?:\n\n|\n[A-Z][a-z]+:|Targeted Degrees|$)/i
  );
  if (compMatch) {
    text = compMatch[1];
  }

  // Helper function to try patterns on both the comp section and full text
  const tryMatch = (regex) => {
    let match = text.match(regex);
    if (!match && text !== fullText) {
      match = fullText.match(regex);
    }
    return match;
  };

  // Pattern: "$30-40k for the term" or "$30k to $40k"
  const termKRegex = /\$(\d{2,3})(?:k)?\s*(?:[-–]|to)\s*\$(\d{2,3})k/i;
  const termKMatch = tryMatch(termKRegex);

  if (termKMatch) {
    const minK = parseFloat(termKMatch[1]);
    const maxK = parseFloat(termKMatch[2]);
    // Assume 4 month term for co-op
    // convert 30k -> 30,000 / 4 months / 173 hours
    const min = (minK * 1000) / (4 * 173);
    const max = (maxK * 1000) / (4 * 173);
    return {
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      avg: parseFloat(((min + max) / 2).toFixed(2)),
      type: "hourly (from term total)",
      currency: "CAD",
    };
  }

  // Pattern: "Monthly range of $3060-$4540" or "Monthly salary of $X" (Prefix style)
  const monthlyPrefixRegex =
    /Monthly\s+(?:range|salary|rate|compensation|pay)(?:.*?)\$([\d,]+(?:\.\d{2})?)(?:\s*(?:[-–]|to)\s*\$?([\d,]+(?:\.\d{2})?))?/i;
  const monthlyPrefixMatch = tryMatch(monthlyPrefixRegex);

  if (monthlyPrefixMatch) {
    const minMonthly = parseFloat(monthlyPrefixMatch[1].replace(/,/g, ""));
    const maxMonthly = monthlyPrefixMatch[2]
      ? parseFloat(monthlyPrefixMatch[2].replace(/,/g, ""))
      : minMonthly;
    const min = minMonthly / 173;
    const max = maxMonthly / 173;
    return {
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      avg: parseFloat(((min + max) / 2).toFixed(2)),
      type: "hourly (from monthly)",
      currency: "CAD",
    };
  }

  // Pattern 1: Hourly with $ sign
  // $24.20-$30.00/hr, $40 - $50/hr, $24 to $30 per hour, $25-40/hourly
  const hourlyRegex =
    /\$(\d{1,3}(?:\.\d{1,2})?)(?:(?:\s*[-–]\s*|\s*to\s*)\$?(\d{1,3}(?:\.\d{1,2})?))?\s*(?:\/|per\s)\s*(?:h(?:ou)?r|hourly)/i;
  const hourlyMatch = tryMatch(hourlyRegex);

  if (hourlyMatch) {
    const min = parseFloat(hourlyMatch[1]);
    const max = hourlyMatch[2] ? parseFloat(hourlyMatch[2]) : min;
    return {
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      avg: parseFloat(((min + max) / 2).toFixed(2)),
      type: "hourly",
      currency: "CAD",
    };
  }

  // Match yearly salaries - standard format like $65,000/year or $65,000 per year
  const yearlyRegex =
    /\$(\d{1,3}(?:,\d{3})*)(?:(?:\s*-\s*|\s*to\s*)\$(\d{1,3}(?:,\d{3})*))?\s*(?:\/|per\s)?\s*(?:year|annum)/i;
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
      type: "hourly (from yearly)",
      currency: "CAD",
    };
  }

  // Match "annual equivalent of $XX,XXX" format - find all values and use min/max
  const annualEquivRegex =
    /annual\s+equivalent\s+of\s+\$(\d{2,3}(?:,\d{3})*)/gi;
  const annualMatches = [...text.matchAll(annualEquivRegex)];

  if (annualMatches.length > 0) {
    const values = annualMatches.map((m) => parseFloat(m[1].replace(/,/g, "")));
    const min = Math.min(...values);
    const max = Math.max(...values);
    return {
      min: parseFloat((min / 2000).toFixed(2)),
      max: parseFloat((max / 2000).toFixed(2)),
      avg: parseFloat(((min + max) / 4000).toFixed(2)),
      type: "hourly (from yearly)",
      currency: "CAD",
    };
  }

  // Match weekly salaries like $1400-1550 per week, $1500/week
  const weeklyRegex =
    /\$(\d{1,4}(?:,\d{3})?)(?:(?:\s*[-–]\s*|\s*to\s*)\$?(\d{1,4}(?:,\d{3})?))?\s*(?:\/|per\s)\s*week/i;
  const weeklyMatch = text.match(weeklyRegex);

  if (weeklyMatch) {
    const minWeekly = parseFloat(weeklyMatch[1].replace(/,/g, ""));
    const maxWeekly = weeklyMatch[2]
      ? parseFloat(weeklyMatch[2].replace(/,/g, ""))
      : minWeekly;
    // Convert to hourly assuming 40 hour work week
    const min = minWeekly / 40;
    const max = maxWeekly / 40;
    return {
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      avg: parseFloat(((min + max) / 2).toFixed(2)),
      type: "hourly (from weekly)",
      currency: "CAD",
    };
  }

  // Match monthly salaries - comprehensive patterns:
  // $5000-6000 per month, $10,400/month, $5500/month
  // $10000-$10500 CAD monthly, $8000 monthly, $9000 USD/mo
  const monthlyRegex =
    /\$([\d,]+(?:\.\d{2})?)(?:(?:\s*[-–]\s*|\s*to\s*)\$?([\d,]+(?:\.\d{2})?))?(?:\s*(?:USD|CAD))?\s*(?:\/\s*(?:month|mo)|per\s*month|monthly)/i;
  const monthlyMatch = tryMatch(monthlyRegex);

  if (monthlyMatch) {
    const minMonthly = parseFloat(monthlyMatch[1].replace(/,/g, ""));
    const maxMonthly = monthlyMatch[2]
      ? parseFloat(monthlyMatch[2].replace(/,/g, ""))
      : minMonthly;
    // Convert to hourly assuming ~173 hours per month (40hrs * 52weeks / 12months)
    const min = minMonthly / 173;
    const max = maxMonthly / 173;
    return {
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      avg: parseFloat(((min + max) / 2).toFixed(2)),
      type: "hourly (from monthly)",
      currency: "CAD",
    };
  }

  // Patterns WITHOUT $ sign (common in some job postings)

  // Handle "K" suffix ranges like "48K-68K" or "48k - 68k"
  // Interpret as annual salary
  const kRangeRegex = /\$?(\d{2,3})[kK]?\s*(?:[-–]|to)\s*\$?(\d{2,3})[kK]/i;
  const kRangeMatch = tryMatch(kRangeRegex);

  if (kRangeMatch) {
    // Only proceed if values are reasonable for annual salary in thousands (e.g. 20k to 200k)
    // Avoid confusing with hourly rates if they are small (though 48k is unambiguous)
    const minK = parseFloat(kRangeMatch[1]);
    const maxK = parseFloat(kRangeMatch[2]);

    if (minK >= 20 && maxK <= 300) {
      const minAnnual = minK * 1000;
      const maxAnnual = maxK * 1000;

      return {
        min: parseFloat((minAnnual / 2000).toFixed(2)),
        max: parseFloat((maxAnnual / 2000).toFixed(2)),
        avg: parseFloat(((minAnnual + maxAnnual) / 4000).toFixed(2)),
        type: "hourly (from yearly K)",
        currency: "CAD",
      };
    }
  }

  // LLM_FALLBACK_MARKER: return null to indicate regex failed, LLM will be tried later
  return null;
}

// LLM-based salary extraction as fallback
// LLM-based salary extraction as fallback
async function extractSalaryWithLLM(fullText) {
  if (!fullText) return null;

  // Only look at compensation section
  const compMatch = fullText.match(
    /Compensation\s*(?:and|&)?\s*Benefits?:?\s*([\s\S]*?)(?:\n\n|\n[A-Z][a-z]+:|Targeted Degrees|$)/i
  );
  if (!compMatch) return null;

  const truncatedText = compMatch[1].slice(0, 1000);

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `Extract salary information.
Reply ONLY with JSON: {"min":number,"max":number,"period":"hourly"|"weekly"|"monthly"|"yearly"|"term"|"daily","currency":"CAD"|"USD"|"RMB"|"CNY"|"EUR"|"GBP"}
If no salary, reply {"min":null}.
Example: "$800-1300/week" -> {"min":800,"max":1300,"period":"weekly","currency":"CAD"}`,
        },
        { role: "user", content: truncatedText },
      ],
      temperature: 0,
      max_tokens: 50,
    });

    let content = response.choices[0]?.message?.content?.trim();
    if (!content) return null;

    // Extract JSON from response
    const jsonMatch = content.match(/\{[^}]+\}/);
    if (jsonMatch) content = jsonMatch[0];

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      return null;
    }

    if (parsed.min === null) return null;

    const minRaw = parseFloat(parsed.min);
    const maxRaw = parsed.max ? parseFloat(parsed.max) : minRaw;

    if (isNaN(minRaw) || minRaw <= 0) return null;

    // Convert to hourly based on period
    let divisor = 1;
    const period = (parsed.period || "hourly").toLowerCase();

    switch (period) {
      case "hourly":
        divisor = 1;
        break;
      case "weekly":
        divisor = 40;
        break;
      case "monthly":
        divisor = 173;
        break;
      case "yearly":
      case "annually":
        divisor = 2000;
        break;
      case "term":
        divisor = 4 * 173; // Assume 4 month term
        break;
      case "daily":
        divisor = 8; // Assume 8 hour day
        break;
      default:
        // aggressive fallback if period is weird, assume hourly if small, yearly if large
        if (minRaw > 10000) divisor = 2000;
        else if (minRaw > 2000) divisor = 173;
        else if (minRaw > 500) divisor = 40;
        else divisor = 1;
    }

    const min = parseFloat((minRaw / divisor).toFixed(2));
    const max = parseFloat((maxRaw / divisor).toFixed(2));

    // Sanity check
    if (min < 5 || min > 200) return null;

    return {
      min: min,
      max: max,
      avg: parseFloat(((min + max) / 2).toFixed(2)),
      type: `hourly (LLM ${period})`,
      currency: parsed.currency || "CAD",
      source: "llm",
    };
  } catch (error) {
    return null;
  }
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

async function processJobs() {
  try {
    console.log("Starting job processing...");
    const rawData = fs.readFileSync(RAW_DATA_PATH, "utf8");
    const jobs = JSON.parse(rawData);

    // Load existing processed data to use as cache
    let existingSalaries = {};
    if (fs.existsSync(OUTPUT_PATH)) {
      try {
        const existingData = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8"));
        if (existingData.jobs) {
          existingData.jobs.forEach((job) => {
            if (job.salary) {
              existingSalaries[job.id] = job.salary;
            }
          });
          console.log(
            `Loaded ${
              Object.keys(existingSalaries).length
            } existing salaries from cache.`
          );
        }
      } catch (e) {
        console.log("Could not read existing data for cache, starting fresh.");
      }
    }

    console.log(`Processing ${jobs.length} jobs...`);

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

    const jobsNeedingLLM = []; // Track jobs without salary for LLM fallback

    jobs.forEach((job, idx) => {
      const combinedText =
        (job.full_description || "") + " " + (job.application_info || "");

      // Check cache first, then regex
      let salary = existingSalaries[job.id];
      if (!salary) {
        salary = extractSalary(combinedText);
      }

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
        _combinedText: combinedText, // Keep for LLM fallback
      };

      processedJobs.push(processedJob);

      // Track jobs needing LLM fallback
      // Optimization: Only use LLM if there are actual numbers in the compensation section
      if (!salary) {
        // Extract comp section
        const compMatch = combinedText.match(
          /Compensation\s*(?:and|&)?\s*Benefits?:?\s*([\s\S]*?)(?:\n\n|\n[A-Z][a-z]+:|Targeted Degrees|$)/i
        );

        // Only queue for LLM if comp section exists AND contains digits
        if (compMatch && /\d/.test(compMatch[1])) {
          jobsNeedingLLM.push(idx);
        }
      }

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

    const regexMatched = processedJobs.filter((j) => j.salary).length;
    console.log(`Regex matched: ${regexMatched}/${jobs.length} jobs`);
    console.log(`Jobs needing LLM fallback: ${jobsNeedingLLM.length}`);

    // LLM fallback pass
    if (jobsNeedingLLM.length > 0) {
      console.log("\nRunning LLM fallback for remaining jobs...");
      let llmSuccessCount = 0;

      for (let i = 0; i < jobsNeedingLLM.length; i++) {
        const jobIndex = jobsNeedingLLM[i];
        const job = processedJobs[jobIndex];

        const salary = await extractSalaryWithLLM(job._combinedText);
        if (salary) {
          processedJobs[jobIndex].salary = salary;
          llmSuccessCount++;
          // Update salary stats
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

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Progress
        if ((i + 1) % 50 === 0 || i === jobsNeedingLLM.length - 1) {
          console.log(
            `  LLM progress: ${i + 1}/${
              jobsNeedingLLM.length
            } (found ${llmSuccessCount} more salaries)`
          );
        }
      }

      console.log(`LLM found ${llmSuccessCount} additional salaries`);
    }

    // Remove temporary field
    processedJobs.forEach((job) => delete job._combinedText);

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
    console.log(
      `Total jobs with salary: ${metrics.salaryStats?.hourly?.count || 0}`
    );
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
