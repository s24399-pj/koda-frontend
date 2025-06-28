import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AuthRequired.scss';

/**
 * Props for the AuthRequired component.
 *
 * @property {string} [pageTitle] - Optional title displayed at the top of the page.
 * @property {string} [message] - Optional custom message explaining the login requirement.
 */
interface AuthRequiredPageProps {
  pageTitle?: string;
  message?: string;
}

/**
 * Renders a login-required notice page. This component is typically displayed when
 * a user attempts to access a protected route without authentication.
 *
 * @component
 * @param {AuthRequiredPageProps} props - The component props.
 * @returns {JSX.Element} The rendered login-required page.
 */
const AuthRequired: React.FC<AuthRequiredPageProps> = ({
  pageTitle = 'Wymagane logowanie',
  message = 'Zaloguj się, aby skorzystać z tej funkcji.',
}) => {
  const location = useLocation();

  /**
   * The current route path, used for redirecting the user back after login.
   */
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
          {/* Redirects to login with return path */}
          <Link
            to={`/user/login?redirect=${encodeURIComponent(currentPath)}`}
            className="login-btn"
          >
            Zaloguj się
          </Link>

          {/* Links to registration page */}
          <Link to="/user/register" className="register-btn">
            Zarejestruj się
          </Link>
        </div>

        <div className="back-link">
          {/* Returns to home page */}
          <Link to="/">Wróć na stronę główną</Link>
        </div>
      </div>
    </div>
  );
};

export default AuthRequired;
