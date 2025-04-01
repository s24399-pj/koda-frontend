import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import useTitle from "../../hooks/useTitle";
import { register } from "../../api/authApi";
import "./RegisterPage.scss";

interface RegisterFormValues {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    terms: boolean;
}

const RegisterSchema = Yup.object().shape({
    firstName: Yup.string()
        .required("Imię jest wymagane"),
    lastName: Yup.string()
        .required("Nazwisko jest wymagane"),
    email: Yup.string()
        .email("Niepoprawny format adresu email")
        .required("Email jest wymagany"),
    phoneNumber: Yup.string()
        .required("Numer telefonu jest wymagany"),
    password: Yup.string()
        .min(8, "Hasło musi zawierać co najmniej 8 znaków")
        .required("Hasło jest wymagane"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], "Hasła nie są identyczne")
        .required("Potwierdzenie hasła jest wymagane"),
    terms: Yup.boolean()
        .oneOf([true], "Musisz zaakceptować regulamin i politykę prywatności")
});

const RegisterPage: React.FC = () => {
    useTitle("Rejestracja");

    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const initialValues: RegisterFormValues = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        terms: false
    };

    const handleSubmit = async (
        values: RegisterFormValues,
        { setSubmitting }: FormikHelpers<RegisterFormValues>
    ) => {
        setError(null);

        try {
            await register({
                email: values.email,
                password: values.password,
                firstName: values.firstName,
                lastName: values.lastName,
            });

            navigate("/user/login", {
                state: {
                    successMessage: "Konto zostało utworzone pomyślnie. Możesz się teraz zalogować."
                }
            });
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Wystąpił błąd podczas rejestracji. Spróbuj ponownie."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="register-container">
            <div className="register-form-wrapper">
                <div className="register-header">
                    <h1>Zarejestruj się</h1>
                    <p>Utwórz konto aby korzystać ze wszystkich funkcji serwisu</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <Formik
                    initialValues={initialValues}
                    validationSchema={RegisterSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, touched, errors }) => (
                        <Form className="register-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">Imię</label>
                                    <Field
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        placeholder="Twoje imię"
                                        className={touched.firstName && errors.firstName ? "error" : ""}
                                    />
                                    <ErrorMessage name="firstName" component="div" className="form-error" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="lastName">Nazwisko</label>
                                    <Field
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        placeholder="Twoje nazwisko"
                                        className={touched.lastName && errors.lastName ? "error" : ""}
                                    />
                                    <ErrorMessage name="lastName" component="div" className="form-error" />
                                </div>
                            </div>

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
                                <label htmlFor="phoneNumber">Numer telefonu</label>
                                <Field
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    placeholder="Twój numer telefonu"
                                    className={touched.phoneNumber && errors.phoneNumber ? "error" : ""}
                                />
                                <ErrorMessage name="phoneNumber" component="div" className="form-error" />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="password">Hasło</label>
                                    <div className="input-icon-wrapper">
                                        <Field
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            placeholder="Minimum 8 znaków"
                                            className={touched.password && errors.password ? "error" : ""}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={togglePasswordVisibility}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? "Ukryj" : "Pokaż"}
                                        </button>
                                    </div>
                                    <ErrorMessage name="password" component="div" className="form-error" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Powtórz hasło</label>
                                    <div className="input-icon-wrapper">
                                        <Field
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            placeholder="Powtórz hasło"
                                            className={touched.confirmPassword && errors.confirmPassword ? "error" : ""}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={toggleConfirmPasswordVisibility}
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? "Ukryj" : "Pokaż"}
                                        </button>
                                    </div>
                                    <ErrorMessage name="confirmPassword" component="div" className="form-error" />
                                </div>
                            </div>

                            <div className="form-terms">
                                <Field type="checkbox" id="terms" name="terms" />
                                <label htmlFor="terms">
                                    Akceptuję <a href="#">regulamin</a> oraz{" "}
                                    <a href="#">politykę prywatności</a>
                                </label>
                            </div>
                            <ErrorMessage name="terms" component="div" className="form-error" />

                            <button type="submit" className="register-button" disabled={isSubmitting}>
                                {isSubmitting ? "Rejestracja..." : "Zarejestruj się"}
                            </button>
                        </Form>
                    )}
                </Formik>

                <div className="login-link">
                    Masz już konto? <Link to="/user/login">Zaloguj się</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;