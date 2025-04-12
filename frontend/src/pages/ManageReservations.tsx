import React, { useState, useEffect, useMemo } from 'react';
import '../css/ManageReservations.css';
import ReservationForm from '../components/ReservationForm';
import TruncatedText from '../components/TruncatedText';
import ManagementNavigation from '../components/ManagementNavigation';
import Footer from '../components/Footer';

interface Reservation {
    id: string;
    customer_name: string;
    customer_id: string;
    guests: number;
    table_number: string | number;
    time_slot: string;
    special_requests?: string;
    status: string;
    email?: string;
    phone?: string;
    customer_email?: string;
    customer_phone?: string;
}

const ManageReservations = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [timeSlotFilter, setTimeSlotFilter] = useState<string>('');
    const [tableFilter, setTableFilter] = useState<string>('');
    const [customerNameFilter, setCustomerNameFilter] = useState<string>('');
    const [emailFilter, setEmailFilter] = useState<string>('');
    const [phoneFilter, setPhoneFilter] = useState<string>('');
    const [showReservationForm, setShowReservationForm] = useState(false);

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

    // Filter handlers
    const handleTableFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTableFilter(event.target.value);
    };

    const handleCustomerNameFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCustomerNameFilter(event.target.value);
    };

    const handleEmailFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmailFilter(event.target.value);
    };

    const handlePhoneFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneFilter(event.target.value);
    };

    // Clear filter functions
    const clearTableFilter = () => setTableFilter('');
    const clearCustomerNameFilter = () => setCustomerNameFilter('');
    const clearEmailFilter = () => setEmailFilter('');
    const clearPhoneFilter = () => setPhoneFilter('');

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

    const filteredAndSortedReservations = useMemo(() => {
        let filtered = reservations.filter(reservation => {
            const matchesStatus = statusFilter ? reservation.status === statusFilter : true;
            const matchesTimeSlot = timeSlotFilter ? reservation.time_slot.startsWith(timeSlotFilter) : true;
            
            // New filters
            const matchesTable = tableFilter ? 
                reservation.table_number.toString().includes(tableFilter) : 
                true;
            
            const matchesCustomerName = customerNameFilter ? 
                reservation.customer_name.toLowerCase().includes(customerNameFilter.toLowerCase()) : 
                true;
            
            const matchesEmail = emailFilter ? 
                (reservation.customer_email || '').toLowerCase().includes(emailFilter.toLowerCase()) : 
                true;
            
            const matchesPhone = phoneFilter ? 
                (reservation.customer_phone || '').includes(phoneFilter) : 
                true;

            return (
                matchesStatus &&
                matchesTimeSlot &&
                matchesTable &&
                matchesCustomerName &&
                matchesEmail &&
                matchesPhone
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
    }, [reservations, statusFilter, timeSlotFilter, tableFilter, customerNameFilter, emailFilter, phoneFilter, sortConfig]);

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

    // Get sort indicator arrow - similar to MenuManagement
    const getSortIndicator = (key: string) => {
        if (sortConfig && sortConfig.key === key) {
            return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
        }
        return ' ⇅';
    };

    return (
        <>
            <ManagementNavigation />
            <div className="reservation-management">
                <h1>Manage Reservations</h1>
                
                <button
                    className={`add-reservation-button ${showReservationForm ? 'close-reservation-button' : ''}`}
                    onClick={() => setShowReservationForm(!showReservationForm)}
                >
                    {showReservationForm ? 'Close New Reservation' : 'Add New Reservation'}
                </button>
               
                {showReservationForm && (
                    <ReservationForm />
                )}
                
                <div className="filtered-count">
                    <p>Showing {filteredAndSortedReservations.length} of {reservations.length} reservations</p>
                </div>
                
                <div className="table-container" style={{ overflowX: "auto" }}>
                    <table>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('id')}>
                                    ID{getSortIndicator('id')}
                                </th>
                                <th onClick={() => handleSort('status')}>
                                    Status{getSortIndicator('status')}
                                    <div className="filter-input">
                                        <select
                                            value={statusFilter}
                                            onChange={e => setStatusFilter(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <option value="">All</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="canceled">Canceled</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                        {statusFilter && (
                                            <button 
                                                className="clear-filter" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setStatusFilter('');
                                                }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('time_slot')}>
                                    Time Slot{getSortIndicator('time_slot')}
                                    <div className="filter-input">
                                        <input
                                            type="date"
                                            value={timeSlotFilter}
                                            onChange={e => setTimeSlotFilter(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        {timeSlotFilter && (
                                            <button 
                                                className="clear-filter" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTimeSlotFilter('');
                                                }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('table_number')}>
                                    Table{getSortIndicator('table_number')}
                                    <div className="filter-input">
                                        <input
                                            type="text"
                                            value={tableFilter}
                                            onChange={handleTableFilterChange}
                                            onClick={(e) => e.stopPropagation()}
                                            placeholder="Filter by table..."
                                        />
                                        {tableFilter && (
                                            <button 
                                                className="clear-filter" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    clearTableFilter();
                                                }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('guests')}>
                                    Guests{getSortIndicator('guests')}
                                </th>
                                <th onClick={() => handleSort('customer_name')}>
                                    Customer Name{getSortIndicator('customer_name')}
                                    <div className="filter-input">
                                        <input
                                            type="text"
                                            value={customerNameFilter}
                                            onChange={handleCustomerNameFilterChange}
                                            onClick={(e) => e.stopPropagation()}
                                            placeholder="Filter by name..."
                                        />
                                        {customerNameFilter && (
                                            <button 
                                                className="clear-filter" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    clearCustomerNameFilter();
                                                }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('customer_email')}>
                                    Email{getSortIndicator('customer_email')}
                                    <div className="filter-input">
                                        <input
                                            type="text"
                                            value={emailFilter}
                                            onChange={handleEmailFilterChange}
                                            onClick={(e) => e.stopPropagation()}
                                            placeholder="Filter by email..."
                                        />
                                        {emailFilter && (
                                            <button 
                                                className="clear-filter" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    clearEmailFilter();
                                                }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('customer_phone')}>
                                    Phone{getSortIndicator('customer_phone')}
                                    <div className="filter-input">
                                        <input
                                            type="text"
                                            value={phoneFilter}
                                            onChange={handlePhoneFilterChange}
                                            onClick={(e) => e.stopPropagation()}
                                            placeholder="Filter by phone..."
                                        />
                                        {phoneFilter && (
                                            <button 
                                                className="clear-filter" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    clearPhoneFilter();
                                                }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('special_requests')}>
                                    Special Requests{getSortIndicator('special_requests')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedReservations.map(reservation => (
                                <tr key={reservation.id || Math.random()}>
                                    <td>{reservation.id || 'New'}</td>
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
                                    <td className="special-requests-cell">
                                        <textarea
                                            value={reservation.special_requests || ''}
                                            onChange={e => handleEdit(reservation.id, 'special_requests', e.target.value)}
                                            rows={Math.min(3, (reservation.special_requests?.split('\n').length || 1))}
                                            placeholder="Enter special requests..."
                                        />
                                        {reservation.special_requests && (
                                            <div className="preview-text">
                                                <TruncatedText 
                                                    text={reservation.special_requests} 
                                                    maxLength={75} 
                                                />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ManageReservations;