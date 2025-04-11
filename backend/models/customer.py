"""
Customer model for the Café Fausse application
"""
from .base import Base
from ..extensions import db
from sqlalchemy.orm import Session


class Customer(Base):
    """Customer model representing restaurant customers"""
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
        return f'<Customer {self.name}>'
        
    @classmethod
    def find_by_email(cls, email):
        """Find a customer by email address"""
        session = Session(db.engine)
        try:
            customer = session.query(cls).filter_by(email=email).first()
            return customer
        finally:
            session.close()
    
    def save(self):
        """Save customer to database"""
        db.session.add(self)
        db.session.commit()
        return self
    
    def to_dict(self):
        """Convert customer to a dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'newsletter_signup': self.newsletter_signup,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }