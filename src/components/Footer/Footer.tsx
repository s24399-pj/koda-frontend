import React from "react";
import "./Footer.css";  // You can style the footer by creating this CSS file

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
            <li><a href="#">Kariera</a></li>
            <li><a href="#">Download</a></li>
            <li><a href="#">Why choose us</a></li>
            <li><a href="#">Pojazdy</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <ul>
            <li><a href="#">Help Centre</a></li>
            <li><a href="#">Our Story</a></li>
            <li><a href="#">Funkcjonalności</a></li>
            <li><a href="#">Guides</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <ul>
            <li><a href="#">Advertise</a></li>
            <li><a href="#">Cennik</a></li>
            <li><a href="#">Partner Network</a></li>
            <li><a href="#">Developer</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <ul>
            <li><a href="tel:+48123123123">+48 123 123 123</a></li>
            <li><a href="mailto:kontakt@koda.com">kontakt@koda.com</a></li>
            <li>Targ Drzewny 9/11, 80-894 Gdańsk</li>
            <li>Copyright 2024 ・ Koda, All Rights Reserved</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
