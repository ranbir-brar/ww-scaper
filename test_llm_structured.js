require("dotenv").config();
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testLLM(text) {
  console.log("Testing text:", text);
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
        { role: "user", content: text },
      ],
      temperature: 0,
      max_tokens: 50,
    });

    console.log("Response:", response.choices[0]?.message?.content);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

const input =
  "Salary based on the number of work terms but the range is between 800$ to 1300$ per week.";
testLLM(input);
