from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.security import generate_password_hash

from models.employee import Employee
from models.menu_item import MenuItem
from models.category import Category
from models.reservation import Reservation
from models.customer import Customer
from models.newsletter import Newsletter
from extensions import db
from datetime import datetime, timedelta, date

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# Helper function to check if user is admin
from functools import wraps

def admin_required(func):
    """Decorator to require admin role"""
    @wraps(func)
    def decorated_view(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'error': 'Authentication required'}), 401
        if not current_user.is_admin:
            return jsonify({'error': 'Admin privileges required'}), 403
        return func(*args, **kwargs)
    return decorated_view

# Helper function to check if user is manager
def manager_required(func):
    """Decorator to require manager or admin role"""
    def decorated_view(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'error': 'Authentication required'}), 401
        if not current_user.is_manager:
            return jsonify({'error': 'Manager privileges required'}), 403
        return func(*args, **kwargs)
    decorated_view.__name__ = func.__name__
    return decorated_view

# Dashboard API
@admin_bp.route('/dashboard', methods=['GET'])
@login_required
def get_dashboard_data():
    """Get dashboard statistics and data"""
    try:
        # Get today's date
        today = date.today()

        # Get counts for dashboard stats
        menu_items_count = MenuItem.query.count()
        categories_count = Category.query.count()
        customers_count = Customer.query.count()
        newsletter_count = Newsletter.query.count()
        
        # Get today's reservations count
        today_reservations_count = Reservation.query.filter(
            Reservation.date == today
        ).count()
        
        # Get upcoming reservations for display
        upcoming_reservations = Reservation.query.filter(
            Reservation.date >= today
        ).order_by(Reservation.date, Reservation.time).limit(10).all()
        
        # Format reservations for response
        formatted_reservations = []
        for res in upcoming_reservations:
            customer = Customer.query.get(res.customer_id)
            if customer:
                customer_name = f"{customer.first_name} {customer.last_name}"
            else:
                customer_name = "Unknown Customer"
                
            formatted_reservations.append({
                'id': res.id,
                'customer_name': customer_name,
                'date': res.date.isoformat(),
                'time': str(res.time),
                'party_size': res.party_size,
                'table_number': res.table_number,
                'status': res.status
            })
        
        # Return dashboard data
        return jsonify({
            'stats': {
                'menu_items': menu_items_count,
                'categories': categories_count,
                'customers': customers_count,
                'newsletter_subscribers': newsletter_count,
                'today_reservations': today_reservations_count
            },
            'upcoming_reservations': formatted_reservations
        }), 200

    except Exception as e:
        print(f"Dashboard error: {str(e)}")
        return jsonify({'error': 'Failed to load dashboard data'}), 500

# Employee Management API
@admin_bp.route('/employees', methods=['GET'])
@admin_required
def get_employees():
    """Get all employees"""
    try:
        employees = Employee.query.all()
        return jsonify({
            'employees': [emp.to_dict() for emp in employees]
        }), 200
    except Exception as e:
        print(f"Employees error: {str(e)}")
        return jsonify({'error': 'Failed to load employees'}), 500

@admin_bp.route('/employees/<int:employee_id>', methods=['GET'])
@admin_required
def get_employee(employee_id):
    """Get a specific employee"""
    try:
        employee = Employee.query.get_or_404(employee_id)
        return jsonify({
            'employee': employee.to_dict()
        }), 200
    except Exception as e:
        print(f"Employee error: {str(e)}")
        return jsonify({'error': 'Failed to load employee'}), 500

@admin_bp.route('/employees', methods=['POST'])
@admin_required
def create_employee():
    """Create a new employee"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    try:
        # Check if username or email already exists
        existing_username = Employee.query.filter_by(username=data['username']).first()
        if existing_username:
            return jsonify({'error': 'Username already exists'}), 409
            
        existing_email = Employee.query.filter_by(email=data['email']).first()
        if existing_email:
            return jsonify({'error': 'Email already exists'}), 409
        
        # Create new employee
        new_employee = Employee(
            username=data['username'],
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            password=data['password'],
            role=data['role'],
            is_active=data.get('is_active', True)
        )
        
        db.session.add(new_employee)
        db.session.commit()
        
        return jsonify({
            'message': 'Employee created successfully',
            'employee': new_employee.to_dict()
        }), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"DB error: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        print(f"Create employee error: {str(e)}")
        return jsonify({'error': 'Failed to create employee'}), 500

@admin_bp.route('/employees/<int:employee_id>', methods=['PUT'])
@admin_required
def update_employee(employee_id):
    """Update an employee"""
    data = request.get_json()
    
    try:
        employee = Employee.query.get_or_404(employee_id)
        
        # Prevent deactivating your own account
        if current_user.id == employee.id and 'is_active' in data and not data['is_active']:
            return jsonify({'error': 'You cannot deactivate your own account'}), 400
        
        # Update fields if they exist in the request
        if 'username' in data and data['username'] != employee.username:
            # Check if username already exists
            existing_username = Employee.query.filter_by(username=data['username']).first()
            if existing_username and existing_username.id != employee_id:
                return jsonify({'error': 'Username already exists'}), 409
            employee.username = data['username']
            
        if 'email' in data and data['email'] != employee.email:
            # Check if email already exists
            existing_email = Employee.query.filter_by(email=data['email']).first()
            if existing_email and existing_email.id != employee_id:
                return jsonify({'error': 'Email already exists'}), 409
            employee.email = data['email']
            
        if 'first_name' in data:
            employee.first_name = data['first_name']
            
        if 'last_name' in data:
            employee.last_name = data['last_name']
            
        if 'role' in data:
            # Prevent demoting yourself from admin
            if current_user.id == employee.id and employee.is_admin and data['role'] != 'admin':
                return jsonify({'error': 'You cannot demote yourself from admin'}), 400
            employee.role = data['role']
            
        if 'is_active' in data:
            employee.is_active = data['is_active']
            
        if 'password' in data and data['password']:
            employee.set_password(data['password'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Employee updated successfully',
            'employee': employee.to_dict()
        }), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"DB error: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        print(f"Update employee error: {str(e)}")
        return jsonify({'error': 'Failed to update employee'}), 500

@admin_bp.route('/employees/<int:employee_id>', methods=['DELETE'])
@admin_required
def delete_employee(employee_id):
    """Delete an employee (deactivate)"""
    try:
        employee = Employee.query.get_or_404(employee_id)
        
        # Prevent deleting yourself
        if current_user.id == employee.id:
            return jsonify({'error': 'You cannot delete your own account'}), 400
        
        # Instead of deleting, just deactivate
        employee.is_active = False
        db.session.commit()
        
        return jsonify({
            'message': 'Employee deactivated successfully'
        }), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"DB error: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        print(f"Delete employee error: {str(e)}")
        return jsonify({'error': 'Failed to deactivate employee'}), 500

# Reservation Management API
@admin_bp.route('/reservations', methods=['GET'])
@login_required
def get_reservations():
    """Get all reservations"""
    try:
        # Filter by date if provided
        date_filter = request.args.get('date')
        status_filter = request.args.get('status')
        
        query = Reservation.query
        
        if date_filter:
            try:
                filter_date = datetime.strptime(date_filter, '%Y-%m-%d').date()
                query = query.filter(Reservation.date == filter_date)
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
                
        if status_filter and status_filter != 'all':
            query = query.filter(Reservation.status == status_filter)
        
        # Order by date and time
        reservations = query.order_by(Reservation.date, Reservation.time).all()
        
        # Get all customer IDs to fetch in one query
        customer_ids = [r.customer_id for r in reservations]
        customers = {c.id: c for c in Customer.query.filter(Customer.id.in_(customer_ids)).all()}
        
        formatted_reservations = []
        for res in reservations:
            customer = customers.get(res.customer_id)
            
            reservation_data = {
                'id': res.id,
                'date': res.date.isoformat(),
                'time': str(res.time),
                'party_size': res.party_size,
                'table_number': res.table_number,
                'status': res.status,
                'notes': res.notes,
                'special_requests': res.special_requests,
                'created_at': res.created_at.isoformat()
            }
            
            if customer:
                reservation_data.update({
                    'customer_name': f"{customer.first_name} {customer.last_name}",
                    'customer_email': customer.email,
                    'customer_phone': customer.phone
                })
            else:
                reservation_data.update({
                    'customer_name': 'Unknown Customer',
                    'customer_email': '',
                    'customer_phone': ''
                })
                
            formatted_reservations.append(reservation_data)
        
        return jsonify({
            'reservations': formatted_reservations
        }), 200
    except Exception as e:
        print(f"Reservations error: {str(e)}")
        return jsonify({'error': 'Failed to load reservations'}), 500

@admin_bp.route('/reservations/<int:reservation_id>', methods=['GET'])
@login_required
def get_reservation(reservation_id):
    """Get a specific reservation"""
    try:
        reservation = Reservation.query.get_or_404(reservation_id)
        customer = Customer.query.get(reservation.customer_id)
        
        reservation_data = {
            'id': reservation.id,
            'date': reservation.date.isoformat(),
            'time': str(reservation.time),
            'party_size': reservation.party_size,
            'table_number': reservation.table_number,
            'status': reservation.status,
            'notes': reservation.notes,
            'special_requests': reservation.special_requests,
            'created_at': reservation.created_at.isoformat()
        }
        
        if customer:
            reservation_data.update({
                'customer_name': f"{customer.first_name} {customer.last_name}",
                'customer_email': customer.email,
                'customer_phone': customer.phone
            })
        else:
            reservation_data.update({
                'customer_name': 'Unknown Customer',
                'customer_email': '',
                'customer_phone': ''
            })
        
        return jsonify({
            'reservation': reservation_data
        }), 200
    except Exception as e:
        print(f"Reservation error: {str(e)}")
        return jsonify({'error': 'Failed to load reservation'}), 500

@admin_bp.route('/reservations/<int:reservation_id>', methods=['PUT'])
@login_required
def update_reservation(reservation_id):
    """Update a reservation"""
    data = request.get_json()
    
    try:
        reservation = Reservation.query.get_or_404(reservation_id)
        
        # Update fields if they exist in the request
        if 'table_number' in data:
            reservation.table_number = data['table_number']
        if 'status' in data:
            reservation.status = data['status']
        if 'notes' in data:
            reservation.notes = data['notes']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Reservation updated successfully',
            'reservation': {
                'id': reservation.id,
                'date': reservation.date.isoformat(),
                'time': str(reservation.time),
                'party_size': reservation.party_size,
                'table_number': reservation.table_number,
                'status': reservation.status,
                'notes': reservation.notes,
                'special_requests': reservation.special_requests
            }
        }), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"DB error: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        print(f"Update reservation error: {str(e)}")
        return jsonify({'error': 'Failed to update reservation'}), 500

@admin_bp.route('/reservations/<int:reservation_id>', methods=['DELETE'])
@manager_required
def cancel_reservation(reservation_id):
    """Cancel a reservation"""
    try:
        reservation = Reservation.query.get_or_404(reservation_id)
        
        # Instead of deleting, just update status to cancelled
        reservation.status = 'cancelled'
        db.session.commit()
        
        return jsonify({
            'message': 'Reservation cancelled successfully'
        }), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"DB error: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        print(f"Cancel reservation error: {str(e)}")
        return jsonify({'error': 'Failed to cancel reservation'}), 500