from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.models import User, Rewards, Booking, HotelBooking

bp = Blueprint('user', __name__, url_prefix='/api/users')

@bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if data.get('first_name'):
            user.first_name = data['first_name']
        if data.get('last_name'):
            user.last_name = data['last_name']
        if data.get('phone_number'):
            user.phone_number = data['phone_number']
        
        db.session.commit()
        
        return jsonify(user.to_dict()), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/bookings', methods=['GET'])
@jwt_required()
def get_bookings():
    """Get user's zoo ticket bookings"""
    try:
        user_id = int(get_jwt_identity())
        bookings = Booking.query.filter_by(user_id=user_id).all()
        return jsonify([booking.to_dict() for booking in bookings]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/hotel-bookings', methods=['GET'])
@jwt_required()
def get_hotel_bookings():
    """Get user's hotel bookings"""
    try:
        user_id = int(get_jwt_identity())
        bookings = HotelBooking.query.filter_by(user_id=user_id).all()
        return jsonify([booking.to_dict() for booking in bookings]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/rewards', methods=['GET'])
@jwt_required()
def get_rewards():
    """Get user's reward points"""
    try:
        user_id = int(get_jwt_identity())
        rewards = Rewards.query.filter_by(user_id=user_id).first()
        if not rewards:
            return jsonify({'points': 0, 'tier': 'bronze'}), 200
        return jsonify({
            'points': rewards.points,
            'tier': rewards.tier,
            'vip_status': rewards.vip_status
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
