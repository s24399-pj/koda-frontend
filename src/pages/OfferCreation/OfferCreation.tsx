import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import {
    CreateOfferCommand,
} from '../../types/offer/OfferTypes';
import { createOffer } from '../../api/offerApi';
import StepsIndicator from '../../components/OfferCreation/StepsIndicator';
import BasicInfoStep from '../../components/OfferCreation/BasicInfoStep';
import VehicleDetailsStep from '../../components/OfferCreation/VehicleDetailsStep';
import EquipmentStep from '../../components/OfferCreation/EquipmentStep';
import ContactAndSummaryStep from '../../components/OfferCreation/ContactAndSummaryStep';
import './OfferCreation.scss';

// Typ dla wartości formularza
type OfferFormValues = CreateOfferCommand & { termsAccepted: boolean };

// Walidacja dla każdego kroku formularza
const validationSchemas = [
    // Krok 1: Podstawowe informacje
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
            .positive('Cena musi być większa od 0'),
        currency: Yup.string().required('Waluta jest wymagana')
    }),

    // Krok 2: Szczegóły pojazdu
    Yup.object({
        brand: Yup.string().required('Marka jest wymagana'),
        model: Yup.string().required('Model jest wymagany'),
        year: Yup.number()
            .required('Rok produkcji jest wymagany')
            .min(1900, 'Rok produkcji musi być większy niż 1900')
            .max(new Date().getFullYear(), `Rok produkcji nie może być większy niż ${new Date().getFullYear()}`),
        vin: Yup.string().nullable().matches(/^[A-HJ-NPR-Z0-9]{17}$/, 'Niepoprawny format numeru VIN').notRequired()
    }),

    // Krok 3: Wyposażenie - brak walidacji, wszystkie pola opcjonalne
    Yup.object({}),

    // Krok 4: Kontakt i finalizacja
    Yup.object({
        contactPhone: Yup.string().nullable()
            // Walidator numeru telefonu, który akceptuje polskie numery (9 cyfr bez spacji lub z separatorami)
            .test('isValidPhone', 'Niepoprawny format numeru telefonu', function(value) {
                if (!value) return true; // Pole nie jest wymagane
                // Usuń wszystkie znaki niebędące cyframi
                const digitsOnly = value.replace(/\D/g, '');
                // Sprawdź czy mamy 9 cyfr (standardowy polski numer bez prefiksu kraju)
                // lub 11 cyfr (z prefiksem +48 lub 48)
                return digitsOnly.length === 9 ||
                    (digitsOnly.length === 11 && digitsOnly.startsWith('48'));
            }),
        contactEmail: Yup.string().nullable().email('Niepoprawny format adresu email').notRequired(),
        expirationDate: Yup.date().nullable().min(new Date(), 'Data wygaśnięcia musi być w przyszłości').notRequired(),
        termsAccepted: Yup.boolean().isTrue('Musisz zaakceptować regulamin')
    })
];

const OfferCreation: React.FC = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [serverError, setServerError] = useState<string | null>(null);

    // Początkowe wartości formularza
    const initialValues: OfferFormValues = {
        title: '',
        description: '',
        price: 0,
        currency: 'PLN',
        negotiable: true,
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        equipment: {},
        termsAccepted: false
    };

    // Przejście do następnego kroku formularza
    const handleNextStep = () => {
        setActiveStep(activeStep + 1);
        window.scrollTo(0, 0);
    };

    // Powrót do poprzedniego kroku formularza
    const handlePreviousStep = () => {
        setActiveStep(activeStep - 1);
        window.scrollTo(0, 0);
    };

    // Funkcja pomocnicza do "spłaszczania" wartości checkboxów
    const normalizeFormValues = (values: OfferFormValues): CreateOfferCommand => {
        const { termsAccepted, ...offerData } = values;

        // Normalizacja wyposażenia - upewniamy się, że wszystkie wartości są booleanami
        if (offerData.equipment) {
            const normalizedEquipment: Record<string, boolean> = {};

            // Przetwarzamy każdą właściwość w obiekcie equipment
            Object.entries(offerData.equipment).forEach(([key, value]) => {
                // Jeśli wartość jest tablicą (np. ["on"]), konwertujemy ją na boolean true
                // W przeciwnym razie zachowujemy oryginalną wartość (już boolean)
                normalizedEquipment[key] = Array.isArray(value) ? true : Boolean(value);
            });

            offerData.equipment = normalizedEquipment;
        }

        // Normalizacja innych pól boolean (firstOwner, accidentFree, serviceHistory)
        if (Array.isArray(offerData.firstOwner)) {
            offerData.firstOwner = true;
        }

        if (Array.isArray(offerData.accidentFree)) {
            offerData.accidentFree = true;
        }

        if (Array.isArray(offerData.serviceHistory)) {
            offerData.serviceHistory = true;
        }

        // Sprawdzenie czy equipment ma jakiekolwiek wartości
        if (Object.values(offerData.equipment || {}).every(v => v === false || v === undefined)) {
            offerData.equipment = undefined;
        }

        return offerData;
    };

    // Obsługa wysłania formularza
    const handleSubmit = async (values: OfferFormValues) => {
        try {
            // Sprawdź czy warunki są zaakceptowane
            if (!values.termsAccepted) {
                setServerError('Musisz zaakceptować regulamin serwisu.');
                return;
            }

            setIsSubmitting(true);
            setServerError(null);

            // Formatowanie numeru telefonu - usunięcie zbędnych znaków
            if (values.contactPhone) {
                values.contactPhone = values.contactPhone.replace(/\s+/g, '').replace(/[()-]/g, '');
            }

            // Normalizacja wartości formularza
            const offerData = normalizeFormValues(values);

            console.log('Wysyłanie danych:', offerData);

            const response = await createOffer(offerData);
            console.log('Oferta utworzona pomyślnie:', response);

            // Przekierowanie do szczegółów utworzonej oferty
            navigate(`/offer/${response.id}`);
        } catch (err) {
            console.error('Błąd podczas tworzenia oferty:', err);
            setServerError('Wystąpił błąd podczas tworzenia oferty. Spróbuj ponownie później.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="offer-creation-container">
            <div className="offer-creation-header">
                <h1>Dodaj nowe ogłoszenie</h1>
                <StepsIndicator
                    steps={['Podstawowe informacje', 'Szczegóły pojazdu', 'Wyposażenie', 'Kontakt i finalizacja']}
                    activeStep={activeStep}
                />
            </div>

            {serverError && (
                <div className="error-message">
                    {serverError}
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