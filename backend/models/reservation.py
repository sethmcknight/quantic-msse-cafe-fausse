"""
Reservation model for the Café Fausse application

This module defines the Reservation model which represents table bookings
at the restaurant. Each reservation is associated with a customer and includes
details about the date, time, number of guests, and special requests.
"""
from .base import Base
from ..extensions import db
from datetime import datetime
from .customer import Customer  # Import Customer model
from sqlalchemy.orm import Session


class Reservation(Base):
    """
    Reservation model representing table bookings
    
    This class represents table reservations made by customers at the restaurant.
    It tracks details such as the time, table number, number of guests, and
    any special requests. It extends the Base model which provides created_at
    and updated_at fields.
    
    Attributes:
        id (int): Primary key for the reservation
        customer_id (int): Foreign key to the customer making the reservation
        time_slot (datetime): Date and time of the reservation
        guests (int): Number of people in the party
        table_number (int): Assigned table number for the reservation
        special_requests (str): Any special requests or notes for this reservation
        status (str): Status of the reservation (confirmed, canceled, completed)
    """
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
        """
        Returns a string representation of the reservation
        
        Returns:
            str: String representation in the format <Reservation id for time_slot>
        """
        return f'<Reservation {self.id} for {self.time_slot}>'
    
    @classmethod
    def find_by_time_slot(cls, time_slot_start, time_slot_end=None):
        """
        Find reservations for a given time slot
        
        Retrieves all confirmed reservations that fall within the specified time range.
        
        Args:
            time_slot_start (datetime): Start of the time slot to check
            time_slot_end (datetime, optional): End of the time slot to check
            
        Returns:
            list: List of Reservation objects that match the criteria
        """
        # Create a new session to ensure we get the latest data
        session = Session(db.engine)
        try:
            if time_slot_end:
                reservations = session.query(cls).filter(
                    cls.time_slot >= time_slot_start,
                    cls.time_slot <= time_slot_end,
                    cls.status == 'confirmed'
                ).all()
            else:
                reservations = session.query(cls).filter_by(time_slot=time_slot_start, status='confirmed').all()
            return reservations
        finally:
            session.close()

    @classmethod
    def get_booked_tables(cls, time_slot_start, time_slot_end=None):
        """
        Get all booked tables for a specific time slot
        
        Retrieves a list of all table numbers that are already booked
        during the specified time range.
        
        Args:
            time_slot_start (datetime): Start of the time slot to check
            time_slot_end (datetime, optional): End of the time slot to check
            
        Returns:
            list: List of integer table numbers that are already booked
        """
        reservations = cls.find_by_time_slot(time_slot_start, time_slot_end)
        return [reservation.table_number for reservation in reservations]
    
    def to_dict(self):
        """
        Convert reservation to a dictionary
        
        Transforms the reservation model into a dictionary for JSON serialization
        and API responses. Includes information about the associated customer.
        
        Returns:
            dict: Dictionary containing all reservation properties and basic customer info
        """
        session = Session(db.engine)
        customer = session.get(Customer, self.customer_id)
        session.close()
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'customer_name': customer.name if customer else None,
            'time_slot': self.time_slot.isoformat(),
            'guests': self.guests,
            'table_number': self.table_number,
            'special_requests': self.special_requests,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }