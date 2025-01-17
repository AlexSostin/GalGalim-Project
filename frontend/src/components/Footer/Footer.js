import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Navigation</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/bikes">Bikes</Link>
              </li>
              <li>
                <Link to="/saved-bikes">Saved Bikes</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contact</h3>
            <p>Email: info@galgalim.co.il</p>
            <p>Phone: +972 (053) 807-40-90</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 GalGalim. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
