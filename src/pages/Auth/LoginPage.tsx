import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import useTitle from '../../hooks/useTitle';
import { login } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext.tsx';
import './LoginPage.scss';

/**
 * Interface defining the structure of login form values.
 */
interface LoginFormValues {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** Whether to remember the user's login session */
  rememberMe: boolean;
}

/**
 * Yup validation schema for the login form.
 * Defines validation rules for login fields including:
 * - Email format validation
 * - Required field validation for email and password
 */
const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Niepoprawny format adresu email').required('Email jest wymagany'),
  password: Yup.string().required('Hasło jest wymagane'),
});

/**
 * Interface for navigation state passed from other pages.
 * Used to display success messages after operations like registration.
 */
interface LocationState {
  /** Optional success message to display */
  successMessage?: string;
}

/**
 * Login page component that provides user authentication functionality.
 * Features a simple login form with email/password validation and success message handling.
 *
 * Key features:
 * - Form validation using Yup schema
 * - Password visibility toggle
 * - Success message display from navigation state
 * - Error handling and display
 * - Remember me checkbox
 * - Links to registration and password reset
 * - Automatic navigation to home page on successful login
 *
 * @returns {JSX.Element} The rendered LoginPage component
 */
const LoginPage: React.FC = () => {
  useTitle('Logowanie');

  const navigate = useNavigate();
  const location = useLocation();
  const { setIsAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const state = location.state as LocationState;

  /**
   * Effect hook to handle success messages passed via navigation state.
   * Typically used to show registration success messages.
   */
  useEffect(() => {
    if (state && state.successMessage) {
      setSuccessMessage(state.successMessage);
    }
  }, [state]);

  /**
   * Initial values for the login form.
   * All fields start as empty strings or false for the remember me checkbox.
   */
  const initialValues: LoginFormValues = {
    email: '',
    password: '',
    rememberMe: false,
  };

  /**
   * Handles form submission for user authentication.
   * Sends login credentials to the API and handles success/error responses.
   * On success, updates authentication state and navigates to home page.
   * On error, displays appropriate error message to the user.
   *
   * @param {LoginFormValues} values - The form values from Formik
   * @param {FormikHelpers<LoginFormValues>} helpers - Formik helper methods including setSubmitting
   */
  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting }: FormikHelpers<LoginFormValues>
  ) => {
    setError(null);
    setSuccessMessage(null);

    try {
      await login({ email: values.email, password: values.password });
      setIsAuthenticated(true);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Wystąpił błąd podczas logowania. Spróbuj ponownie.');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Toggles the visibility of the password field.
   * Switches between password and text input types for better user experience.
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="login-header">
          <h1>Zaloguj się</h1>
          <p>Witamy z powrotem! Zaloguj się, aby kontynuować.</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <Formik
          initialValues={initialValues}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-icon-wrapper">
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Twój adres email"
                    className={touched.email && errors.email ? 'error' : ''}
                    autoComplete="email"
                  />
                </div>
                <ErrorMessage name="email" component="div" className="form-error" />
              </div>

              <div className="form-group">
                <label htmlFor="password">Hasło</label>
                <div className="input-icon-wrapper">
                  <Field
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Twoje hasło"
                    className={touched.password && errors.password ? 'error' : ''}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                  >
                    {showPassword ? 'Ukryj' : 'Pokaż'}
                  </button>
                </div>
                <ErrorMessage name="password" component="div" className="form-error" />
              </div>

              <div className="form-options">
                <div className="remember-me">
                  <Field
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    aria-label="Zapamiętaj mnie"
                  />
                  <label htmlFor="rememberMe">Zapamiętaj mnie</label>
                </div>
                <Link to="/user/reset-password" className="forgot-password">
                  Zapomniałeś hasła?
                </Link>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={isSubmitting}
                aria-label="Zaloguj się"
              >
                {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
              </button>
            </Form>
          )}
        </Formik>

        <div className="register-link">
          Nie masz jeszcze konta? <Link to="/user/register">Zarejestruj się</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
