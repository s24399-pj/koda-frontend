import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import useTitle from "../../hooks/useTitle";
import { login } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext.tsx";
import "./LoginPage.scss";

interface LoginFormValues {
    email: string;
    password: string;
    rememberMe: boolean;
}

const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .email("Niepoprawny format adresu email")
        .required("Email jest wymagany"),
    password: Yup.string()
        .required("Hasło jest wymagane")
});

interface LocationState {
    successMessage?: string;
}

const LoginPage: React.FC = () => {
    useTitle("Logowanie");

    const navigate = useNavigate();
    const location = useLocation();
    const { setIsAuthenticated } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const state = location.state as LocationState;

    useEffect(() => {
        // Sprawdź, czy istnieje komunikat sukcesu z rejestracji
        if (state && state.successMessage) {
            setSuccessMessage(state.successMessage);
        }
    }, [state]);

    const initialValues: LoginFormValues = {
        email: "",
        password: "",
        rememberMe: false
    };

    const handleSubmit = async (
        values: LoginFormValues,
        { setSubmitting }: FormikHelpers<LoginFormValues>
    ) => {
        setError(null);
        setSuccessMessage(null);

        try {
            await login({ email: values.email, password: values.password });
            setIsAuthenticated(true);
            navigate("/");
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Wystąpił błąd podczas logowania. Spróbuj ponownie."
            );
        } finally {
            setSubmitting(false);
        }
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
                                <Field
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Twój adres email"
                                    className={touched.email && errors.email ? "error" : ""}
                                />
                                <ErrorMessage name="email" component="div" className="form-error" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Hasło</label>
                                <Field
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Twoje hasło"
                                    className={touched.password && errors.password ? "error" : ""}
                                />
                                <ErrorMessage name="password" component="div" className="form-error" />
                            </div>

                            <div className="form-options">
                                <div className="remember-me">
                                    <Field type="checkbox" id="rememberMe" name="rememberMe" />
                                    <label htmlFor="rememberMe">Zapamiętaj mnie</label>
                                </div>
                                <a href="#" className="forgot-password">
                                    Zapomniałeś hasła?
                                </a>
                            </div>

                            <button type="submit" className="login-button" disabled={isSubmitting}>
                                {isSubmitting ? "Logowanie..." : "Zaloguj się"}
                            </button>
                        </Form>
                    )}
                </Formik>

                <div className="register-link">
                    Nie masz jeszcze konta?{" "}
                    <Link to="/user/register">Zarejestruj się</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;