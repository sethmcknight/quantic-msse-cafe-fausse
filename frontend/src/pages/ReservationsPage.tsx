import React from 'react';
import ReservationForm from '../components/ReservationForm';
import '../css/ReservationsPage.css';

const ReservationsPage: React.FC = () => {
  return (
    <div className="reservations-page">
      <h1>Make a Reservation</h1>
      <ReservationForm />
    </div>
  );
};

export default ReservationsPage;