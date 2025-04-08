"""
Newsletter API Blueprint for Café Fausse
"""
from flask import Blueprint, jsonify, request
from ..extensions import db
from ..models.newsletter import Newsletter
from ..models.customer import Customer
import re
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

newsletter_bp = Blueprint('newsletter', __name__)

# Email validation regex pattern
EMAIL_PATTERN = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

def subscribe_to_newsletter(email):
    """Helper function to subscribe an email to the newsletter"""
    logger.debug(f"Attempting to subscribe email: {email}")

    # Validate email format
    if not re.match(EMAIL_PATTERN, email):
        logger.error(f"Invalid email format: {email}")
        return {'success': False, 'message': 'Invalid email format'}, 400

    try:
        existing_subscriber = Newsletter.find_by_email(email)
        if existing_subscriber:
            if existing_subscriber.is_active:
                logger.info(f"Email already subscribed: {email}")
                return {'success': False, 'message': 'This email is already subscribed'}, 409
            else:
                existing_subscriber.is_active = True
                db.session.commit()
                logger.info(f"Reactivated subscription for email: {email}")
                return {'success': True, 'message': 'Subscription reactivated'}, 200

        subscriber = Newsletter(email=email)
        db.session.add(subscriber)
        db.session.commit()
        logger.info(f"Successfully subscribed email: {email}")
        return {'success': True, 'message': 'Subscribed successfully'}, 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error subscribing email {email}: {str(e)}")
        return {'success': False, 'message': f'An error occurred: {str(e)}'}, 500

@newsletter_bp.route('/subscribe', methods=['POST'])
def subscribe():
    """Subscribe to the newsletter"""
    data = request.json

    if not data or 'email' not in data:
        logger.error("Email is missing in the request payload.")
        return jsonify({'success': False, 'message': 'Email is required'}), 400

    email = data['email'].strip().lower()
    logger.debug(f"Received subscription request for email: {email}")

    # Validate email format
    if not re.match(EMAIL_PATTERN, email):
        logger.error(f"Invalid email format: {email}")
        return jsonify({'success': False, 'message': 'Invalid email format'}), 400

    try:
        # Check if already subscribed in newsletter table
        existing_subscriber = Newsletter.find_by_email(email)
        if existing_subscriber:
            if existing_subscriber.is_active:
                logger.info(f"Email already subscribed: {email}")
                return jsonify({
                    'success': False, 
                    'message': 'This email is already subscribed to our newsletter'
                }), 409
            else:
                # Reactivate subscription
                existing_subscriber.is_active = True
                db.session.commit()
                logger.info(f"Reactivated subscription for email: {email}")
                return jsonify({
                    'success': True,
                    'message': 'Your subscription has been reactivated!'
                })

        # Check if email belongs to existing customer and update their preference
        customer = Customer.find_by_email(email)
        if customer:
            customer.newsletter_signup = True
            db.session.commit()
            logger.info(f"Updated newsletter preference for customer: {email}")

        # Create new subscription
        subscriber = Newsletter(email=email)
        db.session.add(subscriber)
        db.session.commit()
        logger.info(f"Successfully subscribed email: {email}")

        return jsonify({
            'success': True,
            'message': 'Thank you for subscribing to our newsletter!'
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error occurred during subscription for email {email}: {str(e)}")
        return jsonify({'success': False, 'message': f'An error occurred: {str(e)}'}), 500

@newsletter_bp.route('/unsubscribe', methods=['POST'])
def unsubscribe():
    """Unsubscribe from the newsletter"""
    data = request.json
    
    if not data or 'email' not in data:
        return jsonify({'success': False, 'message': 'Email is required'}), 400
    
    email = data['email'].strip().lower()
    
    try:
        # Find subscriber
        subscriber = Newsletter.find_by_email(email)
        if not subscriber or not subscriber.is_active:
            return jsonify({
                'success': False,
                'message': 'This email is not subscribed to our newsletter'
            }), 404
        
        # Deactivate subscription
        subscriber.is_active = False
        db.session.commit()
        
        # Also update customer if they exist
        customer = Customer.find_by_email(email)
        if customer:
            customer.newsletter_signup = False
            db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'You have been successfully unsubscribed'
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'An error occurred: {str(e)}'}), 500

@newsletter_bp.route('/subscribers', methods=['GET'])
def get_subscribers():
    """Get all active newsletter subscribers"""
    # This endpoint would typically be restricted to admin users
    subscribers = Newsletter.query.filter_by(is_active=True).all()
    return jsonify({
        'success': True,
        'count': len(subscribers),
        'subscribers': [sub.to_dict() for sub in subscribers]
    })