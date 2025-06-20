import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FormikProps } from 'formik';
import ImageUpload from '../ImageUpload';
import { compressImage, validateImageFile } from '../../../api/imageApi';

// ---------------------------------------------------
// Mock image API functions
// ---------------------------------------------------
vi.mock('../../../api/imageApi', () => ({
  validateImageFile: vi.fn(),
  compressImage: vi.fn(),
}));

Object.defineProperty(global.URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'blob:fake-url'),
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

// ---------------------------------------------------
// Helper to create a mock Formik props object
// ---------------------------------------------------
interface DummyValues {
  imageFiles: File[];
}

const createMockFormik = (
  overrides: Partial<FormikProps<DummyValues>> = {}
): FormikProps<DummyValues> => {
  const defaultFormik: FormikProps<DummyValues> = {
    values: { imageFiles: [] },
    errors: {},
    touched: {},
    isSubmitting: false,
    isValidating: false,
    submitCount: 0,
    dirty: false,
    isValid: true,
    initialValues: { imageFiles: [] },
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
  };
  return defaultFormik;
};

// ---------------------------------------------------
// Test suite for ImageUpload component
// ---------------------------------------------------
describe('ImageUpload Component', () => {
  it('renders label, upload area, and file counter', () => {
    const formik = createMockFormik();
    const { container } = render(<ImageUpload formik={formik as any} />);
    expect(screen.getByText('Zdjęcia *')).toBeInTheDocument();
    expect(screen.getByText('Click or drag images here')).toBeInTheDocument();
    expect(screen.getByText('0/10 images')).toBeInTheDocument();

    // Ensure the hidden file input is present
    const fileInput = container.querySelector('#file-input');
    expect(fileInput).toBeInTheDocument();
  });

  it('calls setFieldValue with compressed file after uploading a valid file', async () => {
    (validateImageFile as Mock).mockReturnValue(null);
    const compressedFile = new File(['c'], 'compressed.png', {
      type: 'image/png',
    });
    (compressImage as Mock).mockResolvedValue(compressedFile);

    const formik = createMockFormik();
    const { container } = render(<ImageUpload formik={formik as any} />);

    const file = new File(['a'], 'test.png', { type: 'image/png' });
    const input = container.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(validateImageFile).toHaveBeenCalledWith(file);
      expect(compressImage).toHaveBeenCalledWith(file);
      expect(formik.setFieldValue).toHaveBeenCalledWith('imageFiles', [compressedFile]);
    });
  });

  it('shows alert with validation error and does not call setFieldValue', async () => {
    (validateImageFile as Mock).mockReturnValue('File is too large');
    const formik = createMockFormik();
    const { container } = render(<ImageUpload formik={formik as any} />);

    const invalidFile = new File(['x'], 'bad.jpg', {
      type: 'image/jpeg',
    });
    const input = container.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(input, invalidFile);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'File validation errors:\nbad.jpg: File is too large'
      );
      expect(formik.setFieldValue).not.toHaveBeenCalled();
    });
  });

  it('removes image when clicking the remove button', () => {
    const file1 = new File(['a'], 'a.png', { type: 'image/png' });
    const file2 = new File(['b'], 'b.png', { type: 'image/png' });
    const formik = createMockFormik({ values: { imageFiles: [file1, file2] } });
    render(<ImageUpload formik={formik as any} />);

    const removeButtons = screen.getAllByRole('button', { name: '×' });
    expect(removeButtons).toHaveLength(2);

    fireEvent.click(removeButtons[1]);

    expect(formik.setFieldValue).toHaveBeenCalledWith('imageFiles', [file1]);
  });

  it('toggles drag-active class on drag enter and leave events', () => {
    const formik = createMockFormik();
    render(<ImageUpload formik={formik as any} />);
    const uploadArea = screen
      .getByText('Click or drag images here')
      .closest('.upload-area')! as HTMLElement;

    fireEvent.dragEnter(uploadArea);
    expect(uploadArea).toHaveClass('drag-active');

    fireEvent.dragLeave(uploadArea);
    expect(uploadArea).not.toHaveClass('drag-active');
  });
});
