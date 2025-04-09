import pytest
from backend.init_db import init_db
from backend.extensions import db
from backend.models.category import Category
from backend.models.menu_item import MenuItem
from backend.models.customer import Customer
from backend.models.reservation import Reservation
from backend.models.newsletter import Newsletter
from backend.app import create_app

@pytest.fixture
def client():
    app = create_app('testing')
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            init_db(app)  # Initialize the database within the app context
        yield client

# Test database initialization process
def test_database_initialization():
    # Add test cases for database initialization
    pass

# Test init_db.py script functionality
def test_init_db_script():
    app = create_app('testing')
    with app.app_context():
        db.create_all()  # Ensure database schema is initialized
        init_db(app)

        # Verify categories were created
        categories = Category.query.all()
        assert len(categories) > 0

        # Verify menu items were created
        menu_items = MenuItem.query.all()
        assert len(menu_items) > 0

        # Verify customers were created
        customers = Customer.query.all()
        assert len(customers) > 0

        # Verify newsletter subscribers were created
        subscribers = Newsletter.query.all()
        assert len(subscribers) > 0

        # Verify reservations were created
        reservations = Reservation.query.all()
        assert len(reservations) > 0