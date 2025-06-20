import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { FormikProps } from 'formik';
import EquipmentStep from '../EquipmentStep';
import { CarEquipment, OfferFormValues } from '../../../types/offer/OfferTypes';

vi.mock('formik', async () => {
  const actual = await vi.importActual('formik');
  return {
    ...actual,
    Field: ({ render, name }: any) => {
      if (typeof render === 'function') {
        const mockField = {
          name,
          value: false,
        };
        const mockForm = {
          setFieldValue: vi.fn((fieldName: string, value: any) => {
            const checkbox = document.getElementById(fieldName) as HTMLInputElement;
            if (checkbox) {
              checkbox.checked = value;
            }
          }),
        };
        return render({ field: mockField, form: mockForm });
      }
      return null;
    },
  };
});

describe('EquipmentStep', () => {
  const mockOnNext = vi.fn();
  const mockOnPrevious = vi.fn();
  const mockSetFieldValue = vi.fn();

  const defaultFormikValues: OfferFormValues = {
    title: '',
    description: '',
    price: 0,
    currency: 'PLN',
    negotiable: false,
    brand: '',
    model: '',
    year: 2023,
    mileage: 0,
    color: '',
    enginePower: 0,
    doors: 4,
    seats: 5,
    vin: '',
    registrationNumber: '',
    registrationCountry: 'PL',
    firstOwner: false,
    accidentFree: true,
    serviceHistory: false,
    additionalFeatures: '',
    equipment: {},
    termsAccepted: false,
    imageFiles: [],
  };

  const createMockFormik = (
    overrides: Partial<FormikProps<OfferFormValues>> = {}
  ): FormikProps<OfferFormValues> => ({
    values: defaultFormikValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValidating: false,
    submitCount: 0,
    dirty: false,
    isValid: true,
    initialValues: defaultFormikValues,
    initialErrors: {},
    initialTouched: {},
    initialStatus: undefined,
    status: undefined,
    handleBlur: vi.fn(),
    handleChange: vi.fn(),
    handleReset: vi.fn(),
    handleSubmit: vi.fn(),
    resetForm: vi.fn(),
    setErrors: vi.fn(),
    setFieldError: vi.fn(),
    setFieldTouched: vi.fn(),
    setFieldValue: mockSetFieldValue,
    setFormikState: vi.fn(),
    setStatus: vi.fn(),
    setSubmitting: vi.fn(),
    setTouched: vi.fn(),
    setValues: vi.fn(),
    submitForm: vi.fn(),
    validateField: vi.fn(),
    validateForm: vi.fn(),
    validateOnBlur: true,
    validateOnChange: true,
    validateOnMount: false,
    getFieldProps: vi.fn(),
    getFieldMeta: vi.fn(),
    getFieldHelpers: vi.fn(),
    registerField: vi.fn(),
    unregisterField: vi.fn(),
    ...overrides,
  });

  const defaultProps = {
    formik: createMockFormik(),
    onNext: mockOnNext,
    onPrevious: mockOnPrevious,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders main heading', () => {
      render(<EquipmentStep {...defaultProps} />);
      expect(screen.getByText('Wyposażenie pojazdu')).toBeInTheDocument();
    });

    test('renders all equipment sections', () => {
      render(<EquipmentStep {...defaultProps} />);

      expect(screen.getByText('Komfort')).toBeInTheDocument();
      expect(screen.getByText('Multimedia')).toBeInTheDocument();
      expect(screen.getByText('Systemy wspomagające')).toBeInTheDocument();
      expect(screen.getByText('Oświetlenie')).toBeInTheDocument();
      expect(screen.getByText('Dodatkowe funkcje')).toBeInTheDocument();
    });

    test('renders all multimedia section checkboxes', () => {
      render(<EquipmentStep {...defaultProps} />);

      const multimediaLabels = [
        'System nawigacji',
        'Bluetooth',
        'Port USB',
        'Wielofunkcyjna kierownica',
        'Android Auto',
        'Apple CarPlay',
        'System nagłośnienia',
      ];

      multimediaLabels.forEach(label => {
        expect(screen.getByLabelText(label)).toBeInTheDocument();
      });
    });

    test('renders all driver assistance section checkboxes', () => {
      render(<EquipmentStep {...defaultProps} />);

      const assistanceLabels = [
        'Czujniki parkowania',
        'Kamera cofania',
        'Tempomat',
        'Adaptacyjny tempomat',
        'Asystent pasa ruchu',
        'Detekcja martwego pola',
        'System hamowania awaryjnego',
        'System Start-Stop',
      ];

      assistanceLabels.forEach(label => {
        expect(screen.getByLabelText(label)).toBeInTheDocument();
      });
    });

    test('renders all lighting section checkboxes', () => {
      render(<EquipmentStep {...defaultProps} />);

      const lightingLabels = [
        'Światła ksenonowe',
        'Światła LED',
        'Oświetlenie ambientowe',
        'Automatyczne światła',
        'Adaptacyjne światła',
      ];

      lightingLabels.forEach(label => {
        expect(screen.getByLabelText(label)).toBeInTheDocument();
      });
    });

    test('renders navigation buttons', () => {
      render(<EquipmentStep {...defaultProps} />);

      expect(screen.getByText('Wstecz')).toBeInTheDocument();
      expect(screen.getByText('Pomiń wyposażenie')).toBeInTheDocument();
    });

    test('does not display equipment counter when nothing is selected', () => {
      render(<EquipmentStep {...defaultProps} />);

      expect(screen.queryByText(/Wybrano \d+ elementów wyposażenia/)).not.toBeInTheDocument();
    });
  });

  describe('Next button logic', () => {
    test('displays "Skip equipment" when nothing is selected', () => {
      render(<EquipmentStep {...defaultProps} />);

      expect(screen.getByText('Pomiń wyposażenie')).toBeInTheDocument();
      expect(screen.queryByText('Dalej')).not.toBeInTheDocument();
    });

    test('displays "Next" when something is selected', () => {
      const formik = createMockFormik({
        values: {
          ...defaultFormikValues,
          equipment: {
            airConditioning: true,
          },
        },
      });

      render(<EquipmentStep formik={formik} onNext={mockOnNext} onPrevious={mockOnPrevious} />);

      expect(screen.getByText('Dalej')).toBeInTheDocument();
      expect(screen.queryByText('Pomiń wyposażenie')).not.toBeInTheDocument();
    });
  });

  describe('Equipment counter', () => {
    test('displays correct number of selected items', () => {
      const formik = createMockFormik({
        values: {
          ...defaultFormikValues,
          equipment: {
            airConditioning: true,
            bluetooth: true,
            ledLights: true,
          },
        },
      });

      render(<EquipmentStep formik={formik} onNext={mockOnNext} onPrevious={mockOnPrevious} />);

      expect(screen.getByText('Wybrano 3 elementów wyposażenia')).toBeInTheDocument();
    });

    test('updates counter after item selection', () => {
      const formik = createMockFormik({
        values: {
          ...defaultFormikValues,
          equipment: {
            airConditioning: true,
          },
        },
      });

      const { rerender } = render(
        <EquipmentStep formik={formik} onNext={mockOnNext} onPrevious={mockOnPrevious} />
      );

      expect(screen.getByText('Wybrano 1 elementów wyposażenia')).toBeInTheDocument();

      // Simulate adding another item
      formik.values.equipment = { airConditioning: true, bluetooth: true };
      rerender(<EquipmentStep formik={formik} onNext={mockOnNext} onPrevious={mockOnPrevious} />);

      expect(screen.getByText('Wybrano 2 elementów wyposażenia')).toBeInTheDocument();
    });

    test('hides counter when all items are deselected', () => {
      const formik = createMockFormik({
        values: {
          ...defaultFormikValues,
          equipment: {},
        },
      });

      render(<EquipmentStep formik={formik} onNext={mockOnNext} onPrevious={mockOnPrevious} />);

      expect(screen.queryByText(/Wybrano \d+ elementów wyposażenia/)).not.toBeInTheDocument();
    });
  });

  describe('Navigation callbacks', () => {
    test('calls onNext when Next button is clicked', async () => {
      const user = userEvent.setup();
      const formik = createMockFormik({
        values: {
          ...defaultFormikValues,
          equipment: {
            airConditioning: true,
          },
        },
      });

      render(<EquipmentStep formik={formik} onNext={mockOnNext} onPrevious={mockOnPrevious} />);

      const nextButton = screen.getByText('Dalej');
      await user.click(nextButton);

      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    test('calls onNext when Skip equipment button is clicked', async () => {
      const user = userEvent.setup();
      render(<EquipmentStep {...defaultProps} />);

      const skipButton = screen.getByText('Pomiń wyposażenie');
      await user.click(skipButton);

      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    test('calls onPrevious when Back button is clicked', async () => {
      const user = userEvent.setup();
      render(<EquipmentStep {...defaultProps} />);

      const previousButton = screen.getByText('Wstecz');
      await user.click(previousButton);

      expect(mockOnPrevious).toHaveBeenCalledTimes(1);
    });
  });

  describe('Initial values handling', () => {
    test('handles undefined equipment object', () => {
      const formik = createMockFormik({
        values: {
          ...defaultFormikValues,
          equipment: undefined,
        },
      });

      render(<EquipmentStep formik={formik} onNext={mockOnNext} onPrevious={mockOnPrevious} />);

      expect(screen.getByText('Pomiń wyposażenie')).toBeInTheDocument();
      expect(screen.queryByText(/Wybrano \d+ elementów wyposażenia/)).not.toBeInTheDocument();
    });

    test('counts only true values in equipment', () => {
      const equipment: CarEquipment = {
        airConditioning: true,
        bluetooth: false,
        parkingSensors: true,
        xenonLights: false,
        heatedSteeringWheel: true,
        usbPort: false,
      };

      const formik = createMockFormik({
        values: {
          ...defaultFormikValues,
          equipment,
        },
      });

      render(<EquipmentStep formik={formik} onNext={mockOnNext} onPrevious={mockOnPrevious} />);

      expect(screen.getByText('Wybrano 3 elementów wyposażenia')).toBeInTheDocument();
    });
  });

  describe('CSS structure', () => {
    test('maintains proper CSS classes', () => {
      const { container } = render(<EquipmentStep {...defaultProps} />);

      expect(container.querySelector('.form-step')).toBeInTheDocument();
      expect(container.querySelectorAll('.equipment-section')).toHaveLength(5);
      expect(container.querySelectorAll('.equipment-grid').length).toBeGreaterThan(0);
      expect(container.querySelectorAll('.checkbox-group').length).toBeGreaterThan(0);
      expect(container.querySelector('.form-navigation')).toBeInTheDocument();
      expect(container.querySelector('.previous-step-btn')).toBeInTheDocument();
      expect(container.querySelector('.next-step-btn')).toBeInTheDocument();
    });

    test('applies equipment-info class to counter', () => {
      const formik = createMockFormik({
        values: {
          ...defaultFormikValues,
          equipment: {
            airConditioning: true,
          },
        },
      });

      const { container } = render(
        <EquipmentStep formik={formik} onNext={mockOnNext} onPrevious={mockOnPrevious} />
      );

      expect(container.querySelector('.equipment-info')).toBeInTheDocument();
    });
  });

  describe('Button attributes', () => {
    test('navigation buttons have correct type attribute', () => {
      render(<EquipmentStep {...defaultProps} />);

      const previousButton = screen.getByText('Wstecz');
      const nextButton = screen.getByText('Pomiń wyposażenie');

      expect(previousButton).toHaveAttribute('type', 'button');
      expect(nextButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Field rendering', () => {
    test('renders checkboxes with correct id attributes', () => {
      render(<EquipmentStep {...defaultProps} />);

      const airConditioningCheckbox = screen.getByLabelText('Klimatyzacja');
      expect(airConditioningCheckbox).toHaveAttribute('id', 'equipment.airConditioning');

      const bluetoothCheckbox = screen.getByLabelText('Bluetooth');
      expect(bluetoothCheckbox).toHaveAttribute('id', 'equipment.bluetooth');
    });

    test('all checkboxes are of type checkbox', () => {
      render(<EquipmentStep {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('type', 'checkbox');
      });
    });
  });
});
