# Quick Start Guide - Riget Zoo Adventures (Flask Version)

## Setup (5 minutes)

### Step 1: Install Python Dependencies
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Step 2: Setup Database (MySQL)
```bash
# Create database and tables
mysql -u root -p < database\schema.sql
```

### Step 3: Configure Environment
```bash
# Copy and edit .env file
copy .env.example .env

# Edit .env with your MySQL credentials:
# DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/riget_zoo_adventures
```

### Step 4: Start Backend Server
```bash
python run.py
# Runs on http://localhost:5000
```

### Step 5: Start Frontend Server
```bash
cd frontend
python -m http.server 8000
# Open http://localhost:8000
```

## Test Credentials (if using sample data)
- **Email:** john.doe@example.com
- **Password:** password123

---

## Key Files

| File | Purpose |
|------|---------|
| `run.py` | Flask app entry point |
| `app/__init__.py` | Flask app factory |
| `app/models/models.py` | Database models (User, Booking, etc) |
| `app/routes/` | API endpoints |
| `config.py` | Configuration management |
| `database/schema.sql` | Database structure |

---

## Backend API Endpoints

**Authentication**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

**Zoo Bookings**
- `POST /api/booking/create` - Create booking
- `GET /api/booking/my-bookings` - Get user's bookings

**Hotel Bookings**
- `POST /api/hotel/book` - Book hotel
- `GET /api/hotel/my-bookings` - Get hotel bookings

**User**
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile

**Rewards (Loyalty)**
- `GET /api/rewards/my-rewards` - Get rewards
- `POST /api/rewards/add-points` - Add points

---

## Features to Test

1. ✅ **Register** - Create account with validation
2. ✅ **Login** - JWT authentication
3. ✅ **Book Zoo Tickets** - Check availability and create booking
4. ✅ **Book Hotel** - Search and reserve rooms
5. ✅ **My Account** - View bookings and profile
6. ✅ **Rewards** - Check loyalty points and tier

---

## Tech Stack

- **Backend:** Python + Flask
- **Database:** MySQL
- **Authentication:** JWT (Flask-JWT-Extended)
- **CORS:** Flask-CORS
- **Frontend:** HTML, CSS, JavaScript

---

## Common Issues

**Q: "Module not found" error**
A: Make sure you activated the virtual environment: `venv\Scripts\activate`

**Q: "Connection refused" to database**
A: Ensure MySQL is running and credentials in `.env` are correct

**Q: CORS errors when registering**
A: Make sure `CORS_ORIGIN` in `.env` matches your frontend URL (http://localhost:8000)

---

## Next Steps

- Modify `app/routes/` files to add more features
- Update database models in `app/models/models.py`
- Configure `config.py` for production deployment
- Add more validation in request handlers

Enjoy! 🦁
