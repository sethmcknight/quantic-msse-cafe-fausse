"""
Newsletter API Blueprint for Café Fausse

This module provides API endpoints for managing newsletter subscriptions
for the Café Fausse restaurant application, allowing customers to 
subscribe to, unsubscribe from, and manage their newsletter preferences.
"""
from flask import Blueprint, jsonify, request
from ..extensions import db
from ..models.newsletter import Newsletter
from ..models.customer import Customer
import re
import logging
from email_validator import validate_email, EmailNotValidError

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

newsletter_bp = Blueprint('newsletter', __name__)

def subscribe_to_newsletter(email):
    """
    Helper function to subscribe an email to the newsletter
    
    This internal function is used by other modules to subscribe
    a customer's email to the newsletter. It handles validation,
    checks for existing subscriptions, and manages subscription state.
    
    Parameters:
        email (str): The email address to subscribe
        
    Returns:
        tuple: A tuple containing (response_dict, status_code)
            - response_dict (dict): Contains success status and message
            - status_code (int): HTTP status code
            
    Raises:
        EmailNotValidError: If the email format is invalid
    """
    logger.debug(f"Attempting to subscribe email: {email}")

    # Validate email format using email_validator
    try:
        validate_email(email)
    except EmailNotValidError as e:
        logger.error(f"Invalid email format: {email} - {str(e)}")
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
    """
    Subscribe to the newsletter
    
    Adds an email address to the newsletter subscription list.
    If the email belongs to an existing customer, updates their
    newsletter preference as well.
    
    Request Body:
        email (str): The email address to subscribe
    
    Returns:
        JSON: Object containing success status and message
        
    Responses:
        201: Successfully subscribed to the newsletter
        200: Subscription reactivated
        400: Invalid email format or missing email
        409: Email already subscribed
        500: Server error
    """
    data = request.json

    if not data or 'email' not in data:
        logger.error("Email is missing in the request payload.")
        return jsonify({'success': False, 'message': 'Email is required'}), 400

    email = data['email'].strip().lower()

    # Validate email format using email_validator
    try:
        validate_email(email)
    except EmailNotValidError as e:
        logger.error(f"Invalid email format: {email} - {str(e)}")
        return jsonify({'success': False, 'message': 'Invalid email format'}), 400

    try:
        # Check if already subscribed in newsletter table
        existing_subscriber = Newsletter.find_by_email(email)
        if existing_subscriber:
            if existing_subscriber.is_active:
                return jsonify({
                    'success': False, 
                    'message': 'This email is already subscribed to our newsletter'
                }), 409
            else:
                # Reactivate subscription
                existing_subscriber.is_active = True
                db.session.commit()
                return jsonify({
                    'success': True,
                    'message': 'Your subscription has been reactivated!'
                })

        # Check if email belongs to existing customer and update their preference
        customer = Customer.find_by_email(email)
        if customer:
            customer.newsletter_signup = True
            db.session.commit()

        # Create new subscription
        subscriber = Newsletter(email=email)
        db.session.add(subscriber)
        db.session.commit()

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
    """
    Unsubscribe from the newsletter
    
    Deactivates an email subscription in the newsletter system.
    If the email belongs to an existing customer, updates their
    newsletter preference as well.
    
    Request Body:
        email (str): The email address to unsubscribe
    
    Returns:
        JSON: Object containing success status and message
        
    Responses:
        200: Successfully unsubscribed from the newsletter
        400: Missing email
        404: Email not found in subscription list
        500: Server error
    """
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
    """
    Get all newsletter subscribers
    
    Retrieves a list of all newsletter subscribers, both active and inactive.
    This endpoint would typically be restricted to admin users.
    
    Returns:
        JSON: Object containing success status, total count, and list of subscribers
        
    Responses:
        200: Successfully retrieved subscribers list
    """
    # This endpoint would typically be restricted to admin users
    subscribers = Newsletter.query.all()  # Get all subscribers, not just active ones
    return jsonify({
        'success': True,
        'count': len(subscribers),
        'subscribers': [sub.to_dict() for sub in subscribers]
    })

@newsletter_bp.route('/subscribers/<int:subscriber_id>', methods=['PUT'])
def update_subscriber(subscriber_id):
    """
    Update a newsletter subscriber
    
    Updates the details of an existing newsletter subscriber,
    typically their active/inactive status.
    
    Parameters:
        subscriber_id (int): The ID of the subscriber to update
        
    Request Body:
        is_active (bool, optional): Whether the subscription should be active
    
    Returns:
        JSON: Object containing success status, message, and updated subscriber data
        
    Responses:
        200: Subscriber updated successfully
        400: No data provided
        404: Subscriber not found
        500: Server error
    """
    try:
        # Get the subscriber from the database
        subscriber = Newsletter.query.get(subscriber_id)
        if not subscriber:
            logger.error(f"Subscriber with ID {subscriber_id} not found")
            return jsonify({
                'success': False,
                'message': f'Subscriber with ID {subscriber_id} not found'
            }), 404

        # Get data from request
        data = request.json
        if data is None:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400

        # Update is_active status if provided
        if 'is_active' in data:
            subscriber.is_active = data['is_active']
            
            # If the subscriber is a customer, update their newsletter_signup status as well
            customer = Customer.find_by_email(subscriber.email)
            if customer:
                customer.newsletter_signup = data['is_active']

        # Save changes
        db.session.commit()
        logger.info(f"Successfully updated subscriber with ID {subscriber_id}")
        
        return jsonify({
            'success': True,
            'message': 'Subscriber updated successfully',
            'subscriber': subscriber.to_dict()
        })
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating subscriber with ID {subscriber_id}: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500

# Removed duplicate '/api/newsletter' POST route to avoid conflicts with '/subscribe'