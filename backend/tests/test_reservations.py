import pytest
from backend.api.reservations import create_reservation, get_reservations
from backend.app import create_app
from backend.init_db import init_db
from backend.init_db import drop_db  # Ensure drop_db is imported
import logging
from flask.testing import FlaskClient

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

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

@pytest.fixture(scope='module', autouse=True)
def setup_database():
    app = create_app('testing')
    with app.app_context():
        from backend.init_db import init_db
        init_db(app, populate_sample_data=True)  # Ensure admin user is created

@pytest.fixture
def admin_token(client: FlaskClient):
    # Generate an admin authentication token
    login_data = {
        'username': 'admin',
        'password': 'admin123'
    }
    response = client.post('/api/auth/login', json=login_data)
    assert response.status_code == 200
    return response.json['user']['token']

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
    assert response.json["message"] == "Thank you for your reservation. We look forward to serving you!"

    # Test missing required fields
    response = client.post('/api/reservations', json={
        "name": "Jane Doe"
    })
    assert response.status_code == 400
    assert "error" in response.json  # Verify the "error" key is present

    # Test invalid date format
    response = client.post('/api.reservations', json={
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
    assert len(response.json["reservations"]) == 1
    assert response.json["reservations"][0]["customer_name"] == "John Doe"

def test_create_reservation_missing_data(client: FlaskClient, admin_token):
    # Test creating a reservation with missing required fields
    reservation_data = {
        'customer_id': 1  # Missing other required fields
    }
    response = client.post('/api/admin/reservations', json=reservation_data, headers={
        'Authorization': f'Bearer {admin_token}'
    })
    assert response.status_code == 400
    assert 'error' in response.json

def test_create_reservation_invalid_data(client: FlaskClient, admin_token):
    # Test creating a reservation with invalid data
    reservation_data = {
        'customer_id': 1,
        'time_slot': 'invalid-date',  # Invalid date format
        'guests': -1,  # Invalid number of guests
        'table_number': 5
    }
    response = client.post('/api/admin/reservations', json=reservation_data, headers={
        'Authorization': f'Bearer {admin_token}'
    })
    assert response.status_code == 400
    assert 'error' in response.json

def test_update_reservation_details(client: FlaskClient):
    # Test updating reservation details with valid data
    reservation_data = {
        'table_number': 10,
        'status': 'confirmed'
    }
    response = client.put('/api/admin/reservations/1', json=reservation_data)  # Assuming reservation ID 1 exists
    assert response.status_code == 200
    assert 'reservation' in response.json
    assert response.json['reservation']['table_number'] == 10
    assert response.json['reservation']['status'] == 'confirmed'

def test_update_reservation_invalid_data(client: FlaskClient):
    # Test updating a reservation with invalid data
    reservation_data = {
        'table_number': -5  # Invalid table number
    }
    response = client.put('/api/admin/reservations/1', json=reservation_data)  # Assuming reservation ID 1 exists
    assert response.status_code == 400
    assert 'error' in response.json

def test_cancel_reservation(client: FlaskClient):
    # Test canceling a reservation
    response = client.delete('/api/admin/reservations/1')  # Assuming reservation ID 1 exists
    assert response.status_code == 200
    assert 'message' in response.json
    assert response.json['message'] == 'Reservation cancelled successfully'

def test_cancel_nonexistent_reservation(client: FlaskClient):
    # Test canceling a reservation that does not exist
    response = client.delete('/api/admin/reservations/9999')  # Nonexistent reservation ID
    assert response.status_code == 404
    assert 'error' in response.json

def test_get_all_reservations(client: FlaskClient):
    # Test retrieving all reservations
    response = client.get('/api/admin/reservations')
    assert response.status_code == 200
    assert 'reservations' in response.json
    assert isinstance(response.json['reservations'], list)

def test_filter_reservations_by_date(client: FlaskClient):
    # Test filtering reservations by date
    response = client.get('/api/admin/reservations?date=2025-04-10')
    assert response.status_code == 200
    assert 'reservations' in response.json
    assert isinstance(response.json['reservations'], list)

def test_get_specific_reservation(client: FlaskClient):
    # Test retrieving a specific reservation by ID
    response = client.get('/api/admin/reservations/1')  # Assuming reservation ID 1 exists
    assert response.status_code == 200
    assert 'reservation' in response.json
    assert response.json['reservation']['id'] == 1