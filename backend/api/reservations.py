"""
Reservations API Blueprint for Café Fausse
"""
from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from extensions import db
from models.reservation import Reservation
from models.customer import Customer
import random

reservations_bp = Blueprint('reservations', __name__)

# Constants
TOTAL_TABLES = 30
RESERVATION_DURATION = 90  # minutes

@reservations_bp.route('', methods=['POST'])
@reservations_bp.route('/', methods=['POST'])
def create_reservation():
    """Create a new reservation"""
    data = request.json
    
    # Validate required fields
    required_fields = ['name', 'email', 'date', 'time', 'guests']
    for field in required_fields:
        if field not in data:
            return jsonify({'success': False, 'message': f'Missing required field: {field}'}), 400
    
    try:
        # Parse date and time
        time_slot_str = f"{data['date']} {data['time']}"
        time_slot = datetime.strptime(time_slot_str, '%Y-%m-%d %H:%M')
        
        # Don't allow reservations in the past
        if time_slot < datetime.now():
            return jsonify({'success': False, 'message': 'Cannot make reservations in the past'}), 400
            
        # First, check if we have availability
        reservation_end = time_slot + timedelta(minutes=RESERVATION_DURATION)
        booked_tables = Reservation.get_booked_tables(time_slot, reservation_end)
        
        if len(booked_tables) >= TOTAL_TABLES:
            return jsonify({
                'success': False, 
                'message': 'Sorry, we are fully booked for this time slot'
            }), 409
            
        # Get or create customer
        customer = Customer.find_by_email(data['email'])
        if not customer:
            customer = Customer(
                name=data['name'],
                email=data['email'],
                phone=data.get('phone', None),
                newsletter_signup=data.get('newsletter_signup', False)
            )
            customer.save()
        
        # Find an available table (any random unbooked table)
        available_tables = [t for t in range(1, TOTAL_TABLES + 1) if t not in booked_tables]
        table_number = random.choice(available_tables)
        
        # Create the reservation
        reservation = Reservation(
            customer_id=customer.id,
            time_slot=time_slot,
            guests=data['guests'],
            table_number=table_number,
            special_requests=data.get('special_requests', None),
            status='confirmed'
        )
        db.session.add(reservation)
        db.session.commit()
        
        return jsonify({
            'success': True, 
            'message': 'Reservation confirmed!',
            'reservation_id': reservation.id,
            'table_number': reservation.table_number,
            'time_slot': reservation.time_slot.isoformat()
        }), 201
        
    except ValueError as e:
        return jsonify({'success': False, 'message': f'Invalid data format: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'An error occurred: {str(e)}'}), 500

@reservations_bp.route('/check-availability', methods=['POST'])
def check_availability():
    """Check if a reservation is available for a specific date, time and party size"""
    data = request.json
    
    try:
        # Validate required fields
        if not all(k in data for k in ['date', 'time', 'guests']):
            return jsonify({'success': False, 'message': 'Date, time and guests are required'}), 400
            
        # Parse date and time
        time_slot_str = f"{data['date']} {data['time']}"
        time_slot = datetime.strptime(time_slot_str, '%Y-%m-%d %H:%M')
        guests = int(data['guests'])
        
        # Check if reservation time is valid
        if time_slot < datetime.now():
            return jsonify({'available': False, 'message': 'Cannot make reservations in the past'}), 400
            
        if guests <= 0 or guests > 20:
            return jsonify({'available': False, 'message': 'Invalid number of guests'}), 400
            
        # Check availability
        reservation_end = time_slot + timedelta(minutes=RESERVATION_DURATION)
        booked_tables = Reservation.get_booked_tables(time_slot, reservation_end)
        available = len(booked_tables) < TOTAL_TABLES
        
        return jsonify({
            'available': available,
            'tables_remaining': TOTAL_TABLES - len(booked_tables) if available else 0
        })
        
    except ValueError as e:
        return jsonify({'success': False, 'message': f'Invalid data format: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': f'An error occurred: {str(e)}'}), 500

@reservations_bp.route('/<int:reservation_id>', methods=['GET'])
def get_reservation(reservation_id):
    """Get a specific reservation"""
    reservation = Reservation.query.get(reservation_id)
    
    if not reservation:
        return jsonify({'success': False, 'message': 'Reservation not found'}), 404
    
    # Get customer info
    customer = Customer.query.get(reservation.customer_id)
    
    return jsonify({
        'success': True,
        'reservation': {
            **reservation.to_dict(),
            'customer_name': customer.name,
            'customer_email': customer.email
        }
    })

@reservations_bp.route('/cancel/<int:reservation_id>', methods=['POST'])
def cancel_reservation(reservation_id):
    """Cancel a reservation"""
    reservation = Reservation.query.get(reservation_id)
    
    if not reservation:
        return jsonify({'success': False, 'message': 'Reservation not found'}), 404
    
    reservation.status = 'canceled'
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Reservation has been canceled',
        'reservation_id': reservation_id
    })

@reservations_bp.route('/all', methods=['GET'])
def get_reservations():
    """Get all reservations"""
    reservations = Reservation.query.all()
    return jsonify({
        'success': True,
        'reservations': [reservation.to_dict() for reservation in reservations]
    })