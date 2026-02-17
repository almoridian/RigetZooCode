from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.models import Booking, User

bp = Blueprint('booking', __name__, url_prefix='/api/booking')

@bp.route('/create', methods=['POST'])
@jwt_required()
def create_booking():
    """Create a new booking"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required = ['ticket_type', 'booking_date', 'num_tickets', 'total_price']
        for field in required:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        booking = Booking(
            user_id=user_id,
            ticket_type=data['ticket_type'],
            booking_date=data['booking_date'],
            num_tickets=data['num_tickets'],
            total_price=data['total_price']
        )
        
        db.session.add(booking)
        db.session.commit()
        
        return jsonify({
            'message': 'Booking created successfully',
            'booking': booking.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/my-bookings', methods=['GET'])
@jwt_required()
def get_bookings():
    """Get user's bookings"""
    try:
        user_id = int(get_jwt_identity())
        bookings = Booking.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'bookings': [b.to_dict() for b in bookings]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
