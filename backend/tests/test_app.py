import pytest
from ..app import create_app

@pytest.fixture
def client():
    app = create_app('testing')
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_app_root_endpoint(client):
    # Test the root endpoint (if defined in app.py)
    response = client.get('/')
    assert response.status_code == 200
    assert b"Welcome" in response.data  # Adjust based on actual response content

def test_404_error(client):
    # Test a non-existent endpoint to ensure 404 handling
    response = client.get('/non-existent-endpoint')
    assert response.status_code == 404
    assert b"Not Found" in response.data  # Adjust based on actual 404 response content