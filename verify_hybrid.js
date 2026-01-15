require("dotenv").config();
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Copy of the function from process_jobs.js to test exact logic
async function extractSalaryWithLLM(fullText) {
  if (!fullText) return null;

  // Mocking the behavior where we pass just the text,
  // in process_jobs it extracts the comp section first.
  // We'll simulate that by passing the relevant text directly.
  const truncatedText = fullText.slice(0, 1000);

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `Extract salary information.
Reply ONLY with JSON: {"min":number,"max":number,"period":"hourly"|"weekly"|"monthly"|"yearly"|"term","currency":"CAD"|"USD"}
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
      default:
        // aggressive fallback if period is weird
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
    console.error(error);
    return null;
  }
}

async function run() {
  const input =
    "Salary based on the number of work terms but the range is between 800$ to 1300$ per week.";
  console.log("Input:", input);
  const result = await extractSalaryWithLLM(input);
  console.log("Result:", result);
}

run();
