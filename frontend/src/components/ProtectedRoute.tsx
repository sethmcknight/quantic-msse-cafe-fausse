import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    return <Navigate to="/manage" replace />; // Redirect to /manage
  }

  return <>{children}</>;
};

export default ProtectedRoute;