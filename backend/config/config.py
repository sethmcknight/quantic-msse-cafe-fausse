"""
Configuration settings for the Flask application

This module defines different configuration classes for various environments
(development, testing, production) used by the Flask application. Each configuration
class inherits from the base Config class and overrides specific settings as needed.

Environment variables can be used to override the default configuration values,
particularly for sensitive information like database URLs and secret keys.
"""
import os

class Config:
    """
    Base configuration
    
    This class defines the base configuration settings that are common
    across all environments. It is extended by environment-specific
    configuration classes.
    
    Attributes:
        SECRET_KEY (str): Secret key for securing the Flask app, sessions, etc.
        SQLALCHEMY_TRACK_MODIFICATIONS (bool): Disable SQLAlchemy modification tracking
    """
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    """
    Development configuration
    
    Configuration settings for the development environment.
    Enables debug mode and uses the development database.
    
    Attributes:
        DEBUG (bool): Enable Flask's debug mode
        SQLALCHEMY_DATABASE_URI (str): Connection string for the development database
    """
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
        'postgresql://postgres:postgres@localhost/cafe_fausse_dev'

class TestingConfig(Config):
    """
    Testing configuration
    
    Configuration settings for the testing environment.
    Enables testing mode and uses a separate testing database.
    
    Attributes:
        TESTING (bool): Enable Flask's testing mode
        SQLALCHEMY_DATABASE_URI (str): Connection string for the testing database
    """
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL') or \
        'postgresql://postgres:postgres@localhost/cafe_fausse_test'

class ProductionConfig(Config):
    """
    Production configuration
    
    Configuration settings for the production environment.
    Disables debug and testing modes and uses the production database.
    
    Attributes:
        SQLALCHEMY_DATABASE_URI (str): Connection string for the production database
        DEBUG (bool): Disable Flask's debug mode
        TESTING (bool): Disable Flask's testing mode
    """
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://postgres:postgres@localhost/cafe_fausse'
    DEBUG = False
    TESTING = False

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}