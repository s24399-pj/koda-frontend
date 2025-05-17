import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AuthRequiredPage from '../../pages/AuthRequired/AuthRequired';

interface RequireAuthProps {
  children: JSX.Element;
  allowRedirect?: boolean;
}

/**
 * A wrapper component that protects routes requiring authentication
 * @param children - The component to render if authenticated
 * @param allowRedirect - If true, show auth required page; if false, render children with isAuthenticated=false
 */
const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  allowRedirect = true 
}) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated && allowRedirect) {
    // Show auth required page instead of redirecting
    return <AuthRequiredPage />;
  }

  // Pass the authentication status to the child component
  return React.cloneElement(children, { isAuthenticated });
};

export default RequireAuth;