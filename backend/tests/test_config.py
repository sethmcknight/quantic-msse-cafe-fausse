import pytest
from ..config.config import DevelopmentConfig, TestingConfig, ProductionConfig
from ..app import create_app

@pytest.fixture
def client():
    app = create_app('testing')
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_development_config():
    config = DevelopmentConfig()
    assert config.DEBUG is True
    assert config.SQLALCHEMY_DATABASE_URI.startswith("postgresql://")

def test_testing_config():
    config = TestingConfig()
    assert config.TESTING is True
    assert config.SQLALCHEMY_DATABASE_URI.startswith("postgresql://")

def test_production_config():
    config = ProductionConfig()
    assert config.DEBUG is False
    assert config.TESTING is False
    assert config.SQLALCHEMY_DATABASE_URI.startswith("postgresql://")