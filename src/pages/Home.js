import React from "react";
import "../Style.css";

export default function Home() {
  return (
    <div className="pageWrapper">
      <div className="formContainer">
        <form className="uploadForm">
          <h2>Upload your proposal</h2>
          <p className="subtitle">Select a file to upload.</p>

          <label className="fileInputLabel">
            <input type="file" />
            <span>Choose File</span>
          </label>

          <button type="submit">Upload</button>
        </form>
      </div>
    </div>
  );
}
