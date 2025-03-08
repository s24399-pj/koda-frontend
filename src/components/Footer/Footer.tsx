import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>KODA</h3>
        </div>
        <div className="footer-section">
          <ul>
            <li><a href="#">Nasze Produkty</a></li>
            <li><a href="#">Zasoby</a></li>
            <li><a href="#">Dowiedz się więcej</a></li>
            <li><a href="#">Obserwuj</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <ul>
            <li><a href="tel:+48123123123">+48 123 123 123</a></li>
            <li><a href="mailto:kontakt@koda.com">kontakt@koda.com</a></li>
            <li>Targ Drzewny 9/11, 80-894 Gdańsk</li>
            <li>Copyright 2025 ・ Koda, All Rights Reserved</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
