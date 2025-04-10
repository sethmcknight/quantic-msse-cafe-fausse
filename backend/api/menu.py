"""
Menu API Blueprint for Café Fausse
"""
from flask import Blueprint, jsonify, request
from ..extensions import db
from ..models.menu_item import MenuItem
from ..models.category import Category
from sqlalchemy.orm import Session

menu_bp = Blueprint('menu', __name__)

@menu_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all menu categories"""
    categories = Category.query.all()
    return jsonify({
        'success': True,
        'categories': [category.to_dict() for category in categories]
    })

@menu_bp.route('/items', methods=['GET'])
def get_menu_items():
    """Get all menu items, optionally filtered by category"""
    category_id = request.args.get('category_id', type=int)
    
    if category_id:
        items = MenuItem.query.filter_by(category_id=category_id).all()
    else:
        items = MenuItem.query.all()
        
    return jsonify({
        'success': True,
        'items': [item.to_dict() for item in items]
    })

@menu_bp.route('/items/<int:item_id>', methods=['GET'])
def get_menu_item(item_id):
    """Get a specific menu item by ID"""
    session = Session(db.engine)
    item = session.get(MenuItem, item_id)
    session.close()
    
    if not item:
        return jsonify({'success': False, 'message': 'Menu item not found'}), 404
        
    return jsonify({
        'success': True,
        'item': item.to_dict()
    })

@menu_bp.route('/categories/<int:category_id>/items', methods=['GET'])
def get_items_by_category(category_id):
    """Get all menu items for a specific category"""
    session = Session(db.engine)
    category = session.get(Category, category_id)
    session.close()
    
    if not category:
        return jsonify({'success': False, 'message': 'Category not found'}), 404
        
    items = MenuItem.query.filter_by(category_id=category_id).all()
    
    return jsonify({
        'success': True,
        'category': category.name,
        'items': [item.to_dict() for item in items]
    })

@menu_bp.route('/items', methods=['POST'])
def add_menu_item():
    """Add a new menu item"""
    data = request.json

    required_fields = ['name', 'price', 'category_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'success': False, 'message': f'Missing required field: {field}'}), 400

    try:
        menu_item = MenuItem(
            name=data['name'],
            description=data.get('description', ''),
            price=data['price'],
            category_id=data['category_id'],
            is_vegetarian=data.get('is_vegetarian', False),
            is_vegan=data.get('is_vegan', False),
            is_gluten_free=data.get('is_gluten_free', False),
            image_url=data.get('image_url', None)
        )
        db.session.add(menu_item)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Menu item added successfully', 'item': menu_item.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'An error occurred: {str(e)}'}), 500