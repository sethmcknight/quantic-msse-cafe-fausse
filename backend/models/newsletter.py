"""
Newsletter model for the Café Fausse application
"""
from .base import Base
from extensions import db


class Newsletter(Base):
    """Newsletter model for managing email subscriptions"""
    __tablename__ = 'newsletter_subscribers'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    
    def __repr__(self):
        return f'<Newsletter Subscriber {self.email}>'
    
    @classmethod
    def find_by_email(cls, email):
        """Find a newsletter subscriber by email"""
        return cls.query.filter_by(email=email).first()
    
    def to_dict(self):
        """Convert newsletter subscriber to dictionary"""
        return {
            'id': self.id,
            'email': self.email,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }