import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * Component that protects routes that require authentication
 * If requireAdmin=true, it also checks if the user has admin role
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { isAuthenticated, isAdmin, isLoading, currentUser } = useAuth();

  console.log('ProtectedRoute: isAuthenticated:', isAuthenticated); // Debugging isAuthenticated state
  console.log('ProtectedRoute: requireAdmin:', requireAdmin); // Debugging requireAdmin prop
  console.log('ProtectedRoute: currentUser:', currentUser); // Debugging currentUser state

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // If admin access is required, check if user is admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // User is authenticated and has proper permissions
  return <>{children}</>;
};

export default ProtectedRoute;