"""
JWT utilities for Flask-JWT-Extended
"""

def create_jwt_payload(user):
    """Create JWT payload"""
    return {
        'user_id': user.user_id,
        'email': user.email,
        'role': user.role
    }
