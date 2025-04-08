import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authApi } from '../utils/adminApi';

// Define the auth state interface
interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Define the user interface
interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

// Define the context interface
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  currentUser: User | null; // Add this line
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: async () => {},
  clearError: () => {},
  currentUser: null, // Add this line
});

// Custom hook for using the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isAdmin: false,
    user: null,
    isLoading: true,
    error: null,
  });

  // Check if user is already authenticated when the app loads
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('AuthContext: Checking authentication...'); // Debugging auth check
        const response = await authApi.getProfile();
        console.log('AuthContext: /api/auth/me response:', response); // Log response
        if (response.success) {
          setAuthState({
            isAuthenticated: true,
            isAdmin: response.user.role === 'admin',
            user: response.user,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.log('AuthContext: Error during auth check:', error); // Log error
        setAuthState({
          ...authState,
          isLoading: false,
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setAuthState({
      ...authState,
      isLoading: true,
      error: null,
    });

    try {
      console.log('AuthContext: Logging in...'); // Debugging login
      const response = await authApi.login(username, password);
      console.log('AuthContext: /api/auth/login response:', response); // Log response
      if (response.success) {
        setAuthState({
          isAuthenticated: true,
          isAdmin: response.user.role === 'admin',
          user: response.user,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState({
          ...authState,
          error: response.message || 'Login failed',
          isLoading: false,
        });
      }
    } catch (error: any) {
      console.log('AuthContext: Error during login:', error); // Log error
      setAuthState({
        ...authState,
        error: error.message || 'An error occurred during login',
        isLoading: false,
      });
    }
  };

  const logout = async () => {
    setAuthState({
      ...authState,
      isLoading: true,
    });

    try {
      await authApi.logout();
      setAuthState({
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState({
        ...authState,
        error: error.message,
        isLoading: false,
      });
    }
  };

  const clearError = useCallback(() => {
    setAuthState({
      ...authState,
      error: null,
    });
  }, []);

  const value = {
    ...authState,
    login,
    logout,
    clearError,
    currentUser: authState.user, // Map the user from authState to currentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;