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
    
    # Enable CORS with specific options to handle preflight requests properly
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"], "supports_credentials": True}}, 
         allow_headers=["Content-Type", "Authorization"], 
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
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
    from api.menu import menu_bp
    from api.reservations import reservations_bp
    from api.newsletter import newsletter_bp
    from api.admin import admin_bp
    from api.auth import auth_bp
    
    app.register_blueprint(menu_bp, url_prefix='/api/menu')
    app.register_blueprint(reservations_bp, url_prefix='/api/reservations')
    app.register_blueprint(newsletter_bp, url_prefix='/api/newsletter')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # Initialize extensions with the app
    from .extensions import db, migrate
    from extensions import db, migrate, login_manager
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    
    # Configure session for login manager
    login_manager.session_protection = "strong"
    login_manager.login_view = "auth.login"
    login_manager.login_message_category = "info"
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)