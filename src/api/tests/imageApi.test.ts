import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteImage,
  ImageUploadResponse,
  uploadMultipleImages,
  uploadMultipleImagesWithoutOffer,
  validateImageFile,
} from '../imageApi';

vi.stubGlobal('import.meta', { env: { VITE_API_URL: 'http://localhost:8137' } });

const { mockPost, mockDelete, mockIsAxiosError } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockDelete: vi.fn(),
  mockIsAxiosError: vi.fn(),
}));

vi.mock('axios', () => {
  const mockAxios = {
    post: mockPost,
    delete: mockDelete,
    isAxiosError: mockIsAxiosError,
  };
  return {
    default: mockAxios,
    isAxiosError: mockIsAxiosError,
  };
});

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};

vi.stubGlobal('localStorage', localStorageMock);

describe('imageApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('uploadMultipleImages', () => {
    it('POSTs to /images/:offerId/upload without auth when no token', async () => {
      const mockResponse: ImageUploadResponse[] = [
        {
          id: '1',
          url: '/u.png',
          filename: 'a.png',
          size: 123,
          contentType: 'image/png',
          sortOrder: 0,
        },
      ];

      mockPost.mockResolvedValueOnce({
        data: mockResponse,
      });

      const files = [new File(['a'], 'a.png', { type: 'image/png' })];
      const result = await uploadMultipleImages('offer123', files);

      expect(mockPost).toHaveBeenCalledTimes(1);
      const call = mockPost.mock.calls[0];
      const [url, formData, config] = call;

      expect(url).toBe('http://localhost:8137/api/v1/images/offer123/upload');
      expect(formData).toBeInstanceOf(FormData);
      expect(config).toBeDefined();
      expect(config.headers).toEqual({});
      expect(config.timeout).toBe(30000);
      expect(typeof config.onUploadProgress).toBe('function');

      expect(result).toEqual(mockResponse);
      expect(result[0].id).toBe('1');
    });

    it('includes Authorization header when token is present', async () => {
      localStorageMock.getItem.mockReturnValue('tok123');
      mockPost.mockResolvedValueOnce({ data: [] });

      await uploadMultipleImages('off2', []);
      const cfg = mockPost.mock.calls[0][2];

      expect(cfg.headers).toMatchObject({ Authorization: 'Bearer tok123' });
    });

    it('throws server error message on axios error with response', async () => {
      const error = new Error('Bad');
      Object.defineProperty(error, 'isAxiosError', { value: true });
      Object.defineProperty(error, 'response', {
        value: { data: { message: 'Bad' }, status: 400, statusText: 'Bad' },
      });

      mockPost.mockRejectedValueOnce(error);
      mockIsAxiosError.mockReturnValueOnce(true);

      await expect(uploadMultipleImages('x', [])).rejects.toThrow('Bad');
    });

    it('throws network error when no response received', async () => {
      const error = new Error('Network Error');
      Object.defineProperty(error, 'isAxiosError', { value: true });
      Object.defineProperty(error, 'request', { value: {} });

      mockPost.mockRejectedValueOnce(error);
      mockIsAxiosError.mockReturnValueOnce(true);

      await expect(uploadMultipleImages('x', [])).rejects.toThrow(
        'No response from server. Check your internet connection.'
      );
    });

    it('throws config error on axios config issues', async () => {
      const error = new Error('Oops config');
      Object.defineProperty(error, 'isAxiosError', { value: true });
      Object.defineProperty(error, 'message', { value: 'Oops config' });

      mockPost.mockRejectedValueOnce(error);
      mockIsAxiosError.mockReturnValueOnce(true);

      await expect(uploadMultipleImages('x', [])).rejects.toThrow(
        'Configuration error: Oops config'
      );
    });
  });

  describe('uploadMultipleImagesWithoutOffer', () => {
    it('POSTs to /images/upload', async () => {
      const mockResponse: ImageUploadResponse[] = [
        {
          id: 'a',
          url: '',
          filename: '',
          size: 0,
          contentType: '',
          sortOrder: 0,
        },
      ];

      mockPost.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await uploadMultipleImagesWithoutOffer([]);
      expect(mockPost).toHaveBeenCalledTimes(1);

      const call = mockPost.mock.calls[0];
      expect(call[0]).toBe('http://localhost:8137/api/v1/images/upload');
      expect(call[1]).toBeInstanceOf(FormData);

      const cfg = call[2];
      expect(cfg.headers).toEqual({});
      expect(cfg.timeout).toBe(30000);
      expect(typeof cfg.onUploadProgress).toBe('function');

      expect(result).toEqual(mockResponse);
    });

    it('propagates network error like uploadMultipleImages', async () => {
      const error = new Error('Network Error');
      Object.defineProperty(error, 'isAxiosError', { value: true });
      Object.defineProperty(error, 'request', { value: {} });

      mockPost.mockRejectedValueOnce(error);
      mockIsAxiosError.mockReturnValueOnce(true);

      await expect(uploadMultipleImagesWithoutOffer([])).rejects.toThrow(
        'No response from server. Check your internet connection.'
      );
    });
  });

  describe('deleteImage', () => {
    it('DELETEs the correct URL without auth', async () => {
      mockDelete.mockResolvedValueOnce({});
      await deleteImage('img1');

      const call = mockDelete.mock.calls[0];
      expect(call[0]).toBe('http://localhost:8137/api/v1/images/img1');
      expect(call[1]).toEqual({ headers: {} });
    });

    it('attaches Authorization header when token exists', async () => {
      localStorageMock.getItem.mockReturnValue('abc');
      mockDelete.mockResolvedValueOnce({});

      await deleteImage('img2');
      const cfg = mockDelete.mock.calls[0][1];

      expect(cfg.headers).toMatchObject({ Authorization: 'Bearer abc' });
    });

    it('throws server error message when delete fails', async () => {
      const error = new Error('Delete failed');
      Object.defineProperty(error, 'isAxiosError', { value: true });
      Object.defineProperty(error, 'response', {
        value: { data: { message: 'Delete failed' } },
      });

      mockDelete.mockRejectedValueOnce(error);
      mockIsAxiosError.mockReturnValueOnce(true);

      await expect(deleteImage('x')).rejects.toThrow('Delete failed');
    });

    it('throws network error otherwise', async () => {
      mockDelete.mockRejectedValueOnce(new Error('err'));
      mockIsAxiosError.mockReturnValueOnce(false);

      await expect(deleteImage('x')).rejects.toThrow('Network error while deleting image');
    });
  });

  describe('validateImageFile', () => {
    it('accepts a valid file', () => {
      const f = new File(['1'], 'f.png', { type: 'image/png' });
      Object.defineProperty(f, 'size', { value: 2 * 1024 * 1024 });
      expect(validateImageFile(f)).toBeNull();
    });

    it('rejects unsupported format', () => {
      const f = new File([], 'f.gif', { type: 'image/gif' });
      expect(validateImageFile(f)).toMatch(/Unsupported file format/);
    });

    it('rejects too-large file', () => {
      const f = new File([], 'big.jpg', { type: 'image/jpeg' });
      Object.defineProperty(f, 'size', { value: 6 * 1024 * 1024 });
      expect(validateImageFile(f)).toMatch(/Maximum size: 5MB/);
    });
  });
});
