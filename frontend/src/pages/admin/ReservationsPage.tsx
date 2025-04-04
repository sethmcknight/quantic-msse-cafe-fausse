import React, { useState, useEffect } from 'react';
import { adminReservationApi } from '../../utils/adminApi';
import { useAppContext } from '../../context/AppContext';
import '../../css/AdminPanel.css';

type Reservation = {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  date: string;
  time: string;
  party_size: number;
  table_number: number | null;
  status: string;
  notes: string | null;
  special_requests: string | null;
  created_at: string;
};

const AdminReservationsPage: React.FC = () => {
  const { showNotification } = useAppContext();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editReservation, setEditReservation] = useState<Reservation | null>(null);

  // Fetch reservations
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await adminReservationApi.getAll();
        setReservations(response.reservations);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching reservations:', err);
        setError('Failed to load reservations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    // Assuming timeString is in format "HH:MM:SS" or "HH:MM"
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert to 12-hour format
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Handle updating reservation status
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await adminReservationApi.update(id, { status: newStatus });
      
      // Update the local state
      setReservations(prev => 
        prev.map(res => 
          res.id === id ? { ...res, status: newStatus } : res
        )
      );
      
      showNotification('Reservation status updated successfully', 'success');
    } catch (err: any) {
      console.error('Error updating reservation status:', err);
      showNotification('Failed to update reservation status', 'error');
    }
  };

  // Handle editing a reservation
  const handleEditSave = async () => {
    if (!editReservation) return;
    
    try {
      await adminReservationApi.update(editReservation.id, {
        table_number: editReservation.table_number,
        notes: editReservation.notes,
        status: editReservation.status
      });
      
      // Update the local state
      setReservations(prev => 
        prev.map(res => 
          res.id === editReservation.id ? editReservation : res
        )
      );
      
      setEditReservation(null);
      showNotification('Reservation updated successfully', 'success');
    } catch (err: any) {
      console.error('Error updating reservation:', err);
      showNotification('Failed to update reservation', 'error');
    }
  };

  // Filter reservations
  const filteredReservations = reservations.filter(reservation => {
    const matchesDate = dateFilter ? reservation.date === dateFilter : true;
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    const matchesSearch = 
      reservation.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.customer_phone && reservation.customer_phone.includes(searchTerm));
    
    return matchesDate && matchesStatus && matchesSearch;
  });

  // Set today's date as default for the date filter
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDateFilter(today);
  }, []);

  if (loading) {
    return <div className="admin-loading">Loading reservations...</div>;
  }

  return (
    <div className="admin-reservations-page">
      <div className="page-header">
        <h1>Reservations Management</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="filters-container">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date-filter">Date</label>
            <input
              type="date"
              id="date-filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="search">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {filteredReservations.length === 0 ? (
        <p>No reservations found for the selected criteria.</p>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Date & Time</th>
                <th>Party Size</th>
                <th>Table</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map(reservation => (
                <tr key={reservation.id}>
                  <td>{reservation.customer_name}</td>
                  <td>
                    <div>{reservation.customer_email}</div>
                    {reservation.customer_phone && (
                      <div>{reservation.customer_phone}</div>
                    )}
                  </td>
                  <td>
                    <div>{formatDate(reservation.date)}</div>
                    <div>{formatTime(reservation.time)}</div>
                  </td>
                  <td>{reservation.party_size}</td>
                  <td>
                    {editReservation?.id === reservation.id ? (
                      <input
                        type="number"
                        min="1"
                        value={editReservation.table_number || ''}
                        onChange={(e) => setEditReservation({
                          ...editReservation,
                          table_number: e.target.value ? Number(e.target.value) : null
                        })}
                      />
                    ) : (
                      reservation.table_number || 'Not assigned'
                    )}
                  </td>
                  <td>
                    {editReservation?.id === reservation.id ? (
                      <select
                        value={editReservation.status}
                        onChange={(e) => setEditReservation({
                          ...editReservation,
                          status: e.target.value
                        })}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                        <option value="no-show">No Show</option>
                      </select>
                    ) : (
                      <span className={`status status-${reservation.status.toLowerCase()}`}>
                        {reservation.status}
                      </span>
                    )}
                  </td>
                  <td className="action-buttons">
                    {editReservation?.id === reservation.id ? (
                      <>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={handleEditSave}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditReservation(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditReservation(reservation)}
                        >
                          Edit
                        </button>
                        {reservation.status !== 'completed' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleStatusChange(reservation.id, 'completed')}
                          >
                            Complete
                          </button>
                        )}
                        {reservation.status !== 'cancelled' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReservationsPage;