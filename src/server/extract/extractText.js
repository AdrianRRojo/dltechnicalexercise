import { extractPDFText } from "./extractPDFText.js";

import * as pdfMod from "./extractPDFText.js";
console.log("extractPDFText module exports:", Object.keys(pdfMod));

export async function extractText(file) {
  const ext = file.originalname.split(".").pop().toLowerCase();

  if (ext === "pdf") {
    return await extractPDFText(file.buffer);
  }

  throw new Error(`Unsupported file type: ${ext}`);
}
