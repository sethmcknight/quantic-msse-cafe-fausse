import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('authToken'); // Check if the user is authenticated

  if (!isAuthenticated) {
    // Store the intended path in localStorage
    localStorage.setItem('redirectPath', location.pathname);
    return <Navigate to="/manage" replace />; // Redirect to /manage
  }

  return <>{children}</>; // Render the protected content if authenticated
};

export default PrivateRoute;