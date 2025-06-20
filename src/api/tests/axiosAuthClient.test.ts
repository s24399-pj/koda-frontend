import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';

const mockAxiosInstance = {
  interceptors: {
    request: {
      use: vi.fn(),
    },
    response: {
      use: vi.fn(),
    },
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
};

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
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

describe('AuthAxiosClient', () => {
  const mockBaseUrl = 'http://test-api.com';
  let mockLocationHref = '';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_URL', mockBaseUrl);
    console.error = vi.fn();

    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: {
        href: mockLocationHref,
      },
    });

    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should create axios instance with correct config', async () => {
    const axios = await import('axios');
    await import('../axiosAuthClient');

    expect(axios.default.create).toHaveBeenCalledWith({
      baseURL: mockBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  test('should setup interceptors', async () => {
    await import('../axiosAuthClient');

    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
  });

  test('should add authorization header when token exists', async () => {
    await import('../axiosAuthClient');

    const requestUseCalls = mockAxiosInstance.interceptors.request.use.mock.calls;
    const requestSuccessHandler = requestUseCalls[0][0];

    const mockToken = 'test-token-123';
    vi.mocked(localStorage.getItem).mockReturnValueOnce(mockToken);

    const config: InternalAxiosRequestConfig = {
      headers: {} as any,
      method: 'get',
      url: '/test',
    } as InternalAxiosRequestConfig;

    const result = requestSuccessHandler(config);

    expect(localStorage.getItem).toHaveBeenCalledWith('accessToken');
    expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
  });

  test('should handle 401 error', async () => {
    await import('../axiosAuthClient');

    const responseUseCalls = mockAxiosInstance.interceptors.response.use.mock.calls;
    const responseErrorHandler = responseUseCalls[0][1];

    const mockError: AxiosError = {
      name: 'AxiosError',
      message: 'Unauthorized',
      response: {
        status: 401,
        data: { error: 'Unauthorized' },
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any,
      },
      isAxiosError: true,
      toJSON: () => ({}),
      config: {} as any,
    };

    await expect(responseErrorHandler(mockError)).rejects.toBe(mockError);

    expect(console.error).toHaveBeenCalledWith('Authentication error:', { error: 'Unauthorized' });
    expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
    expect(window.location.href).toBe('/user/login');
  });

  test('should use custom logout handler', async () => {
    const { setLogoutFunction } = await import('../axiosAuthClient');
    const customLogoutHandler = vi.fn();

    setLogoutFunction(customLogoutHandler);

    const responseUseCalls = mockAxiosInstance.interceptors.response.use.mock.calls;
    const responseErrorHandler = responseUseCalls[0][1];

    const mockError: AxiosError = {
      name: 'AxiosError',
      message: 'Unauthorized',
      response: {
        status: 401,
        data: { error: 'Unauthorized' },
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any,
      },
      isAxiosError: true,
      toJSON: () => ({}),
      config: {} as any,
    };

    await expect(responseErrorHandler(mockError)).rejects.toBe(mockError);

    expect(customLogoutHandler).toHaveBeenCalled();
    expect(localStorage.removeItem).not.toHaveBeenCalled();
  });

  test('should export axios instance', async () => {
    const authClient = await import('../axiosAuthClient');

    expect(authClient.default).toBe(mockAxiosInstance);
  });
});
