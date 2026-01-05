function extractContact(lines, email, phone, fullText) {
  const candidates = [];

  const HARD_BLOCKLIST = [
    "llc",
    "inc",
    "corp",
    "company",
    "ltd",
    "proposal",
    "estimate",
    "invoice",
    "services",
    "construction",
    "plumbing",
    "electrical",
    "total",
    "price",
    "subtotal",
    "tax",
    "amount",
    "balance",
    "page",
    "date",
    "number",
    "description",
    "quantity",
    "rate",
    "street",
    "avenue",
    "road",
    "drive",
    "boulevard",
    "lane",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
    "agreement",
    "warranty",
    "guarantee",
    "terms",
    "conditions",
  ];

  for (let i = 0; i < Math.min(lines.length, 50); i++) {
    const line = lines[i].toLowerCase();

    if (/^(contact|prepared by|submitted by|from|name):/i.test(line)) {
      const nextLine = lines[i + 1]?.trim();
      if (nextLine) {
        const nameMatch = nextLine.match(
          /^([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+)/
        );
        if (nameMatch) {
          return nameMatch[1];
        }
      }

      const sameLine = lines[i].match(
        /(?:contact|prepared by|submitted by|from|name):\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i
      );
      if (sameLine) {
        return sameLine[1];
      }
    }
  }

  for (let i = 0; i < Math.min(lines.length, 80); i++) {
    const line = lines[i]?.trim();
    if (!line) continue;

    const lower = line.toLowerCase();

    if (line.length > 45 || line.length < 5) continue;
    if (HARD_BLOCKLIST.some((word) => lower.includes(word))) continue;
    if ((line.match(/[0-9$#%@]/g) || []).length > 2) continue;
    if (line === line.toUpperCase() && line.length > 4) continue;

    let match = null;
    let patternType = "";

    match = line.match(/^([A-Z][a-z]{1,15})\s+([A-Z][a-z]{1,15})$/);
    if (match) patternType = "standard";

    if (!match) {
      match = line.match(
        /^([A-Z][a-z]{1,15})\s+([A-Z]\.?)\s+([A-Z][a-z]{1,15})$/
      );
      if (match) patternType = "middle_initial";
    }

    if (!match) {
      match = line.match(
        /^([A-Z][a-z]+\s+[A-Z][a-z]+),?\s*(Jr\.?|Sr\.?|II|III|IV|PhD|PE|P\.E\.?|CPA|Esq\.?)$/i
      );
      if (match) patternType = "with_suffix";
    }

    if (!match) continue;

    let score = 5;

    // const prev2 = lines[i - 2]?.toLowerCase() || "";
    const prev1 = lines[i - 1]?.toLowerCase() || "";
    const next1 = lines[i + 1]?.toLowerCase() || "";
    const next2 = lines[i + 2]?.toLowerCase() || "";

    if (
      /contact|prepared by|submitted by|from|attn|attention|estimator|project manager/i.test(
        prev1
      )
    )
      score += 20;
    if (/@/.test(next1) || /@/.test(next2)) score += 15;
    if (/\d{3}[-.)]\s*\d{3}/.test(next1) || /\d{3}[-.)]\s*\d{3}/.test(next2))
      score += 12;
    if (
      /manager|director|owner|president|coordinator|engineer|specialist/i.test(
        next1
      )
    )
      score += 10;

    if (i < 15) score += 10;
    else if (i < 30) score += 5;

    if (patternType === "middle_initial") score += 5;
    if (patternType === "with_suffix") score += 4;

    candidates.push({ name: line, score, index: i, pattern: patternType });
  }

  candidates.sort((a, b) => b.score - a.score);

  console.log("Top 5 candidates:", candidates.slice(0, 5));

  if (candidates.length > 0 && candidates[0].score >= 15) {
    return candidates[0].name;
  }

  if (email !== "Not found" && email.includes("@")) {
    const localPart = email.split("@")[0];
    const parts = localPart.split(/[._-]/);

    if (parts.length >= 2 && parts[0].length > 1 && parts[1].length > 1) {
      const firstName =
        parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
      const lastName =
        parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
      return `${firstName} ${lastName}`;
    }
  }

  return "Not found";
}