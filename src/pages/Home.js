import React, { useState } from "react";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

import "../Style.css";

import BridgelineLogo from "../img/Bridgeline-Logo.png";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function Home() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const [isVisible, setIsVisible] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isScopeEditing, setIsScopeEditing] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setData(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleScopeChange = (index, field, value) => {
    setData((prev) => ({
      ...prev,
      scope: prev.scope.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAddScopeItem = () => {
    setData((prev) => ({
      ...prev,
      scope: [...prev.scope, { description: "", price: "" }],
    }));
  };

  const handleRemoveScopeItem = (index) => {
    setData((prev) => ({
      ...prev,
      scope: prev.scope.filter((_, i) => i !== index),
    }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      return;
    }
    setIsVisible(!isVisible);

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

      console.log("Uploading file:", file.name);
    } catch (err) {
      console.error(err);
      setError("Failed to process file.");
    }
  };

  return (
    <div className="pageWrapper">
      {isVisible && (
        <div className="formContainer">
          <img
            id="logo"
            src={BridgelineLogo}
            alt="Bridgline Technologies Logo"
          />
          <form className="uploadForm" onSubmit={handleUpload}>
            <h2>Upload your proposal</h2>
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
        </div>
      )}

      <div className="tableWrapper">
        {data && (
          <div className="tablesContainer">
            <div className="infoTable">
              <div className="tableTitle">
                <h3>Extracted Information</h3>
                <button onClick={() => setIsEditing((prev) => !prev)}>
                  {isEditing ? "Save" : "Edit"}
                </button>
              </div>
              <table className="extractedTable">
                <tbody>
                  <tr>
                    <th>Company</th>
                    <td>
                      <input
                        type="text"
                        name="company"
                        value={data.company}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </td>
                  </tr>

                  <tr>
                    <th>Contact</th>
                    <td>
                      <input
                        type="text"
                        name="contact"
                        value={data.contact}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </td>
                  </tr>

                  <tr>
                    <th>Email</th>
                    <td>
                      <input
                        type="text"
                        name="email"
                        value={data.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </td>
                  </tr>

                  <tr>
                    <th>Phone Number</th>
                    <td>
                      <input
                        type="text"
                        name="phone"
                        value={data.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </td>
                  </tr>
                  {/* 
                  <tr>
                    <th>Trade</th>
                    <td>
                      <input
                        type="text"
                        name="trade"
                        value={data.trade}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </td>
                  </tr> */}
                </tbody>
              </table>
            </div>

            <div className="scopeTable">
              <div className="tableTitle">
                <h3>Scope of Work</h3>
                <button onClick={() => setIsScopeEditing((prev) => !prev)}>
                  {isScopeEditing ? "Save" : "Edit"}
                </button>
              </div>
              <table className="extractedTable">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Price</th>
                    {isScopeEditing && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.scope && data.scope.length > 0 ? (
                    data.scope.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                              handleScopeChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            disabled={!isScopeEditing}
                            style={{ width: "100%" }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.price}
                            onChange={(e) =>
                              handleScopeChange(index, "price", e.target.value)
                            }
                            disabled={!isScopeEditing}
                            style={{ width: "100%" }}
                          />
                        </td>
                        {isScopeEditing && (
                          <td>
                            <button
                              onClick={() => handleRemoveScopeItem(index)}
                              className="removeBtn"
                            >
                              Remove
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isScopeEditing ? 3 : 2}>
                        No scope items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {isScopeEditing && (
                <button onClick={handleAddScopeItem} className="addBtn">
                  Add Item
                </button>
              )}
            </div>

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
  let lines = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const lineMap = new Map();

    content.items.forEach((item) => {
      const y = Math.round(item.transform[5]);
      if (!lineMap.has(y)) {
        lineMap.set(y, []);
      }
      lineMap.get(y).push(item);
    });

    const sortedLines = Array.from(lineMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([y, items]) => {
        return items
          .sort((a, b) => a.transform[4] - b.transform[4])
          .map((item) => item.str)
          .join(" ")
          .trim();
      })
      .filter((line) => line.length > 0);

    lines = lines.concat(sortedLines);
    text += sortedLines.join("\n") + "\n";
  }

  return { text, lines };
}

function extractFields(text) {
  const { text: fullText, lines } =
    typeof text === "string"
      ? {
          text,
          lines: text
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
        }
      : text;

  const email =
    fullText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ||
    "Not found";

  const phone =
    fullText.match(
      /(\+?\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/
    )?.[0] || "Not found";

  const company =
    lines
      .map((l) => l.match(/^(.+?\b(?:llc|inc|corp|company|ltd)\.?\b)/i)?.[1])
      .find(Boolean) || "Unknown";

  const contact = extractContact(lines, email, phone, fullText);

  const scope = extractScope(lines, fullText);

  return { company, contact, email, phone, scope };
}

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

    const prev2 = lines[i - 2]?.toLowerCase() || "";
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

  return "Unknown";
}

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
