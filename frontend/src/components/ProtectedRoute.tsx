/**
 * ProtectedRoute Component
 * 
 * A wrapper component that protects routes requiring authentication.
 * Redirects users to the login page (/manage) if they are not authenticated
 * as determined by the presence of an authToken in localStorage.
 * 
 * @component
 * @example
 * ```tsx
 * <Route path="/manage/customers" element={<ProtectedRoute><ManageCustomers /></ProtectedRoute>} />
 * ```
 */
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  /** The child components to render if authenticated */
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Check for authentication token in localStorage
  const token = localStorage.getItem('authToken');

  if (!token) {
    // Redirect to login page if no token exists
    return <Navigate to="/manage" replace />; // Redirect to /manage
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;