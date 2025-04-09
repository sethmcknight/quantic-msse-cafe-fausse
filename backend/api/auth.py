from flask import Blueprint, request, jsonify, session
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy.exc import SQLAlchemyError
from flask_jwt_extended import create_access_token

from backend.models.employee import Employee
from backend.extensions import db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login endpoint for employees
    """
    # Get request data
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({
            'error': 'Username and password are required'
        }), 400
    
    try:
        # Find employee by username
        employee = Employee.query.filter_by(username=data['username']).first()
        
        # Check if employee exists and is active
        if not employee:
            return jsonify({
                'error': 'Invalid username or password'
            }), 401
            
        if not employee.is_active:
            return jsonify({
                'error': 'This account has been deactivated'
            }), 401
        
        # Check password
        if not check_password_hash(employee.password, data['password']):
            return jsonify({
                'error': 'Invalid username or password'
            }), 401
        
        # Login the user
        login_user(employee)
        
        # Update last login time
        employee.update_last_login()
        db.session.commit()
        
        # Generate access token
        access_token = create_access_token(identity=employee.id)
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                **employee.to_dict(),
                'token': access_token
            }
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'error': 'Database error occurred',
            'details': str(e)
        }), 500
    except Exception as e:
        return jsonify({
            'error': 'An unexpected error occurred',
            'details': str(e)
        }), 500

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """
    Logout endpoint for employees
    """
    logout_user()
    return jsonify({
        'message': 'Logout successful'
    }), 200

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    """
    Get current logged in employee
    """
    return jsonify({
        'user': current_user.to_dict()
    }), 200

@auth_bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    """
    Change password endpoint for employees
    """
    # Get request data
    data = request.get_json()
    
    if not data or not data.get('current_password') or not data.get('new_password'):
        return jsonify({
            'error': 'Current password and new password are required'
        }), 400
    
    try:
        # Check current password
        if not check_password_hash(current_user.password, data['current_password']):
            return jsonify({
                'error': 'Current password is incorrect'
            }), 401
        
        # Update password
        current_user.password = generate_password_hash(data['new_password'])
        db.session.commit()
        
        return jsonify({
            'message': 'Password changed successfully'
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'error': 'Database error occurred',
            'details': str(e)
        }), 500
    except Exception as e:
        return jsonify({
            'error': 'An unexpected error occurred',
            'details': str(e)
        }), 500