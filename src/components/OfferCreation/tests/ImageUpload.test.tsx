import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FormikProps } from 'formik';
import ImageUpload from '../ImageUpload';
import { compressImage, validateImageFile } from '../../../api/imageApi';

vi.mock('../../../api/imageApi', () => ({
  validateImageFile: vi.fn(),
  compressImage: vi.fn(),
}));

Object.defineProperty(global.URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'blob:fake-url'),
});

Object.defineProperty(global.URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn(),
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

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

describe('ImageUpload Component', () => {
  it('renders label, upload area, and file counter', () => {
    const formik = createMockFormik();
    render(<ImageUpload formik={formik as any} />);

    expect(screen.getByText('Zdjęcia *')).toBeInTheDocument();
    expect(screen.getByText('Naciśnij lub przeciągnij zdjęcia')).toBeInTheDocument();
    expect(screen.getByText('0/10 Zdjęć')).toBeInTheDocument();
    expect(
      screen.getByText('Wspierane formaty: JPG, PNG, WEBP (max 5MB każde)')
    ).toBeInTheDocument();
  });

  it('calls setFieldValue with compressed file after uploading a valid file', async () => {
    (validateImageFile as Mock).mockReturnValue(null);
    const compressedFile = new File(['c'], 'compressed.png', {
      type: 'image/png',
    });
    (compressImage as Mock).mockResolvedValue(compressedFile);

    const formik = createMockFormik();
    render(<ImageUpload formik={formik as any} />);

    const file = new File(['a'], 'test.png', { type: 'image/png' });
    const hiddenInputs = document.querySelectorAll('input[type="file"]');
    const input = hiddenInputs[0] as HTMLInputElement;

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
    render(<ImageUpload formik={formik as any} />);

    const invalidFile = new File(['x'], 'bad.jpg', {
      type: 'image/jpeg',
    });

    const hiddenInputs = document.querySelectorAll('input[type="file"]');
    const input = hiddenInputs[0] as HTMLInputElement;
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
      .getByText('Naciśnij lub przeciągnij zdjęcia')
      .closest('.upload-area') as HTMLElement;

    fireEvent.dragEnter(uploadArea);
    expect(uploadArea).toHaveClass('drag-active');

    fireEvent.dragLeave(uploadArea);
    expect(uploadArea).not.toHaveClass('drag-active');
  });

  it('handles file drop on upload area', async () => {
    (validateImageFile as Mock).mockReturnValue(null);
    const compressedFile = new File(['c'], 'compressed.png', { type: 'image/png' });
    (compressImage as Mock).mockResolvedValue(compressedFile);

    const formik = createMockFormik();
    render(<ImageUpload formik={formik as any} />);

    const uploadArea = screen
      .getByText('Naciśnij lub przeciągnij zdjęcia')
      .closest('.upload-area') as HTMLElement;
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    fireEvent.drop(uploadArea, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(validateImageFile).toHaveBeenCalledWith(file);
      expect(compressImage).toHaveBeenCalledWith(file);
      expect(formik.setFieldValue).toHaveBeenCalledWith('imageFiles', [compressedFile]);
    });
  });

  it('prevents default on dragOver event', () => {
    const formik = createMockFormik();
    render(<ImageUpload formik={formik as any} />);

    const uploadArea = screen
      .getByText('Naciśnij lub przeciągnij zdjęcia')
      .closest('.upload-area') as HTMLElement;
    const dragOverEvent = new Event('dragover', { bubbles: true });
    const preventDefaultSpy = vi.spyOn(dragOverEvent, 'preventDefault');

    fireEvent(uploadArea, dragOverEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('displays uploaded images with preview', () => {
    const file1 = new File(['a'], 'image1.png', { type: 'image/png' });
    const file2 = new File(['b'], 'image2.jpg', { type: 'image/jpeg' });
    const formik = createMockFormik({ values: { imageFiles: [file1, file2] } });

    render(<ImageUpload formik={formik as any} />);

    expect(screen.getByText('2/10 Zdjęć')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '×' })).toHaveLength(2);
    expect(screen.getByText('Główne')).toBeInTheDocument(); // Primary badge on first image
  });

  it('shows camera options modal when clicking upload area', () => {
    const formik = createMockFormik();
    render(<ImageUpload formik={formik as any} />);

    const uploadArea = screen
      .getByText('Naciśnij lub przeciągnij zdjęcia')
      .closest('.upload-area') as HTMLElement;
    fireEvent.click(uploadArea);

    expect(screen.getByText('Dodaj zdjęcie')).toBeInTheDocument();
    expect(screen.getByText('Z galerii')).toBeInTheDocument();
    expect(screen.getByText('Zrób zdjęcie')).toBeInTheDocument();
    expect(screen.getByText('Anuluj')).toBeInTheDocument();
  });

  it('closes camera options modal when clicking cancel', () => {
    const formik = createMockFormik();
    render(<ImageUpload formik={formik as any} />);

    const uploadArea = screen
      .getByText('Naciśnij lub przeciągnij zdjęcia')
      .closest('.upload-area') as HTMLElement;
    fireEvent.click(uploadArea);

    expect(screen.getByText('Dodaj zdjęcie')).toBeInTheDocument();

    const cancelButton = screen.getByText('Anuluj');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Dodaj zdjęcie')).not.toBeInTheDocument();
  });

  it('closes camera options modal when clicking overlay', () => {
    const formik = createMockFormik();
    render(<ImageUpload formik={formik as any} />);

    const uploadArea = screen
      .getByText('Naciśnij lub przeciągnij zdjęcia')
      .closest('.upload-area') as HTMLElement;
    fireEvent.click(uploadArea);

    const overlay = document.querySelector('.camera-options-overlay') as HTMLElement;
    fireEvent.click(overlay);

    expect(screen.queryByText('Dodaj zdjęcie')).not.toBeInTheDocument();
  });

  it('triggers gallery file input when clicking gallery option', () => {
    const formik = createMockFormik();
    render(<ImageUpload formik={formik as any} />);

    const uploadArea = screen
      .getByText('Naciśnij lub przeciągnij zdjęcia')
      .closest('.upload-area') as HTMLElement;
    fireEvent.click(uploadArea);

    const hiddenInputs = document.querySelectorAll('input[type="file"]');
    const galleryInput = hiddenInputs[0] as HTMLInputElement; // First input is gallery
    const clickSpy = vi.spyOn(galleryInput, 'click').mockImplementation(() => {});

    const galleryButton = screen.getByText('Z galerii');
    fireEvent.click(galleryButton);

    expect(clickSpy).toHaveBeenCalled();
    expect(screen.queryByText('Dodaj zdjęcie')).not.toBeInTheDocument();
  });

  it('triggers camera file input when clicking camera option', () => {
    const formik = createMockFormik();
    render(<ImageUpload formik={formik as any} />);

    const uploadArea = screen
      .getByText('Naciśnij lub przeciągnij zdjęcia')
      .closest('.upload-area') as HTMLElement;
    fireEvent.click(uploadArea);

    const hiddenInputs = document.querySelectorAll('input[type="file"]');
    const cameraInput = hiddenInputs[1] as HTMLInputElement; // Second input is camera
    const clickSpy = vi.spyOn(cameraInput, 'click').mockImplementation(() => {});

    const cameraButton = screen.getByText('Zrób zdjęcie');
    fireEvent.click(cameraButton);

    expect(clickSpy).toHaveBeenCalled();
    expect(screen.queryByText('Dodaj zdjęcie')).not.toBeInTheDocument();
  });

  it('shows loading state during file processing', async () => {
    (validateImageFile as Mock).mockReturnValue(null);
    (compressImage as Mock).mockImplementation(
      () =>
        new Promise(resolve => setTimeout(() => resolve(new File(['c'], 'compressed.png')), 100))
    );

    const formik = createMockFormik();
    render(<ImageUpload formik={formik as any} />);

    const file = new File(['a'], 'test.png', { type: 'image/png' });
    const hiddenInputs = document.querySelectorAll('input[type="file"]');
    const input = hiddenInputs[0] as HTMLInputElement;

    await userEvent.upload(input, file);

    expect(screen.getByText('Processing images...')).toBeInTheDocument();
    expect(document.querySelector('.spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Processing images...')).not.toBeInTheDocument();
    });
  });

  it('enforces 10 image limit', async () => {
    (validateImageFile as Mock).mockReturnValue(null);
    (compressImage as Mock).mockResolvedValue(new File(['c'], 'compressed.png'));

    const existingFiles = Array.from(
      { length: 8 },
      (_, i) => new File(['existing'], `existing${i}.png`, { type: 'image/png' })
    );

    const formik = createMockFormik({ values: { imageFiles: existingFiles } });
    render(<ImageUpload formik={formik as any} />);

    const newFiles = Array.from(
      { length: 5 },
      (_, i) => new File(['new'], `new${i}.png`, { type: 'image/png' })
    );

    const hiddenInputs = document.querySelectorAll('input[type="file"]');
    const input = hiddenInputs[0] as HTMLInputElement;

    await userEvent.upload(input, newFiles);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Możesz dodać maksymalnie 10 zdjęć');
      expect(formik.setFieldValue).toHaveBeenCalledWith(
        'imageFiles',
        expect.arrayContaining([...existingFiles, expect.any(File), expect.any(File)])
      );
    });
  });
});
