"""
Shared extensions for the Flask application
"""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_login import LoginManager
from flask_jwt_extended import JWTManager

# Initialize extensions
# These are initialized here to avoid circular imports
# and will be bound to the app in the app factory

db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
login_manager = LoginManager()
jwt = JWTManager()

# Initialize login manager for employee authentication
@login_manager.user_loader
def load_user(user_id):
    from backend.models.employee import Employee
    return Employee.query.get(int(user_id))

@jwt.user_identity_loader
def user_identity_lookup(employee):
    return employee.id

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    from backend.models.employee import Employee
    identity = jwt_data["sub"]
    return Employee.query.get(identity)

def get_employee_by_id(user_id):
    from backend.models.employee import Employee
    session: Session = db.session
    return session.get(Employee, int(user_id))