"""
Reservation model for the Café Fausse application
"""
from .base import Base
from ..extensions import db
from datetime import datetime


class Reservation(Base):
    """Reservation model representing table bookings"""
    __tablename__ = 'reservations'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    time_slot = db.Column(db.DateTime, nullable=False)
    guests = db.Column(db.Integer, nullable=False)
    table_number = db.Column(db.Integer, nullable=False)
    special_requests = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='confirmed')  # confirmed, canceled, completed

    def __repr__(self):
        return f'<Reservation {self.id} for {self.time_slot}>'
    
    @classmethod
    def find_by_time_slot(cls, time_slot_start, time_slot_end=None):
        """Find reservations for a given time slot"""
        if time_slot_end:
            return cls.query.filter(
                cls.time_slot >= time_slot_start,
                cls.time_slot <= time_slot_end,
                cls.status == 'confirmed'
            ).all()
        return cls.query.filter_by(time_slot=time_slot_start, status='confirmed').all()

    @classmethod
    def get_booked_tables(cls, time_slot_start, time_slot_end=None):
        """Get all booked tables for a specific time slot"""
        reservations = cls.find_by_time_slot(time_slot_start, time_slot_end)
        return [reservation.table_number for reservation in reservations]
    
    def to_dict(self):
        """Convert reservation to a dictionary"""
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'time_slot': self.time_slot.isoformat(),
            'guests': self.guests,
            'table_number': self.table_number,
            'special_requests': self.special_requests,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }