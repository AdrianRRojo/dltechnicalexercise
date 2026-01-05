import "../styles/Home.css";
import BridgelineLogo from "../img/Bridgeline-Logo.png";
import Navbar from "../nav/Nav.js";

export default function Thankyou() {
  return (
    <div> 
      <Navbar />
      <div className="pageWrapper">
        <div className="tyContainer">
          <img
            id="logo"
            src={BridgelineLogo}
            alt="Bridgline Technologies Logo"
          />
          <h2>Thank you for your interest!</h2>
          <p className="subtitle">
            Your submission has been successfully uploaded.
          </p>

          <a href="/">
            <button>Submit a new proposal</button>
          </a>
        </div>
      </div>
    </div>
  );
}
