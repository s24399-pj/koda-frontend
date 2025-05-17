import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { AuthContextType } from "../types/auth/AuthContextType.ts";
import axios from "axios";

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const checkIsAuthenticated = (): boolean => {
        const token = localStorage.getItem("accessToken");
        return !!token;
    };

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(checkIsAuthenticated());

    const isProtectedRoute = (): boolean => {
        return window.location.pathname.startsWith('/user/');
    };

    const handleAuthFailure = (): void => {
        if (isProtectedRoute()) {
            window.location.href = '/';
        } else {
            window.location.reload();
        }
    };

    const validateToken = async (): Promise<boolean> => {
        const token = localStorage.getItem("accessToken");
        
        if (!token) {
            return false;
        }
        
        try {
            const response = await axios.get(`${API_BASE_URL}/auth/validate`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            return response.status === 200;
        } catch (error) {
            console.error("Token validation failed:", error);
            localStorage.removeItem("accessToken");
            setIsAuthenticated(false);
            handleAuthFailure();
            
            return false;
        }
    };

    const logout = async (): Promise<void> => {
        const token = localStorage.getItem("accessToken");
        
        if (token) {
            try {
                // Send request to backend to invalidate the token
                await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.error("Logout request error:", error);
            }
        }
        
        // Always clear local storage and set authenticated to false
        localStorage.removeItem("accessToken");
        setIsAuthenticated(false);
        
        window.location.href = '/';
    };

    useEffect(() => {
        const checkAuth = async () => {
            const authenticated = checkIsAuthenticated();
            
            if (authenticated) {
                // Validate token on mount and when token exists
                const isValid = await validateToken();
                setIsAuthenticated(isValid);
                
                if (!isValid && isProtectedRoute()) {
                    window.location.href = '/';
                }
            } else {
                setIsAuthenticated(false);
                
                if (isProtectedRoute()) {
                    window.location.href = '/';
                }
            }
        };

        checkAuth();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "accessToken") {
                checkAuth();
            }
        };

        const tokenValidationInterval = setInterval(() => {
            if (checkIsAuthenticated()) {
                validateToken();
            } else if (isProtectedRoute()) {
                window.location.href = '/';
            }
        }, 5 * 60 * 1000);

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            clearInterval(tokenValidationInterval);
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

export default AuthContext;