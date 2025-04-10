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
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [timeSlotFilter, setTimeSlotFilter] = useState<string>('');

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
        // Validate duplicate table number assignment for the same timeslot
        if (field === 'table_number') {
            const editedReservation = reservations.find(reservation => reservation.id === id);
            if (editedReservation) {
                const isDuplicate = reservations.some(reservation =>
                    reservation.id !== id &&
                    reservation.table_number === value &&
                    reservation.time_slot === editedReservation.time_slot
                );
                if (isDuplicate) {
                    alert('This table is already assigned for the selected timeslot. Please choose a different table.');
                    return;
                }
            }
        }

        setReservations(prevReservations =>
            prevReservations.map(reservation =>
                reservation.id === id ? { ...reservation, [field]: value } : reservation
            )
        );

        const updatedReservation = reservations.find(reservation => reservation.id === id);
        if (updatedReservation) {
            const updatedData = { ...updatedReservation, [field]: value };
            fetch(`/api/reservations/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
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

    const filteredAndSortedReservations = React.useMemo(() => {
        let filtered = reservations.filter(reservation => {
            const matchesStatus = statusFilter ? reservation.status === statusFilter : true;
            const matchesTimeSlot = timeSlotFilter ? reservation.time_slot.startsWith(timeSlotFilter) : true;

            const customerName = typeof reservation.customer_name === 'string' ? reservation.customer_name.toLowerCase() : '';
            const customerId = typeof reservation.customer_id === 'string' ? reservation.customer_id.toLowerCase() : '';
            const guests = reservation.guests ? reservation.guests.toString() : '';
            const tableNumber = reservation.table_number ? reservation.table_number.toString() : '';
            const timeSlot = typeof reservation.time_slot === 'string' ? reservation.time_slot : '';
            const specialRequests = typeof reservation.special_requests === 'string' ? reservation.special_requests.toLowerCase() : '';
            const status = typeof reservation.status === 'string' ? reservation.status.toLowerCase() : '';

            return (
                matchesStatus &&
                matchesTimeSlot &&
                (
                    customerName.includes(searchQuery.toLowerCase()) ||
                    customerId.includes(searchQuery.toLowerCase()) ||
                    guests.includes(searchQuery) ||
                    tableNumber.includes(searchQuery) ||
                    timeSlot.includes(searchQuery) ||
                    specialRequests.includes(searchQuery.toLowerCase()) ||
                    status.includes(searchQuery.toLowerCase())
                )
            );
        });

        if (sortConfig !== null) {
            filtered = [...filtered].sort((a, b) => {
                const aValue = a[sortConfig.key as keyof Reservation] ?? '';
                const bValue = b[sortConfig.key as keyof Reservation] ?? '';

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [reservations, searchQuery, statusFilter, timeSlotFilter, sortConfig]);

    const handleSort = (key: string) => {
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
                            <th onClick={() => handleSort('id')}>
                                ID {sortConfig?.key === 'id' ? (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '⇅') : '⇅'}
                            </th>
                            <th onClick={() => handleSort('status')}>
                                Status {sortConfig?.key === 'status' ? (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '⇅') : '⇅'}
                                <select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="canceled">Canceled</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </th>
                            <th onClick={() => handleSort('time_slot')}>
                                Time Slot {sortConfig?.key === 'time_slot' ? (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '⇅') : '⇅'}
                                <input
                                    type="date"
                                    value={timeSlotFilter}
                                    onChange={e => setTimeSlotFilter(e.target.value)}
                                />
                            </th>
                            <th onClick={() => handleSort('table_number')}>
                                Table {sortConfig?.key === 'table_number' ? (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '⇅') : '⇅'}
                            </th>
                            <th onClick={() => handleSort('guests')}>
                                Guests {sortConfig?.key === 'guests' ? (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '⇅') : '⇅'}
                            </th>
                            <th onClick={() => handleSort('customer_name')}>
                                Customer Name {sortConfig?.key === 'customer_name' ? (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '⇅') : '⇅'}
                            </th>
                            <th onClick={() => handleSort('customer_email')}>
                                Email {sortConfig?.key === 'customer_email' ? (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '⇅') : '⇅'}
                            </th>
                            <th onClick={() => handleSort('customer_phone')}>
                                Phone {sortConfig?.key === 'customer_phone' ? (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '⇅') : '⇅'}
                            </th>
                            <th onClick={() => handleSort('special_requests')}>
                                Special Requests {sortConfig?.key === 'special_requests' ? (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '⇅') : '⇅'}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedReservations.map(reservation => (
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
};

export default ReservationManagement;