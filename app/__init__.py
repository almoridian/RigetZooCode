from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from config import config

db = SQLAlchemy()
jwt = JWTManager()

def create_app(config_name='development'):
    """Application factory"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Register blueprints
    from app.routes import auth_bp, booking_bp, hotel_bp, user_bp, rewards_bp
    
    app.register_blueprint(auth_bp.bp)
    app.register_blueprint(booking_bp.bp)
    app.register_blueprint(hotel_bp.bp)
    app.register_blueprint(user_bp.bp)
    app.register_blueprint(rewards_bp.bp)
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health():
        return {'status': 'healthy'}, 200
    
    return app
