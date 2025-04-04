from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash

from models.base import BaseModel
from extensions import db

class Employee(UserMixin, BaseModel):
    """
    Employee model for cafe staff, managers, and admins
    """
    __tablename__ = 'employees'
    
    # Authentication fields
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    
    # Personal information
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    
    # Role and permissions
    role = db.Column(db.String(20), nullable=False, default='staff')  # staff, manager, admin
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    # Tracking
    last_login = db.Column(db.DateTime, nullable=True)
    
    def __init__(self, username, email, first_name, last_name, 
                 password=None, role='staff', is_active=True):
        self.username = username
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        if password:
            self.set_password(password)
        self.role = role
        self.is_active = is_active
    
    @property
    def is_admin(self):
        return self.role == 'admin'
    
    @property
    def is_manager(self):
        return self.role == 'admin' or self.role == 'manager'
    
    def set_password(self, password):
        """Set password hash for user"""
        self.password = generate_password_hash(password)
    
    def update_last_login(self):
        """Update the last login timestamp"""
        self.last_login = datetime.utcnow()
    
    def to_dict(self):
        """Return a dict representation of the employee"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,
            'is_active': self.is_active,
            'is_admin': self.is_admin,
            'is_manager': self.is_manager,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Employee {self.username} ({self.role})>'