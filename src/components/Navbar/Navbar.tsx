import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/koda_logo.svg';
import './navbar.scss';
import { useAuth } from '../../context/AuthContext.tsx';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/user/login');
    } catch (error) {
      console.error('Błąd podczas wylogowywania:', error);
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
          <Link to="/offers">Kup</Link>
          <Link to="/offer/create">Sprzedaj</Link>
          <Link to="/comparison">Porównaj</Link>
          <Link to="/whyus">Edukacja</Link>
          <Link to="/liked">Ulubione</Link>
        </div>

        <div className="navbar-buttons">
          {isAuthenticated ? (
            <>
              <Link to="/chat" className="chat-link">
                <i className="fas fa-comments"></i>
                <span>Wiadomości</span>
              </Link>
              <Link to="/user/panel" className="profile">
                <i className="fas fa-user"></i>
                <span>Mój profil</span>
              </Link>
              <button onClick={handleLogout} className="logout">
                <i className="fas fa-sign-out-alt"></i>
                <span>Wyloguj się</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/user/register" className="signup">
                Zarejestruj się
              </Link>
              <Link to="/user/login" className="login">
                Zaloguj się
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
