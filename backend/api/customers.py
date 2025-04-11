"""
Customers API Blueprint for Café Fausse
"""
from flask import Blueprint, jsonify, request
from ..extensions import db
from ..models.customer import Customer
import logging
from email_validator import validate_email, EmailNotValidError

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

customers_bp = Blueprint('customers', __name__)

@customers_bp.route('', methods=['GET'])
def get_customers():
    """Get all customers"""
    try:
        customers = Customer.query.all()
        return jsonify({
            'success': True,
            'count': len(customers),
            'customers': [customer.to_dict() for customer in customers]
        })
    except Exception as e:
        logger.error(f"Error retrieving customers: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500

@customers_bp.route('/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    """Get a specific customer by ID"""
    try:
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({
                'success': False,
                'message': f'Customer with ID {customer_id} not found'
            }), 404

        return jsonify({
            'success': True,
            'customer': customer.to_dict()
        })
    except Exception as e:
        logger.error(f"Error retrieving customer {customer_id}: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500

@customers_bp.route('/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    """Update a customer"""
    try:
        # Get the customer from the database
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({
                'success': False,
                'message': f'Customer with ID {customer_id} not found'
            }), 404

        # Get data from request
        data = request.json
        if data is None:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400

        # Update fields if provided
        if 'name' in data:
            customer.name = data['name']
        
        if 'phone' in data:
            customer.phone = data['phone']
        
        if 'newsletter_signup' in data:
            customer.newsletter_signup = data['newsletter_signup']
            
        if 'email' in data:
            try:
                # Validate the new email if it's being updated
                validate_email(data['email'])
                
                # Check if the email is already in use by another customer
                existing_customer = Customer.find_by_email(data['email'])
                if existing_customer and existing_customer.id != customer_id:
                    return jsonify({
                        'success': False,
                        'message': 'Email is already in use by another customer'
                    }), 409
                    
                customer.email = data['email']
            except EmailNotValidError as e:
                return jsonify({
                    'success': False,
                    'message': f'Invalid email format: {str(e)}'
                }), 400

        # Save changes
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Customer updated successfully',
            'customer': customer.to_dict()
        })
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating customer {customer_id}: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500

@customers_bp.route('', methods=['POST'])
def create_customer():
    """Create a new customer"""
    try:
        # Get data from request
        data = request.json
        if data is None or not all(key in data for key in ['name', 'email']):
            return jsonify({
                'success': False,
                'message': 'Name and email are required fields'
            }), 400
            
        # Validate email
        try:
            validate_email(data['email'])
        except EmailNotValidError as e:
            return jsonify({
                'success': False,
                'message': f'Invalid email format: {str(e)}'
            }), 400
            
        # Check if email is already in use
        if Customer.find_by_email(data['email']):
            return jsonify({
                'success': False,
                'message': 'Email is already in use by another customer'
            }), 409
            
        # Create new customer
        customer = Customer(
            name=data['name'],
            email=data['email'],
            phone=data.get('phone'),
            newsletter_signup=data.get('newsletter_signup', False)
        )
        
        # Save to database
        db.session.add(customer)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Customer created successfully',
            'customer': customer.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating customer: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500