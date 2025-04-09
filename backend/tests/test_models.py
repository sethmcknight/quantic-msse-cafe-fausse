import pytest
from datetime import datetime
from backend.models.category import Category
from backend.models.customer import Customer
from backend.models.menu_item import MenuItem
from backend.models.newsletter import Newsletter
from backend.models.reservation import Reservation
from backend.extensions import db
from ..app import create_app

@pytest.fixture
def client():
    app = create_app('testing')
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def setup_database():
    app = create_app('testing')
    app.app_context().push()  # Push application context
    db.create_all()
    yield
    db.session.remove()
    db.drop_all()

def test_category_model(setup_database):
    category = Category(name="Starters")
    db.session.add(category)
    db.session.commit()

    assert category.id is not None
    assert category.name == "Starters"

def test_customer_model(setup_database):
    customer = Customer(name="John Doe", email="john.doe@example.com", phone="123-456-7890")
    db.session.add(customer)
    db.session.commit()

    assert customer.id is not None
    assert customer.name == "John Doe"
    assert customer.email == "john.doe@example.com"
    assert customer.phone == "123-456-7890"

def test_menu_item_model(setup_database):
    category = Category(name="Main Course")
    db.session.add(category)
    db.session.commit()

    menu_item = MenuItem(name="Grilled Salmon", description="Fresh salmon grilled to perfection", price=25.99, category_id=category.id)
    db.session.add(menu_item)
    db.session.commit()

    assert menu_item.id is not None
    assert menu_item.name == "Grilled Salmon"
    assert menu_item.description == "Fresh salmon grilled to perfection"
    assert menu_item.price == 25.99
    assert menu_item.category_id == category.id

def test_newsletter_model(setup_database):
    newsletter = Newsletter(email="subscriber@example.com", is_active=True)
    db.session.add(newsletter)
    db.session.commit()

    assert newsletter.id is not None
    assert newsletter.email == "subscriber@example.com"
    assert newsletter.is_active is True

def test_reservation_model(setup_database):
    customer = Customer(name="Jane Doe", email="jane.doe@example.com")
    db.session.add(customer)
    db.session.commit()

    time_slot = datetime.strptime("2025-04-15 19:00", "%Y-%m-%d %H:%M")
    reservation = Reservation(customer_id=customer.id, time_slot=time_slot, guests=4, table_number=5)
    db.session.add(reservation)
    db.session.commit()

    assert reservation.id is not None
    assert reservation.customer_id == customer.id
    assert reservation.time_slot == time_slot
    assert reservation.guests == 4
    assert reservation.table_number == 5