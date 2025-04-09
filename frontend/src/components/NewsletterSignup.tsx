import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { newsletterApi } from '../utils/api';
import '../css/NewsletterSignup.css';

interface NewsletterSignupProps {
  className?: string;
  footerMode?: boolean;
}

const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ className, footerMode }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { showNotification } = useAppContext();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const validateEmail = (email: string): boolean => {
    // Simple email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!validateEmail(email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await newsletterApi.subscribe(email);
      
      if (response.success) {
        setIsSubscribed(true);
        showNotification(response.message || 'Thanks for subscribing to our newsletter!', 'success');
        setEmail('');
      } else {
        showNotification(response.message || 'Error subscribing to newsletter', 'error');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      showNotification('Failed to subscribe. Please try again later.', 'error');
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