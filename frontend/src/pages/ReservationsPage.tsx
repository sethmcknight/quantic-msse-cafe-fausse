import React from 'react';
import { useAppContext } from '../context/AppContext';
import ReservationForm from '../components/ReservationForm';
import '../css/ReservationsPage.css';

const ReservationsPage: React.FC = () => {
  const { showNotification } = useAppContext();

  return (
    <div className="reservations-page">
      <h1>Make a Reservation</h1>
      <ReservationForm showNotification={showNotification} />
    </div>
  );
};

export default ReservationsPage;