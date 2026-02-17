from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.models import Rewards

bp = Blueprint('rewards', __name__, url_prefix='/api/rewards')

@bp.route('/my-rewards', methods=['GET'])
@jwt_required()
def get_rewards():
    """Get user's loyalty rewards"""
    try:
        user_id = int(get_jwt_identity())
        rewards = Rewards.query.filter_by(user_id=user_id).first()
        
        if not rewards:
            return jsonify({'error': 'Rewards not found'}), 404
        
        return jsonify({
            'rewards': rewards.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/add-points', methods=['POST'])
@jwt_required()
def add_points():
    """Add points to user's rewards"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or not data.get('points'):
            return jsonify({'error': 'Points amount required'}), 400
        
        rewards = Rewards.query.filter_by(user_id=user_id).first()
        
        if not rewards:
            return jsonify({'error': 'Rewards not found'}), 404
        
        rewards.points += int(data['points'])
        
        # Update tier based on points
        if rewards.points >= 5000:
            rewards.tier = 'platinum'
        elif rewards.points >= 3000:
            rewards.tier = 'gold'
        elif rewards.points >= 1000:
            rewards.tier = 'silver'
        else:
            rewards.tier = 'bronze'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Points added successfully',
            'rewards': rewards.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
