import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../api/authApi";
import logo from "../../assets/images/koda_logo.svg";
import './navbar.scss';
import {useAuth} from "../../context/AuthContext.tsx";

const Navbar: React.FC = () => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      navigate("/user/login");
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
    }
  };

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
            {isAuthenticated ? (
                <>
                  <Link to="/user/profile" className="profile">Mój profil</Link>
                  <button onClick={handleLogout} className="logout">Wyloguj się</button>
                </>
            ) : (
                <>
                  <Link to="/user/register" className="signup">Zarejestruj się</Link>
                  <Link to="/user/login" className="login">Zaloguj się</Link>
                </>
            )}
          </div>
        </div>
      </nav>
  );
};

export default Navbar;