"""
Development server launcher script for Café Fausse application
"""
from backend.app import create_app
import os

if __name__ == '__main__':
    app = create_app('development')
    port = int(os.environ.get('FLASK_RUN_PORT', 5001))
    app.run(debug=True, host='0.0.0.0', port=port)