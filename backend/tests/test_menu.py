import pytest
import logging
from backend.api.menu import get_menu_items, add_menu_item
from ..app import create_app
from ..init_db import init_db

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@pytest.fixture
def client():
    app = create_app('testing')
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            init_db(app)  # Initialize the database with sample data
        yield client

@pytest.fixture
def init_database():
    app = create_app('testing')
    with app.app_context():
        init_db(app, populate_sample_data=False)  # Ensure no sample data is populated
    yield
    # Teardown the database after testing
    from backend.init_db import drop_db
    drop_db()

@pytest.fixture
def init_database_with_sample_data():
    app = create_app('testing')
    with app.app_context():
        if not hasattr(app, '_db_initialized'):
            logger.debug("Initializing database with sample data for testing...")
            init_db(app, populate_sample_data=True)  # Populate with sample data
        logger.info("Database initialized with sample data.")
    yield
    logger.info("Tearing down database after testing...")
    drop_db(app)  # Teardown the database after testing

@pytest.fixture(autouse=True)
def clear_database():
    app = create_app('testing')
    with app.app_context():
        if not hasattr(app, '_db_initialized'):
            logger.debug("Initializing database for testing...")
            init_db(app, populate_sample_data=False)  # Ensure no sample data is populated
        logger.info("Database cleared for testing.")

def test_get_menu_items(client, init_database_with_sample_data):
    # Test retrieving menu items (should include sample data)
    response = client.get('/api/menu/items')
    assert response.status_code == 200

    # Validate response structure
    assert "success" in response.json
    assert "items" in response.json
    assert response.json["success"] is True

    # Ensure sample data is present
    items = response.json["items"]
    assert len(items) > 0

    # Validate the structure of the first item
    first_item = items[0]
    assert "id" in first_item
    assert "name" in first_item
    assert "description" in first_item
    assert "price" in first_item
    assert "category_id" in first_item
    assert "is_vegetarian" in first_item
    assert "is_vegan" in first_item
    assert "is_gluten_free" in first_item

    # Validate data types of the first item
    assert isinstance(first_item["id"], int)
    assert isinstance(first_item["name"], str)
    assert isinstance(first_item["description"], str)
    assert isinstance(first_item["price"], (int, float))
    assert isinstance(first_item["category_id"], int)
    assert isinstance(first_item["is_vegetarian"], bool)
    assert isinstance(first_item["is_vegan"], bool)
    assert isinstance(first_item["is_gluten_free"], bool)

    # Test retrieving menu items when the database is empty
    init_database()  # Clear the database
    response = client.get('/api/menu/items')
    assert response.status_code == 200
    assert response.json["success"] is True
    assert len(response.json["items"]) == 0  # Ensure no items are returned

@pytest.fixture
def valid_category_id(client, init_database_with_sample_data):
    """Fixture to dynamically fetch a valid category ID."""
    response = client.get('/api/menu/categories')
    assert response.status_code == 200
    categories = response.json["categories"]
    assert len(categories) > 0  # Ensure at least one category exists
    return categories[0]["id"]  # Return the first category ID

def test_add_menu_item(client, init_database_with_sample_data, valid_category_id):
    # Test adding a valid menu item
    response = client.post('/api/menu/items', json={
        "name": "Caesar Salad",
        "description": "Crisp romaine lettuce with Caesar dressing.",
        "price": 12.99,
        "category_id": valid_category_id  # Use dynamically fetched category ID
    })
    assert response.status_code == 201
    assert response.json["message"] == "Menu item added successfully"

    # Test adding a menu item with missing fields
    response = client.post('/api/menu/items', json={  # Corrected endpoint for adding menu items
        "name": "Incomplete Item"
    })
    assert response.status_code == 400
    assert "message" in response.json