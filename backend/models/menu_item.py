"""
MenuItem model for the Café Fausse application
"""
from .base import Base
from extensions import db
from .category import Category  # Explicitly import the Category model


class MenuItem(Base):
    """MenuItem model representing items on the menu"""
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
        return f'<MenuItem {self.name}>'
    
    def to_dict(self):
        """Convert menu item to a dictionary"""
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