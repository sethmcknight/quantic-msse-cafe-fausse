import React, { useState, useEffect } from 'react';
import '../css/reservation-management.css';

interface Reservation {
    id: string;
    name: string;
    email: string;
    phone: string;
    date: string;
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
                if (Array.isArray(data)) {
                    setReservations(data);
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

    const filteredReservations = reservations.filter(reservation =>
        reservation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.phone.includes(searchQuery) ||
        reservation.date.includes(searchQuery)
    );

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
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReservations.map(reservation => (
                            <tr key={reservation.id}>
                                <td>{reservation.name}</td>
                                <td>{reservation.email}</td>
                                <td>{reservation.phone}</td>
                                <td>{reservation.date}</td>
                                <td>
                                    <button>Edit</button>
                                    <button>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
};

export default ReservationManagement;