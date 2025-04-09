import pytest
from flask.testing import FlaskClient
from backend.app import create_app

@pytest.fixture
def client():
    app = create_app('testing')
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_create_employee_valid(client: FlaskClient):
    # Test creating an employee with valid data
    employee_data = {
        'username': 'new_employee',
        'email': 'new_employee@example.com',
        'password': 'password123',
        'first_name': 'John',
        'last_name': 'Doe',
        'role': 'staff'
    }
    response = client.post('/api/admin/employees', json=employee_data)
    assert response.status_code == 201
    assert 'employee' in response.json
    assert response.json['employee']['username'] == 'new_employee'

def test_create_employee_missing_fields(client: FlaskClient):
    # Test creating an employee with missing required fields
    employee_data = {
        'username': 'incomplete_employee',
        'email': 'incomplete@example.com'
    }
    response = client.post('/api/admin/employees', json=employee_data)
    assert response.status_code == 400
    assert 'error' in response.json

def test_create_employee_duplicate_username(client: FlaskClient):
    # Test creating an employee with a duplicate username
    employee_data = {
        'username': 'admin',  # Duplicate username
        'email': 'duplicate@example.com',
        'password': 'password123',
        'first_name': 'Jane',
        'last_name': 'Doe',
        'role': 'staff'
    }
    response = client.post('/api/admin/employees', json=employee_data)
    assert response.status_code == 409
    assert 'error' in response.json