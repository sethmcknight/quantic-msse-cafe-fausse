"""
Database initialization script for Café Fausse application
"""
import os
import sys
from backend.app import create_app
from backend.extensions import db
from backend.models.category import Category
from backend.models.menu_item import MenuItem
from backend.models.customer import Customer
from backend.models.reservation import Reservation
from backend.models.newsletter import Newsletter
from backend.models.employee import Employee
from datetime import datetime, timedelta

def init_db(app, populate_sample_data=True):
    """Initialize the database with optional sample data"""
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
        
        # Debug log for admin user creation
        print("Creating admin test user...")
        admin = Employee(
            username="admin",
            email="admin@cafefausse.com",
            first_name="Admin",
            last_name="User",
            password="admin123",
            role="admin",
            is_active=True
        )
        print(f"Admin user created: {admin}")

        # Create manager test user
        print("Creating manager test user...")
        manager = Employee(
            username="manager",
            email="manager@cafefausse.com",
            first_name="Manager",
            last_name="User",
            password="manager123",
            role="manager",
            is_active=True
        )
        print(f"Manager user created: {manager}")
        
        db.session.add_all([admin, manager])
        db.session.commit()
        
        print("Database initialization complete!")

def drop_db():
    """Drop all tables in the database."""
    print("Dropping all tables...")
    db.drop_all()
    db.session.commit()

if __name__ == '__main__':
    app = create_app('development')
    init_db(app)