"""
Employee model for the Café Fausse application

This module defines the Employee model which represents staff members
who can authenticate to the system and perform administrative operations
based on their assigned roles.
"""
from werkzeug.security import generate_password_hash, check_password_hash
from ..extensions import db
from .base import Base

class Employee(Base):
    """
    Employee model for staff authentication
    
    This class represents restaurant employees who can log in to the system
    and perform various operations based on their role. It implements
    secure password handling and extends the Base model which provides
    created_at and updated_at fields.
    
    Attributes:
        id (int): Primary key for the employee
        username (str): Unique username for authentication
        password_hash (str): Securely hashed password
        role (str): Employee role defining permissions (staff, manager, admin, etc.)
    """
    __tablename__ = 'employees'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='staff')
    
    def set_password(self, password):
        """
        Generate a password hash for the provided password
        
        Securely hashes the provided plaintext password and stores the hash.
        
        Args:
            password (str): The plaintext password to hash
        """
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """
        Check if the provided password matches the stored hash
        
        Verifies that the provided plaintext password matches the stored hash.
        
        Args:
            password (str): The plaintext password to check
            
        Returns:
            bool: True if the password matches, False otherwise
        """
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """
        Return a dictionary representation of the model
        
        Creates a dictionary containing employee information for API responses,
        excluding sensitive information like the password hash.
        
        Returns:
            dict: Dictionary containing employee properties
        """
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role
        }
    
    def __repr__(self):
        """
        Returns a string representation of the employee
        
        Returns:
            str: String representation in the format <Employee username>
        """
        return f'<Employee {self.username}>'