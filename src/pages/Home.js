import React, { useState } from "react";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

import "../Style.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function Home() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setData(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      return;
    }

    const ext = file.name.split(".").pop().toLowerCase();

    try {
      let text = "";

      if (ext === "pdf") {
        text = await extractPDFText(file);
      } else {
        setError("File Format not allowed");
        return;
      }
      setData(extractFields(text));
      // console.log("File: ", file);
      console.log("Uploading file:", file.name);
    } catch (err) {
      console.error(err);
      setError("Failed to process file.");
    }
  };

  return (
    <div className="pageWrapper">
      <div className="formContainer">
        <form className="uploadForm" onSubmit={handleUpload}>
          <h2>Upload your proposal</h2>
          {/* //TODO: Should update the file name here later, Before clicking upload. */}
          <p className="subtitle">Select a file to upload.</p>

          <label className="fileInputLabel">
            <input
              type="file"
              accept=".pdf,.xlsx,.txt"
              onChange={handleFileChange}
            />
            <span>Choose File</span>
          </label>

          <button type="submit">Upload</button>
        </form>
        {error && <p className="error"> {error} </p>}

        {data && (
          <div>
            <h3>Extracted Information</h3>
            <table className="extractedTable">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Trade & Scope</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{data.company}</td>
                  <td>{data.contact}</td>
                  <td>{data.email}</td>
                  <td>{data.phone}</td>
                  <td>{data.trade}</td>
                </tr>
              </tbody>
            </table>
              {console.log("Data: ", data)}
          </div>
        )}
      </div>
    </div>
  );
}

async function extractPDFText(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + " ";
  }

  return text;
}

function extractFields(text) {
  const email =
    text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "Not found";
  // Matches common email formats like name@example.com

  const phone =
    text.match(/(\+?\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/)?.[0] ||
    "Not found";
  // Extracts a phone number like (123) 456-7890 or 123-456-7890

  const lines = text
    .split(/[\n,]/)
    .map((l) => l.trim())
    .filter(Boolean);

  const company =
    lines
      .map((l) => l.match(/^(.+?\b(?:llc|inc|corp|company|ltd)\.?\b)/i)?.[1])
      .find(Boolean) || "Unknown";
  // Look for common company titles like LLC and Inc -- Case-Insensitive.

  const contact =
    lines.find((l) => /^[A-Z][a-z]+\s[A-Z][a-z]+$/.test(l)) || "Unknown";
  // NOt working
  const trade =
    lines.find((l) =>
      /plumbing|electrical|hvac|construction|it|marketing|design/i.test(l)
    ) || "Unknown";
  // NOt working
  return { company, contact, email, phone, trade };
}
