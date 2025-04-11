import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ManageReservations from '../../pages/ManageReservations';

// Mock the fetch API
beforeEach(() => {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: () =>
                Promise.resolve([
                    {
                        id: '1',
                        name: 'John Doe',
                        email: 'johndoe@example.com',
                        phone: '123-456-7890',
                        date: '2025-04-10',
                    },
                    {
                        id: '2',
                        name: 'Jane Smith',
                        email: 'janesmith@example.com',
                        phone: '987-654-3210',
                        date: '2025-04-11',
                    },
                ]),
        })
    ) as jest.Mock;
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('ManageReservations Page', () => {
    test('renders the page and fetches reservations', async () => {
        render(<ManageReservations />);

        // Verify the page title
        expect(screen.getByText('Reservation Management')).toBeInTheDocument();

        // Wait for reservations to load
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    test('filters reservations based on search query', async () => {
        render(<ManageReservations />);

        // Wait for reservations to load
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });

        // Search for "John"
        const searchInput = screen.getByPlaceholderText('Search by name, email, phone, or date');
        fireEvent.change(searchInput, { target: { value: 'John' } });

        // Verify only "John Doe" is displayed
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    test('displays an error message if the API call fails', async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
            })
        );

        render(<ManageReservations />);

        // Verify error message
        await waitFor(() => {
            expect(screen.getByText('Error fetching reservations:')).toBeInTheDocument();
        });
    });
});