import React from 'react';
import { FormikProps, Field, ErrorMessage, FieldInputProps } from 'formik';
import { CreateOfferCommand } from '../../types/offer/OfferTypes';

interface ContactAndSummaryStepProps {
    formik: FormikProps<CreateOfferCommand & { termsAccepted: boolean }>;
    onPrevious: () => void;
    isSubmitting: boolean;
}

// Definicja typu dla render prop pola Formik
interface TermsFieldProps {
    field: FieldInputProps<boolean>;
    form: FormikProps<CreateOfferCommand & { termsAccepted: boolean }>;
}

const ContactAndSummaryStep: React.FC<ContactAndSummaryStepProps> = ({
                                                                         formik,
                                                                         onPrevious,
                                                                         isSubmitting
                                                                     }) => {
    return (
        <div className="form-step">
            <h2>Kontakt i finalizacja</h2>

            <div className="form-group">
                <label htmlFor="location">Lokalizacja</label>
                <Field
                    type="text"
                    id="location"
                    name="location"
                    placeholder="Np. Warszawa, Mazowieckie"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="contactPhone">Telefon kontaktowy</label>
                    <Field
                        type="tel"
                        id="contactPhone"
                        name="contactPhone"
                        placeholder="Np. +48 123 456 789"
                        className={formik.touched.contactPhone && formik.errors.contactPhone ? 'error' : ''}
                    />
                    <ErrorMessage name="contactPhone" component="div" className="error-text" />
                </div>

                <div className="form-group">
                    <label htmlFor="contactEmail">Email kontaktowy</label>
                    <Field
                        type="email"
                        id="contactEmail"
                        name="contactEmail"
                        placeholder="Np. jan.kowalski@example.com"
                        className={formik.touched.contactEmail && formik.errors.contactEmail ? 'error' : ''}
                    />
                    <ErrorMessage name="contactEmail" component="div" className="error-text" />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="expirationDate">Data wygaśnięcia ogłoszenia</label>
                <Field
                    type="datetime-local"
                    id="expirationDate"
                    name="expirationDate"
                    min={new Date().toISOString().slice(0, 16)}
                    className={formik.touched.expirationDate && formik.errors.expirationDate ? 'error' : ''}
                />
                <ErrorMessage name="expirationDate" component="div" className="error-text" />
                <small>Jeśli nie wybierzesz daty, ogłoszenie wygaśnie po 30 dniach.</small>
            </div>

            <div className="form-summary">
                <h3>Podsumowanie ogłoszenia</h3>
                <div className="summary-details">
                    <div className="summary-row">
                        <span className="summary-label">Tytuł:</span>
                        <span className="summary-value">{formik.values.title}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Cena:</span>
                        <span className="summary-value">
                            {formik.values.price} {formik.values.currency}
                            {formik.values.negotiable !== false ? ' (do negocjacji)' : ''}
                        </span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Marka i model:</span>
                        <span className="summary-value">{formik.values.brand} {formik.values.model}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Rok produkcji:</span>
                        <span className="summary-value">{formik.values.year}</span>
                    </div>
                    {formik.values.mileage && (
                        <div className="summary-row">
                            <span className="summary-label">Przebieg:</span>
                            <span className="summary-value">{formik.values.mileage} km</span>
                        </div>
                    )}
                    {formik.values.fuelType && (
                        <div className="summary-row">
                            <span className="summary-label">Rodzaj paliwa:</span>
                            <span className="summary-value">{formik.values.fuelType}</span>
                        </div>
                    )}
                    {formik.values.bodyType && (
                        <div className="summary-row">
                            <span className="summary-label">Typ nadwozia:</span>
                            <span className="summary-value">{formik.values.bodyType}</span>
                        </div>
                    )}
                    {formik.values.transmission && (
                        <div className="summary-row">
                            <span className="summary-label">Skrzynia biegów:</span>
                            <span className="summary-value">{formik.values.transmission}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="offer-terms">
                <div className="checkbox-group">
                    <Field name="termsAccepted">
                        {({ field, form }: TermsFieldProps) => (
                            <input
                                type="checkbox"
                                id="termsAccepted"
                                checked={Boolean(field.value)}
                                onChange={() => {
                                    form.setFieldValue('termsAccepted', !field.value);
                                }}
                            />
                        )}
                    </Field>
                    <label htmlFor="termsAccepted" className={formik.touched.termsAccepted && formik.errors.termsAccepted ? 'error' : ''}>
                        Akceptuję regulamin serwisu i potwierdzam, że podane informacje są zgodne z prawdą.
                    </label>
                    <ErrorMessage name="termsAccepted" component="div" className="error-text" />
                </div>
            </div>

            <div className="form-navigation">
                <button type="button" className="previous-step-btn" onClick={onPrevious}>
                    Wstecz
                </button>
                <button
                    type="submit"
                    className="submit-offer-btn"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Wysyłanie...' : 'Opublikuj ogłoszenie'}
                </button>
            </div>
        </div>
    );
};

export default ContactAndSummaryStep;