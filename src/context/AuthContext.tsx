import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { AuthContextType } from "../types/auth/AuthContextType.ts";
import authClient, { setLogoutFunction } from "../api/axiosAuthClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8137";

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    setIsAuthenticated: () => {},
    checkIsAuthenticated: () => false,
    logout: () => Promise.resolve(),
    validateToken: () => Promise.resolve(false)
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
    children: ReactNode;
}

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
        console.error("Error parsing JWT token:", error);
        return false;
    }
};

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
        console.error("Error getting token expiration:", error);
        return null;
    }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const checkIsAuthenticated = (): boolean => {
        const token = localStorage.getItem("accessToken");
        
        if (!token) {
            return false;
        }
        
        // Local validation before making API calls
        const valid = isTokenValid(token);
        if (!valid) {
            localStorage.removeItem("accessToken");
            return false;
        }
        
        return true;
    };

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(checkIsAuthenticated());

    const validateToken = async (): Promise<boolean> => {
        if (!checkIsAuthenticated()) {
            return false;
        }
       
        try {
            const response = await authClient.get(`${API_BASE_URL}/auth/validate`);
            return response.status === 200;
        } catch (error) {
            console.error("Token validation failed:", error);
            localStorage.removeItem("accessToken");
            setIsAuthenticated(false);
            return false;
        }
    };

    const logout = async (): Promise<void> => {
        if (checkIsAuthenticated()) {
            try {
                await authClient.post(`${API_BASE_URL}/auth/logout`, {});
            } catch (error) {
                console.error("Logout request error:", error);
            }
        }
       
        localStorage.removeItem("accessToken");
        setIsAuthenticated(false);
       
        window.location.href = '/';
    };

    useEffect(() => {
        // Register the logout function with axiosAuthClient
        setLogoutFunction(logout);
        
        const checkAuth = async () => {
            const authenticated = checkIsAuthenticated();
           
            if (authenticated) {
                const isValid = await validateToken();
                setIsAuthenticated(isValid);
            } else {
                setIsAuthenticated(false);
            }
        };
        
        checkAuth();
        
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "accessToken") {
                checkAuth();
            }
        };
        
        let tokenExpirationTimeout: number | null = null;
        
        const setupExpirationCheck = () => {
            const token = localStorage.getItem("accessToken");
            if (!token) return;
            
            const expirationTime = getTokenExpirationTime(token);
            if (!expirationTime) return;
            
            if (tokenExpirationTimeout) {
                window.clearTimeout(tokenExpirationTimeout);
            }
            
            // Time until token expires (minus 10 seconds buffer)
            const timeUntilExpiry = Math.max(0, expirationTime - Date.now() - 10000);
            
            tokenExpirationTimeout = window.setTimeout(() => {
                checkAuth();
                // After checking, setup next expiration if a new token exists
                setupExpirationCheck();
            }, timeUntilExpiry);
        };
        
        // Initial setup of expiration check
        setupExpirationCheck();
        
        window.addEventListener("storage", handleStorageChange);
        
        return () => {
            window.removeEventListener("storage", handleStorageChange);
            if (tokenExpirationTimeout) {
                window.clearTimeout(tokenExpirationTimeout);
            }
        };
    }, []);

    const value = {
        isAuthenticated,
        setIsAuthenticated,
        checkIsAuthenticated,
        logout,
        validateToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};