"""
Menu API Blueprint for Café Fausse

This module provides API endpoints for managing menu items and categories
for the Café Fausse restaurant application.
"""
from flask import Blueprint, jsonify, request
from ..extensions import db
from ..models.menu_item import MenuItem
from ..models.category import Category
from sqlalchemy.orm import Session
from flask_jwt_extended import jwt_required

menu_bp = Blueprint('menu', __name__)

@menu_bp.route('/categories', methods=['GET'])
def get_categories():
    """
    Get all menu categories
    
    Returns a list of all menu categories available in the restaurant.
    
    Returns:
        JSON: Object containing success status and a list of category objects
    """
    categories = Category.query.all()
    return jsonify({
        'success': True,
        'categories': [category.to_dict() for category in categories]
    })

@menu_bp.route('/items', methods=['GET'])
def get_menu_items():
    """
    Get all menu items, optionally filtered by category
    
    Query Parameters:
        category_id (int, optional): Filter items by category ID
    
    Returns:
        JSON: Object containing success status and a list of menu item objects
    """
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
    """
    Get a specific menu item by ID
    
    Parameters:
        item_id (int): The ID of the menu item to retrieve
    
    Returns:
        JSON: Object containing success status and the requested menu item
        
    Responses:
        404: Menu item not found
    """
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
    """
    Get all menu items for a specific category
    
    Parameters:
        category_id (int): The ID of the category to retrieve items for
    
    Returns:
        JSON: Object containing success status, category name, and a list of menu items
        
    Responses:
        404: Category not found
    """
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
@jwt_required()
def add_menu_item():
    """
    Add a new menu item
    
    Requires JWT authentication.
    
    Request Body:
        name (str): Name of the menu item
        price (float): Price of the menu item
        category_id (int): ID of the category this item belongs to
        description (str, optional): Description of the menu item
        is_vegetarian (bool, optional): Whether the item is vegetarian
        is_vegan (bool, optional): Whether the item is vegan
        is_gluten_free (bool, optional): Whether the item is gluten-free
        image_url (str, optional): URL to the menu item image
    
    Returns:
        JSON: Object containing success status, message, and the created menu item
        
    Responses:
        201: Menu item created successfully
        400: Missing required field
        500: Server error
    """
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

@menu_bp.route('/items/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_menu_item(item_id):
    """
    Update a specific menu item by ID
    
    Requires JWT authentication.
    
    Parameters:
        item_id (int): The ID of the menu item to update
        
    Request Body:
        name (str, optional): Updated name of the menu item
        description (str, optional): Updated description of the menu item
        price (float, optional): Updated price of the menu item
        category_id (int, optional): Updated category ID for the menu item
    
    Returns:
        JSON: Object containing success status and message
        
    Responses:
        200: Menu item updated successfully
        404: Menu item not found
        500: Server error
    """
    data = request.get_json()
    session = db.session

    item = session.get(MenuItem, item_id)
    if not item:
        return jsonify({'success': False, 'message': 'Menu item not found'}), 404

    # Update fields if they exist in the request
    if 'name' in data:
        item.name = data['name']
    if 'description' in data:
        item.description = data['description']
    if 'price' in data:
        item.price = data['price']
    if 'category_id' in data:
        item.category_id = data['category_id']

    try:
        session.commit()
        return jsonify({'success': True, 'message': 'Menu item updated successfully'})
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@menu_bp.route('/categories/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_menu_category(category_id):
    """
    Update a specific menu category by ID
    
    Requires JWT authentication.
    
    Parameters:
        category_id (int): The ID of the category to update
        
    Request Body:
        name (str, optional): Updated name of the category
    
    Returns:
        JSON: Object containing success status and message
        
    Responses:
        200: Category updated successfully
        404: Category not found
        500: Server error
    """
    data = request.get_json()
    session = db.session

    category = session.get(Category, category_id)
    if not category:
        return jsonify({'success': False, 'message': 'Category not found'}), 404

    # Update fields if they exist in the request
    if 'name' in data:
        category.name = data['name']

    try:
        session.commit()
        return jsonify({'success': True, 'message': 'Category updated successfully'})
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@menu_bp.route('/categories', methods=['POST'])
@jwt_required()
def add_menu_category():
    """
    Add a new menu category
    
    Requires JWT authentication.
    
    Request Body:
        name (str): Name of the category
    
    Returns:
        JSON: Object containing success status, message, and the created category
        
    Responses:
        201: Category created successfully
        400: Missing required field or category with same name already exists
        500: Server error
    """
    data = request.json

    if 'name' not in data or not data['name']:
        return jsonify({'success': False, 'message': 'Missing required field: name'}), 400

    try:
        # Check if category with the same name already exists
        existing_category = Category.query.filter_by(name=data['name']).first()
        if existing_category:
            return jsonify({'success': False, 'message': 'A category with this name already exists'}), 400

        category = Category(name=data['name'])
        db.session.add(category)
        db.session.commit()

        return jsonify({
            'success': True, 
            'message': 'Category added successfully', 
            'category': category.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'An error occurred: {str(e)}'}), 500

@menu_bp.route('/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_menu_item(item_id):
    """
    Delete a specific menu item by ID
    
    Requires JWT authentication.
    
    Parameters:
        item_id (int): The ID of the menu item to delete
    
    Returns:
        JSON: Object containing success status and message
        
    Responses:
        200: Menu item deleted successfully
        404: Menu item not found
        500: Server error
    """
    try:
        session = db.session
        item = session.get(MenuItem, item_id)
        
        if not item:
            return jsonify({'success': False, 'message': 'Menu item not found'}), 404
            
        session.delete(item)
        session.commit()
        
        return jsonify({'success': True, 'message': 'Menu item deleted successfully'})
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'message': f'An error occurred: {str(e)}'}), 500

@menu_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_menu_category(category_id):
    """
    Delete a specific menu category by ID
    
    Requires JWT authentication.
    
    Parameters:
        category_id (int): The ID of the category to delete
    
    Returns:
        JSON: Object containing success status and message
        
    Responses:
        200: Category deleted successfully
        404: Category not found
        400: Cannot delete category with existing menu items
        500: Server error
    """
    try:
        session = db.session
        category = session.get(Category, category_id)
        
        if not category:
            return jsonify({'success': False, 'message': 'Category not found'}), 404
            
        # Check if there are menu items using this category
        items_using_category = MenuItem.query.filter_by(category_id=category_id).count()
        if items_using_category > 0:
            return jsonify({
                'success': False, 
                'message': f'Cannot delete category that has {items_using_category} menu items. Please reassign or delete those items first.'
            }), 400
            
        session.delete(category)
        session.commit()
        
        return jsonify({'success': True, 'message': 'Category deleted successfully'})
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'message': f'An error occurred: {str(e)}'}), 500