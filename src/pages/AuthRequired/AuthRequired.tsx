import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AuthRequired.scss';

interface AuthRequiredPageProps {
  pageTitle?: string;
  message?: string;
}

const AuthRequired: React.FC<AuthRequiredPageProps> = ({
  pageTitle = 'Wymagane logowanie',
  message = 'Zaloguj się, aby skorzystać z tej funkcji.',
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="auth-required-page">
      <h1>{pageTitle}</h1>

      <div className="auth-required-container">
        <h1>Zaloguj się</h1>

        <div className="auth-message">
          <p>{message}</p>
        </div>

        <div className="auth-buttons">
          <Link
            to={`/user/login?redirect=${encodeURIComponent(currentPath)}`}
            className="login-btn"
          >
            Zaloguj się
          </Link>
          <Link to="/user/register" className="register-btn">
            Zarejestruj się
          </Link>
        </div>

        <div className="back-link">
          <Link to="/">Wróć na stronę główną</Link>
        </div>
      </div>
    </div>
  );
};

export default AuthRequired;
