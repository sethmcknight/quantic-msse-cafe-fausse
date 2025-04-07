import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { reservationApi } from '../utils/api';
import InlineNotification from '../components/InlineNotification';
import '../css/ReservationsPage.css';

const ReservationsPage: React.FC = () => {
  const { showNotification } = useAppContext();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: 2,
    specialRequests: '',
    newsletterOptIn: false
  });
  
  // Availability check state
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [tablesRemaining, setTablesRemaining] = useState(0);
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [reservationDetails, setReservationDetails] = useState<{
    reservationId?: number;
    tableNumber?: number;
    name?: string;
    email?: string;
    phone?: string;
    date?: string;
    time?: string;
    guests?: number;
    specialRequests?: string;
    message?: string;
  } | null>(null);

  // Notification state
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error' | 'info'} | null>(null);
  const [availabilityNotification, setAvailabilityNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset availability check when date, time, or guests change
    if (name === 'date' || name === 'time' || name === 'guests') {
      setAvailabilityChecked(false);
      setIsAvailable(false);
      setAvailabilityNotification(null);
    }
  };
  
  // Display notification inline instead of using the global notification system
  const displayNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    // Still call the context method for logging purposes
    showNotification(message, type);
  };

  // Clear notification
  const clearNotification = () => {
    setNotification(null);
  };
  
  // Check availability
  const checkAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.date || !formData.time || !formData.guests) {
      displayNotification('Please select a date, time, and number of guests.', 'error');
      return;
    }
    
    setIsCheckingAvailability(true);
    
    try {
      const response = await reservationApi.checkAvailability(
        formData.date, 
        formData.time, 
        parseInt(formData.guests.toString())
      );
      
      const remainingTables = response.tables_remaining || 0;
      setTablesRemaining(remainingTables);
      setIsAvailable(response.available);
      setAvailabilityChecked(true);
      
      if (!response.available) {
        // Only set the availability notification, not the general notification
        setAvailabilityNotification({
          message: 'Not available. Please select another time.',
          type: 'error'
        });
      } else {
        // Only set the availability notification, not the general notification
        setAvailabilityNotification({
          message: `Available! (${remainingTables} tables remaining)`,
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      displayNotification('Error checking availability. Please try again.', 'error');
      setIsAvailable(false);
    } finally {
      setIsCheckingAvailability(false);
    }
  };
  
  // Submit reservation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.date || !formData.time || !formData.guests) {
      displayNotification('Please fill in all required fields.', 'error');
      return;
    }
    
    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      displayNotification('Please enter a valid email address.', 'error');
      return;
    }
    
    // Check availability again if not already checked
    if (!availabilityChecked) {
      displayNotification('Please check availability before submitting.', 'error');
      return;
    }
    
    if (!isAvailable) {
      displayNotification('This time slot is not available. Please select another time.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await reservationApi.createReservation(formData);
      
      if (response.success) {
        setSubmissionSuccess(true);

        const normalizeResponse = (response: any) => ({
          reservationId: response.reservationId || response.reservation_id,
          tableNumber: response.tableNumber || response.table_number,
          name: response.name,
          email: response.email,
          phone: response.phone,
          date: new Date(response.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          time: new Date(`1970-01-01T${response.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
          guests: response.guests,
          specialRequests: response.specialRequests,
          message: response.message,
        });

        const normalizedDetails = normalizeResponse(response);
        setReservationDetails(normalizedDetails);

        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          date: '',
          time: '',
          guests: 2,
          specialRequests: '',
          newsletterOptIn: false
        });
        setAvailabilityChecked(false);
        setIsAvailable(false);

        if (submissionSuccess && reservationDetails) {
          const confirmationElement = document.querySelector('.reservation-confirmation');
          if (confirmationElement) {
            confirmationElement.scrollIntoView({ behavior: 'smooth' });
          }
        }
      } else {
        displayNotification(response.message || 'Error creating reservation.', 'error');
      }
    } catch (error) {
      console.error('Error submitting reservation:', error);
      displayNotification('Error submitting reservation. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate time options (5:00 PM to 10:00 PM, 30 min intervals)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 17; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const hourStr = hour.toString().padStart(2, '0');
        const minuteStr = minute.toString().padStart(2, '0');
        const timeValue = `${hourStr}:${minuteStr}`;
        const timeLabel = `${hour > 12 ? hour - 12 : hour}:${minuteStr} ${hour >= 12 ? 'PM' : 'AM'}`;
        options.push(<option key={timeValue} value={timeValue}>{timeLabel}</option>);
      }
    }
    return options;
  };

  useEffect(() => {
    if (submissionSuccess && reservationDetails) {
      const confirmationElement = document.querySelector('.reservation-confirmation');
      if (confirmationElement) {
        confirmationElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [submissionSuccess, reservationDetails]);

  useEffect(() => {
    if (submissionSuccess) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [submissionSuccess]);

  return (
    <div className="reservations-page">
      <h1>Make a Reservation</h1>
      
      {/* Display notification if exists */}
      {notification && (
        <InlineNotification
          message={notification.message}
          type={notification.type}
          onDismiss={clearNotification}
        />
      )}
      
      {submissionSuccess && reservationDetails ? (
        <div className="reservation-confirmation">
          <h2>Reservation Confirmed!</h2>
          <p>{reservationDetails.message}</p>
          <div className="confirmation-details">
            {reservationDetails.reservationId && (
              <p><strong>Reservation ID:</strong> {reservationDetails.reservationId}</p>
            )}
            {reservationDetails.tableNumber && (
              <p><strong>Table Number:</strong> {reservationDetails.tableNumber}</p>
            )}
            {reservationDetails.name && (
              <p><strong>Name:</strong> {reservationDetails.name}</p>
            )}
            {reservationDetails.email && (
              <p><strong>Email:</strong> {reservationDetails.email}</p>
            )}
            {reservationDetails.phone && (
              <p><strong>Phone:</strong> {reservationDetails.phone}</p>
            )}
            {reservationDetails.date && (
              <p><strong>Date:</strong> {reservationDetails.date}</p>
            )}
            {reservationDetails.time && (
              <p><strong>Time:</strong> {reservationDetails.time}</p>
            )}
            {reservationDetails.guests && (
              <p><strong>Guests:</strong> {reservationDetails.guests}</p>
            )}
            {reservationDetails.specialRequests && (
              <p><strong>Special Requests:</strong> {reservationDetails.specialRequests}</p>
            )}
          </div>
          <button 
            className="make-new-reservation"
            onClick={() => setSubmissionSuccess(false)}
          >
            Make Another Reservation
          </button>
        </div>
      ) : (
        <div className="reservation-form-container">
          <p>Please fill out the form below to make a reservation. All fields marked with * are required.</p>
          
          <form className="reservation-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="time">Time *</label>
              <select 
                id="time" 
                name="time" 
                value={formData.time} 
                onChange={handleChange}
                required
              >
                <option value="">Select a time</option>
                {generateTimeOptions()}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="guests">Number of Guests *</label>
              <select
                id="guests"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                required
              >
                {[...Array(8)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="check-availability">
              <button 
                type="button" 
                onClick={checkAvailability}
                disabled={!formData.date || !formData.time || !formData.guests || isCheckingAvailability}
              >
                {isCheckingAvailability ? 'Checking...' : 'Check Availability'}
              </button>
              
              {availabilityNotification && (
                <InlineNotification
                  message={availabilityNotification.message}
                  type={availabilityNotification.type}
                  duration={0}
                  onDismiss={() => setAvailabilityNotification(null)}
                  showSymbol={true}
                />
              )}
            </div>
            
            {availabilityChecked && isAvailable && (
            <>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

              <div className="form-group">
                <label htmlFor="specialRequests">Special Requests</label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Allergies, special occasions, seating preferences, etc."
                />
              </div>

              <div className="form-group newsletter-opt-in">
                <input
                  type="checkbox"
                  id="newsletterOptIn"
                  name="newsletterOptIn"
                  checked={formData.newsletterOptIn || false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      newsletterOptIn: e.target.checked,
                    }))
                  }
                />
                <label htmlFor="newsletterOptIn" className="checkbox-label">
                I want to receive updates on special events and promotions!
                </label>
              </div>

              <div className="form-submit">
                <button 
                  type="submit" 
                  disabled={!availabilityChecked || !isAvailable || isSubmitting || !formData.name || !formData.email}
                >
                  {isSubmitting ? 'Submitting...' : 'Complete Reservation'}
                </button>
              </div>
            </>
            )}
          </form>
          
          <div className="reservation-info">
            <h3>Reservation Policies</h3>
            <ul>
              <li>Reservations can be made up to 60 days in advance.</li>
              <li>For parties larger than 8, please call us directly at (202) 555-4567.</li>
              <li>We hold reservations for 15 minutes past the reservation time.</li>
              <li>To cancel or modify your reservation, please contact us at least 24 hours in advance.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;