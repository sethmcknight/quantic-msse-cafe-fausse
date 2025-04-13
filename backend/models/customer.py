"""
Customer model for the Café Fausse application

This module defines the Customer model which represents restaurant customers
who make reservations or subscribe to the newsletter. It stores essential
contact information and preferences.
"""
from .base import Base
from ..extensions import db
from sqlalchemy.orm import Session


class Customer(Base):
    """
    Customer model representing restaurant customers
    
    This class represents customers who interact with the restaurant,
    primarily for making reservations and newsletter subscriptions.
    It extends the Base model which provides created_at and updated_at fields.
    
    Attributes:
        id (int): Primary key for the customer
        name (str): Customer's full name
        email (str): Customer's email address, must be unique
        phone (str): Customer's phone number
        newsletter_signup (bool): Whether the customer is subscribed to the newsletter
        reservations (relationship): One-to-many relationship with Reservation objects
    """
    __tablename__ = 'customers'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    newsletter_signup = db.Column(db.Boolean, default=False)
    
    # Relationship with reservations - use fully qualified path to avoid conflict
    reservations = db.relationship('backend.models.reservation.Reservation', backref='customer', lazy=True)

    def __repr__(self):
        """
        Returns a string representation of the customer
        
        Returns:
            str: String representation in the format <Customer name>
        """
        return f'<Customer {self.name}>'
        
    @classmethod
    def find_by_email(cls, email):
        """
        Find a customer by email address
        
        Searches for a customer with the specified email address.
        Uses a dedicated session to ensure transaction isolation.
        
        Args:
            email (str): The email address to search for
            
        Returns:
            Customer: The customer object if found, otherwise None
        """
        session = Session(db.engine)
        try:
            customer = session.query(cls).filter_by(email=email).first()
            return customer
        finally:
            session.close()
    
    def save(self):
        """
        Save customer to database
        
        Persists the current customer object to the database.
        Uses a dedicated session to ensure transaction isolation.
        
        Returns:
            Customer: The saved customer object
        """
        session = Session(db.engine)
        try:
            session.add(self)
            session.commit()
            return self
        finally:
            session.close()
    
    def to_dict(self):
        """
        Convert customer to a dictionary
        
        Transforms the customer model into a dictionary for JSON serialization
        and API responses.
        
        Returns:
            dict: Dictionary containing all customer properties
        """
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'newsletter_signup': self.newsletter_signup,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }