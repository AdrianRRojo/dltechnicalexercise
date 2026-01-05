import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export async function extractPDFText(buffer) {
  const data = await pdfParse(buffer);
  return data.text || "";
}
