import React, { useEffect, useState, useMemo } from 'react';
import '../css/NewsletterManagement.css';

interface NewsletterSubscriber {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface SortConfig {
  key: keyof NewsletterSubscriber;
  direction: 'asc' | 'desc';
}

const NewsletterManagement: React.FC = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [emailSearch, setEmailSearch] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

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

  // Format date to "Month day, Year" (e.g., "April 6, 2025")
  const formatDate = (dateString: string): string => {
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown Date';
    }
  };

  // Handle status change and update backend
  const handleStatusChange = (id: number, isActive: boolean) => {
    // Update state locally
    setSubscribers(prevSubscribers =>
      prevSubscribers.map(subscriber =>
        subscriber.id === id ? { ...subscriber, is_active: isActive } : subscriber
      )
    );

    // Send update to backend
    fetch(`/api/newsletter/subscribers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_active: isActive }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update subscriber status');
        }
        return response.json();
      })
      .then(data => {
        console.log('Subscriber status updated successfully:', data);
      })
      .catch(error => {
        console.error('Error updating subscriber status:', error);
        // Revert the local change if the server update fails
        fetch('/api/newsletter/subscribers')
          .then(response => response.json())
          .then(data => {
            if (data.success && Array.isArray(data.subscribers)) {
              setSubscribers(data.subscribers);
            }
          });
      });
  };

  // Handle sorting
  const handleSort = (key: keyof NewsletterSubscriber) => {
    setSortConfig(prevConfig => {
      if (prevConfig && prevConfig.key === key) {
        if (prevConfig.direction === 'asc') {
          return { key, direction: 'desc' };
        } else if (prevConfig.direction === 'desc') {
          return null; // Clear sorting
        }
      }
      return { key, direction: 'asc' };
    });
  };

  // Handle email search change
  const handleEmailSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailSearch(event.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value);
  };

  // Handle date filter change
  const handleDateFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(event.target.value);
  };

  // Clear date filter
  const clearDateFilter = () => {
    setDateFilter('');
  };

  // Clear email search
  const clearEmailSearch = () => {
    setEmailSearch('');
  };

  // Get filtered and sorted subscribers
  const filteredAndSortedSubscribers = useMemo(() => {
    let filtered = subscribers.filter(subscriber => {
      // Apply status filter
      if (statusFilter === 'active' && !subscriber.is_active) return false;
      if (statusFilter === 'inactive' && subscriber.is_active) return false;

      // Apply date filter - match the exact date
      if (dateFilter) {
        // Convert ISO date string to local date string format (YYYY-MM-DD)
        const subscriberDateStr = subscriber.created_at.split('T')[0];
        
        // Now compare date strings directly without timezone complications
        if (subscriberDateStr !== dateFilter) {
          return false;
        }
      }

      // Apply email search filter
      if (emailSearch) {
        return subscriber.email.toLowerCase().includes(emailSearch.toLowerCase());
      }
      return true;
    });

    // Apply sorting
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [subscribers, statusFilter, dateFilter, emailSearch, sortConfig]);

  // Get sort indicator arrow
  const getSortIndicator = (key: keyof NewsletterSubscriber) => {
    if (sortConfig && sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return ' ⇅';
  };

  return (
    <div className="newsletter-management">
      <h1>Newsletter Management</h1>

      <div className="subscribers-count">
        <p>Total: {filteredAndSortedSubscribers.length} subscribers</p>
      </div>

      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('id')}>
              ID{getSortIndicator('id')}
            </th>
            <th onClick={() => handleSort('email')}>
              Email{getSortIndicator('email')}
              <div className="email-search">
                <input
                  type="text"
                  value={emailSearch}
                  onChange={handleEmailSearchChange}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Search emails..."
                />
                {emailSearch && (
                  <button 
                    className="clear-search-filter" 
                    onClick={(e) => {
                      e.stopPropagation();
                      clearEmailSearch();
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </th>
            <th onClick={() => handleSort('created_at')}>
              Subscribed Date{getSortIndicator('created_at')}
              <div className="date-filter">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Filter by date"
                />
                {dateFilter && (
                  <button 
                    className="clear-date-filter" 
                    onClick={(e) => {
                      e.stopPropagation();
                      clearDateFilter();
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </th>
            <th onClick={() => handleSort('is_active')}>
              Status{getSortIndicator('is_active')}
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedSubscribers.map(subscriber => (
            <tr key={subscriber.id}>
              <td>{subscriber.id}</td>
              <td>{subscriber.email}</td>
              <td>{formatDate(subscriber.created_at)}</td>
              <td>
                <select
                  value={subscriber.is_active ? 'Active' : 'Inactive'}
                  onChange={(e) => handleStatusChange(subscriber.id, e.target.value === 'Active')}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NewsletterManagement;