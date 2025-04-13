"""
Category model for the Café Fausse application

This module defines the Category model which represents menu categories
in the restaurant's menu system. Categories are used to organize menu items
into logical groups such as appetizers, main courses, desserts, etc.
"""
from .base import Base
from ..extensions import db


class Category(Base):
    """
    Category model for menu categorization
    
    This class represents categories used to organize menu items.
    It extends the Base model which provides created_at and updated_at fields.
    
    Attributes:
        id (int): Primary key for the category
        name (str): Name of the category, must be unique
        description (str): Optional description of the category
        display_order (int): Order in which to display this category relative to others
        menu_items (relationship): One-to-many relationship with MenuItem objects
    """
    __tablename__ = 'categories'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.String(200), nullable=True)
    display_order = db.Column(db.Integer, default=0)

    # Use back_populates instead of backref to avoid conflicts
    menu_items = db.relationship('backend.models.menu_item.MenuItem', back_populates='category', lazy=True)

    def __repr__(self):
        """
        Returns a string representation of the category
        
        Returns:
            str: String representation in the format <Category name>
        """
        return f'<Category {self.name}>'
    
    def to_dict(self):
        """
        Convert category to dictionary
        
        Transforms the category model into a dictionary for JSON serialization
        and API responses.
        
        Returns:
            dict: Dictionary containing all category properties
        """
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'display_order': self.display_order
        }

class MenuCategory(db.Model):
    """
    Legacy MenuCategory model
    
    This appears to be a legacy or alternative category model.
    Consider consolidating with the main Category model if possible.
    
    Attributes:
        id (int): Primary key for the menu category
        name (str): Name of the menu category
    """
    __tablename__ = 'menu_categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        """
        Convert menu category to dictionary
        
        Returns:
            dict: Dictionary containing menu category properties
        """
        return {
            'id': self.id,
            'name': self.name
        }