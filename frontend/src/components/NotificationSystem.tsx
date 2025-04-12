import React, { useState, useEffect } from 'react';
import { NotificationType } from '../context/AppContext';
import '../css/Notification.css';

interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
}

const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // Listen for notification events from AppContext
    const handleNotification = (event: Event) => {
      if (event instanceof CustomEvent) {
        const { message, type } = event.detail;
        const id = Date.now().toString();
        
        setNotifications(prev => [...prev, { id, message, type }]);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          dismissNotification(id);
        }, 5000);
      }
    };

    document.addEventListener('cafe-fausse-notification', handleNotification);
    return () => {
      document.removeEventListener('cafe-fausse-notification', handleNotification);
    };
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`notification ${notification.type}`}
          role="alert"
        >
          <p>{notification.message}</p>
          <button 
            className="close-button" 
            onClick={() => dismissNotification(notification.id)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;