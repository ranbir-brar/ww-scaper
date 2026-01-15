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
          content: `Extract hourly salary from text. Convert: weekly/40, monthly/173, yearly/2000.
Reply ONLY with JSON: {"min":X,"max":Y} or {"min":null,"max":null} if none found.`,
        },
        { role: "user", content: text },
      ],
      temperature: 0,
      max_tokens: 30,
    });

    console.log("Response:", response.choices[0]?.message?.content);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

const input =
  "Salary based on the number of work terms but the range is between 800$ to 1300$ per week.";
testLLM(input);
