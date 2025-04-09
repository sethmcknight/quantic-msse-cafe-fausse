import pytest
from flask import Flask
from flask.testing import FlaskClient
from backend.app import create_app

@pytest.fixture
def client():
    app = create_app('testing')
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# Ensure database initialization for testing
@pytest.fixture(scope='module', autouse=True)
def setup_database():
    app = create_app('testing')
    with app.app_context():
        from backend.init_db import init_db
        init_db(app, populate_sample_data=True)

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

def test_login_and_redirect(client: FlaskClient):
    # Simulate login with valid credentials
    login_data = {
        'username': 'admin',
        'password': 'admin123'  # Corrected password
    }
    response = client.post('/api/auth/login', json=login_data)
    assert response.status_code == 200
    assert 'user' in response.json

    # Simulate redirection to dashboard after login
    response = client.get('/api/admin/dashboard', headers={
        'Authorization': f"Bearer {response.json['user']['token']}"
    })
    assert response.status_code == 200
    assert 'stats' in response.json
    assert 'upcoming_reservations' in response.json

def test_access_admin_endpoint_without_authentication(client: FlaskClient):
    # Test accessing an admin endpoint without authentication
    response = client.get('/api/admin/dashboard')
    assert response.status_code == 401
    assert 'error' in response.json

def test_access_admin_endpoint_insufficient_permissions(client: FlaskClient, admin_token):
    # Test accessing an admin endpoint with insufficient permissions
    login_data = {
        'username': 'staff_user',  # Assuming a staff user exists
        'password': 'staff_password'
    }
    login_response = client.post('/api/auth/login', json=login_data)
    assert login_response.status_code == 200

    token = login_response.json['user']['token']
    response = client.get('/api/admin/dashboard', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 403
    assert 'error' in response.json

def test_access_manager_only_endpoint(client: FlaskClient):
    # Test accessing a manager-only endpoint as a manager
    login_data = {
        'username': 'manager_user',  # Assuming a manager user exists
        'password': 'manager_password'
    }
    login_response = client.post('/api/auth/login', json=login_data)
    assert login_response.status_code == 200

    token = login_response.json['user']['token']
    response = client.get('/api/admin/employees', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 200

    # Test accessing a manager-only endpoint as a non-manager
    login_data = {
        'username': 'staff_user',
        'password': 'staff_password'
    }
    login_response = client.post('/api/auth/login', json=login_data)
    assert login_response.status_code == 200

    token = login_response.json['user']['token']
    response = client.get('/api/admin/employees', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 403
    assert 'error' in response.json