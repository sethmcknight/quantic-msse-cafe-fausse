import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../css/AdminPanel.css';

const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, error, clearError } = useAuth();

  // Get the return URL from location state or default to dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin/dashboard';

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    console.log('isAuthenticated:', isAuthenticated); // Debugging isAuthenticated state
    console.log('from:', from); // Debugging redirection path
    console.log('LoginPage: isAuthenticated:', isAuthenticated); // Debugging isAuthenticated state
    console.log('LoginPage: from:', from); // Debugging redirection path
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Clear any previous errors when this component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!username.trim()) {
      setSubmitError('Username is required');
      return;
    }
    
    if (!password) {
      setSubmitError('Password is required');
      return;
    }
    
    try {
      setSubmitError(null);
      setIsSubmitting(true);
      
      // Call login function from AuthContext
      await login(username, password);
      
      // Navigate to return URL (will happen in useEffect when isAuthenticated changes)
    } catch (err: any) {
      // Error handling is done in AuthContext, but we can add specific UI feedback here
      setSubmitError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="login-header">
          <h1>Café Fausse</h1>
          <h2>Admin Login</h2>
        </div>
        
        {(error || submitError) && (
          <div className="login-error">
            {error || submitError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>&copy; {new Date().getFullYear()} Café Fausse - Staff Portal</p>
          <a href="/" className="back-link">Return to Website</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;