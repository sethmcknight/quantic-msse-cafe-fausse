"""
Database initialization script for Café Fausse application

This module provides functionality to initialize the database with the required
schema and optionally populate it with sample data for development and testing.
It creates tables for all models and adds initial categories, menu items, customers,
newsletter subscribers, reservations, and employee accounts.

This script can be run directly or imported and used programmatically.
"""
import os
import sys
from .app import create_app
from .extensions import db
from .models.category import Category
from .models.customer import Customer
from .models.reservation import Reservation
from .models.newsletter import Newsletter
from .models.employee import Employee  # Import Employee model directly
from datetime import datetime, timedelta

def init_db(app, populate_sample_data=True):
    """
    Initialize the database with optional sample data
    
    This function creates all database tables based on the SQLAlchemy models
    and optionally populates them with sample data for development and testing.
    
    Args:
        app (Flask): The Flask application instance
        populate_sample_data (bool): Whether to populate the database with sample data.
                                    Defaults to True.
    """
    print("Initializing database...")

    with app.app_context():
        # Log the database URI for debugging
        print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")

        # Drop all tables if they exist
        print("Dropping all existing tables...")
        db.drop_all()

        # Debug log to confirm schema creation
        print("Executing db.create_all() to create tables...")

        # Create all tables explicitly
        db.create_all()

        # Ensure the schema is created for testing
        if app.config.get('TESTING'):
            print("Ensuring test database schema is created...")
            db.create_all()

        if not populate_sample_data:
            print("Skipping sample data population.")
            return

        # Create categories
        print("Creating menu categories...")
        starters = Category(name="Starters", description="Appetizers and small plates", display_order=1)
        main_courses = Category(name="Main Courses", description="Entrees and main dishes", display_order=2)
        desserts = Category(name="Desserts", description="Sweet treats to finish your meal", display_order=3)
        beverages = Category(name="Beverages", description="Drinks and refreshments", display_order=4)

        db.session.add_all([starters, main_courses, desserts, beverages])
        db.session.commit()

        # Move the import of MenuItem inside the init_db function to ensure it occurs after db initialization
        from .models.menu_item import MenuItem

        # Create menu items based on the requirements
        print("Creating menu items...")

        # Starters
        bruschetta = MenuItem(
            name="Bruschetta",
            description="Fresh tomatoes, basil, olive oil, and toasted baguette slices",
            price=8.50,
            category_id=starters.id,
            is_vegetarian=True,
            display_order=1
        )

        caesar_salad = MenuItem(
            name="Caesar Salad",
            description="Crisp romaine with homemade Caesar dressing",
            price=9.00,
            category_id=starters.id,
            display_order=2
        )

        # Main Courses
        grilled_salmon = MenuItem(
            name="Grilled Salmon",
            description="Served with lemon butter sauce and seasonal vegetables",
            price=22.00,
            category_id=main_courses.id,
            is_gluten_free=True,
            display_order=1
        )

        ribeye_steak = MenuItem(
            name="Ribeye Steak",
            description="12 oz prime cut with garlic mashed potatoes",
            price=28.00,
            category_id=main_courses.id,
            is_gluten_free=True,
            display_order=2
        )

        vegetable_risotto = MenuItem(
            name="Vegetable Risotto",
            description="Creamy Arborio rice with wild mushrooms",
            price=18.00,
            category_id=main_courses.id,
            is_vegetarian=True,
            display_order=3
        )

        # Desserts
        tiramisu = MenuItem(
            name="Tiramisu",
            description="Classic Italian dessert with mascarpone",
            price=7.50,
            category_id=desserts.id,
            is_vegetarian=True,
            display_order=1
        )

        cheesecake = MenuItem(
            name="Cheesecake",
            description="Creamy cheesecake with berry compote",
            price=7.00,
            category_id=desserts.id,
            is_vegetarian=True,
            display_order=2
        )

        # Beverages
        red_wine = MenuItem(
            name="Red Wine (Glass)",
            description="A selection of Italian reds",
            price=10.00,
            category_id=beverages.id,
            display_order=1
        )

        white_wine = MenuItem(
            name="White Wine (Glass)",
            description="Crisp and refreshing",
            price=9.00,
            category_id=beverages.id,
            display_order=2
        )

        craft_beer = MenuItem(
            name="Craft Beer",
            description="Local artisan brews",
            price=6.00,
            category_id=beverages.id,
            display_order=3
        )

        espresso = MenuItem(
            name="Espresso",
            description="Strong and aromatic",
            price=3.00,
            category_id=beverages.id,
            display_order=4
        )

        db.session.add_all([
            bruschetta, caesar_salad, 
            grilled_salmon, ribeye_steak, vegetable_risotto, 
            tiramisu, cheesecake,
            red_wine, white_wine, craft_beer, espresso
        ])
        db.session.commit()

        # Create sample customers
        print("Creating sample customers...")
        customer1 = Customer(
            name="John Smith",
            email="john.smith@example.com",
            phone="555-123-4567",
            newsletter_signup=True
        )

        customer2 = Customer(
            name="Jane Doe",
            email="jane.doe@example.com",
            phone="555-987-6543",
            newsletter_signup=False
        )

        db.session.add_all([customer1, customer2])
        db.session.commit()

        # Create sample newsletter subscribers
        print("Creating newsletter subscribers...")
        subscriber1 = Newsletter(
            email="newsletter.fan@example.com",
            is_active=True
        )

        subscriber2 = Newsletter(
            email=customer1.email,  # Link to existing customer
            is_active=True
        )

        db.session.add_all([subscriber1, subscriber2])
        db.session.commit()

        # Create sample reservations
        print("Creating sample reservations...")
        tomorrow = datetime.now() + timedelta(days=1)
        next_week = datetime.now() + timedelta(days=7)

        # Format to 19:00 (7 PM)
        tomorrow_evening = tomorrow.replace(hour=19, minute=0, second=0, microsecond=0)
        next_week_evening = next_week.replace(hour=19, minute=0, second=0, microsecond=0)

        reservation1 = Reservation(
            customer_id=customer1.id,
            time_slot=tomorrow_evening,
            guests=2,
            table_number=5,
            special_requests="Window seat if possible",
            status="confirmed"
        )

        reservation2 = Reservation(
            customer_id=customer2.id,
            time_slot=next_week_evening,
            guests=4,
            table_number=10,
            status="confirmed"
        )

        db.session.add_all([reservation1, reservation2])
        db.session.commit()

        # Create sample employees
        print("Creating sample employees...")
        admin_employee = Employee(
            username="admin",
            role="admin"
        )
        admin_employee.set_password("password123")

        db.session.add(admin_employee)
        db.session.commit()

        print("Sample employees created!")

        print("Database initialization complete!")

def drop_db():
    """
    Drop all tables in the database
    
    This function removes all tables from the database, effectively
    resetting it to an empty state. Use with caution as it permanently
    deletes all data.
    """
    print("Dropping all tables...")
    db.drop_all()
    db.session.commit()

if __name__ == '__main__':
    app = create_app('development')
    init_db(app)