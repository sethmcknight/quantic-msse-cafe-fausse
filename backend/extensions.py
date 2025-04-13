"""
Shared extensions for the Flask application

This module initializes Flask extensions that are used across the application.
These extensions are initialized without binding to a specific Flask application
instance, following the Flask application factory pattern. They will be
initialized with the app instance when create_app() is called.

Extensions defined:
- SQLAlchemy: For ORM database operations
- Migrate: For handling database migrations
"""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Initialize SQLAlchemy without binding to app
db = SQLAlchemy()
migrate = Migrate()