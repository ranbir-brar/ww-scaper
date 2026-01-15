require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function listModels() {
  try {
    const models = await groq.models.list();
    console.log("Available Groq Models:");
    models.data.forEach((model) => {
        // IDs often hint at the model family (Llama, Mixtral, Gemma)
        console.log(`- ${model.id} (Owner: ${model.owned_by})`);
    });
    
    // speed isn't in the list API, but I can provide general knowledge
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
