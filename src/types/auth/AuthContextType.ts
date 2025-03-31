export interface AuthContextType {
    isAuthenticated: boolean;
    setIsAuthenticated: (value: boolean) => void;
    checkIsAuthenticated: () => boolean;
    logout: () => void;
}