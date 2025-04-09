import pytest
from backend.api.menu import get_menu_items, add_menu_item
from ..app import create_app
from ..init_db import init_db

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

@pytest.fixture(autouse=True)
def clear_database():
    app = create_app('testing')
    with app.app_context():
        from backend.init_db import drop_db, init_db
        drop_db()
        init_db(app, populate_sample_data=False)

def test_get_menu_items(client, init_database):
    # Test retrieving menu items (should be empty initially)
    response = client.get('/api/menu/items')  # Corrected endpoint for retrieving menu items
    assert response.status_code == 200
    assert response.json == {"success": True, "items": []}  # Adjusted expected response

    # Add a menu item and test retrieval
    client.post('/api/menu/items', json={  # Corrected endpoint for adding menu items
        "name": "Ribeye Steak",
        "description": "Juicy ribeye steak with garlic butter.",
        "price": 29.99,
        "category_id": 2  # Assuming category_id 2 exists
    })
    response = client.get('/api/menu/items')  # Corrected endpoint for retrieving menu items
    assert response.status_code == 200
    assert len(response.json["items"]) == 1
    assert response.json["items"][0]["name"] == "Ribeye Steak"

def test_add_menu_item(client, init_database):
    # Test adding a valid menu item
    response = client.post('/api/menu/items', json={  # Corrected endpoint for adding menu items
        "name": "Caesar Salad",
        "description": "Crisp romaine lettuce with Caesar dressing.",
        "price": 12.99,
        "category_id": 1  # Assuming category_id 1 exists
    })
    assert response.status_code == 201
    assert response.json["message"] == "Menu item added successfully."

    # Test adding a menu item with missing fields
    response = client.post('/api/menu/items', json={  # Corrected endpoint for adding menu items
        "name": "Incomplete Item"
    })
    assert response.status_code == 400
    assert "message" in response.json