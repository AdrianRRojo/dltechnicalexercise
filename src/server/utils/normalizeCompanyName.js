export function normalizeCompanyName(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[\.,]/g, " ")
    .replace(/\b(llc|inc|incorporated|corp|corporation|ltd|limited)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
