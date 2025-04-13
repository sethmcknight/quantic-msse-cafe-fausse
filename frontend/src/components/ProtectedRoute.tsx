/**
 * ProtectedRoute Component
 * 
 * A wrapper component that protects routes requiring authentication.
 * Redirects users to the login page (/manage) if they are not authenticated
 * as determined by the presence of an authToken in localStorage.
 * Saves the current path to localStorage for redirect after login.
 * 
 * @component
 * @example
 * ```tsx
 * <Route path="/manage/customers" element={<ProtectedRoute><ManageCustomers /></ProtectedRoute>} />
 * ```
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  /** The child components to render if authenticated */
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Get the current location
  const location = useLocation();
  // Check for authentication token in localStorage
  const token = localStorage.getItem('authToken');

  if (!token) {
    // Store the current path for redirection after login
    localStorage.setItem('redirectPath', location.pathname);
    // Redirect to login page if no token exists
    return <Navigate to="/manage" replace />; // Redirect to /manage
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;