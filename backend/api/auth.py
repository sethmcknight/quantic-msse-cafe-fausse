from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models.employee import Employee  # Updated to use relative import
from ..extensions import db
import traceback

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        # Debug print
        current_app.logger.info("Login attempt received.")
        
        # Validate user credentials
        user = Employee.query.filter_by(username=username).first()
        
        if not user:
            current_app.logger.warning("Login failed: User not found.")
            return jsonify({'error': 'Invalid credentials'}), 401
            
        if user and user.check_password(password):
            # User exists and password is correct
            current_app.logger.info("Login successful.")
            access_token = create_access_token(identity=user.id)
            return jsonify({'token': access_token}), 200
        else:
            current_app.logger.warning("Login failed: Incorrect password.")
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        # Log the error
        current_app.logger.error(f"Login error: {str(e)}")
        current_app.logger.error(f"Login error: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': 'An error occurred during login'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # JWTs are stateless, so logout can be handled client-side by deleting the token
    return jsonify({'message': 'Logged out successfully'}), 200