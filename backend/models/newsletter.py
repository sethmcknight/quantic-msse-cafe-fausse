"""
Newsletter model for the Café Fausse application

This module defines the Newsletter model which represents newsletter subscribers
for the restaurant's email marketing campaigns. Each entry stores an email address
and subscription status.
"""
from .base import Base
from ..extensions import db


class Newsletter(Base):
    """
    Newsletter model for managing email subscriptions
    
    This class represents subscribers to the restaurant's newsletter.
    It tracks email addresses and their active/inactive subscription status.
    It extends the Base model which provides created_at and updated_at fields.
    
    Attributes:
        id (int): Primary key for the newsletter subscriber
        email (str): Email address of the subscriber
        is_active (bool): Whether the subscription is currently active
    """
    __tablename__ = 'newsletter_subscribers'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    
    def __repr__(self):
        """
        Returns a string representation of the newsletter subscriber
        
        Returns:
            str: String representation in the format <Newsletter Subscriber email>
        """
        return f'<Newsletter Subscriber {self.email}>'
    
    @classmethod
    def find_by_email(cls, email):
        """
        Find a newsletter subscriber by email
        
        Searches for a subscriber with the specified email address.
        
        Args:
            email (str): The email address to search for
            
        Returns:
            Newsletter: The subscriber object if found, otherwise None
        """
        return cls.query.filter_by(email=email).first()
    
    def to_dict(self):
        """
        Convert newsletter subscriber to dictionary
        
        Transforms the newsletter subscriber model into a dictionary for JSON serialization
        and API responses.
        
        Returns:
            dict: Dictionary containing all newsletter subscriber properties
        """
        return {
            'id': self.id,
            'email': self.email,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }