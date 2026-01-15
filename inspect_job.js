const fs = require("fs");
const path = require("path");

const RAW_DATA_PATH = path.join(__dirname, "jobs.json");

try {
  const jobs = JSON.parse(fs.readFileSync(RAW_DATA_PATH, "utf8"));
  const job = jobs.find((j) => j.id === 449800 || j.id === "449800");

  if (job) {
    console.log("Job ID:", job.id);
    console.log("Title:", job.title);
    console.log("Compensation Section:");
    // Extract comp section roughly like main script
    const combinedText =
      (job.full_description || "") + " " + (job.application_info || "");
    const compMatch = combinedText.match(
      /Compensation\s*(?:and|&)?\s*Benefits?:?\s*([\s\S]*?)(?:\n\n|\n[A-Z][a-z]+:|Targeted Degrees|$)/i
    );
    if (compMatch) {
      console.log("--- START COMP ---");
      console.log(compMatch[1].trim());
      console.log("--- END COMP ---");
    } else {
      console.log("No compensation section found via regex.");
      console.log("Snippet of description looking for keywords:");
      const idx = combinedText.toLowerCase().indexOf("compensation");
      if (idx !== -1) {
        console.log(combinedText.substring(idx, idx + 200));
      }
    }
  } else {
    console.log("Job 449800 not found.");
  }
} catch (e) {
  console.error(e);
}
