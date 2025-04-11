"""
Café Fausse - Main Flask Application
"""
from flask import Flask, jsonify
from flask_cors import CORS

# Import configuration
from .config.config import config

def create_app(config_name='development'):
    """Create and configure the Flask application"""
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Enable CORS for the frontend
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
    
    # Sample route
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Welcome to Café Fausse API',
            'status': 'online'
        })
    
    # Register blueprints
    from .api.menu import menu_bp
    from .api.reservations import reservations_bp
    from .api.newsletter import newsletter_bp
    from .api.customers import customers_bp
    from .api.auth import auth_bp
    
    app.register_blueprint(menu_bp, url_prefix='/api/menu')
    app.register_blueprint(reservations_bp, url_prefix='/api/reservations')
    app.register_blueprint(newsletter_bp, url_prefix='/api/newsletter')
    app.register_blueprint(customers_bp, url_prefix='/api/customers')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # Initialize extensions with the app
    from .extensions import db, migrate
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Configure Flask-JWT-Extended
    from flask_jwt_extended import JWTManager
    app.config["JWT_SECRET_KEY"] = app.config.get("SECRET_KEY", "default-jwt-secret-key")
    jwt = JWTManager(app)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5001)