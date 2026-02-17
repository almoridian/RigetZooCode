from flask import Flask, render_template, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from config import config
import os

db = SQLAlchemy()
jwt = JWTManager()

def create_app(config_name='development'):
    """Application factory"""
    # Get the root directory of the project
    # __file__ is at app/__init__.py, so go up 2 directories
    root_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, 
        origins=app.config['CORS_ORIGINS'],
        allow_headers=['Content-Type', 'Authorization'],
        supports_credentials=True)
    
    # JWT error handler
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'error': 'Invalid token'}), 401
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify({'error': 'Token expired'}), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'error': 'Missing Authorization header'}), 401
    
    # Register blueprints
    from app.routes import auth_bp, booking_bp, hotel_bp, user_bp, rewards_bp
    
    app.register_blueprint(auth_bp.bp)
    app.register_blueprint(booking_bp.bp)
    app.register_blueprint(hotel_bp.bp)
    app.register_blueprint(user_bp.bp)
    app.register_blueprint(rewards_bp.bp)
    
    # Create tables
    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            # Database not available, but app can still serve static files
            print(f"Warning: Could not initialize database: {e}")
            pass
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health():
        return {'status': 'healthy'}, 200
    
    # Serve static assets (CSS, JS, images, etc.)
    @app.route('/css/<path:filename>')
    def serve_css(filename):
        frontend_dir = os.path.join(root_dir, 'frontend')
        css_dir = os.path.join(frontend_dir, 'css')
        return send_from_directory(css_dir, filename)
    
    @app.route('/js/<path:filename>')
    def serve_js(filename):
        frontend_dir = os.path.join(root_dir, 'frontend')
        js_dir = os.path.join(frontend_dir, 'js')
        return send_from_directory(js_dir, filename)
    
    @app.route('/manifest.json')
    def serve_manifest():
        frontend_dir = os.path.join(root_dir, 'frontend')
        return send_from_directory(frontend_dir, 'manifest.json')
    
    # Serve pages from the pages directory
    @app.route('/pages/<path:filename>')
    def serve_page(filename):
        frontend_dir = os.path.join(root_dir, 'frontend')
        pages_dir = os.path.join(frontend_dir, 'pages')
        return send_from_directory(pages_dir, filename)
    
    # Serve index.html at root
    @app.route('/')
    def index():
        frontend_dir = os.path.join(root_dir, 'frontend')
        return send_from_directory(frontend_dir, 'index.html')
    
    return app
