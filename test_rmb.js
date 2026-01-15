require("dotenv").config();
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function extractSalaryWithLLM(fullText) {
  if (!fullText) return null;
  const truncatedText = fullText.slice(0, 1000);

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
        divisor = 4 * 173;
        break;
      case "daily":
        divisor = 8; // Assume 8 hour day
        break;
      default:
        // aggressive fallback
        divisor = 1;
    }

    const min = parseFloat((minRaw / divisor).toFixed(2));
    const max = parseFloat((maxRaw / divisor).toFixed(2));

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
    "Compensation and Benefits:\n\n200 RMB per day\n\nStudents matched to an international";
  console.log("Input:", input);
  const result = await extractSalaryWithLLM(input);
  console.log("Result:", result);
}

run();
