import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Form, Formik, FormikProps} from 'formik';
import * as Yup from 'yup';
import {
    CarEquipment,
    CreateOfferCommand,
    OfferFormValues
} from '../../types/offer/OfferTypes';
import {createOffer} from '../../api/offerApi';
import { uploadMultipleImages } from '../../api/imageApi';
import StepsIndicator from '../../components/OfferCreation/StepsIndicator';
import BasicInfoStep from '../../components/OfferCreation/BasicInfoStep';
import VehicleDetailsStep from '../../components/OfferCreation/VehicleDetailsStep';
import EquipmentStep from '../../components/OfferCreation/EquipmentStep';
import ContactAndSummaryStep from '../../components/OfferCreation/ContactAndSummaryStep';
import './OfferCreation.scss';

const validationSchemas = [
    Yup.object({
        title: Yup.string()
            .required('Tytuł jest wymagany')
            .min(3, 'Tytuł musi mieć co najmniej 3 znaki')
            .max(100, 'Tytuł nie może przekraczać 100 znaków'),
        description: Yup.string()
            .required('Opis jest wymagany')
            .min(10, 'Opis musi mieć co najmniej 10 znaków')
            .max(2000, 'Opis nie może przekraczać 2000 znaków'),
        price: Yup.number()
            .required('Cena jest wymagana')
            .positive('Cena musi być większa od 0')
            .typeError('Cena musi być liczbą'),
        currency: Yup.string().required('Waluta jest wymagana'),
        imageFiles: Yup.array()
            .min(1, 'Dodaj co najmniej jedno zdjęcie')
            .max(10, 'Możesz dodać maksymalnie 10 zdjęć')
    }),

    Yup.object({
        brand: Yup.string()
            .required('Marka jest wymagana')
            .min(2, 'Marka musi mieć co najmniej 2 znaki')
            .max(50, 'Marka nie może przekraczać 50 znaków'),
        model: Yup.string()
            .required('Model jest wymagany')
            .min(1, 'Model musi mieć co najmniej 1 znak')
            .max(50, 'Model nie może przekraczać 50 znaków'),
        year: Yup.number()
            .required('Rok produkcji jest wymagany')
            .min(1900, 'Rok produkcji musi być większy niż 1900')
            .max(new Date().getFullYear(), `Rok produkcji nie może być większy niż ${new Date().getFullYear()}`)
            .typeError('Rok produkcji musi być liczbą'),
        mileage: Yup.number()
            .required('Przebieg jest wymagany')
            .min(0, 'Przebieg nie może być ujemny')
            .typeError('Przebieg musi być liczbą'),
        condition: Yup.string()
            .required('Stan pojazdu jest wymagany'),
        color: Yup.string()
            .required('Kolor jest wymagany')
            .max(30, 'Kolor nie może przekraczać 30 znaków'),
        fuelType: Yup.string()
            .required('Rodzaj paliwa jest wymagany'),
        transmission: Yup.string()
            .required('Skrzynia biegów jest wymagana'),
        bodyType: Yup.string()
            .required('Typ nadwozia jest wymagany'),
        driveType: Yup.string()
            .required('Napęd jest wymagany'),
        displacement: Yup.string()
            .required('Pojemność silnika jest wymagana'),
        enginePower: Yup.number()
            .required('Moc silnika jest wymagana')
            .min(1, 'Moc silnika musi być większa od 0')
            .typeError('Moc silnika musi być liczbą'),
        doors: Yup.number()
            .required('Liczba drzwi jest wymagana')
            .min(1, 'Liczba drzwi musi być większa od 0')
            .max(10, 'Liczba drzwi nie może być większa niż 10')
            .typeError('Liczba drzwi musi być liczbą'),
        seats: Yup.number()
            .required('Liczba miejsc jest wymagana')
            .min(1, 'Liczba miejsc musi być większa od 0')
            .max(50, 'Liczba miejsc nie może być większa niż 50')
            .typeError('Liczba miejsc musi być liczbą'),
        registrationNumber: Yup.string()
            .required('Numer rejestracyjny jest wymagany')
            .max(15, 'Numer rejestracyjny nie może przekraczać 15 znaków'),
        registrationCountry: Yup.string()
            .required('Kraj rejestracji jest wymagany')
            .max(30, 'Kraj rejestracji nie może przekraczać 30 znaków'),
        vin: Yup.string()
            .required('Numer VIN jest wymagany')
            .matches(/^[A-HJ-NPR-Z0-9]{17}$/, 'Niepoprawny format numeru VIN - musi składać się z 17 znaków')
    }),

    Yup.object({}),

    Yup.object({
        location: Yup.string()
            .nullable()
            .max(100, 'Lokalizacja nie może przekraczać 100 znaków'),
        expirationDate: Yup.date()
            .nullable()
            .min(new Date(new Date().setDate(new Date().getDate() + 1)), 'Data wygaśnięcia musi być w przyszłości (minimum dzień później)')
            .typeError('Podaj prawidłową datę')
            .notRequired(),
        termsAccepted: Yup.boolean()
            .isTrue('Musisz zaakceptować regulamin')
    })
];

const OfferCreation: React.FC = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const initialValues: OfferFormValues = {
        title: '',
        description: '',
        price: 0,
        currency: 'PLN',
        negotiable: true,
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        mileage: 0,
        color: '',
        enginePower: 1,
        doors: 1,
        seats: 1,
        vin: '',
        registrationNumber: '',
        registrationCountry: 'Polska',
        firstOwner: false,
        accidentFree: false,
        serviceHistory: false,
        additionalFeatures: '',
        equipment: undefined, // Zmienione z {} na undefined
        termsAccepted: false,
        imageFiles: [],
        fuelType: undefined,
        transmission: undefined,
        bodyType: undefined,
        driveType: undefined,
        condition: undefined,
        displacement: undefined,
        contactPhone: undefined,
        contactEmail: undefined,
        location: undefined,
        expirationDate: undefined
    };

    const handleNextStep = () => {
        setActiveStep(activeStep + 1);
        window.scrollTo(0, 0);
    };

    const handlePreviousStep = () => {
        setActiveStep(activeStep - 1);
        window.scrollTo(0, 0);
    };

    const normalizeFormValues = async (values: OfferFormValues): Promise<CreateOfferCommand> => {
        const {termsAccepted, imageFiles, ...offerData} = values;

        if (offerData.expirationDate) {
            if (typeof offerData.expirationDate === 'string' && !offerData.expirationDate.includes('T')) {
                const date = new Date(offerData.expirationDate);
                date.setHours(23, 59, 59, 999);
                offerData.expirationDate = date.toISOString();
            }
        }

        // Poprawiona obsługa equipment
        if (offerData.equipment && Object.keys(offerData.equipment).length > 0) {
            const normalizedEquipment: CarEquipment = {};
            Object.entries(offerData.equipment).forEach(([key, value]) => {
                (normalizedEquipment as any)[key] = Boolean(value);
            });

            // Sprawdź czy wszystkie wartości są false
            if (Object.values(normalizedEquipment).every(v => !v)) {
                offerData.equipment = undefined;
            } else {
                offerData.equipment = normalizedEquipment;
            }
        } else {
            offerData.equipment = undefined;
        }

        return offerData;
    };

    const handleSubmit = async (values: OfferFormValues) => {
        try {
            if (!values.termsAccepted) {
                setServerError('Musisz zaakceptować regulamin serwisu.');
                return;
            }

            setIsSubmitting(true);
            setServerError(null);
            setUploadProgress(0);

            const offerData = await normalizeFormValues(values);
            setUploadProgress(25);

            console.log('Wysyłanie danych:', offerData);

            const response = await createOffer(offerData);
            const createdOfferId = response.id;
            setUploadProgress(50);

            if (values.imageFiles && values.imageFiles.length > 0) {
                try {
                    setUploadProgress(60);
                    await uploadMultipleImages(createdOfferId, values.imageFiles);
                    setUploadProgress(90);
                } catch (error) {
                    console.error('Błąd podczas przesyłania zdjęć:', error);
                    throw new Error('Błąd podczas przesyłania zdjęć. Spróbuj ponownie.');
                }
            }

            setUploadProgress(100);

            console.log('Oferta utworzona pomyślnie:', response);

            navigate(`/offer/${response.id}`);
        } catch (err) {
            console.error('Błąd podczas tworzenia oferty:', err);
            if (err instanceof Error) {
                setServerError(err.message);
            } else {
                setServerError('Wystąpił błąd podczas tworzenia oferty. Spróbuj ponownie później.');
            }
        } finally {
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="offer-creation-container">
            <div className="offer-creation-header">
                <h1>Dodaj nowe ogłoszenie</h1>
                <StepsIndicator
                    steps={['Podstawowe informacje', 'Szczegóły pojazdu', 'Wyposażenie', 'Lokalizacja i finalizacja']}
                    activeStep={activeStep}
                />
            </div>

            {serverError && (
                <div className="error-message">
                    {serverError}
                </div>
            )}

            {isSubmitting && uploadProgress > 0 && (
                <div className="upload-progress">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    <span className="progress-text">
                        {uploadProgress < 50 ? 'Tworzenie oferty...' :
                            uploadProgress < 90 ? 'Przesyłanie zdjęć...' :
                                uploadProgress < 100 ? 'Finalizowanie...' : 'Gotowe!'}
                    </span>
                </div>
            )}

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchemas[activeStep]}
                onSubmit={handleSubmit}
                validateOnChange={false}
                validateOnBlur={true}
            >
                {(formik: FormikProps<OfferFormValues>) => (
                    <Form className="offer-creation-form">
                        {activeStep === 0 && (
                            <BasicInfoStep formik={formik} onNext={handleNextStep}/>
                        )}

                        {activeStep === 1 && (
                            <VehicleDetailsStep
                                formik={formik}
                                onNext={handleNextStep}
                                onPrevious={handlePreviousStep}
                            />
                        )}

                        {activeStep === 2 && (
                            <EquipmentStep
                                formik={formik}
                                onNext={handleNextStep}
                                onPrevious={handlePreviousStep}
                            />
                        )}

                        {activeStep === 3 && (
                            <ContactAndSummaryStep
                                formik={formik}
                                onPrevious={handlePreviousStep}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default OfferCreation;