"""
MenuItem model for the Café Fausse application

This module defines the MenuItem model which represents items on the restaurant's menu.
Each menu item belongs to a category and has properties like price, description,
dietary information, and availability status.
"""
from .base import Base
from ..extensions import db
from .category import Category  # Explicitly import the Category model


class MenuItem(Base):
    """
    MenuItem model representing items on the menu
    
    This class represents individual menu items that customers can order,
    with details about pricing, dietary restrictions, and categorization.
    It extends the Base model which provides created_at and updated_at fields.
    
    Attributes:
        id (int): Primary key for the menu item
        name (str): Name of the menu item
        description (str): Detailed description of the menu item
        price (float): Price of the menu item in the local currency
        image_url (str): URL to an image of the menu item
        is_vegetarian (bool): Whether the item is suitable for vegetarians
        is_vegan (bool): Whether the item is suitable for vegans
        is_gluten_free (bool): Whether the item is gluten-free
        is_featured (bool): Whether the item is featured on the menu
        available (bool): Whether the item is currently available for ordering
        display_order (int): Order in which to display this item relative to others
        category_id (int): Foreign key to the category this item belongs to
        category (Category): Relationship to the Category model
    """
    __tablename__ = 'menu_items'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    is_vegetarian = db.Column(db.Boolean, default=False)
    is_vegan = db.Column(db.Boolean, default=False)
    is_gluten_free = db.Column(db.Boolean, default=False)
    is_featured = db.Column(db.Boolean, default=False)
    available = db.Column(db.Boolean, default=True)
    display_order = db.Column(db.Integer, default=0)
    
    # Foreign key to category
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    category = db.relationship('Category', back_populates='menu_items')  # Use the correct reference

    def __repr__(self):
        """
        Returns a string representation of the menu item
        
        Returns:
            str: String representation in the format <MenuItem name>
        """
        return f'<MenuItem {self.name}>'
    
    def to_dict(self):
        """
        Convert menu item to a dictionary
        
        Transforms the menu item model into a dictionary for JSON serialization
        and API responses.
        
        Returns:
            dict: Dictionary containing all menu item properties
        """
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'image_url': self.image_url,
            'is_vegetarian': self.is_vegetarian,
            'is_vegan': self.is_vegan,
            'is_gluten_free': self.is_gluten_free,
            'is_featured': self.is_featured,
            'available': self.available,
            'category_id': self.category_id,
            'display_order': self.display_order
        }