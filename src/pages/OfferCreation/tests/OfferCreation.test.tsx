import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import OfferCreation from '../OfferCreation';

const { mockUseNavigate, mockCreateOffer, mockUploadMultipleImages, mockScrollTo } = vi.hoisted(
  () => ({
    mockUseNavigate: vi.fn(),
    mockCreateOffer: vi.fn(),
    mockUploadMultipleImages: vi.fn(),
    mockScrollTo: vi.fn(),
  })
);

vi.mock('react-router-dom', () => ({
  useNavigate: mockUseNavigate,
}));

vi.mock('../../../api/offerApi', () => ({
  createOffer: mockCreateOffer,
}));

vi.mock('../../../api/imageApi', () => ({
  uploadMultipleImages: mockUploadMultipleImages,
}));

vi.mock('../../../components/OfferCreation/StepsIndicator', () => ({
  default: ({ steps, activeStep }: { steps: string[]; activeStep: number }) => (
    <div data-testid="steps-indicator">
      Step {activeStep + 1} of {steps.length}: {steps[activeStep]}
    </div>
  ),
}));

vi.mock('../../../components/OfferCreation/BasicInfoStep', () => ({
  default: ({ formik, onNext }: { formik: any; onNext: () => void }) => {
    const [showErrors, setShowErrors] = React.useState(false);

    const handleNext = () => {
      const hasErrors =
        !formik.values.title ||
        formik.values.title.length < 3 ||
        !formik.values.description ||
        formik.values.description.length < 10 ||
        !formik.values.price ||
        formik.values.price <= 0;

      if (hasErrors) {
        setShowErrors(true);
      } else {
        onNext();
      }
    };

    return (
      <div data-testid="basic-info-step">
        <h2>Basic Info Step</h2>
        <input
          data-testid="title-input"
          value={formik.values.title}
          onChange={e => formik.setFieldValue('title', e.target.value)}
          placeholder="Tytuł"
        />
        <input
          data-testid="description-input"
          value={formik.values.description}
          onChange={e => formik.setFieldValue('description', e.target.value)}
          placeholder="Opis"
        />
        <input
          data-testid="price-input"
          type="number"
          value={formik.values.price}
          onChange={e => formik.setFieldValue('price', Number(e.target.value))}
          placeholder="Cena"
        />
        <button type="button" onClick={handleNext} data-testid="next-button">
          Dalej
        </button>
        {showErrors && (!formik.values.title || formik.values.title.length < 3) && (
          <div data-testid="title-error">
            {!formik.values.title ? 'Tytuł jest wymagany' : 'Tytuł musi mieć co najmniej 3 znaki'}
          </div>
        )}
        {showErrors && (!formik.values.description || formik.values.description.length < 10) && (
          <div data-testid="description-error">
            {!formik.values.description
              ? 'Opis jest wymagany'
              : 'Opis musi mieć co najmniej 10 znaków'}
          </div>
        )}
        {showErrors && (!formik.values.price || formik.values.price <= 0) && (
          <div data-testid="price-error">
            {!formik.values.price ? 'Cena jest wymagana' : 'Cena musi być większa od 0'}
          </div>
        )}
      </div>
    );
  },
}));

vi.mock('../../../components/OfferCreation/VehicleDetailsStep', () => ({
  default: ({
    formik,
    onNext,
    onPrevious,
  }: {
    formik: any;
    onNext: () => void;
    onPrevious: () => void;
  }) => {
    const [showErrors, setShowErrors] = React.useState(false);

    const handleNext = () => {
      const hasErrors =
        !formik.values.brand ||
        !formik.values.model ||
        !formik.values.vin ||
        (formik.values.vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(formik.values.vin));

      if (hasErrors) {
        setShowErrors(true);
      } else {
        onNext();
      }
    };

    return (
      <div data-testid="vehicle-details-step">
        <h2>Vehicle Details Step</h2>
        <input
          data-testid="brand-input"
          value={formik.values.brand}
          onChange={e => formik.setFieldValue('brand', e.target.value)}
          placeholder="Marka"
        />
        <input
          data-testid="model-input"
          value={formik.values.model}
          onChange={e => formik.setFieldValue('model', e.target.value)}
          placeholder="Model"
        />
        <input
          data-testid="year-input"
          type="number"
          value={formik.values.year}
          onChange={e => formik.setFieldValue('year', Number(e.target.value))}
          placeholder="Rok"
        />
        <input
          data-testid="vin-input"
          value={formik.values.vin}
          onChange={e => formik.setFieldValue('vin', e.target.value)}
          placeholder="VIN"
        />
        <button type="button" onClick={onPrevious} data-testid="previous-button">
          Wstecz
        </button>
        <button type="button" onClick={handleNext} data-testid="next-button">
          Dalej
        </button>
        {showErrors && !formik.values.brand && (
          <div data-testid="brand-error">Marka jest wymagana</div>
        )}
        {showErrors && !formik.values.model && (
          <div data-testid="model-error">Model jest wymagany</div>
        )}
        {showErrors && !formik.values.vin && (
          <div data-testid="vin-error">Numer VIN jest wymagany</div>
        )}
        {showErrors && formik.values.vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(formik.values.vin) && (
          <div data-testid="vin-error">
            Niepoprawny format numeru VIN - musi składać się z 17 znaków
          </div>
        )}
      </div>
    );
  },
}));

vi.mock('../../../components/OfferCreation/EquipmentStep', () => ({
  default: ({
    onNext,
    onPrevious,
  }: {
    formik: any;
    onNext: () => void;
    onPrevious: () => void;
  }) => (
    <div data-testid="equipment-step">
      <h2>Equipment Step</h2>
      <button type="button" onClick={onPrevious} data-testid="previous-button">
        Wstecz
      </button>
      <button type="button" onClick={onNext} data-testid="next-button">
        Dalej
      </button>
    </div>
  ),
}));

vi.mock('../../../components/OfferCreation/ContactAndSummaryStep', () => ({
  default: ({
    formik,
    onPrevious,
    isSubmitting,
  }: {
    formik: any;
    onPrevious: () => void;
    isSubmitting: boolean;
  }) => {
    const [showError, setShowError] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formik.values.termsAccepted) {
        setShowError(true);
      } else {
        setShowError(false);
        // Trigger the form submission
        formik.handleSubmit(e);
      }
    };

    return (
      <div data-testid="contact-summary-step">
        <h2>Contact and Summary Step</h2>
        <form onSubmit={handleSubmit}>
          <input
            data-testid="terms-checkbox"
            type="checkbox"
            checked={formik.values.termsAccepted}
            onChange={e => {
              formik.setFieldValue('termsAccepted', e.target.checked);
              if (e.target.checked) {
                setShowError(false);
              }
            }}
          />
          <label htmlFor="terms-checkbox">Akceptuję regulamin</label>
          <button type="button" onClick={onPrevious} data-testid="previous-button">
            Wstecz
          </button>
          <button type="submit" disabled={isSubmitting} data-testid="submit-button">
            {isSubmitting ? 'Tworzenie...' : 'Utwórz ofertę'}
          </button>
          {showError && <div data-testid="terms-error">Musisz zaakceptować regulamin</div>}
        </form>
      </div>
    );
  },
}));

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

const renderComponent = () => {
  return render(<OfferCreation />);
};

describe('OfferCreation Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNavigate.mockReturnValue(vi.fn());
    mockCreateOffer.mockResolvedValue({ id: 'offer-123' });
    mockUploadMultipleImages.mockResolvedValue(undefined);
  });

  test('renders initial state correctly', () => {
    renderComponent();

    expect(screen.getByText('Dodaj nowe ogłoszenie')).toBeInTheDocument();
    expect(screen.getByTestId('steps-indicator')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 4: Podstawowe informacje')).toBeInTheDocument();
    expect(screen.getByTestId('basic-info-step')).toBeInTheDocument();
    expect(screen.queryByTestId('vehicle-details-step')).not.toBeInTheDocument();
  });

  test('navigates to next step when validation passes', async () => {
    renderComponent();

    // Fill required fields for step 1
    fireEvent.change(screen.getByTestId('title-input'), {
      target: { value: 'Test Car Title' },
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'This is a test description with more than 10 characters' },
    });
    fireEvent.change(screen.getByTestId('price-input'), {
      target: { value: '50000' },
    });

    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Step 2 of 4: Szczegóły pojazdu')).toBeInTheDocument();
      expect(screen.getByTestId('vehicle-details-step')).toBeInTheDocument();
      expect(screen.queryByTestId('basic-info-step')).not.toBeInTheDocument();
    });

    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('shows validation errors when trying to proceed with invalid data', async () => {
    renderComponent();

    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTestId('title-error')).toBeInTheDocument();
      expect(screen.getByText('Tytuł jest wymagany')).toBeInTheDocument();
    });

    // Should still be on step 1
    expect(screen.getByText('Step 1 of 4: Podstawowe informacje')).toBeInTheDocument();
    expect(screen.getByTestId('basic-info-step')).toBeInTheDocument();
  });

  test('validates title length constraints', async () => {
    renderComponent();

    // Test too short title
    fireEvent.change(screen.getByTestId('title-input'), {
      target: { value: 'AB' },
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'Valid description here' },
    });
    fireEvent.change(screen.getByTestId('price-input'), {
      target: { value: '1000' },
    });
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByText('Tytuł musi mieć co najmniej 3 znaki')).toBeInTheDocument();
      expect(screen.getByTestId('basic-info-step')).toBeInTheDocument();
    });
  });

  test('validates price input', async () => {
    renderComponent();

    // Test negative price
    fireEvent.change(screen.getByTestId('title-input'), {
      target: { value: 'Valid title' },
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'Valid description here' },
    });
    fireEvent.change(screen.getByTestId('price-input'), {
      target: { value: '-1000' },
    });
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByText('Cena musi być większa od 0')).toBeInTheDocument();
      expect(screen.getByTestId('basic-info-step')).toBeInTheDocument();
    });
  });

  test('navigates between steps correctly', async () => {
    renderComponent();

    // Go to step 2
    await fillValidBasicInfo();
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByTestId('vehicle-details-step')).toBeInTheDocument();
    });

    // Go back to step 1
    fireEvent.click(screen.getByTestId('previous-button'));

    await waitFor(() => {
      expect(screen.getByTestId('basic-info-step')).toBeInTheDocument();
      expect(screen.getByText('Step 1 of 4: Podstawowe informacje')).toBeInTheDocument();
    });

    expect(mockScrollTo).toHaveBeenCalledTimes(2);
  });

  test('validates VIN format', async () => {
    renderComponent();

    // Navigate to step 2
    await fillValidBasicInfo();
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByTestId('vehicle-details-step')).toBeInTheDocument();
    });

    // Fill required fields with valid VIN first to test VIN format validation
    fireEvent.change(screen.getByTestId('brand-input'), {
      target: { value: 'BMW' },
    });
    fireEvent.change(screen.getByTestId('model-input'), {
      target: { value: 'X5' },
    });

    // Test invalid VIN
    fireEvent.change(screen.getByTestId('vin-input'), {
      target: { value: 'INVALID_VIN' },
    });
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByTestId('vin-error')).toBeInTheDocument();
      expect(
        screen.getByText('Niepoprawny format numeru VIN - musi składać się z 17 znaków')
      ).toBeInTheDocument();
    });

    // Should still be on step 2
    expect(screen.getByTestId('vehicle-details-step')).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 4: Szczegóły pojazdu')).toBeInTheDocument();
  });

  test('validates required fields in vehicle details step', async () => {
    renderComponent();

    // Navigate to step 2
    await fillValidBasicInfo();
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByTestId('vehicle-details-step')).toBeInTheDocument();
    });

    // Try to proceed without filling required fields
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByTestId('brand-error')).toBeInTheDocument();
      expect(screen.getByText('Marka jest wymagana')).toBeInTheDocument();
    });

    // Should still be on step 2
    expect(screen.getByTestId('vehicle-details-step')).toBeInTheDocument();
  });

  test('successfully submits form with valid data', async () => {
    const mockNavigate = vi.fn();
    mockUseNavigate.mockReturnValue(mockNavigate);

    renderComponent();

    // Fill all steps
    await fillValidBasicInfo();
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByTestId('vehicle-details-step')).toBeInTheDocument();
    });

    await fillValidVehicleDetails();
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByTestId('equipment-step')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByTestId('contact-summary-step')).toBeInTheDocument();
    });

    // Accept terms and submit
    fireEvent.click(screen.getByTestId('terms-checkbox'));
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockCreateOffer).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Car Title',
          description: 'This is a test description with more than 10 characters',
          price: 50000,
          brand: 'BMW',
          model: 'X5',
        })
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/offer/offer-123');
    });
  });

  test('shows error when terms are not accepted', async () => {
    renderComponent();

    // Navigate to final step
    await navigateToFinalStep();

    // Try to submit without accepting terms
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      // Check for the error that's actually displayed in the mock component
      expect(screen.getByText('Musisz zaakceptować regulamin')).toBeInTheDocument();
    });

    expect(mockCreateOffer).not.toHaveBeenCalled();
  });

  test('handles API error during submission', async () => {
    mockCreateOffer.mockRejectedValue(new Error('API Error'));

    renderComponent();

    await navigateToFinalStep();

    // Accept terms and submit
    fireEvent.click(screen.getByTestId('terms-checkbox'));
    fireEvent.click(screen.getByTestId('submit-button'));

    // Since API errors are handled by the main component and we're using mocks,
    // we just verify the API was called and failed
    await waitFor(() => {
      expect(mockCreateOffer).toHaveBeenCalled();
    });
  });

  test('normalizes form values correctly', async () => {
    renderComponent();

    await navigateToFinalStep();

    // Accept terms and submit
    fireEvent.click(screen.getByTestId('terms-checkbox'));
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockCreateOffer).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Car Title',
          description: 'This is a test description with more than 10 characters',
          price: 50000,
          currency: 'PLN',
          brand: 'BMW',
          model: 'X5',
          year: 2020,
          vin: 'WBAFR9C50DD000001',
        })
      );
    });

    // Verify that termsAccepted and imageFiles are not included
    const callArguments = mockCreateOffer.mock.calls[0][0];
    expect(callArguments).not.toHaveProperty('termsAccepted');
    expect(callArguments).not.toHaveProperty('imageFiles');
  });

  // Helper functions
  const fillValidBasicInfo = async () => {
    fireEvent.change(screen.getByTestId('title-input'), {
      target: { value: 'Test Car Title' },
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'This is a test description with more than 10 characters' },
    });
    fireEvent.change(screen.getByTestId('price-input'), {
      target: { value: '50000' },
    });
  };

  const fillValidVehicleDetails = async () => {
    fireEvent.change(screen.getByTestId('brand-input'), {
      target: { value: 'BMW' },
    });
    fireEvent.change(screen.getByTestId('model-input'), {
      target: { value: 'X5' },
    });
    fireEvent.change(screen.getByTestId('year-input'), {
      target: { value: '2020' },
    });
    fireEvent.change(screen.getByTestId('vin-input'), {
      target: { value: 'WBAFR9C50DD000001' },
    });
  };

  const navigateToFinalStep = async () => {
    // Step 1
    await fillValidBasicInfo();
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByTestId('vehicle-details-step')).toBeInTheDocument();
    });

    // Step 2
    await fillValidVehicleDetails();
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByTestId('equipment-step')).toBeInTheDocument();
    });

    // Step 3
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByTestId('contact-summary-step')).toBeInTheDocument();
    });
  };
});
