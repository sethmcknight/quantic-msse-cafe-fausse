import React, { useState, useEffect } from 'react';
import { adminDashboardApi } from '../../utils/adminApi';
import '../../css/AdminPanel.css';

type DashboardStats = {
  today_reservations: number;
  menu_items: number;
  categories: number;
  customers: number;
  newsletter_subscribers: number;
};

type Reservation = {
  id: number;
  customer_name: string;
  date: string;
  time: string;
  party_size: number;
  table_number: number | null;
  status: string;
};

const AdminDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await adminDashboardApi.getData();
        setStats(response.stats);
        setUpcomingReservations(response.upcoming_reservations);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString: string) => {
    // Assuming timeString is in format "HH:MM:SS" or "HH:MM"
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert to 12-hour format
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return <div className="admin-dashboard">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">{error}</div>
        <button 
          className="btn btn-primary" 
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats?.today_reservations || 0}</div>
          <div className="stat-label">Today's Reservations</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats?.menu_items || 0}</div>
          <div className="stat-label">Menu Items</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats?.categories || 0}</div>
          <div className="stat-label">Categories</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats?.customers || 0}</div>
          <div className="stat-label">Customers</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats?.newsletter_subscribers || 0}</div>
          <div className="stat-label">Newsletter Subscribers</div>
        </div>
      </div>
      
      <div className="upcoming-reservations">
        <h2>Upcoming Reservations</h2>
        
        {upcomingReservations.length === 0 ? (
          <p>No upcoming reservations</p>
        ) : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Party Size</th>
                  <th>Table</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingReservations.map(reservation => (
                  <tr key={reservation.id}>
                    <td>{reservation.customer_name}</td>
                    <td>{formatDate(reservation.date)}</td>
                    <td>{formatTime(reservation.time)}</td>
                    <td>{reservation.party_size}</td>
                    <td>{reservation.table_number || 'Not assigned'}</td>
                    <td>
                      <span className={`status status-${reservation.status.toLowerCase()}`}>
                        {reservation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;