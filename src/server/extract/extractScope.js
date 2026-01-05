function extractScope(lines, fullText) {
  const scopeItems = [];

  const SCOPE_KEYWORDS =
    /scope of work|work scope|items|services|deliverables|project scope|description|line items/i;
  const END_KEYWORDS =
    /total|subtotal|terms|conditions|signature|notes|thank you|sincerely/i;

  let inScopeSection = false;
  let scopeStartIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    if (SCOPE_KEYWORDS.test(lower)) {
      inScopeSection = true;
      scopeStartIndex = i + 1;
      continue;
    }

    if (inScopeSection && END_KEYWORDS.test(lower)) {
      break;
    }

    if (inScopeSection && i > scopeStartIndex) {
      if (line.length < 3) continue;
      if (line === line.toUpperCase() && line.length < 50) continue;

      let match = line.match(/^(.+?)\s+\$?([\d,]+\.?\d{0,2})$/);

      if (match) {
        const description = match[1].trim();
        const price = match[2];

        if (description.length > 5 && !/^\d+$/.test(description)) {
          scopeItems.push({
            description,
            price: price.includes(".") ? `$${price}` : price,
          });
          continue;
        }
      }

      const priceMatch = line.match(
        /\$[\d,]+\.?\d{0,2}|(?:^|\s)([\d,]+\.\d{2})(?:\s|$)/
      );

      if (priceMatch) {
        const priceIndex = line.indexOf(priceMatch[0]);
        const description = line.substring(0, priceIndex).trim();
        const price = priceMatch[0].trim();

        if (description.length > 5) {
          scopeItems.push({ description, price });
          continue;
        }
      }

      if (/^[-•*\d]+[\.)]\s+/.test(line) || /^[A-Z]/.test(line)) {
        const cleanLine = line.replace(/^[-•*\d]+[\.)]\s+/, "").trim();

        if (
          cleanLine.length > 10 &&
          !/^(scope|description|item|price|total|note)/i.test(cleanLine)
        ) {
          const nextLine = lines[i + 1];
          const nextPrice = nextLine?.match(/^\$?[\d,]+\.?\d{0,2}$/);

          if (nextPrice) {
            scopeItems.push({
              description: cleanLine,
              price: nextPrice[0],
            });
            i++;
          } else {
            scopeItems.push({
              description: cleanLine,
              price: "",
            });
          }
        }
      }
    }
  }

  if (scopeItems.length === 0) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (/^(\d+[\.)]\s+|[-•*]\s+)/.test(line)) {
        const cleanLine = line.replace(/^(\d+[\.)]\s+|[-•*]\s+)/, "").trim();

        if (cleanLine.length > 10) {
          const priceInLine = cleanLine.match(/\$?[\d,]+\.?\d{2}$/);
          const nextLine = lines[i + 1];
          const priceNextLine = nextLine?.match(/^\$?[\d,]+\.?\d{2}$/);

          if (priceInLine) {
            const desc = cleanLine
              .substring(0, cleanLine.indexOf(priceInLine[0]))
              .trim();
            scopeItems.push({ description: desc, price: priceInLine[0] });
          } else if (priceNextLine) {
            scopeItems.push({
              description: cleanLine,
              price: priceNextLine[0],
            });
            i++;
          } else {
            scopeItems.push({ description: cleanLine, price: "" });
          }
        }
      }
    }
  }

  return scopeItems.length > 0
    ? scopeItems
    : [{ description: "No items found", price: "" }];
}