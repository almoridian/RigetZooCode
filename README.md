# Riget Zoo Adventures - Flask Version

A Python/Flask backend for the Riget Zoo Adventures booking system with MySQL database.

## Quick Start

### 1. Setup

```bash
cd RigetZooCode-Flask
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 2. Database Setup

```bash
mysql -u root -p < database\schema.sql
```

### 3. Configure

Copy `.env.example` to `.env` and update MySQL credentials:

```
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/riget_zoo_adventures
JWT_SECRET_KEY=your-secret-key
CORS_ORIGIN=http://localhost:8000
```

### 4. Run Backend

```bash
python run.py
```

Runs on `http://localhost:5000`

### 5. Run Frontend

```bash
cd frontend
python -m http.server 8000
```

Access at `http://localhost:8000`

## Project Structure

```
app/
├── routes/          # API endpoints
│   ├── auth_bp.py    # Login/Register
│   ├── booking_bp.py # Zoo tickets
│   ├── hotel_bp.py   # Hotel bookings
│   ├── user_bp.py    # User profile
│   └── rewards_bp.py # Loyalty program
├── models/          # Database models
│   └── models.py
└── __init__.py      # Flask app factory
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Bookings
- `POST /api/booking/create` - Create booking
- `GET /api/booking/my-bookings` - Get user's bookings

### Hotel
- `POST /api/hotel/book` - Book hotel
- `GET /api/hotel/my-bookings` - Get hotel bookings

### User
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile

### Rewards
- `GET /api/rewards/my-rewards` - Get rewards
- `POST /api/rewards/add-points` - Add points

## Tech Stack

- **Backend:** Python + Flask
- **Database:** MySQL
- **Auth:** JWT (Flask-JWT-Extended)
- **Frontend:** HTML, CSS, JavaScript
