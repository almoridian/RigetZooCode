from app import db
from datetime import datetime
import bcrypt

class User(db.Model):
    """User model"""
    __tablename__ = 'users'
    
    user_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20), nullable=True)
    role = db.Column(db.String(20), default='customer')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    bookings = db.relationship('Booking', backref='user', lazy=True)
    hotel_bookings = db.relationship('HotelBooking', backref='user', lazy=True)
    rewards = db.relationship('Rewards', backref='user', uselist=False)
    
    @staticmethod
    def hash_password(password):
        """Hash password using bcrypt"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        """Verify password"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'user_id': self.user_id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role
        }


class Booking(db.Model):
    """Zoo ticket booking"""
    __tablename__ = 'bookings'
    
    booking_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    ticket_type = db.Column(db.String(50), nullable=False)
    booking_date = db.Column(db.Date, nullable=False)
    num_tickets = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Decimal(10, 2), nullable=False)
    status = db.Column(db.String(20), default='confirmed')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'booking_id': self.booking_id,
            'ticket_type': self.ticket_type,
            'booking_date': str(self.booking_date),
            'num_tickets': self.num_tickets,
            'total_price': float(self.total_price),
            'status': self.status
        }


class HotelBooking(db.Model):
    """Hotel room booking"""
    __tablename__ = 'hotel_bookings'
    
    hotel_booking_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    room_type = db.Column(db.String(50), nullable=False)
    check_in = db.Column(db.Date, nullable=False)
    check_out = db.Column(db.Date, nullable=False)
    num_rooms = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Decimal(10, 2), nullable=False)
    status = db.Column(db.String(20), default='confirmed')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'hotel_booking_id': self.hotel_booking_id,
            'room_type': self.room_type,
            'check_in': str(self.check_in),
            'check_out': str(self.check_out),
            'num_rooms': self.num_rooms,
            'total_price': float(self.total_price),
            'status': self.status
        }


class Rewards(db.Model):
    """Loyalty rewards program"""
    __tablename__ = 'rewards'
    
    reward_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), unique=True, nullable=False)
    points = db.Column(db.Integer, default=0)
    tier = db.Column(db.String(20), default='bronze')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'reward_id': self.reward_id,
            'user_id': self.user_id,
            'points': self.points,
            'tier': self.tier
        }
