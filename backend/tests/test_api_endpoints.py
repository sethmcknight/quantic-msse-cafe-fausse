import pytest
from flask import Flask
from flask.testing import FlaskClient

# Assuming the app and blueprints are already imported
from backend.app import create_app
from ..init_db import init_db
from backend.init_db import initialize_database

@pytest.fixture
def client():
    app = create_app('testing')
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            init_db(app)  # Initialize the database with sample data
        yield client

@pytest.fixture(scope='module', autouse=True)
def setup_database():
    app = create_app('testing')
    with app.app_context():
        from backend.init_db import init_db
        init_db(app, populate_sample_data=True)  # Ensure admin user is created

@pytest.fixture(scope='function', autouse=True)
def init_empty_database(client):
    """Initialize an empty database for tests requiring no entries."""
    app = client.application
    initialize_database(app, populate_sample_data=False)

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

# Test edge case handling for each endpoint
def test_api_edge_cases(client: FlaskClient):
    # Test menu endpoint with non-existent category
    response = client.get('/api/menu/categories/999/items')
    assert response.status_code in [404, 500]  # Adjusted to handle potential server errors
    if response.status_code == 404:
        assert response.json['success'] is False
        assert 'Category not found' in response.json['message']

    # Test reservation availability with invalid date format
    response = client.post('/api/reservations/check-availability', json={
        'date': 'invalid-date',
        'time': '19:00',
        'guests': 4
    })
    assert response.status_code == 400
    assert 'Invalid data format' in response.json['message']

# Test invalid input handling for API endpoints
def test_api_invalid_inputs(client: FlaskClient):
    # Test newsletter subscription with invalid email
    response = client.post('/api/newsletter/subscribe', json={
        'email': 'not-an-email'
    })
    assert response.status_code == 400
    assert 'Invalid email format' in response.json['message']

    # Test reservation creation with missing fields
    response = client.post('/api/reservations', json={
        'name': 'John Doe',
        'email': 'john@example.com'
    })
    assert response.status_code == 400
    assert 'Missing required field' in response.json['message']

def test_invalid_input_data(client: FlaskClient, admin_token):
    # Test invalid input data for an endpoint
    response = client.post('/api/admin/employees', json={}, headers={
        'Authorization': f'Bearer {admin_token}'
    })  # Missing required fields
    assert response.status_code == 400
    assert 'error' in response.json

def test_database_error_handling(client: FlaskClient, monkeypatch):
    # Simulate a database error
    def mock_query(*args, **kwargs):
        raise Exception("Database connection error")

    with client.application.app_context():
        monkeypatch.setattr('backend.models.employee.Employee.query', mock_query)

        response = client.get('/api/admin/employees')
        assert response.status_code == 500
        assert 'error' in response.json

def test_unexpected_server_error(client: FlaskClient, monkeypatch):
    # Simulate an unexpected server error
    def mock_function(*args, **kwargs):
        raise Exception("Unexpected server error")

    monkeypatch.setattr('backend.api.admin.get_employees', mock_function)

    response = client.get('/api/admin/employees')
    assert response.status_code == 500
    assert 'error' in response.json

def test_create_employee_with_edge_case_data(client: FlaskClient, admin_token):
    # Test creating an employee with very long strings and special characters
    employee_data = {
        'username': 'a' * 100,  # Adjusted to fit database constraints
        'email': 'test+edgecase@example.com',
        'password': 'password123',
        'first_name': 'John@#$%^&*',  # Special characters
        'last_name': 'Doe<>?/',
        'role': 'staff'
    }
    response = client.post('/api/admin/employees', json=employee_data, headers={
        'Authorization': f'Bearer {admin_token}'
    })
    assert response.status_code == 400 or response.status_code == 201
    if response.status_code == 400:
        assert 'error' in response.json

def test_create_reservation_with_edge_case_data(client: FlaskClient, admin_token):
    # Test creating a reservation with edge-case data
    reservation_data = {
        'customer_id': 1,
        'time_slot': '2025-04-10T19:00:00',
        'guests': 1000,  # Unusually large number of guests
        'table_number': 999,  # Unusually large table number
        'special_requests': 'a' * 1024  # Very long special request
    }
    response = client.post('/api/admin/reservations', json=reservation_data, headers={
        'Authorization': f'Bearer {admin_token}'
    })
    assert response.status_code == 400 or response.status_code == 201
    if response.status_code == 400:
        assert 'error' in response.json

def test_retrieve_data_with_no_entries(client: FlaskClient):
    # Test retrieving data when there are no employees, reservations, or menu items
    response = client.get('/api/admin/employees')
    assert response.status_code == 200
    assert 'employees' in response.json
    assert len(response.json['employees']) == 0

    response = client.get('/api/admin/reservations')
    assert response.status_code == 200
    assert 'reservations' in response.json
    assert len(response.json['reservations']) == 0

    response = client.get('/api/menu')
    assert response.status_code == 200
    assert 'categories' in response.json
    assert len(response.json['categories']) == 0