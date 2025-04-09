import pytest
from flask.testing import FlaskClient
from backend.app import create_app
from backend.init_db import init_db

@pytest.fixture
def client():
    app = create_app('testing')
    app.config['TESTING'] = True
    with app.app_context():
        init_db(app, populate_sample_data=True)  # Ensure admin user is created
    with app.test_client() as client:
        yield client

@pytest.fixture
def admin_token(client: FlaskClient):
    # Generate an admin authentication token
    login_data = {
        'username': 'admin',
        'password': 'admin123'
    }
    print("Generating admin authentication token...")
    print(f"Login data: {login_data}")
    response = client.post('/api/auth/login', json=login_data)
    print(f"Response status code: {response.status_code}")
    print(f"Response JSON: {response.json}")
    assert response.status_code == 200
    return response.json['user']['token']

@pytest.fixture(scope='module', autouse=True)
def setup_database():
    app = create_app('testing')
    with app.app_context():
        from backend.init_db import init_db
        init_db(app, populate_sample_data=True)  # Ensure admin user is created

def test_create_employee_valid(client: FlaskClient, admin_token):
    # Test creating an employee with valid data
    employee_data = {
        'username': 'new_employee',
        'email': 'new_employee@example.com',
        'password': 'password123',
        'first_name': 'John',
        'last_name': 'Doe',
        'role': 'staff'
    }
    response = client.post('/api/admin/employees', json=employee_data, headers={
        'Authorization': f'Bearer {admin_token}'
    })
    assert response.status_code == 201
    assert 'employee' in response.json
    assert response.json['employee']['username'] == 'new_employee'

def test_create_employee_missing_fields(client: FlaskClient, admin_token):
    # Test creating an employee with missing required fields
    employee_data = {
        'username': 'incomplete_employee',
        'email': 'incomplete@example.com'
    }
    response = client.post('/api/admin/employees', json=employee_data, headers={
        'Authorization': f'Bearer {admin_token}'
    })
    assert response.status_code == 400
    assert 'error' in response.json

def test_create_employee_duplicate_username(client: FlaskClient, admin_token):
    # Test creating an employee with a duplicate username
    employee_data = {
        'username': 'admin',  # Duplicate username
        'email': 'duplicate@example.com',
        'password': 'password123',
        'first_name': 'Jane',
        'last_name': 'Doe',
        'role': 'staff'
    }
    response = client.post('/api/admin/employees', json=employee_data, headers={
        'Authorization': f'Bearer {admin_token}'
    })
    assert response.status_code == 409
    assert 'error' in response.json

def test_update_employee_valid(client: FlaskClient, admin_token):
    # Test updating an employee's details with valid data
    employee_data = {
        'email': 'updated_employee@example.com',
        'role': 'staff'  # Adjusted to a valid role
    }
    response = client.put('/api/admin/employees/1', json=employee_data, headers={
        'Authorization': f'Bearer {admin_token}'
    })
    assert response.status_code == 200
    assert 'employee' in response.json
    assert response.json['employee']['email'] == 'updated_employee@example.com'
    assert response.json['employee']['role'] == 'staff'

def test_update_employee_invalid_email(client: FlaskClient, admin_token):
    # Test updating an employee with an invalid email format
    employee_data = {
        'email': 'invalid-email'
    }
    response = client.put('/api/admin/employees/1', json=employee_data, headers={
        'Authorization': f'Bearer {admin_token}'
    })
    assert response.status_code == 400
    assert 'error' in response.json

def test_prevent_admin_deactivation(client: FlaskClient, admin_token):
    # Test preventing an admin from deactivating their own account
    employee_data = {
        'is_active': False
    }
    response = client.put('/api/admin/employees/1', json=employee_data, headers={
        'Authorization': f'Bearer {admin_token}'
    })
    assert response.status_code == 400
    assert 'error' in response.json

def test_deactivate_employee(client: FlaskClient, admin_token):
    # Test deactivating an employee
    response = client.delete('/api/admin/employees/2', headers={
        'Authorization': f'Bearer {admin_token}'
    })  # Assuming employee ID 2 exists
    assert response.status_code == 200
    assert 'message' in response.json
    assert response.json['message'] == 'Employee deactivated successfully'

def test_prevent_self_deletion(client: FlaskClient, admin_token):
    # Test preventing an admin from deleting their own account
    response = client.delete('/api/admin/employees/1', headers={
        'Authorization': f'Bearer {admin_token}'
    })  # Assuming admin ID is 1
    assert response.status_code == 400
    assert 'error' in response.json

def test_get_all_employees(client: FlaskClient, admin_token):
    # Test retrieving a list of all employees
    response = client.get('/api/admin/employees', headers={
        'Authorization': f'Bearer {admin_token}'
    })
    assert response.status_code == 200
    assert 'employees' in response.json
    assert isinstance(response.json['employees'], list)

def test_get_specific_employee(client: FlaskClient, admin_token):
    # Test retrieving a specific employee by ID
    response = client.get('/api/admin/employees/1', headers={
        'Authorization': f'Bearer {admin_token}'
    })  # Assuming employee ID 1 exists
    assert response.status_code == 200
    assert 'employee' in response.json
    assert response.json['employee']['id'] == 1

def test_get_dashboard_statistics(client: FlaskClient, admin_token):
    # Test retrieving dashboard statistics
    response = client.get('/api/admin/dashboard', headers={
        'Authorization': f'Bearer {admin_token}'
    })
    assert response.status_code == 200
    assert 'stats' in response.json
    assert 'menu_items' in response.json['stats']
    assert 'categories' in response.json['stats']
    assert 'customers' in response.json['stats']
    assert 'newsletter_subscribers' in response.json['stats']

def test_get_upcoming_reservations(client: FlaskClient, admin_token):
    # Test retrieving upcoming reservations
    response = client.get('/api/admin/dashboard', headers={
        'Authorization': f'Bearer {admin_token}'
    })
    assert response.status_code == 200
    assert 'upcoming_reservations' in response.json
    assert isinstance(response.json['upcoming_reservations'], list)

def test_dashboard_error_handling(client: FlaskClient, monkeypatch, admin_token):
    # Simulate a database error when fetching dashboard data
    def mock_query(*args, **kwargs):
        raise Exception("Database connection error")

    with client.application.app_context():
        monkeypatch.setattr('backend.models.menu_item.MenuItem.query', mock_query)

        response = client.get('/api/admin/dashboard', headers={
            'Authorization': f'Bearer {admin_token}'
        })
        assert response.status_code == 500
        assert 'error' in response.json