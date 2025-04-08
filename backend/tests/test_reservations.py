import pytest
from backend.api.reservations import create_reservation, get_reservations
from ..app import create_app
from backend.init_db import init_db

@pytest.fixture
def client():
    app = create_app('testing')
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def init_database():
    app = create_app('testing')
    with app.app_context():
        from backend.init_db import drop_db
        drop_db()  # Reset the database before initializing
        init_db(app)  # Initialize the database
    yield
    # Teardown the database after testing
    drop_db()

def test_create_reservation(client, init_database):
    # Test valid reservation creation
    response = client.post('/api/reservations', json={
        "name": "John Doe",
        "email": "johndoe@example.com",
        "phone": "123-456-7890",
        "date": "2025-04-10",
        "time": "19:00",
        "guests": 4
    })
    assert response.status_code == 201
    assert response.json["message"] == "Reservation created successfully."

    # Test missing required fields
    response = client.post('/api/reservations', json={
        "name": "Jane Doe"
    })
    assert response.status_code == 400
    assert "error" in response.json  # Verify the "error" key is present

def test_get_reservations(client, init_database):
    # Test retrieving reservations (should be empty initially)
    response = client.get('/api/reservations')
    assert response.status_code == 200
    assert response.json == []

    # Add a reservation and test retrieval
    client.post('/api/reservations', json={
        "name": "John Doe",
        "email": "johndoe@example.com",
        "phone": "123-456-7890",
        "date": "2025-04-10",
        "time": "19:00",
        "guests": 4
    })
    response = client.get('/api/reservations')
    assert response.status_code == 200
    assert len(response.json) == 1
    assert response.json[0]["name"] == "John Doe"