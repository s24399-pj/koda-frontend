import React from 'react';
import { FormikProps, Field, ErrorMessage, FieldInputProps } from 'formik';
import {
    CreateOfferCommand,
    FuelType,
    TransmissionType,
    BodyType,
    DriveType,
    VehicleCondition
} from '../../types/offer/OfferTypes';

// Definiujemy typ dla wartości formularza
type OfferFormValues = CreateOfferCommand & { termsAccepted: boolean };

// Interfejs dla props komponentu
interface VehicleDetailsStepProps {
    formik: FormikProps<OfferFormValues>;
    onNext: () => void;
    onPrevious: () => void;
}

// Interfejs dla render props pola Field
interface FieldRenderProps {
    field: FieldInputProps<any>;
    form: FormikProps<OfferFormValues>;
}

const VehicleDetailsStep: React.FC<VehicleDetailsStepProps> = ({ formik, onNext, onPrevious }) => {
    const currentYear = new Date().getFullYear();

    const handleNext = () => {
        formik.validateForm().then(errors => {
            // Dotknij wszystkie pola, aby pokazać błędy walidacji
            formik.setTouched({
                brand: true,
                model: true,
                year: true,
                vin: formik.values.vin ? true : false
            });

            // Sprawdź czy są błędy w polach tego kroku
            const stepErrors = Object.keys(errors).filter(key =>
                ['brand', 'model', 'year', 'vin'].includes(key)
            );

            if (stepErrors.length === 0) {
                onNext();
            }
        });
    };

    return (
        <div className="form-step">
            <h2>Szczegóły pojazdu</h2>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="brand">Marka *</label>
                    <Field
                        type="text"
                        id="brand"
                        name="brand"
                        placeholder="Np. BMW, Audi, Toyota"
                        className={formik.touched.brand && formik.errors.brand ? 'error' : ''}
                    />
                    <ErrorMessage name="brand" component="div" className="error-text" />
                </div>

                <div className="form-group">
                    <label htmlFor="model">Model *</label>
                    <Field
                        type="text"
                        id="model"
                        name="model"
                        placeholder="Np. Seria 3, A4, Corolla"
                        className={formik.touched.model && formik.errors.model ? 'error' : ''}
                    />
                    <ErrorMessage name="model" component="div" className="error-text" />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="year">Rok produkcji *</label>
                    <Field
                        type="number"
                        id="year"
                        name="year"
                        placeholder="Np. 2020"
                        min="1900"
                        max={currentYear}
                        className={formik.touched.year && formik.errors.year ? 'error' : ''}
                    />
                    <ErrorMessage name="year" component="div" className="error-text" />
                </div>

                <div className="form-group">
                    <label htmlFor="mileage">Przebieg (km)</label>
                    <Field
                        type="number"
                        id="mileage"
                        name="mileage"
                        placeholder="Np. 75000"
                        min="0"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="condition">Stan pojazdu</label>
                    <Field
                        as="select"
                        id="condition"
                        name="condition"
                    >
                        <option value="">Wybierz stan pojazdu</option>
                        <option value={VehicleCondition.NEW}>Nowy</option>
                        <option value={VehicleCondition.USED}>Używany</option>
                        <option value={VehicleCondition.DAMAGED}>Uszkodzony</option>
                        <option value={VehicleCondition.FOR_PARTS}>Na części</option>
                        <option value={VehicleCondition.RESTORED}>Odrestaurowany</option>
                        <option value={VehicleCondition.CLASSIC}>Klasyczny</option>
                    </Field>
                </div>

                <div className="form-group">
                    <label htmlFor="color">Kolor</label>
                    <Field
                        type="text"
                        id="color"
                        name="color"
                        placeholder="Np. Czarny, Srebrny, Biały"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="fuelType">Rodzaj paliwa</label>
                    <Field
                        as="select"
                        id="fuelType"
                        name="fuelType"
                    >
                        <option value="">Wybierz rodzaj paliwa</option>
                        <option value={FuelType.PETROL}>Benzyna</option>
                        <option value={FuelType.DIESEL}>Diesel</option>
                        <option value={FuelType.LPG}>LPG</option>
                        <option value={FuelType.HYBRID}>Hybryda</option>
                        <option value={FuelType.ELECTRIC}>Elektryczny</option>
                        <option value={FuelType.HYDROGEN}>Wodór</option>
                        <option value={FuelType.OTHER}>Inny</option>
                    </Field>
                </div>

                <div className="form-group">
                    <label htmlFor="transmission">Skrzynia biegów</label>
                    <Field
                        as="select"
                        id="transmission"
                        name="transmission"
                    >
                        <option value="">Wybierz skrzynię biegów</option>
                        <option value={TransmissionType.MANUAL}>Manualna</option>
                        <option value={TransmissionType.AUTOMATIC}>Automatyczna</option>
                        <option value={TransmissionType.SEMI_AUTOMATIC}>Półautomatyczna</option>
                    </Field>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="bodyType">Typ nadwozia</label>
                    <Field
                        as="select"
                        id="bodyType"
                        name="bodyType"
                    >
                        <option value="">Wybierz typ nadwozia</option>
                        <option value={BodyType.SEDAN}>Sedan</option>
                        <option value={BodyType.HATCHBACK}>Hatchback</option>
                        <option value={BodyType.ESTATE}>Kombi</option>
                        <option value={BodyType.SUV}>SUV</option>
                        <option value={BodyType.COUPE}>Coupe</option>
                        <option value={BodyType.CONVERTIBLE}>Kabriolet</option>
                        <option value={BodyType.PICKUP}>Pickup</option>
                        <option value={BodyType.VAN}>Van</option>
                        <option value={BodyType.MINIBUS}>Minibus</option>
                        <option value={BodyType.OTHER}>Inny</option>
                    </Field>
                </div>

                <div className="form-group">
                    <label htmlFor="driveType">Napęd</label>
                    <Field
                        as="select"
                        id="driveType"
                        name="driveType"
                    >
                        <option value="">Wybierz rodzaj napędu</option>
                        <option value={DriveType.FRONT_WHEEL_DRIVE}>Przedni (FWD)</option>
                        <option value={DriveType.REAR_WHEEL_DRIVE}>Tylny (RWD)</option>
                        <option value={DriveType.ALL_WHEEL_DRIVE}>Na wszystkie koła (AWD)</option>
                        <option value={DriveType.FOUR_WHEEL_DRIVE}>4x4</option>
                        <option value={DriveType.OTHER}>Inny</option>
                    </Field>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="displacement">Pojemność silnika (cm³)</label>
                    <Field
                        type="text"
                        id="displacement"
                        name="displacement"
                        placeholder="Np. 1998"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="enginePower">Moc silnika (KM)</label>
                    <Field
                        type="number"
                        id="enginePower"
                        name="enginePower"
                        placeholder="Np. 150"
                        min="0"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="doors">Liczba drzwi</label>
                    <Field
                        type="number"
                        id="doors"
                        name="doors"
                        placeholder="Np. 5"
                        min="0"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="seats">Liczba miejsc</label>
                    <Field
                        type="number"
                        id="seats"
                        name="seats"
                        placeholder="Np. 5"
                        min="0"
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="vin">Numer VIN</label>
                <Field
                    type="text"
                    id="vin"
                    name="vin"
                    placeholder="Np. WBA7J2C50KG356939"
                    maxLength={17}
                    className={formik.touched.vin && formik.errors.vin ? 'error' : ''}
                />
                <ErrorMessage name="vin" component="div" className="error-text" />
                <small>Numer VIN składa się z 17 znaków</small>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="registrationNumber">Numer rejestracyjny</label>
                    <Field
                        type="text"
                        id="registrationNumber"
                        name="registrationNumber"
                        placeholder="Np. WA12345"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="registrationCountry">Kraj rejestracji</label>
                    <Field
                        type="text"
                        id="registrationCountry"
                        name="registrationCountry"
                        placeholder="Np. Polska"
                    />
                </div>
            </div>

            <div className="form-group checkboxes-container">
                <div className="checkbox-group">
                    <Field
                        name="firstOwner"
                        render={({ field, form }: FieldRenderProps) => (
                            <input
                                type="checkbox"
                                id="firstOwner"
                                checked={Boolean(field.value)}
                                onChange={() => form.setFieldValue('firstOwner', !field.value)}
                            />
                        )}
                    />
                    <label htmlFor="firstOwner">Pierwszy właściciel</label>
                </div>

                <div className="checkbox-group">
                    <Field
                        name="accidentFree"
                        render={({ field, form }: FieldRenderProps) => (
                            <input
                                type="checkbox"
                                id="accidentFree"
                                checked={Boolean(field.value)}
                                onChange={() => form.setFieldValue('accidentFree', !field.value)}
                            />
                        )}
                    />
                    <label htmlFor="accidentFree">Bezwypadkowy</label>
                </div>

                <div className="checkbox-group">
                    <Field
                        name="serviceHistory"
                        render={({ field, form }: FieldRenderProps) => (
                            <input
                                type="checkbox"
                                id="serviceHistory"
                                checked={Boolean(field.value)}
                                onChange={() => form.setFieldValue('serviceHistory', !field.value)}
                            />
                        )}
                    />
                    <label htmlFor="serviceHistory">Pełna historia serwisowa</label>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="additionalFeatures">Dodatkowe informacje</label>
                <Field
                    as="textarea"
                    id="additionalFeatures"
                    name="additionalFeatures"
                    placeholder="Wpisz dodatkowe informacje o pojeździe, które nie zostały uwzględnione w formularzu"
                    rows={4}
                    maxLength={1000}
                />
                <small>Maksymalnie 1000 znaków</small>
            </div>

            <div className="form-navigation">
                <button type="button" className="previous-step-btn" onClick={onPrevious}>
                    Wstecz
                </button>
                <button type="button" className="next-step-btn" onClick={handleNext}>
                    Dalej
                </button>
            </div>
        </div>
    );
};

export default VehicleDetailsStep;