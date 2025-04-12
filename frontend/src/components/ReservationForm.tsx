import React, { useState } from 'react';
import InlineNotification from './InlineNotification';
import { reservationApi } from '../utils/api';
import { useAppContext } from '../context/AppContext';
import '../css/ReservationsPage.css';
import '../css/ReservationForm.css';

// Add the onReservationAdded prop type
interface ReservationFormProps {
  onReservationAdded?: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

const formatTime = (timeString: string) => {
  const [hour, minute] = timeString.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12-hour format
  return `${formattedHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
};

const ReservationConfirmation: React.FC<{ reservationDetails: any; onDismiss: () => void }> = ({ reservationDetails, onDismiss }) => {
  const formattedDate = formatDate(reservationDetails.date);
  const formattedTime = formatTime(reservationDetails.time);

  return (
    <div className="reservation-confirmation">
      <h2>Reservation Confirmed!</h2>
      <p>Thank you, {reservationDetails.name}, for your reservation.</p>
      <ul>
        <li>Reservation ID: {reservationDetails.id}</li>
        <li>Date: {formattedDate}</li>
        <li>Time: {formattedTime}</li>
        <li>Guests: {reservationDetails.guests}</li>
        <li>Email: {reservationDetails.email}</li>
        {reservationDetails.specialRequests && (
          <li>Special Requests: {reservationDetails.specialRequests}</li>
        )}
      </ul>
      <button onClick={onDismiss}>Close</button>
    </div>
  );
};

const ReservationForm: React.FC<ReservationFormProps> = ({ onReservationAdded }) => {
  const { showNotification } = useAppContext();
  
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

  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  // Removed unused tablesRemaining state variable
  // Removed unused notification state variable
  const [availabilityNotification, setAvailabilityNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationDetails, setReservationDetails] = useState<any | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'date' || name === 'time' || name === 'guests') {
      setAvailabilityChecked(false);
      setIsAvailable(false);
      setAvailabilityNotification(null);
    }
  };

  const displayNotification = (message: string, type: 'success' | 'error' | 'info') => {
    showNotification(message, type);
    showNotification(message, type);
  };

  // Removed unused clearNotification function

  const checkAvailability = async (e: React.FormEvent) => {
    e.preventDefault();

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
      // Removed unused setTablesRemaining call
      setIsAvailable(response.available);
      setAvailabilityChecked(true);

      setAvailabilityNotification({
        message: response.available
          ? `Available! (${remainingTables} tables remaining)`
          : 'Not available. Please select another time.',
        type: response.available ? 'success' : 'error'
      });
    } catch (error) {
      console.error('Error checking availability:', error);
      displayNotification('Error checking availability. Please try again.', 'error');
      setIsAvailable(false);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.date || !formData.time || !formData.guests) {
      displayNotification('Please fill in all required fields.', 'error');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      displayNotification('Please enter a valid email address.', 'error');
      return;
    }

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

      console.log('Backend response:', response);

      if (response.success) {
        setReservationDetails({
          id: response.reservation_id, // Correctly map reservation_id from the backend
          name: formData.name,
          date: formData.date,
          time: formData.time,
          guests: formData.guests,
          tableNumber: response.table_number, // Correctly map table_number from the backend
          email: formData.email,
          specialRequests: formData.specialRequests,
        });
        displayNotification('Reservation created successfully!', 'success');
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
        
        // Call the onReservationAdded callback if provided
        if (onReservationAdded) {
          onReservationAdded();
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

  if (reservationDetails) {
    return <ReservationConfirmation reservationDetails={reservationDetails} onDismiss={() => setReservationDetails(null)} />;
  }

  return (
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
  );
};

export default ReservationForm;