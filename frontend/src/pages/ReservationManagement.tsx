import React, { useState, useEffect } from 'react';
import '../css/reservation-management.css';

interface Reservation {
    id: string;
    customer_name: string;
    customer_id: string;
    guests: number;
    table_number: string;
    time_slot: string;
    special_requests?: string;
    status: string;
}

const ReservationManagement = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Fetch reservations from the backend API
        fetch('/api/reservations')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch reservations');
                }
                return response.json();
            })
            .then(data => {
                if (data.success && Array.isArray(data.reservations)) {
                    setReservations(data.reservations);
                } else {
                    console.error('Unexpected data format:', data);
                    setReservations([]);
                }
            })
            .catch(error => {
                console.error('Error fetching reservations:', error);
                setReservations([]);
            });
    }, []);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const filteredReservations = reservations.filter(reservation => {
        const customerName = typeof reservation.customer_name === 'string' ? reservation.customer_name.toLowerCase() : '';
        const customerId = typeof reservation.customer_id === 'string' ? reservation.customer_id.toLowerCase() : '';
        const guests = reservation.guests ? reservation.guests.toString() : '';
        const tableNumber = reservation.table_number ? reservation.table_number.toString() : '';
        const timeSlot = typeof reservation.time_slot === 'string' ? reservation.time_slot : '';
        const specialRequests = typeof reservation.special_requests === 'string' ? reservation.special_requests.toLowerCase() : '';
        const status = typeof reservation.status === 'string' ? reservation.status.toLowerCase() : '';

        return (
            customerName.includes(searchQuery.toLowerCase()) ||
            customerId.includes(searchQuery.toLowerCase()) ||
            guests.includes(searchQuery) ||
            tableNumber.includes(searchQuery) ||
            timeSlot.includes(searchQuery) ||
            specialRequests.includes(searchQuery.toLowerCase()) ||
            status.includes(searchQuery.toLowerCase())
        );
    });

    return (
        <div className="management-page">
            <main>
                <h1>Reservation Management</h1>
                <input
                    type="text"
                    placeholder="Search by name, email, phone, or date"
                    value={searchQuery}
                    onChange={handleSearch}
                />
                <table>
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Customer ID</th>
                            <th>Guests</th>
                            <th>Table Number</th>
                            <th>Time Slot</th>
                            <th>Special Requests</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReservations.map(reservation => (
                            <tr key={reservation.id}>
                                <td>{reservation.customer_name}</td>
                                <td>{reservation.customer_id}</td>
                                <td>{reservation.guests}</td>
                                <td>{reservation.table_number}</td>
                                <td>{reservation.time_slot}</td>
                                <td>{reservation.special_requests || 'N/A'}</td>
                                <td>{reservation.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
};

export default ReservationManagement;