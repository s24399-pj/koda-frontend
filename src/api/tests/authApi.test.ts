import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { RegisterCredentials } from '../../types/auth/RegisterCredentials';
import { LoginCredentials } from '../../types/auth/LoginCredentials';
import { AuthResponse } from '../../types/auth/AuthResponse';
import { login, logout, register } from '../authApi';

const { mockPost, mockGet, mockAxiosAuthGet } = vi.hoisted(() => {
  return {
    mockPost: vi.fn(),
    mockGet: vi.fn(),
    mockAxiosAuthGet: vi.fn(),
  };
});

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: mockPost,
      get: mockGet,
    })),
  },
}));

vi.mock('../axiosAuthClient', () => ({
  default: {
    get: mockAxiosAuthGet,
  },
}));

vi.stubGlobal('localStorage', {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
});

describe('AuthService', () => {
  const mockApiUrl = 'http://test-api.com';
  const originalConsoleError = console.error;

  beforeAll(() => {
    console.error = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_URL', mockApiUrl);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  describe('register', () => {
    const mockCredentials: RegisterCredentials = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    test('should successfully register a user', async () => {
      mockPost.mockResolvedValueOnce({ data: {} });

      await register(mockCredentials);

      expect(mockPost).toHaveBeenCalledWith('/api/v1/external/users/register', mockCredentials);
      expect(console.error).not.toHaveBeenCalled();
    });

    test('should handle registration error', async () => {
      const mockError = new Error('Registration failed');
      mockPost.mockRejectedValueOnce(mockError);

      await expect(register(mockCredentials)).rejects.toThrow('Registration failed');

      expect(console.error).toHaveBeenCalledWith('Register error:', mockError);
    });
  });

  describe('login', () => {
    const mockCredentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockAuthResponse: AuthResponse = {
      accessToken: 'mock-access-token',
    };

    test('should successfully login and store access token', async () => {
      mockPost.mockResolvedValueOnce({ data: mockAuthResponse });

      const result = await login(mockCredentials);

      expect(mockPost).toHaveBeenCalledWith('/api/v1/external/users/login', mockCredentials);
      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'mock-access-token');
      expect(result).toEqual(mockAuthResponse);
      expect(console.error).not.toHaveBeenCalled();
    });

    test('should handle login error and not store token', async () => {
      const mockError = new Error('Invalid credentials');
      mockPost.mockRejectedValueOnce(mockError);

      await expect(login(mockCredentials)).rejects.toThrow('Invalid credentials');

      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Login error:', mockError);
    });

    test('should handle network error', async () => {
      const networkError = new Error('Network Error');
      mockPost.mockRejectedValueOnce(networkError);

      await expect(login(mockCredentials)).rejects.toThrow('Network Error');

      expect(console.error).toHaveBeenCalledWith('Login error:', networkError);
    });
  });

  describe('logout', () => {
    test('should successfully logout and remove access token', async () => {
      mockAxiosAuthGet.mockResolvedValueOnce({ data: {} });

      await logout();

      expect(mockAxiosAuthGet).toHaveBeenCalledWith('/api/v1/auth/logout');
      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(console.error).not.toHaveBeenCalled();
    });

    test('should remove token even if logout request fails', async () => {
      const mockError = new Error('Logout failed');
      mockAxiosAuthGet.mockRejectedValueOnce(mockError);

      await logout();

      expect(mockAxiosAuthGet).toHaveBeenCalledWith('/api/v1/auth/logout');
      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(console.error).toHaveBeenCalledWith('Logout error:', mockError);
    });

    test('should handle network error during logout', async () => {
      const networkError = new Error('Network Error');
      mockAxiosAuthGet.mockRejectedValueOnce(networkError);

      await logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(console.error).toHaveBeenCalledWith('Logout error:', networkError);
    });

    test('should always remove token from localStorage', async () => {
      mockAxiosAuthGet.mockResolvedValueOnce({ data: {} });
      await logout();
      expect(localStorage.removeItem).toHaveBeenCalledTimes(1);

      vi.clearAllMocks();

      mockAxiosAuthGet.mockRejectedValueOnce(new Error());
      await logout();
      expect(localStorage.removeItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling patterns', () => {
    test('should preserve original error when rethrowing', async () => {
      const originalError = {
        response: {
          status: 400,
          data: { message: 'Bad Request' },
        },
      };

      mockPost.mockRejectedValueOnce(originalError);

      try {
        await register({} as RegisterCredentials);
      } catch (error) {
        expect(error).toBe(originalError);
      }
    });
  });
});
