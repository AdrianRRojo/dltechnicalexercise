import { Link } from "react-router-dom";
import BridgelineLogo from "../img/Bridgeline-Logo.png";
import "../styles/Nav.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img src={BridgelineLogo} alt="Bridgeline Technologies" />
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/bid" className="nav-link">
              Bid System
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
