import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AuthContextType } from '../types/auth/AuthContextType.ts';
import authClient, { setLogoutFunction } from '../api/axiosAuthClient';

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  checkIsAuthenticated: () => false,
  logout: () => Promise.resolve(),
  validateToken: () => Promise.resolve(false),
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Decodes JWT token and checks if it's not expired
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
 * Get token expiration time in milliseconds
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const checkIsAuthenticated = (): boolean => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      return false;
    }

    // Local validation before making API calls
    const valid = isTokenValid(token);
    if (!valid) {
      localStorage.removeItem('accessToken');
      return false;
    }

    return true;
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(checkIsAuthenticated());
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const validateToken = async (): Promise<boolean> => {
    if (!checkIsAuthenticated()) {
      return false;
    }

    try {
      const response = await authClient.get(`/auth/validate`);
      return response.status === 200;
    } catch (error) {
      console.error('Token validation failed:', error);
      // Don't auto-logout here - let axiosAuthClient handle it
      return false;
    }
  };

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

  const handleAuthError = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  useEffect(() => {
    // Register the auth error handler with axiosAuthClient
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

      // Time until token expires (minus 30 seconds buffer)
      const timeUntilExpiry = Math.max(0, expirationTime - Date.now() - 30000);

      tokenExpirationTimeout = window.setTimeout(() => {
        console.log('Token expired, logging out...');
        handleAuthError();
      }, timeUntilExpiry);
    };

    // Setup expiration check only if we have a valid token
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

  // Don't render until we've initialized
  if (!isInitialized) {
    return null;
  }

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    checkIsAuthenticated,
    logout,
    validateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
