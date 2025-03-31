import React from 'react';
import { Link } from "react-router-dom";
import logo from "../../assets/images/koda_logo.svg";
import './navbar.scss';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="Koda Logo" className="logo-img" />
            <span className="logo-text">KODA</span>
          </Link>
        </div>

        <div className="navbar-links">
          <a href="#">Sprzedaj</a>
          <a href="#">Kup</a>
          <a href="#">O nas</a>
          <a href="#">Dlaczego warto wybrać nas</a>
        </div>
        
        <div className="navbar-buttons">
          <a href="#" className="signup">Zarejestruj się</a>
          <a href="#" className="login">Zaloguj się</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;