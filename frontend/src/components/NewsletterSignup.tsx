/**
 * NewsletterSignup Component
 * 
 * A responsive form component that allows users to subscribe to the Café Fausse newsletter.
 * This component can be displayed in two modes: as a standalone form or in footer mode.
 * It includes validation, error handling, and success feedback.
 */
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { newsletterApi } from '../utils/api';
import '../css/NewsletterSignup.css';

/**
 * Props for the NewsletterSignup component
 */
interface NewsletterSignupProps {
  /** Optional CSS class name to apply to the component */
  className?: string;
  /** Whether the component is displayed in the footer (compact mode) */
  footerMode?: boolean;
}

/**
 * NewsletterSignup Component
 * 
 * Provides a form for users to subscribe to the restaurant's newsletter.
 * Handles email validation, API communication, and displays appropriate feedback.
 * 
 * @component
 */
const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ className, footerMode }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { showNotification } = useAppContext();

  /**
   * Updates the email state when the input field changes
   * 
   * @param e - Change event from email input field
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  /**
   * Validates the email format using regex
   * 
   * @param email - The email address to validate
   * @returns Boolean indicating if the email is valid
   */
  const validateEmail = (email: string): boolean => {
    // Simple email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  /**
   * Handles form submission for newsletter subscription
   * 
   * Validates the email, makes API request to subscribe, and handles
   * success and error states appropriately.
   * 
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(''); // Clear any previous error message
    
    try {
      const response = await newsletterApi.subscribe(email);
      
      if (response.success) {
        setIsSubscribed(true);
        showNotification(response.message || 'Thanks for subscribing to our newsletter!', 'success');
        setEmail('');
      } else {
        if (response.message && response.message.toLowerCase().includes('invalid email format')) {
          setErrorMessage('Please enter a valid email address');
        } else {
          setErrorMessage(response.message || 'Error subscribing to newsletter');
        }
      }
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      
      // Check if error has response data from API
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        // Handle the specific case for invalid email format
        if (errorData.message && errorData.message.toLowerCase().includes('invalid email format')) {
          setErrorMessage('Please enter a valid email address');
        } else {
          setErrorMessage(errorData.message || 'Error subscribing to newsletter');
        }
      } else {
        setErrorMessage('Failed to subscribe. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`newsletter-signup ${className || ''}`}>
      {/* Only show heading and description if not in footer mode */}
      {!footerMode && (
        <>
          <h3>Subscribe to Our Newsletter</h3>
          <p>Stay updated with our latest events, seasonal menus, and special promotions.</p>
        </>
      )}
      
      {isSubscribed ? (
        <div className="subscription-success">
          <p>Thank you for subscribing!</p>
          <button 
            className="subscribe-again" 
            onClick={() => setIsSubscribed(false)}
          >
            Subscribe another email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="newsletter-form">
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Your email address"
              value={email}
              onChange={handleEmailChange}
              required
              aria-label="Email address for newsletter"
            />
            <button 
              type="submit"
              className="subscribe-button"
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
          {errorMessage && <p className="error-text">{errorMessage}</p>}
          {!footerMode && (
            <small className="privacy-note">
              We respect your privacy and will never share your information.
            </small>
          )}
        </form>
      )}
    </div>
  );
};

export default NewsletterSignup;