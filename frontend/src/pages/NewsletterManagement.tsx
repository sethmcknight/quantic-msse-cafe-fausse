import React, { useEffect, useState } from 'react';
import '../css/NewsletterManagement.css';

interface NewsletterSubscriber {
  id: number;
  name: string;
  email: string;
  subscribed_date: string;
}

const NewsletterManagement: React.FC = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);

  useEffect(() => {
    // Fetch newsletter subscribers from the backend API
    fetch('/api/newsletter/subscribers')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch newsletter subscribers');
        }
        return response.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.subscribers)) {
          setSubscribers(data.subscribers);
        } else {
          console.error('Unexpected data format:', data);
          setSubscribers([]);
        }
      })
      .catch(error => {
        console.error('Error fetching newsletter subscribers:', error);
        setSubscribers([]);
      });
  }, []);

  return (
    <div className="newsletter-management">
      <h1>Newsletter Management</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Subscribed Date</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map(subscriber => (
            <tr key={subscriber.id}>
              <td>{subscriber.id}</td>
              <td>{subscriber.email}</td>
              <td>{new Date(subscriber.subscribed_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NewsletterManagement;