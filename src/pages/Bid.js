import React, { useState } from "react";
import Navbar from "../nav/Nav.js";
import "../styles/Bid.css";

const mockContractors = [
  {
    id: 1,
    company: "Bridgeline",
    contact: "Adrian Rojo",
    phone: "(555) 123-4567",
    email: "test@test",
  }
];

export default function Bid() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContractors, setSelectedContractors] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredContractors = mockContractors.filter(
    (contractor) =>
      contractor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleContractor = (contractorId) => {
    setSelectedContractors((prev) =>
      prev.includes(contractorId)
        ? prev.filter((id) => id !== contractorId)
        : [...prev, contractorId]
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

          <div className="contractorList">
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
                    <div className="avatar">{contractor.company.charAt(0)}</div>
                    <div className="contractor-info">
                      <h3 className="company-name">{contractor.company}</h3>
                      <p className="contact-name">{contractor.contact}</p>
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
                  ✓ Invitation sent to {selectedContractors.length}{" "}
                  contractor(s)!
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
                    const contractor = mockContractors.find((c) => c.id === id);
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
                  Send Invitation to {selectedContractors.length || 0}{" "}
                  Contractor(s)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
