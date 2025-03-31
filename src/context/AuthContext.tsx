import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import {AuthContextType} from "../types/auth/AuthContextType.ts";

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    setIsAuthenticated: () => {},
    checkIsAuthenticated: () => false,
    logout: () => {},
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

    const logout = async (): Promise<void> => {
        try {
            await logout();
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Logout error:", error);
            setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(checkIsAuthenticated());
        };

        checkAuth();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "accessToken") {
                checkAuth();
            }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const value = {
        isAuthenticated,
        setIsAuthenticated,
        checkIsAuthenticated,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;