from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database configuration
DATABASE = 'restaurant.db'

def get_db_connection():
    """Create a database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Initialize the database with required tables"""
    conn = get_db_connection()
    
    # Create reviews table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT NOT NULL,
            date TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert sample data if table is empty
    count = conn.execute('SELECT COUNT(*) FROM reviews').fetchone()[0]
    if count == 0:
        sample_reviews = [
            ("Emily Davis", 5, "Amazing food and excellent service! Will definitely come back.", "2025-10-12"),
            ("Tom Wilson", 4, "Great pizza! A bit crowded during lunch hours though.", "2025-10-11"),
            ("Lisa Anderson", 5, "Best burgers in town! Love the atmosphere too.", "2025-10-10"),
            ("David Martinez", 3, "Food was good but service was slow.", "2025-10-09"),
        ]
        
        conn.executemany(
            'INSERT INTO reviews (name, rating, comment, date) VALUES (?, ?, ?, ?)',
            sample_reviews
        )
    
    conn.commit()
    conn.close()

@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    """Get all reviews"""
    try:
        conn = get_db_connection()
        reviews = conn.execute(
            'SELECT id, name, rating, comment, date FROM reviews ORDER BY created_at DESC'
        ).fetchall()
        conn.close()
        
        # Convert to list of dictionaries
        reviews_list = []
        for review in reviews:
            reviews_list.append({
                'id': review['id'],
                'name': review['name'],
                'rating': review['rating'],
                'comment': review['comment'],
                'date': review['date']
            })
        
        return jsonify({
            'success': True,
            'reviews': reviews_list
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/reviews', methods=['POST'])
def create_review():
    """Create a new review"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(key in data for key in ['name', 'rating', 'comment']):
            return jsonify({
                'success': False,
                'error': 'Missing required fields: name, rating, comment'
            }), 400
        
        # Validate rating range
        if not isinstance(data['rating'], int) or data['rating'] < 1 or data['rating'] > 5:
            return jsonify({
                'success': False,
                'error': 'Rating must be an integer between 1 and 5'
            }), 400
        
        # Get current date
        current_date = datetime.now().strftime('%Y-%m-%d')
        
        # Insert into database
        conn = get_db_connection()
        cursor = conn.execute(
            'INSERT INTO reviews (name, rating, comment, date) VALUES (?, ?, ?, ?)',
            (data['name'], data['rating'], data['comment'], current_date)
        )
        review_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Review created successfully',
            'review': {
                'id': review_id,
                'name': data['name'],
                'rating': data['rating'],
                'comment': data['comment'],
                'date': current_date
            }
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/reviews/<int:review_id>', methods=['GET'])
def get_review(review_id):
    """Get a specific review by ID"""
    try:
        conn = get_db_connection()
        review = conn.execute(
            'SELECT id, name, rating, comment, date FROM reviews WHERE id = ?',
            (review_id,)
        ).fetchone()
        conn.close()
        
        if review:
            return jsonify({
                'success': True,
                'review': {
                    'id': review['id'],
                    'name': review['name'],
                    'rating': review['rating'],
                    'comment': review['comment'],
                    'date': review['date']
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Review not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/reviews/<int:review_id>', methods=['DELETE'])
def delete_review(review_id):
    """Delete a review"""
    try:
        conn = get_db_connection()
        cursor = conn.execute('DELETE FROM reviews WHERE id = ?', (review_id,))
        conn.commit()
        
        if cursor.rowcount > 0:
            conn.close()
            return jsonify({
                'success': True,
                'message': 'Review deleted successfully'
            })
        else:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Review not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get review statistics"""
    try:
        conn = get_db_connection()
        
        # Get total reviews count
        total_reviews = conn.execute('SELECT COUNT(*) FROM reviews').fetchone()[0]
        
        # Get average rating
        avg_rating = conn.execute('SELECT AVG(rating) FROM reviews').fetchone()[0]
        avg_rating = round(avg_rating, 1) if avg_rating else 0
        
        # Get rating distribution
        rating_dist = conn.execute('''
            SELECT rating, COUNT(*) as count 
            FROM reviews 
            GROUP BY rating 
            ORDER BY rating DESC
        ''').fetchall()
        
        # Get recent reviews count (last 7 days)
        recent_reviews = conn.execute('''
            SELECT COUNT(*) FROM reviews 
            WHERE date >= date('now', '-7 days')
        ''').fetchone()[0]
        
        conn.close()
        
        # Format rating distribution
        rating_distribution = {}
        for row in rating_dist:
            rating_distribution[f"{row['rating']}_star"] = row['count']
        
        return jsonify({
            'success': True,
            'stats': {
                'total_reviews': total_reviews,
                'average_rating': avg_rating,
                'recent_reviews_7days': recent_reviews,
                'rating_distribution': rating_distribution
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'Restaurant Management System API is running',
        'timestamp': datetime.now().isoformat()
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    # Initialize database when starting the app
    init_database()
    
    # Run the application
    app.run(debug=True, host='0.0.0.0', port=5000)