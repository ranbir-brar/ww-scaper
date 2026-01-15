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

  // Fallback: Match patterns like "$XX - $XX per hour" or "$XX to $XX an hour"
  const hourlyFallbackRegex =
    /\$(\d{1,3}(?:\.\d{1,2})?)\s*(?:[-–]|to)\s*\$?(\d{1,3}(?:\.\d{1,2})?)\s*(?:per|an|\/)\s*(?:h(?:ou)?r|hourly)/i;
  const hourlyFallbackMatch = text.match(hourlyFallbackRegex);

  if (hourlyFallbackMatch) {
    const min = parseFloat(hourlyFallbackMatch[1]);
    const max = parseFloat(hourlyFallbackMatch[2]);
    return {
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      avg: parseFloat(((min + max) / 2).toFixed(2)),
      type: "hourly",
      currency: "CAD",
    };
  }

  // Match "$XX hourly rate" or "$XX USD hourly" patterns
  const hourlyRateRegex =
    /\$(\d{1,3}(?:\.\d{1,2})?)\s*(?:USD|CAD)?\s*(?:hourly\s*rate|hourly)/i;
  const hourlyRateMatch = text.match(hourlyRateRegex);

  if (hourlyRateMatch) {
    const rate = parseFloat(hourlyRateMatch[1]);
    return {
      min: parseFloat(rate.toFixed(2)),
      max: parseFloat(rate.toFixed(2)),
      avg: parseFloat(rate.toFixed(2)),
      type: "hourly",
      currency: "CAD",
    };
  }

  // Aggressive fallback: Look for $XX-$XX near compensation/salary keywords
  const aggressiveRegex =
    /(?:salary|compensation|pay|rate|paid|earning)[^\$]*\$(\d{1,3}(?:\.\d{1,2})?)\s*(?:[-–]|to)\s*\$?(\d{1,3}(?:\.\d{1,2})?)/i;
  const aggressiveMatch = text.match(aggressiveRegex);

  if (aggressiveMatch) {
    const min = parseFloat(aggressiveMatch[1]);
    const max = parseFloat(aggressiveMatch[2]);
    // Only accept if values are in reasonable hourly range (10-200)
    if (min >= 10 && min <= 200 && max >= 10 && max <= 200) {
      return {
        min: parseFloat(min.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        avg: parseFloat(((min + max) / 2).toFixed(2)),
        type: "hourly",
        currency: "CAD",
      };
    }
  }

  // Match yearly salaries - standard format like $65,000/year or $65,000 per year
  const yearlyRegex =
    /\$(\d{2,3}(?:,\d{3})*)(?:(?:\s*-\s*|\s*to\s*)\$(\d{2,3}(?:,\d{3})*))?\s*(?:\/|per\s)?\s*(?:year|annum)/i;
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
    /\$(\d{3,4}(?:,\d{3})?)(?:(?:\s*[-–]\s*|\s*to\s*)\$?(\d{3,4}(?:,\d{3})?))?\s*(?:\/|per\s)\s*week/i;
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

  // Monthly without $: "10,500 USD/month" or "5000 CAD per month"
  const monthlyNoDollarRegex =
    /(\d{1,3}(?:,\d{3})?|\d{4,6})(?:\s*[-–]\s*(\d{1,3}(?:,\d{3})?|\d{4,6}))?\s*(?:USD|CAD|usd|cad)?\s*(?:\/|per\s)\s*month/i;
  const monthlyNoDollarMatch = tryMatch(monthlyNoDollarRegex);

  if (monthlyNoDollarMatch) {
    const minMonthly = parseFloat(monthlyNoDollarMatch[1].replace(/,/g, ""));
    const maxMonthly = monthlyNoDollarMatch[2]
      ? parseFloat(monthlyNoDollarMatch[2].replace(/,/g, ""))
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

  // Hourly without $: "25 USD/hour" or "30-40 CAD per hour"
  const hourlyNoDollarRegex =
    /(\d{1,3}(?:\.\d{1,2})?)(?:\s*[-–]\s*(\d{1,3}(?:\.\d{1,2})?))?\s*(?:USD|CAD|usd|cad)\s*(?:\/|per\s)\s*(?:h(?:ou)?r|hourly)/i;
  const hourlyNoDollarMatch = tryMatch(hourlyNoDollarRegex);

  if (hourlyNoDollarMatch) {
    const min = parseFloat(hourlyNoDollarMatch[1]);
    const max = hourlyNoDollarMatch[2]
      ? parseFloat(hourlyNoDollarMatch[2])
      : min;
    return {
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      avg: parseFloat(((min + max) / 2).toFixed(2)),
      type: "hourly",
      currency: "CAD",
    };
  }

  // Weekly without $: "1500 USD/week"
  const weeklyNoDollarRegex =
    /(\d{3,4}(?:,\d{3})?)(?:\s*[-–]\s*(\d{3,4}(?:,\d{3})?))?\s*(?:USD|CAD|usd|cad)?\s*(?:\/|per\s)\s*week/i;
  const weeklyNoDollarMatch = tryMatch(weeklyNoDollarRegex);

  if (weeklyNoDollarMatch) {
    const minWeekly = parseFloat(weeklyNoDollarMatch[1].replace(/,/g, ""));
    const maxWeekly = weeklyNoDollarMatch[2]
      ? parseFloat(weeklyNoDollarMatch[2].replace(/,/g, ""))
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

  // Pattern: "Base salary of USD 9,000" or "salary of USD $9,000" (currency before number)
  const salaryOfRegex =
    /(?:base\s+)?salary\s+(?:of\s+)?(?:USD|CAD|usd|cad)\s*\$?\s*(\d{1,3}(?:,\d{3})?|\d{4,6})/i;
  const salaryOfMatch = tryMatch(salaryOfRegex);

  if (salaryOfMatch) {
    const amount = parseFloat(salaryOfMatch[1].replace(/,/g, ""));
    // Assume monthly if amount is in typical monthly range (3000-20000)
    if (amount >= 3000 && amount <= 20000) {
      const hourly = amount / 173;
      return {
        min: parseFloat(hourly.toFixed(2)),
        max: parseFloat(hourly.toFixed(2)),
        avg: parseFloat(hourly.toFixed(2)),
        type: "hourly (from monthly)",
        currency: "CAD",
      };
    }
    // If smaller, might be hourly
    if (amount >= 15 && amount <= 200) {
      return {
        min: parseFloat(amount.toFixed(2)),
        max: parseFloat(amount.toFixed(2)),
        avg: parseFloat(amount.toFixed(2)),
        type: "hourly",
        currency: "CAD",
      };
    }
  }

  // Pattern: Just "USD X,XXX" or "CAD X,XXX" in compensation section (currency first)
  const currencyFirstRegex =
    /(?:USD|CAD)\s*\$?\s*(\d{1,3}(?:,\d{3})?|\d{4,6})(?:\s*[-–]\s*(?:USD|CAD)?\s*\$?\s*(\d{1,3}(?:,\d{3})?|\d{4,6}))?/i;
  const currencyFirstMatch = text.match(currencyFirstRegex); // Only check comp section

  if (currencyFirstMatch && text !== fullText) {
    const amount1 = parseFloat(currencyFirstMatch[1].replace(/,/g, ""));
    const amount2 = currencyFirstMatch[2]
      ? parseFloat(currencyFirstMatch[2].replace(/,/g, ""))
      : amount1;
    const minAmt = Math.min(amount1, amount2);
    const maxAmt = Math.max(amount1, amount2);

    // Assume monthly if in typical monthly range
    if (minAmt >= 3000 && maxAmt <= 25000) {
      return {
        min: parseFloat((minAmt / 173).toFixed(2)),
        max: parseFloat((maxAmt / 173).toFixed(2)),
        avg: parseFloat(((minAmt + maxAmt) / 346).toFixed(2)),
        type: "hourly (from monthly)",
        currency: "CAD",
      };
    }
  }

  // Handle "K" suffix ranges like "48K-68K" or "48k - 68k"
  // Interpret as annual salary
  const kRangeRegex = /\$?(\d{2,3})[kK]?\s*(?:[-–]|to)\s*\$?(\d{2,3})[kK]/i;
  const kRangeMatch = tryMatch(kRangeRegex);

  if (kRangeMatch) {
    const minK = parseFloat(kRangeMatch[1]);
    const maxK = parseFloat(kRangeMatch[2]);

    // Only proceed if values are reasonable for annual salary in thousands (e.g. 20k to 200k)
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

  return null;
}

const testText = "the range is 48K-68K for Wealth Co-ops.";
console.log("Input:", testText);
console.log("Result:", extractSalary(testText));
