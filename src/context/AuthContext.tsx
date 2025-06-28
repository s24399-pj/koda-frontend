import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AuthContextType } from '../types/auth/AuthContextType.ts';
import authClient, { setLogoutFunction } from '../api/axiosAuthClient';

/**
 * Creates a context to provide authentication state and utilities throughout the app.
 */
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  checkIsAuthenticated: () => false,
  logout: () => Promise.resolve(),
  validateToken: () => Promise.resolve(false),
});

/**
 * Custom hook to access authentication context.
 *
 * @returns {AuthContextType} The current authentication context value.
 */
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Checks if a JWT token is valid by decoding and verifying its expiration time.
 *
 * @param {string} token - The JWT token to validate.
 * @returns {boolean} True if the token is not expired and properly formatted.
 */
const isTokenValid = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    if (!payload.exp) {
      return true;
    }

    const expirationTime = payload.exp * 1000;
    return Date.now() < expirationTime;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return false;
  }
};

/**
 * Extracts the expiration timestamp from a JWT token.
 *
 * @param {string} token - The JWT token to decode.
 * @returns {number | null} Expiration time in milliseconds, or null if parsing fails.
 */
const getTokenExpirationTime = (token: string): number | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    if (!payload.exp) {
      return null;
    }

    return payload.exp * 1000;
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
};

/**
 * AuthProvider component manages authentication state and makes it available
 * to all child components via React Context.
 *
 * @param {AuthProviderProps} props - React children elements.
 * @returns {JSX.Element | null} Auth context provider, or null while initializing.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  /**
   * Checks if the user is authenticated based on token presence and validity.
   *
   * @returns {boolean} True if the user has a valid token.
   */
  const checkIsAuthenticated = (): boolean => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      return false;
    }

    const valid = isTokenValid(token);
    if (!valid) {
      localStorage.removeItem('accessToken');
      return false;
    }

    return true;
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(checkIsAuthenticated());
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  /**
   * Sends a request to the backend to validate the access token.
   *
   * @returns {Promise<boolean>} True if the token is valid according to the server.
   */
  const validateToken = async (): Promise<boolean> => {
    if (!checkIsAuthenticated()) {
      return false;
    }

    try {
      const response = await authClient.get(`/auth/validate`);
      return response.status === 200;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  /**
   * Logs the user out by notifying the backend and clearing local storage.
   */
  const logout = async (): Promise<void> => {
    try {
      if (checkIsAuthenticated()) {
        await authClient.post(`/auth/logout`, {});
      }
    } catch (error) {
      console.error('Logout request error:', error);
    }

    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  /**
   * Handles logout triggered by token expiration or authentication errors.
   */
  const handleAuthError = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  useEffect(() => {
    // Register logout handler to be triggered from axios interceptors
    setLogoutFunction(handleAuthError);

    const initializeAuth = () => {
      const authenticated = checkIsAuthenticated();
      setIsAuthenticated(authenticated);
      setIsInitialized(true);
    };

    initializeAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        const authenticated = checkIsAuthenticated();
        setIsAuthenticated(authenticated);
      }
    };

    let tokenExpirationTimeout: number | null = null;

    const setupExpirationCheck = () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const expirationTime = getTokenExpirationTime(token);
      if (!expirationTime) return;

      if (tokenExpirationTimeout) {
        window.clearTimeout(tokenExpirationTimeout);
      }

      // Check 30 seconds before expiration
      const timeUntilExpiry = Math.max(0, expirationTime - Date.now() - 30000);

      tokenExpirationTimeout = window.setTimeout(() => {
        console.log('Token expired, logging out...');
        handleAuthError();
      }, timeUntilExpiry);
    };

    if (checkIsAuthenticated()) {
      setupExpirationCheck();
    }

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (tokenExpirationTimeout) {
        window.clearTimeout(tokenExpirationTimeout);
      }
    };
  }, []);

  // Avoid rendering children until auth status is initialized
  if (!isInitialized) {
    return null;
  }

  const value: AuthContextType = {
    isAuthenticated,
    setIsAuthenticated,
    checkIsAuthenticated,
    logout,
    validateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
