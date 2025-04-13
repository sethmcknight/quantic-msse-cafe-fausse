"""
Base model for SQLAlchemy models

This module defines the Base model class which provides common functionality
that other models in the application extend. It includes timestamp tracking
and common database operations.
"""
from datetime import datetime
from ..extensions import db


class Base(db.Model):
    """
    Base model class that includes common columns and methods
    
    This abstract base class provides functionality shared across all models
    in the application, including automatic timestamp tracking and common
    database operations like save and delete.
    
    Attributes:
        created_at (datetime): Timestamp when the record was created
        updated_at (datetime): Timestamp when the record was last updated
    """
    __abstract__ = True

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def save(self):
        """
        Save the model instance to the database
        
        Adds the current model instance to the session and commits it
        to the database.
        
        Returns:
            Base: The saved model instance
        """
        db.session.add(self)
        db.session.commit()
        return self

    def delete(self):
        """
        Delete the model instance from the database
        
        Removes the current model instance from the database and commits
        the change.
        
        Returns:
            Base: The deleted model instance
        """
        db.session.delete(self)
        db.session.commit()
        return self