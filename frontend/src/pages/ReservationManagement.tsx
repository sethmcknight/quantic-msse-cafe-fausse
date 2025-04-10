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
    email?: string;
    phone?: string;
    customer_email?: string;
    customer_phone?: string;
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

    const handleEdit = (id: string, field: string, value: string | number) => {
        setReservations(prevReservations =>
            prevReservations.map(reservation =>
                reservation.id === id ? { ...reservation, [field]: value } : reservation
            )
        );
    };

    const handleSave = (id: string) => {
        const updatedReservation = reservations.find(reservation => reservation.id === id);
        if (updatedReservation) {
            fetch(`/api/reservations/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedReservation),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to save reservation');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Reservation updated:', data);
                })
                .catch(error => {
                    console.error('Error saving reservation:', error);
                });
        }
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
                            <th>ID</th>
                            <th>Status</th>
                            <th>Time Slot</th>
                            <th>Table</th>
                            <th>Guests</th>
                            <th>Customer ID</th>
                            <th>Customer Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Special Requests</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReservations.map(reservation => (
                            <tr key={reservation.id}>
                                <td>{reservation.id}</td>
                                <td>
                                    <select
                                        value={reservation.status}
                                        onChange={e => handleEdit(reservation.id, 'status', e.target.value)}
                                    >
                                        <option value="confirmed">Confirmed</option>
                                        <option value="canceled">Canceled</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="datetime-local"
                                        value={reservation.time_slot}
                                        onChange={e => handleEdit(reservation.id, 'time_slot', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={reservation.table_number}
                                        onChange={e => handleEdit(reservation.id, 'table_number', parseInt(e.target.value, 10))}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={reservation.guests}
                                        onChange={e => handleEdit(reservation.id, 'guests', parseInt(e.target.value, 10))}
                                    />
                                </td>
                                <td>{reservation.customer_id}</td>
                                <td>
                                    <input
                                        type="text"
                                        value={reservation.customer_name}
                                        onChange={e => handleEdit(reservation.id, 'customer_name', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="email"
                                        value={reservation.customer_email || ''}
                                        onChange={e => handleEdit(reservation.id, 'customer_email', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="tel"
                                        value={reservation.customer_phone || ''}
                                        onChange={e => handleEdit(reservation.id, 'customer_phone', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={reservation.special_requests || ''}
                                        onChange={e => handleEdit(reservation.id, 'special_requests', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <button onClick={() => handleSave(reservation.id)}>Save</button>
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