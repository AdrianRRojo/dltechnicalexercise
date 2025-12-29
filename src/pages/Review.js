import React from "react";
import "../Style.css";

const fakeEntries = [
  {
    id: 1,
    filename: "Proposal1.pdf",
    company: "Bridgeline Technologies",
    uploadedBy: "Jane Doe",
    uploadedAt: "2025-12-28",
    confidence: ".6352",
    status: "Pending",
  },
  {
    id: 2,
    filename: "Proposal2.txt",
    company: "AROJO Inc.",
    uploadedBy: "Adrian Rojo",
    uploadedAt: "2025-12-29",
    confidence: ".8923",
    status: "Approved",
  },
  {
    id: 3,
    filename: "Proposal3.xlsx",
    company: "CJ LLC",
    uploadedBy: "Colby Jack",
    uploadedAt: "2025-12-30",
    confidence: ".211",
    status: "Rejected",
  },
];

const getConfidenceClass = (score) => {
  if (score <= 0.5) return "low";
  if (score <= 0.75) return "medium";
  return "high";
};


export default function Review() {
  return (
    <div className="adminPage">
      <h1>Proposal Review</h1>
      <p className="adminSubtitle">Review uploaded Proposals</p>

      <div className="tableCard">
        <table>
          <thead>
            <tr>
              <th>File Name</th>
              <th>Company Name</th>
              <th>Uploaded By</th>
              <th>Date</th>
              <th>Confidence</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {fakeEntries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.filename}</td>
                <td>{entry.company}</td>
                <td>{entry.uploadedBy}</td>
                <td>{entry.uploadedAt}</td>
                <td className={`confidence ${getConfidenceClass(entry.confidence)}`}>
                    {(entry.confidence * 100).toFixed(2)}%
                </td>

                
                <td>
                  <span className={`status ${entry.status.toLowerCase()}`}>
                    {entry.status}
                  </span>
                </td>
                <td className="actions">
                  <button className="Download">Download</button>
                  <button className="approve">Approve</button>
                  <button className="reject">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
