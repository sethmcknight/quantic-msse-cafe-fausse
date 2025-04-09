import pytest
from backend.api.newsletter import subscribe_to_newsletter
from backend.models.newsletter import Newsletter
from backend.app import create_app
from backend.init_db import init_db

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
        init_db(app)
    yield
    # Teardown the database after testing
    from backend.init_db import drop_db
    drop_db()

def test_subscribe_to_newsletter(client, init_database):
    # Test valid subscription
    response = client.post('/api/newsletter/subscribe', json={"email": "test@example.com"})
    assert response.status_code == 201
    assert response.json["message"] == "Thank you for subscribing to our newsletter!"

    # Test duplicate subscription
    response = client.post('/api/newsletter/subscribe', json={"email": "test@example.com"})
    assert response.status_code == 409
    assert response.json["message"] == "This email is already subscribed to our newsletter"

    # Test invalid email
    response = client.post('/api/newsletter/subscribe', json={"email": "invalid-email"})
    assert response.status_code == 400
    assert response.json["message"] == "Invalid email format"