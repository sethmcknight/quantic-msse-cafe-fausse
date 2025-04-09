"""
Shared extensions for the Flask application
"""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_login import LoginManager
from sqlalchemy.orm import Session

# Initialize SQLAlchemy without binding to app
db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
login_manager = LoginManager()

# Initialize login manager for employee authentication
@login_manager.user_loader
def load_user(user_id):
    return get_employee_by_id(user_id)

def get_employee_by_id(user_id):
    from backend.models.employee import Employee
    session: Session = db.session
    return session.get(Employee, int(user_id))