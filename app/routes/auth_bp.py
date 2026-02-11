from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app import db
from app.models.models import User, Rewards

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if email already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create user
        user = User(
            email=data['email'],
            password_hash=User.hash_password(data['password']),
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone_number=data.get('phone_number')
        )
        
        db.session.add(user)
        db.session.flush()  # Get the user_id
        
        # Initialize rewards
        rewards = Rewards(user_id=user.user_id)
        db.session.add(rewards)
        db.session.commit()
        
        return jsonify({
            'message': 'Registration successful',
            'user': user.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password required'}), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        
        # Verify credentials
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is inactive'}), 403
        
        # Generate JWT token
        access_token = create_access_token(identity=user.user_id)
        
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/logout', methods=['POST'])
def logout():
    """User logout"""
    return jsonify({'message': 'Logout successful'}), 200
