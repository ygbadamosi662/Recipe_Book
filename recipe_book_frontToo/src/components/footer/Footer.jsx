import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer>
      <div className="containner">
        <p>&copy; {new Date().getFullYear()} Your Recipe App</p>
        <ul className="footer-links">
          <li>
            <a href="/terms">Terms of Service</a>
          </li>
          <li>
            <a href="/privacy">Privacy Policy</a>
          </li>
          <li>
            <a href="/contact">Contact Us</a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
