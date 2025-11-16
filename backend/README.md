# Restaurant Management System Backend

This is the Flask backend for the Restaurant Management System.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the application:**
   ```bash
   python app.py
   ```

**Alternative: Use the startup script**
```bash
# On Windows
start-backend.bat

# On macOS/Linux
./start-backend.sh
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Reviews
- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Create a new review
- `GET /api/reviews/{id}` - Get a specific review
- `DELETE /api/reviews/{id}` - Delete a review

### Statistics
- `GET /api/stats` - Get review statistics

### Health Check
- `GET /api/health` - API health check

## Database

The application uses SQLite database (`restaurant.db`) which will be automatically created when you first run the application.

## CORS

Cross-Origin Resource Sharing (CORS) is enabled for all routes to allow the React frontend to communicate with the backend.