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