"""
Category model for the Café Fausse application
"""
from models.base import Base
from extensions import db


class Category(Base):
    """Category model for menu categorization"""
    __tablename__ = 'categories'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.String(200), nullable=True)
    display_order = db.Column(db.Integer, default=0)

    # Use back_populates instead of backref to avoid conflicts
    menu_items = db.relationship('backend.models.menu_item.MenuItem', back_populates='category', lazy=True)

    def __repr__(self):
        return f'<Category {self.name}>'
    
    def to_dict(self):
        """Convert category to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'display_order': self.display_order
        }