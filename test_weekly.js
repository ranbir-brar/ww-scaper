function extractSalary(fullText) {
  if (!fullText) return null;
  let text = fullText;

  // Helper function to try patterns
  const tryMatch = (regex) => {
    let match = text.match(regex);
    if (!match && text !== fullText) {
      match = fullText.match(regex);
    }
    return match;
  };

  // We only include the relevant regexes to see if they match the user's string

  // Weekly with $ sign (requires $)
  const weeklyRegex =
    /\$(\d{3,4}(?:,\d{3})?)(?:(?:\s*[-–]\s*|\s*to\s*)\$?(\d{3,4}(?:,\d{3})?))?\s*(?:\/|per\s)\s*week/i;
  const weeklyMatch = text.match(weeklyRegex);
  if (weeklyMatch) return "MATCHED weeklyRegex";

  // Weekly without $ (does not handle 'to')
  const weeklyNoDollarRegex =
    /(\d{3,4}(?:,\d{3})?)(?:\s*[-–]\s*(\d{3,4}(?:,\d{3})?))?\s*(?:USD|CAD|usd|cad)?\s*(?:\/|per\s)\s*week/i;
  const weeklyNoDollarMatch = tryMatch(weeklyNoDollarRegex);
  if (weeklyNoDollarMatch) return "MATCHED weeklyNoDollarRegex";

  return null;
}

const input =
  "Salary based on the number of work terms but the range is between 800$ to 1300$ per week.";
console.log("Input:", input);
console.log("Result:", extractSalary(input));
