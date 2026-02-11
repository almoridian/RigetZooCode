from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.models import HotelBooking

bp = Blueprint('hotel', __name__, url_prefix='/api/hotel')

@bp.route('/book', methods=['POST'])
@jwt_required()
def book_hotel():
    """Book a hotel room"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required = ['room_type', 'check_in', 'check_out', 'num_rooms', 'total_price']
        for field in required:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        booking = HotelBooking(
            user_id=user_id,
            room_type=data['room_type'],
            check_in=data['check_in'],
            check_out=data['check_out'],
            num_rooms=data['num_rooms'],
            total_price=data['total_price']
        )
        
        db.session.add(booking)
        db.session.commit()
        
        return jsonify({
            'message': 'Hotel booking created successfully',
            'booking': booking.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/my-bookings', methods=['GET'])
@jwt_required()
def get_hotel_bookings():
    """Get user's hotel bookings"""
    try:
        user_id = get_jwt_identity()
        bookings = HotelBooking.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'bookings': [b.to_dict() for b in bookings]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
