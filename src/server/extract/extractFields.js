export function extractFields(text) {
  const emailMatch = text.match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  );
  const phoneMatch = text.match(
    /(\+?\d{1,2}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/
  );

  return {
    company: extractCompany(text),
    contact: extractContact(text),
    email: emailMatch ? emailMatch[0] : "Not found",
    phone: phoneMatch ? phoneMatch[0] : "Not found",
    scope: extractScope(text),
  };
}

function extractCompany(text) {
  const match = text.match(/Company\s*:\s*(.+)/i);
  return match ? match[1].trim() : "Not found";
}

function extractContact(text) {
  const match = text.match(/Contact\s*:\s*(.+)/i);
  return match ? match[1].trim() : "Not found";
}

function extractScope(text) {
  return [];
}
