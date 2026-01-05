import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../nav/Nav.js";
import "../styles/Bid.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function Bid() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContractors, setSelectedContractors] = useState([]); 
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {


      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE_URL}/api/itb/contractors`);
        if (!res.ok) throw new Error("Failed to load contractors");

        const json = await res.json();

        if (!cancelled) setContractors(Array.isArray(json.contractors) ? json.contractors : []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load contractors");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredContractors = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return contractors;

    return contractors.filter(
      (c) =>
        (c.company || "").toLowerCase().includes(q) ||
        (c.contact || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q)
    );
  }, [contractors, searchTerm]);

  const toggleContractor = (companyId) => {
    setSelectedContractors((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleSendInvitation = () => {
    if (selectedContractors.length > 0 && projectName && projectDescription) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedContractors([]);
        setProjectName("");
        setProjectDescription("");
        setDueDate("");
      }, 3000);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        {/* Contractor Sidebar */}
        <div className="sidebar">
          <div className="header">
            <h1 className="title">Contractors</h1>
            <p className="subtitle">{selectedContractors.length} selected</p>
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search contractors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {loading && (
            <div style={{ padding: "12px" }}>
              <p>Loading contractors…</p>
            </div>
          )}

          {error && (
            <div style={{ padding: "12px" }}>
              <p style={{ color: "red" }}>{error}</p>
            </div>
          )}

          <div className="contractorList">
            {!loading && !error && filteredContractors.length === 0 && (
              <div style={{ padding: "12px" }}>
                <p>No contractors found.</p>
              </div>
            )}

            {filteredContractors.map((contractor) => {
              const isSelected = selectedContractors.includes(contractor.id);
              return (
                <div
                  key={contractor.id}
                  onClick={() => toggleContractor(contractor.id)}
                  className={`contractor-item ${isSelected ? "selected" : ""}`}
                >
                  <div className="contractor-content">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="checkbox"
                    />
                    <div className="avatar">
                      {(contractor.company || "?").charAt(0)}
                    </div>
                    <div className="contractor-info">
                      <h3 className="company-name">{contractor.company}</h3>
                      <p className="contact-name">{contractor.contact}</p>

                      {typeof contractor.proposalsCount === "number" && (
                        <p className="contact-name" style={{ opacity: 0.8 }}>
                          {contractor.proposalsCount} proposal(s)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="main-content">
          <div className="form-container">
            <h2 className="main-title">Invitation to Bid</h2>
            <p className="main-subtitle">
              Select contractors from the sidebar and fill out the project
              details below
            </p>

            {showSuccess && (
              <div className="success-message">
                <p className="success-text">
                  ✓ Invitation sent to {selectedContractors.length} contractor(s)!
                </p>
              </div>
            )}

            {selectedContractors.length > 0 && (
              <div className="selected-preview">
                <h3 className="preview-title">
                  Selected Contractors ({selectedContractors.length})
                </h3>
                <div className="chip-container">
                  {selectedContractors.map((id) => {
                    const contractor = contractors.find((c) => c.id === id);
                    if (!contractor) return null;
                    return (
                      <span key={id} className="chip">
                        {contractor.company}
                        <button
                          onClick={() => toggleContractor(id)}
                          className="chip-remove"
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="form-card">
              <div className="form-group">
                <label className="label">Project Name *</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., Kitchen Renovation"
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="label">Project Description *</label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe the scope of work, requirements, and any special considerations..."
                  rows="6"
                  className="input textarea"
                />
              </div>

              <div className="form-group">
                <label className="label">Bid Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input"
                />
              </div>

              <div className="button-container">
                <button
                  onClick={handleSendInvitation}
                  disabled={
                    selectedContractors.length === 0 ||
                    !projectName ||
                    !projectDescription
                  }
                  className={`button ${
                    selectedContractors.length === 0 ||
                    !projectName ||
                    !projectDescription
                      ? "disabled"
                      : ""
                  }`}
                >
                  Send Invitation to {selectedContractors.length || 0} Contractor(s)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
