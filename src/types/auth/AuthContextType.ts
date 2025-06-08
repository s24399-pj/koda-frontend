export interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  checkIsAuthenticated: () => boolean;
  logout: () => Promise<void>;
  validateToken: () => Promise<boolean>;
}
