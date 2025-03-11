import React from 'react';
import './navbar.scss';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Logo and name */}
        <div className="navbar-logo">
          <span>KODA</span>
        </div>
        
        {/* Main navigation */}
        <div className="navbar-links">
          <a href="#">Sprzedaj</a>
          <a href="#">Kup</a>
          <a href="#">O nas</a>
          <a href="#">Dlaczego warto wybrać nas</a>
        </div>
        
        {/* Account buttons */}
        <div className="navbar-buttons">
          <a href="#" className="signup">Zarejestruj się</a>
          <a href="#" className="login">Zaloguj się</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
