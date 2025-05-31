import React from 'react';
import { FormikProps, Field, ErrorMessage, FieldInputProps } from 'formik';
import {CreateOfferCommand, OfferFormValues} from '../../types/offer/OfferTypes';

interface ContactAndSummaryStepProps {
    formik: FormikProps<OfferFormValues>;
    onPrevious: () => void;
    isSubmitting: boolean;
}

interface TermsFieldProps {
    field: FieldInputProps<boolean>;
    form: FormikProps<CreateOfferCommand & { termsAccepted: boolean }>;
}

const ContactAndSummaryStep: React.FC<ContactAndSummaryStepProps> = ({
                                                                         formik,
                                                                         onPrevious,
                                                                         isSubmitting
                                                                     }) => {
    const handleSubmit = () => {
        if (formik.values.expirationDate) {
            const expirationDate = new Date(formik.values.expirationDate);

            expirationDate.setHours(23, 59, 59, 999);

            formik.setFieldValue('expirationDate', expirationDate.toISOString());
        }

        formik.handleSubmit();
    };

    return (
        <div className="form-step">
            <h2>Lokalizacja i finalizacja</h2>

            <div className="form-group">
                <label htmlFor="location">Lokalizacja</label>
                <Field
                    type="text"
                    id="location"
                    name="location"
                    placeholder="Np. Warszawa, Mazowieckie"
                    className={formik.touched.location && formik.errors.location ? 'error' : ''}
                />
                <ErrorMessage name="location" component="div" className="error-text" />
                <small>Podaj lokalizację pojazdu</small>
            </div>

            <div className="form-group">
                <label htmlFor="expirationDate">Data wygaśnięcia ogłoszenia</label>
                <Field
                    type="date"
                    id="expirationDate"
                    name="expirationDate"
                    min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                    className={formik.touched.expirationDate && formik.errors.expirationDate ? 'error' : ''}
                />
                <ErrorMessage name="expirationDate" component="div" className="error-text" />
                <small>Jeśli nie wybierzesz daty, ogłoszenie wygaśnie po 30 dniach. Wybrana data określa pełny dzień wygaśnięcia.</small>
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
                    {formik.values.mileage !== undefined && formik.values.mileage !== null && (
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
                    {formik.values.location && (
                        <div className="summary-row">
                            <span className="summary-label">Lokalizacja:</span>
                            <span className="summary-value">{formik.values.location}</span>
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
                    type="button"
                    className="submit-offer-btn"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                >
                    {isSubmitting ? 'Wysyłanie...' : 'Opublikuj ogłoszenie'}
                </button>
            </div>
        </div>
    );
};

export default ContactAndSummaryStep;