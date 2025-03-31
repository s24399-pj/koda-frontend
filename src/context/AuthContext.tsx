import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";

// Interfejs kontekstu autoryzacji
interface AuthContextType {
    isAuthenticated: boolean;
    setIsAuthenticated: (value: boolean) => void;
    checkIsAuthenticated: () => boolean;
}

// Utworzenie kontekstu z domyślnymi wartościami
const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    setIsAuthenticated: () => {},
    checkIsAuthenticated: () => false,
});

// Hook do korzystania z kontekstu
export const useAuth = () => useContext(AuthContext);

// Props dla dostawcy kontekstu
interface AuthProviderProps {
    children: ReactNode;
}

// Dostawca kontekstu autoryzacji
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // Funkcja sprawdzająca czy użytkownik jest zalogowany
    const checkIsAuthenticated = (): boolean => {
        const token = localStorage.getItem("accessToken");
        return !!token;
    };

    const [isAuthenticatedState, setIsAuthenticated] = useState<boolean>(checkIsAuthenticated());

    // Inicjalizacja stanu autoryzacji
    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(checkIsAuthenticated());
        };

        // Sprawdź przy montowaniu komponentu
        checkAuth();

        // Nasłuchiwanie na zmiany w localStorage
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

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: isAuthenticatedState,
                setIsAuthenticated,
                checkIsAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;