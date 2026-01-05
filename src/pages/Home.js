import React, { useState } from "react";

import "../styles/Home.css";

import BridgelineLogo from "../img/Bridgeline-Logo.png";
import hazard from "../img/hazard-sign-svgrepo-com.svg";

import Navbar from "../nav/Nav.js";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function Home() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [isVisible, setIsVisible] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isScopeEditing, setIsScopeEditing] = useState(false);

  const [loadingExtract, setLoadingExtract] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setError("");
    setData(null);
    setSubmitAttempted(false);
    setIsVisible(true);
    setIsEditing(false);
    setIsScopeEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScopeChange = (index, field, value) => {
    setData((prev) => ({
      ...prev,
      scope: (prev?.scope || []).map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAddScopeItem = () => {
    setData((prev) => ({
      ...prev,
      scope: [{ description: "", price: "" }, ...(prev?.scope || [])],
    }));
  };

  const handleRemoveScopeItem = (index) => {
    setData((prev) => ({
      ...prev,
      scope: (prev?.scope || []).filter((_, i) => i !== index),
    }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!API_BASE_URL) {
      setError(
        "Missing REACT_APP_API_BASE_URL. Add it to your .env and restart React."
      );
      return;
    }

    if (!file) {
      setError("Please select a file.");
      return;
    }

    setLoadingExtract(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/api/proposals/extract`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const msg = await safeReadError(res);
        throw new Error(msg || "Server failed to extract.");
      }

      const json = await res.json();

      // Expecting: { extracted: { company, contact, email, phone, scope } }
      const extracted = json?.extracted || json;

      setData({
        company: extracted.company ?? "Not found",
        contact: extracted.contact ?? "Not found",
        email: extracted.email ?? "Not found",
        phone: extracted.phone ?? "Not found",
        scope: Array.isArray(extracted.scope) ? extracted.scope : [],
      });

      setIsVisible(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to process proposal.");
    } finally {
      setLoadingExtract(false);
    }
  };

  const handleSubmitProposal = (company, contact, email, phone) => {
    if (
      company === "Not found" ||
      contact === "Not found" ||
      email === "Not found" ||
      phone === "Not found"
    ) {
      setError("Please update Company contact information");
      return false;
    }
    setError("");
    return true;
  };

const handleConfirm = async () => {
  if (!data) return;

  if (!file) {
    setError("Original file is missing. Please re-upload the proposal.");
    return;
  }

  setSubmitAttempted(true);

  const isValid = handleSubmitProposal(
    data.company,
    data.contact,
    data.email,
    data.phone
  );
  if (!isValid) return;

  setLoadingConfirm(true);
  setError("");

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "payload",
      JSON.stringify({
        company: data.company,
        contact: data.contact,
        email: data.email,
        phone: data.phone,
        scope: Array.isArray(data.scope) ? data.scope : [],
      })
    );

    const res = await fetch(`${API_BASE_URL}/api/proposals/confirm`, {
      method: "POST",
      body: formData, 
    });

    if (!res.ok) {
      const msg = await safeReadError(res);
      throw new Error(msg || "Server failed to save proposal.");
    }

    await res.json();
    window.location.href = "/confirm";
  } catch (err) {
    console.error(err);
    setError(err.message || "Failed to save proposal to database.");
  } finally {
    setLoadingConfirm(false);
  }
};


  const handleStartOver = () => {
    setFile(null);
    setData(null);
    setError("");
    setSubmitAttempted(false);
    setIsVisible(true);
    setIsEditing(false);
    setIsScopeEditing(false);
  };

  return (
    <div>
      <Navbar />
      <div className="pageWrapper">
        {isVisible && (
          <div className="formContainer">
            <img id="logo" src={BridgelineLogo} alt="Bridgeline Logo" />

            <form className="uploadForm" onSubmit={handleUpload}>
              <h2>Upload your proposal</h2>
              <p className="subtitle">Select a file to upload.</p>

              <label className="fileInputLabel">
                <input
                  type="file"
                  accept=".pdf,.xlsx,.txt"
                  onChange={handleFileChange}
                  disabled={loadingExtract}
                />
                <span>{file ? file.name : "Choose File"}</span>
              </label>

              <button type="submit" disabled={loadingExtract || !file}>
                {loadingExtract ? "Extracting..." : "Upload"}
              </button>
            </form>

            {error && <p className="error">{error}</p>}
          </div>
        )}

        {data && (
          <div className="tablesContainer">
            {/* Extracted Info */}
            <div className="infoTable">
              <div className="tableTitle">
                <h3>Extracted Information</h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setIsEditing((p) => !p)}>
                    {isEditing ? "Save" : "Edit"}
                  </button>
                  <button onClick={handleStartOver}>Start Over</button>
                </div>
              </div>

              <table className="extractedTable">
                <tbody>
                  {["company", "contact", "email", "phone"].map((field) => (
                    <tr key={field}>
                      <th>{field.charAt(0).toUpperCase() + field.slice(1)}</th>
                      <td>
                        <input
                          type="text"
                          name={field}
                          value={data[field] || ""}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          style={{
                            border:
                              submitAttempted &&
                              (data[field] === "Not found" ||
                                data[field]?.trim() === "")
                                ? "2px solid red"
                                : "",
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="submitButtonDiv">
                <button
                  className="buttons submit"
                  onClick={handleConfirm}
                  disabled={loadingConfirm}
                >
                  {loadingConfirm ? "Saving..." : "Submit Proposal"}
                </button>
              </div>

              {error && (
                <div className="errorMsg">
                  <img src={hazard} alt="Error" />
                  <p className="error" style={{ color: "red" }}>
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* Scope */}
            <div className="scopeTable">
              <div className="tableTitle">
                <h3>Scope of Work</h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  {isScopeEditing && (
                    <button onClick={handleAddScopeItem} className="addBtn">
                      Add Item
                    </button>
                  )}
                  <button onClick={() => setIsScopeEditing((p) => !p)}>
                    {isScopeEditing ? "Save" : "Edit"}
                  </button>
                </div>
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
                  {Array.isArray(data.scope) && data.scope.length > 0 ? (
                    data.scope.map((item, i) => (
                      <tr key={i}>
                        <td>
                          <textarea
                            value={item.description || ""}
                            onChange={(e) =>
                              handleScopeChange(i, "description", e.target.value)
                            }
                            disabled={!isScopeEditing}
                            rows="2"
                            style={{
                              width: "100%",
                              resize: "vertical",
                              minHeight: "50px",
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.price || ""}
                            onChange={(e) =>
                              handleScopeChange(i, "price", e.target.value)
                            }
                            disabled={!isScopeEditing}
                            style={{ width: "100%" }}
                          />
                        </td>
                        {isScopeEditing && (
                          <td>
                            <button
                              onClick={() => handleRemoveScopeItem(i)}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

async function safeReadError(res) {
  try {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await res.json();
      return j?.message || j?.error || JSON.stringify(j);
    }
    return await res.text();
  } catch {
    return "";
  }
}
