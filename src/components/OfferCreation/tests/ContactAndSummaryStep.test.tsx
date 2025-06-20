import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { FormikProps } from 'formik';
import ContactAndSummaryStep from '../ContactAndSummaryStep';
import {
  BodyType,
  FuelType,
  OfferFormValues,
  TransmissionType,
} from '../../../types/offer/OfferTypes';

vi.mock('formik', async () => {
  const actual = await vi.importActual('formik');
  return {
    ...actual,
    Field: ({ children, name, type, id, placeholder, className, min, ...props }: any) => {
      if (typeof children === 'function') {
        // Custom Field render function
        const mockField = { name, value: false };
        const mockForm = { setFieldValue: vi.fn() };
        return children({ field: mockField, form: mockForm });
      }

      return React.createElement('input', {
        type,
        id,
        name,
        placeholder,
        className,
        min,
        'data-testid': `field-${name}`,
        ...props,
      });
    },
    ErrorMessage: ({ name, component = 'div', className }: any) =>
      React.createElement(
        component,
        {
          className,
          'data-testid': `error-${name}`,
        },
        `Error for ${name}`
      ),
  };
});

describe('ContactAndSummaryStep', () => {
  const mockOnPrevious = vi.fn();
  const mockHandleSubmit = vi.fn();
  const mockSetFieldValue = vi.fn();

  const defaultFormikValues: OfferFormValues = {
    title: 'BMW X5 2020',
    description: 'Great car in excellent condition',
    price: 150000,
    currency: 'PLN',
    negotiable: true,
    brand: 'BMW',
    model: 'X5',
    year: 2020,
    mileage: 50000,
    color: 'Black',
    enginePower: 300,
    doors: 5,
    seats: 5,
    vin: 'ABC123',
    registrationNumber: 'WA12345',
    registrationCountry: 'Poland',
    firstOwner: true,
    accidentFree: true,
    serviceHistory: true,
    additionalFeatures: 'Additional features',
    termsAccepted: false,
    imageFiles: [],
    fuelType: FuelType.DIESEL,
    transmission: TransmissionType.AUTOMATIC,
    bodyType: BodyType.SUV,
    location: 'Warsaw',
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
    handleSubmit: mockHandleSubmit,
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
    onPrevious: mockOnPrevious,
    isSubmitting: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders all form elements', () => {
    render(<ContactAndSummaryStep {...defaultProps} />);

    expect(screen.getByText('Lokalizacja i finalizacja')).toBeInTheDocument();
    expect(screen.getByText('Lokalizacja')).toBeInTheDocument();
    expect(screen.getByText('Data wygaśnięcia ogłoszenia')).toBeInTheDocument();
    expect(screen.getByText('Podsumowanie ogłoszenia')).toBeInTheDocument();
    expect(screen.getByText('Wstecz')).toBeInTheDocument();
    expect(screen.getByText('Opublikuj ogłoszenie')).toBeInTheDocument();
  });

  test('displays location field with placeholder', () => {
    render(<ContactAndSummaryStep {...defaultProps} />);

    const locationField = screen.getByTestId('field-location');
    expect(locationField).toHaveAttribute('placeholder', 'Np. Warszawa, Mazowieckie');
    expect(screen.getByText('Podaj lokalizację pojazdu')).toBeInTheDocument();
  });

  test('displays expiration date field with minimum date', () => {
    render(<ContactAndSummaryStep {...defaultProps} />);

    const expirationField = screen.getByTestId('field-expirationDate');
    expect(expirationField).toHaveAttribute('type', 'date');
    expect(expirationField).toHaveAttribute('min');
    expect(screen.getByText(/Jeśli nie wybierzesz daty/)).toBeInTheDocument();
  });

  test('displays offer summary with all details', () => {
    render(<ContactAndSummaryStep {...defaultProps} />);

    expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    expect(screen.getByText('150000 PLN (do negocjacji)')).toBeInTheDocument();
    expect(screen.getByText('BMW X5')).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
    expect(screen.getByText('50000 km')).toBeInTheDocument();
    expect(screen.getByText('DIESEL')).toBeInTheDocument();
    expect(screen.getByText('SUV')).toBeInTheDocument();
    expect(screen.getByText('AUTOMATIC')).toBeInTheDocument();
    expect(screen.getByText('Warsaw')).toBeInTheDocument();
  });

  test('displays price without negotiable text when negotiable is false', () => {
    const formik = createMockFormik({
      values: { ...defaultFormikValues, negotiable: false },
    });

    render(
      <ContactAndSummaryStep formik={formik} onPrevious={mockOnPrevious} isSubmitting={false} />
    );

    expect(screen.getByText('150000 PLN')).toBeInTheDocument();
    expect(screen.queryByText('(do negocjacji)')).not.toBeInTheDocument();
  });

  test('hides optional summary fields when not provided', () => {
    const formik = createMockFormik({
      values: {
        ...defaultFormikValues,
        mileage: undefined as any,
        fuelType: undefined,
        bodyType: undefined,
        transmission: undefined,
        location: undefined,
      },
    });

    render(
      <ContactAndSummaryStep formik={formik} onPrevious={mockOnPrevious} isSubmitting={false} />
    );

    expect(screen.queryByText('Przebieg:')).not.toBeInTheDocument();
    expect(screen.queryByText('Rodzaj paliwa:')).not.toBeInTheDocument();
    expect(screen.queryByText('Typ nadwozia:')).not.toBeInTheDocument();
    expect(screen.queryByText('Skrzynia biegów:')).not.toBeInTheDocument();
    expect(screen.queryByText('Lokalizacja:')).not.toBeInTheDocument();
  });

  test('shows mileage field when mileage is 0', () => {
    const formik = createMockFormik({
      values: { ...defaultFormikValues, mileage: 0 },
    });

    render(
      <ContactAndSummaryStep formik={formik} onPrevious={mockOnPrevious} isSubmitting={false} />
    );

    expect(screen.getByText('Przebieg:')).toBeInTheDocument();
    expect(screen.getByText('0 km')).toBeInTheDocument();
  });

  test('displays terms acceptance checkbox', () => {
    render(<ContactAndSummaryStep {...defaultProps} />);

    expect(screen.getByText(/Akceptuję regulamin serwisu/)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  test('calls onPrevious when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<ContactAndSummaryStep {...defaultProps} />);

    const backButton = screen.getByText('Wstecz');
    await user.click(backButton);

    expect(mockOnPrevious).toHaveBeenCalled();
  });

  test('shows submit button with correct text when not submitting', () => {
    render(<ContactAndSummaryStep {...defaultProps} />);

    const submitButton = screen.getByText('Opublikuj ogłoszenie');
    expect(submitButton).not.toBeDisabled();
  });

  test('shows loading state when submitting', () => {
    render(<ContactAndSummaryStep {...defaultProps} isSubmitting={true} />);

    const submitButton = screen.getByText('Wysyłanie...');
    expect(submitButton).toBeDisabled();
  });

  test('calls handleSubmit when submit button is clicked', async () => {
    const user = userEvent.setup();
    render(<ContactAndSummaryStep {...defaultProps} />);

    const submitButton = screen.getByText('Opublikuj ogłoszenie');
    await user.click(submitButton);

    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  test('does not modify expiration date when not provided', async () => {
    const formik = createMockFormik({
      values: { ...defaultFormikValues, expirationDate: undefined },
    });

    const user = userEvent.setup();
    render(
      <ContactAndSummaryStep formik={formik} onPrevious={mockOnPrevious} isSubmitting={false} />
    );

    const submitButton = screen.getByText('Opublikuj ogłoszenie');
    await user.click(submitButton);

    expect(mockSetFieldValue).not.toHaveBeenCalledWith('expirationDate', expect.anything());
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  test('displays error class when fields are touched and have errors', () => {
    const formik = createMockFormik({
      errors: { location: 'Location is required', expirationDate: 'Invalid date' },
      touched: { location: true, expirationDate: true },
    });

    render(
      <ContactAndSummaryStep formik={formik} onPrevious={mockOnPrevious} isSubmitting={false} />
    );

    const locationField = screen.getByTestId('field-location');
    const expirationField = screen.getByTestId('field-expirationDate');

    expect(locationField).toHaveClass('error');
    expect(expirationField).toHaveClass('error');
  });

  test('does not display error class when fields are not touched', () => {
    const formik = createMockFormik({
      errors: { location: 'Location is required' },
      touched: { location: false },
    });

    render(
      <ContactAndSummaryStep formik={formik} onPrevious={mockOnPrevious} isSubmitting={false} />
    );

    const locationField = screen.getByTestId('field-location');
    expect(locationField).not.toHaveClass('error');
  });

  test('displays error class on terms label when terms error exists', () => {
    const formik = createMockFormik({
      errors: { termsAccepted: 'You must accept terms' },
      touched: { termsAccepted: true },
    });

    render(
      <ContactAndSummaryStep formik={formik} onPrevious={mockOnPrevious} isSubmitting={false} />
    );

    const termsLabel = screen.getByText(/Akceptuję regulamin serwisu/);
    expect(termsLabel).toHaveClass('error');
  });

  test('has correct minimum date for expiration field', () => {
    render(<ContactAndSummaryStep {...defaultProps} />);

    const expirationField = screen.getByTestId('field-expirationDate');
    const minDate = expirationField.getAttribute('min');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const expectedMin = tomorrow.toISOString().split('T')[0];

    expect(minDate).toBe(expectedMin);
  });

  test('handles different currency values in summary', () => {
    const formik = createMockFormik({
      values: { ...defaultFormikValues, currency: 'EUR', price: 45000 },
    });

    render(
      <ContactAndSummaryStep formik={formik} onPrevious={mockOnPrevious} isSubmitting={false} />
    );

    expect(screen.getByText('45000 EUR (do negocjacji)')).toBeInTheDocument();
  });

  test('displays all summary labels correctly', () => {
    render(<ContactAndSummaryStep {...defaultProps} />);

    expect(screen.getByText('Tytuł:')).toBeInTheDocument();
    expect(screen.getByText('Cena:')).toBeInTheDocument();
    expect(screen.getByText('Marka i model:')).toBeInTheDocument();
    expect(screen.getByText('Rok produkcji:')).toBeInTheDocument();
    expect(screen.getByText('Przebieg:')).toBeInTheDocument();
    expect(screen.getByText('Rodzaj paliwa:')).toBeInTheDocument();
    expect(screen.getByText('Typ nadwozia:')).toBeInTheDocument();
    expect(screen.getByText('Skrzynia biegów:')).toBeInTheDocument();
    expect(screen.getByText('Lokalizacja:')).toBeInTheDocument();
  });

  test('maintains proper CSS structure', () => {
    const { container } = render(<ContactAndSummaryStep {...defaultProps} />);

    expect(container.querySelector('.form-step')).toBeInTheDocument();
    expect(container.querySelector('.form-summary')).toBeInTheDocument();
    expect(container.querySelector('.summary-details')).toBeInTheDocument();
    expect(container.querySelectorAll('.summary-row')).toHaveLength(9); // All fields shown
    expect(container.querySelector('.offer-terms')).toBeInTheDocument();
    expect(container.querySelector('.checkbox-group')).toBeInTheDocument();
    expect(container.querySelector('.form-navigation')).toBeInTheDocument();
  });

  test('handles empty title gracefully', () => {
    const formik = createMockFormik({
      values: { ...defaultFormikValues, title: '' },
    });

    render(
      <ContactAndSummaryStep formik={formik} onPrevious={mockOnPrevious} isSubmitting={false} />
    );

    const titleValue = screen.getByText('Tytuł:').nextElementSibling;
    expect(titleValue?.textContent).toBe('');
  });

  test('handles rapid submit button clicks', async () => {
    const user = userEvent.setup();
    render(<ContactAndSummaryStep {...defaultProps} />);

    const submitButton = screen.getByText('Opublikuj ogłoszenie');

    await user.click(submitButton);
    await user.click(submitButton);
    await user.click(submitButton);

    expect(mockHandleSubmit).toHaveBeenCalledTimes(3);
  });

  test('handles null mileage correctly', () => {
    const formik = createMockFormik({
      values: { ...defaultFormikValues, mileage: null as any },
    });

    render(
      <ContactAndSummaryStep formik={formik} onPrevious={mockOnPrevious} isSubmitting={false} />
    );

    expect(screen.queryByText('Przebieg:')).not.toBeInTheDocument();
  });

  test('preserves form values during re-renders', () => {
    const formik = createMockFormik({
      values: {
        ...defaultFormikValues,
        location: 'Krakow',
        title: 'Audi A4 2019',
      },
    });

    const { rerender } = render(
      <ContactAndSummaryStep formik={formik} onPrevious={mockOnPrevious} isSubmitting={false} />
    );

    expect(screen.getByText('Audi A4 2019')).toBeInTheDocument();
    expect(screen.getByText('Krakow')).toBeInTheDocument();

    rerender(
      <ContactAndSummaryStep formik={formik} onPrevious={mockOnPrevious} isSubmitting={false} />
    );

    expect(screen.getByText('Audi A4 2019')).toBeInTheDocument();
    expect(screen.getByText('Krakow')).toBeInTheDocument();
  });

  test('displays correct button types', () => {
    render(<ContactAndSummaryStep {...defaultProps} />);

    const backButton = screen.getByText('Wstecz');
    const submitButton = screen.getByText('Opublikuj ogłoszenie');

    expect(backButton).toHaveAttribute('type', 'button');
    expect(submitButton).toHaveAttribute('type', 'button');
  });
});
