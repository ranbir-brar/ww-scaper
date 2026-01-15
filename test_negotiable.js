function extractSalary(fullText) {
  if (!fullText) return null;
  let text = fullText;

  const tryMatch = (regex) => {
    let match = text.match(regex);
    if (!match && text !== fullText) {
      match = fullText.match(regex);
    }
    return match;
  };

  // Pre-check for debug target
  const isDebug = text.includes("1,400");
  if (isDebug) console.log("Debug mode: true");

  // Fixed Weekly Regex (1-4 digits)
  const weeklyRegex =
    /\$(\d{1,4}(?:,\d{3})?)(?:(?:\s*[-–]\s*|\s*to\s*)\$?(\d{1,4}(?:,\d{3})?))?\s*(?:\/|per\s)\s*week/i;
  const weeklyMatch = text.match(weeklyRegex);

  if (weeklyMatch) {
    if (isDebug) console.log("Matched weeklyRegex:", weeklyMatch[0]);
    const minWeekly = parseFloat(weeklyMatch[1].replace(/,/g, ""));
    const maxWeekly = weeklyMatch[2]
      ? parseFloat(weeklyMatch[2].replace(/,/g, ""))
      : minWeekly;
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

  // Fixed Yearly Regex (1-3 digit blocks)
  const yearlyRegex =
    /\$(\d{1,3}(?:,\d{3})*)(?:(?:\s*-\s*|\s*to\s*)\$(\d{1,3}(?:,\d{3})*))?\s*(?:\/|per\s)?\s*(?:year|annum)/i;
  const yearlyMatch = text.match(yearlyRegex);

  if (yearlyMatch) {
    if (isDebug) console.log("Matched yearlyRegex");
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

  return null;
}

const input =
  "Negotiable, typically $1,400 / week or $72,800 annualized with an increase for repeat students.";
console.log("Input:", input);
console.log("Result:", extractSalary(input));
