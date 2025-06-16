import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'
import {FormikProps} from 'formik'
import BasicInfoStep from '../BasicInfoStep'
import {OfferFormValues} from '../../../types/offer/OfferTypes'

vi.mock('formik', async () => {
    const actual = await vi.importActual('formik')
    return {
        ...actual,
        Field: ({children, as, type, id, name, placeholder, className, maxLength, rows, min, step, ...props}: any) => {
            const Component = as || (type === 'checkbox' ? 'input' : type === 'number' ? 'input' : 'input')
            return React.createElement(Component, {
                type,
                id,
                name,
                placeholder,
                className,
                maxLength,
                rows,
                min,
                step,
                'data-testid': `field-${name}`,
                ...props
            })
        },
        ErrorMessage: ({name, component = 'div', className}: any) =>
            React.createElement(component, {
                className,
                'data-testid': `error-${name}`
            }, `Error for ${name}`)
    }
})

vi.mock('../ImageUpload', () => ({
    default: () => (
        <div data-testid="image-upload">ImageUpload Component</div>
    )
}))

const mockScrollIntoView = vi.fn()
const mockFocus = vi.fn()

Object.defineProperty(Element.prototype, 'scrollIntoView', {
    value: mockScrollIntoView,
    writable: true
})

Object.defineProperty(HTMLElement.prototype, 'focus', {
    value: mockFocus,
    writable: true
})

describe('BasicInfoStep', () => {
    const mockOnNext = vi.fn()
    const mockValidateForm = vi.fn()
    const mockSetTouched = vi.fn()

    const defaultFormikValues: OfferFormValues = {
        title: '',
        description: '',
        price: 0,
        currency: 'PLN',
        negotiable: false,
        brand: '',
        model: '',
        year: 2020,
        mileage: 0,
        color: '',
        enginePower: 0,
        doors: 4,
        seats: 5,
        vin: '',
        registrationNumber: '',
        registrationCountry: '',
        firstOwner: false,
        accidentFree: false,
        serviceHistory: false,
        additionalFeatures: '',
        termsAccepted: false,
        imageFiles: []
    }

    const createMockFormik = (overrides: Partial<FormikProps<OfferFormValues>> = {}): FormikProps<OfferFormValues> => ({
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
        setFieldValue: vi.fn(),
        setFormikState: vi.fn(),
        setStatus: vi.fn(),
        setSubmitting: vi.fn(),
        setTouched: mockSetTouched,
        setValues: vi.fn(),
        submitForm: vi.fn(),
        validateField: vi.fn(),
        validateForm: mockValidateForm,
        validateOnBlur: true,
        validateOnChange: true,
        validateOnMount: false,
        getFieldProps: vi.fn(),
        getFieldMeta: vi.fn(),
        getFieldHelpers: vi.fn(),
        registerField: vi.fn(),
        unregisterField: vi.fn(),
        ...overrides
    })

    const defaultProps = {
        formik: createMockFormik(),
        onNext: mockOnNext
    }

    beforeEach(() => {
        vi.clearAllMocks()
        mockValidateForm.mockResolvedValue({})

        global.document.getElementById = vi.fn().mockReturnValue({
            scrollIntoView: mockScrollIntoView,
            focus: mockFocus
        })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    test('renders all form fields', () => {
        render(<BasicInfoStep {...defaultProps} />)

        expect(screen.getByText('Podstawowe informacje o ofercie')).toBeInTheDocument()
        expect(screen.getByTestId('image-upload')).toBeInTheDocument()
        expect(screen.getByText('Tytuł ogłoszenia *')).toBeInTheDocument()
        expect(screen.getByText('Opis ogłoszenia *')).toBeInTheDocument()
        expect(screen.getByText('Cena *')).toBeInTheDocument()
        expect(screen.getByText('Waluta *')).toBeInTheDocument()
        expect(screen.getByText('Cena do negocjacji')).toBeInTheDocument()
        expect(screen.getByText('Dalej')).toBeInTheDocument()
    })

    test('displays correct placeholders', () => {
        render(<BasicInfoStep {...defaultProps} />)

        expect(screen.getByTestId('field-title')).toHaveAttribute('placeholder', 'Np. BMW Seria 3 318i, 2020, Salon Polska')
        expect(screen.getByTestId('field-description')).toHaveAttribute('placeholder', 'Opisz dokładnie swój samochód. Wymień jego zalety, historię, stan techniczny i wszystko co może zainteresować potencjalnych kupujących.')
        expect(screen.getByTestId('field-price')).toHaveAttribute('placeholder', 'Cena')
    })

    test('shows character count for title', () => {
        const formik = createMockFormik({
            values: {...defaultFormikValues, title: 'Test title'}
        })

        render(<BasicInfoStep formik={formik} onNext={mockOnNext}/>)

        expect(screen.getByText('10/100 znaków')).toBeInTheDocument()
    })

    test('shows character count for description', () => {
        const formik = createMockFormik({
            values: {...defaultFormikValues, description: 'Test description'}
        })

        render(<BasicInfoStep formik={formik} onNext={mockOnNext}/>)

        expect(screen.getByText('16/2000 znaków')).toBeInTheDocument()
    })

    test('shows warning style for title when near limit', () => {
        const longTitle = 'a'.repeat(95)
        const formik = createMockFormik({
            values: {...defaultFormikValues, title: longTitle}
        })

        render(<BasicInfoStep formik={formik} onNext={mockOnNext}/>)

        const charCount = screen.getByText('95/100 znaków')
        expect(charCount).toHaveClass('char-count', 'warning')
    })

    test('shows warning style for description when near limit', () => {
        const longDescription = 'a'.repeat(1950)
        const formik = createMockFormik({
            values: {...defaultFormikValues, description: longDescription}
        })

        render(<BasicInfoStep formik={formik} onNext={mockOnNext}/>)

        const charCount = screen.getByText('1950/2000 znaków')
        expect(charCount).toHaveClass('char-count', 'warning')
    })

    test('displays error class when field has error and is touched', () => {
        const formik = createMockFormik({
            errors: {title: 'Title is required'},
            touched: {title: true}
        })

        render(<BasicInfoStep formik={formik} onNext={mockOnNext}/>)

        const titleInput = screen.getByTestId('field-title')
        expect(titleInput).toHaveClass('error')
    })

    test('does not display error class when field has error but is not touched', () => {
        const formik = createMockFormik({
            errors: {title: 'Title is required'},
            touched: {title: false}
        })

        render(<BasicInfoStep formik={formik} onNext={mockOnNext}/>)

        const titleInput = screen.getByTestId('field-title')
        expect(titleInput).not.toHaveClass('error')
    })

    test('validates form when next button is clicked', async () => {
        const user = userEvent.setup()
        render(<BasicInfoStep {...defaultProps} />)

        const nextButton = screen.getByText('Dalej')
        await user.click(nextButton)

        expect(mockValidateForm).toHaveBeenCalled()
    })

    test('sets touched fields when next button is clicked', async () => {
        const user = userEvent.setup()
        render(<BasicInfoStep {...defaultProps} />)

        const nextButton = screen.getByText('Dalej')
        await user.click(nextButton)

        await waitFor(() => {
            expect(mockSetTouched).toHaveBeenCalledWith({
                title: true,
                description: true,
                price: true,
                currency: true,
                imageFiles: true,
            })
        })
    })

    test('calls onNext when validation passes', async () => {
        mockValidateForm.mockResolvedValue({})
        const user = userEvent.setup()

        render(<BasicInfoStep {...defaultProps} />)

        const nextButton = screen.getByText('Dalej')
        await user.click(nextButton)

        await waitFor(() => {
            expect(mockOnNext).toHaveBeenCalled()
        })
    })

    test('does not call onNext when validation fails', async () => {
        mockValidateForm.mockResolvedValue({title: 'Title is required'})
        const user = userEvent.setup()

        render(<BasicInfoStep {...defaultProps} />)

        const nextButton = screen.getByText('Dalej')
        await user.click(nextButton)

        await waitFor(() => {
            expect(mockOnNext).not.toHaveBeenCalled()
        })
    })

    test('scrolls to first error field when validation fails', async () => {
        mockValidateForm.mockResolvedValue({title: 'Title is required', description: 'Description is required'})
        const user = userEvent.setup()

        render(<BasicInfoStep {...defaultProps} />)

        const nextButton = screen.getByText('Dalej')
        await user.click(nextButton)

        await waitFor(() => {
            expect(global.document.getElementById).toHaveBeenCalledWith('title')
            expect(mockScrollIntoView).toHaveBeenCalledWith({behavior: 'smooth', block: 'center'})
            expect(mockFocus).toHaveBeenCalled()
        })
    })

    test('only validates step-specific fields', async () => {
        mockValidateForm.mockResolvedValue({
            title: 'Title is required',
            brand: 'Brand is required',
            model: 'Model is required'
        })
        const user = userEvent.setup()

        render(<BasicInfoStep {...defaultProps} />)

        const nextButton = screen.getByText('Dalej')
        await user.click(nextButton)

        await waitFor(() => {
            expect(mockOnNext).not.toHaveBeenCalled()
            expect(global.document.getElementById).toHaveBeenCalledWith('title')
        })
    })

    test('proceeds when only non-step fields have errors', async () => {
        mockValidateForm.mockResolvedValue({
            brand: 'Brand is required',
            model: 'Model is required'
        })
        const user = userEvent.setup()

        render(<BasicInfoStep {...defaultProps} />)

        const nextButton = screen.getByText('Dalej')
        await user.click(nextButton)

        await waitFor(() => {
            expect(mockOnNext).toHaveBeenCalled()
        })
    })

    test('has correct form attributes', () => {
        render(<BasicInfoStep {...defaultProps} />)

        const titleInput = screen.getByTestId('field-title')
        const descriptionInput = screen.getByTestId('field-description')
        const priceInput = screen.getByTestId('field-price')

        expect(titleInput).toHaveAttribute('maxLength', '100')
        expect(descriptionInput).toHaveAttribute('maxLength', '2000')
        expect(descriptionInput).toHaveAttribute('rows', '10')
        expect(priceInput).toHaveAttribute('type', 'number')
        expect(priceInput).toHaveAttribute('min', '1')
        expect(priceInput).toHaveAttribute('step', '0.01')
    })

    test('maintains form structure with proper CSS classes', () => {
        const {container} = render(<BasicInfoStep {...defaultProps} />)

        expect(container.querySelector('.form-step')).toBeInTheDocument()
        expect(container.querySelector('.form-navigation')).toBeInTheDocument()
        expect(container.querySelector('.next-step-btn')).toBeInTheDocument()
    })

})