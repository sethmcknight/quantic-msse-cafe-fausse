"""
Base model for SQLAlchemy models
"""
from datetime import datetime
from ..extensions import db


class Base(db.Model):
    """Base model class that includes common columns and methods"""
    __abstract__ = True

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def save(self):
        """Save the model instance to the database"""
        db.session.add(self)
        db.session.commit()
        return self

    def delete(self):
        """Delete the model instance from the database"""
        db.session.delete(self)
        db.session.commit()
        return self