async function extractPDFText(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(" ") + " ";
  }

  return text;
}

function extractFields(text) {
  const email =
    text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ||
    "Not found";

  const phone =
    text.match(/(\+?\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/)?.[0] ||
    "Not found";

  const lines = text
    .split(/[\n,]/)
    .map(l => l.trim())
    .filter(Boolean);

  const company =
    lines.find(l => /llc|inc|corp|company|ltd/i.test(l)) ||
    "Unknown";

  const contact =
    lines.find(l => /^[A-Z][a-z]+\s[A-Z][a-z]+$/.test(l)) ||
    "Unknown";

  const trade =
    lines.find(l =>
      /plumbing|electrical|hvac|construction|it|marketing|design/i.test(l)
    ) ||
    "Unknown";

  return { company, contact, email, phone, trade };
}
