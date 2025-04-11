from werkzeug.security import generate_password_hash, check_password_hash
from ..extensions import db
from .base import Base

class Employee(Base):
    """Employee model for staff authentication"""
    __tablename__ = 'employees'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='staff')
    
    def set_password(self, password):
        """Generate a password hash for the provided password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if the provided password matches the stored hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Return a dictionary representation of the model"""
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role
        }
    
    def __repr__(self):
        return f'<Employee {self.username}>'