"""
Shared extensions for the Flask application
"""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_login import LoginManager

# Initialize SQLAlchemy without binding to app
db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
login_manager = LoginManager()

# Initialize login manager for employee authentication
@login_manager.user_loader
def load_user(user_id):
    from .models.employee import Employee
    return Employee.query.get(int(user_id))