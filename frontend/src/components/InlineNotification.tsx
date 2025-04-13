/**
 * InlineNotification Component
 * 
 * A reusable notification component that displays messages with different
 * visual styles based on their type (success, error, info).
 * Features configurable auto-dismiss functionality and optional status symbols.
 */
import React, { useState, useEffect } from 'react';
import '../css/InlineNotification.css';

/**
 * Types of notifications that can be displayed
 */
type NotificationType = 'success' | 'error' | 'info';

/**
 * Props for the InlineNotification component
 */
interface InlineNotificationProps {
  /** The message to display in the notification */
  message: string;
  /** The type of notification which determines its styling */
  type: NotificationType;
  /** Duration in milliseconds before auto-dismissing (0 to disable) */
  duration?: number;
  /** Optional callback function when notification is dismissed */
  onDismiss?: () => void;
  /** Whether to show a visual symbol indicating the notification type */
  showSymbol?: boolean;
}

/**
 * InlineNotification Component
 * 
 * Displays temporary notifications to users with appropriate styling.
 * Can be configured to auto-dismiss after a specified duration or remain
 * until manually dismissed.
 * 
 * @component
 * @example
 * ```tsx
 * <InlineNotification 
 *   message="Your changes have been saved!" 
 *   type="success" 
 *   duration={3000} 
 *   showSymbol={true}
 * />
 * ```
 */
const InlineNotification: React.FC<InlineNotificationProps> = ({ 
  message, 
  type, 
  duration = 5000, 
  onDismiss,
  showSymbol = false
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Reset visibility when message changes
    setVisible(true);
    
    // Auto-dismiss after specified duration
    let timeoutId: NodeJS.Timeout | undefined;
    if (duration > 0) {
      timeoutId = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, duration);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [message, duration, onDismiss]);

  if (!visible || !message) return null;

  /**
   * Handles the manual closing of the notification
   */
  const handleClose = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  /**
   * Returns the appropriate symbol based on notification type
   * 
   * @returns The symbol character string or empty string if symbols are disabled
   */
  const getSymbol = () => {
    if (!showSymbol) return '';
    
    switch(type) {
      case 'success':
        return '✓ ';
      case 'error':
        return '✗ ';
      case 'info':
        return 'ℹ ';
      default:
        return '';
    }
  };

  return (
    <div className={`inline-notification ${type}`} role="alert">
      <p>{getSymbol()}{message}</p>
      <button 
        className="close-button" 
        onClick={handleClose} 
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default InlineNotification;