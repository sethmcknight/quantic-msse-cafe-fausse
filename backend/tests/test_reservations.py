import pytest
from backend.api.reservations import create_reservation, get_reservations
from ..app import create_app
from backend.init_db import init_db
from backend.init_db import drop_db  # Ensure drop_db is imported

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
        init_db(app, populate_sample_data=False)  # Ensure no sample data is populated
    yield
    # Teardown the database after testing
    from backend.init_db import drop_db
    drop_db()

# Ensure the database is cleared before each test
@pytest.fixture(autouse=True)
def clear_database():
    app = create_app('testing')
    with app.app_context():
        from backend.init_db import drop_db, init_db
        drop_db()
        init_db(app, populate_sample_data=False)

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

    # Test invalid date format
    response = client.post('/api/reservations', json={
        "name": "John Doe",
        "email": "johndoe@example.com",
        "phone": "123-456-7890",
        "date": "10-04-2025",  # Invalid format
        "time": "19:00",
        "guests": 4
    })
    assert response.status_code == 400
    assert "Invalid data format" in response.json["message"]

    # Test reservation in the past
    response = client.post('/api/reservations', json={
        "name": "John Doe",
        "email": "johndoe@example.com",
        "phone": "123-456-7890",
        "date": "2025-04-01",  # Past date
        "time": "19:00",
        "guests": 4
    })
    assert response.status_code == 400
    assert "Cannot make reservations in the past" in response.json["message"]

def test_get_reservations(client, init_database):
    # Test retrieving reservations (should be empty initially)
    response = client.get('/api/reservations')
    assert response.status_code == 200
    assert response.json == {"success": True, "reservations": []}  # Confirm empty list

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