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
    
    # Create all tables according to the ER diagram
    
    # Create MENU table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS menu (
            ItemID INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create CUSTOMER table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS customer (
            CustomerID INTEGER PRIMARY KEY AUTOINCREMENT,
            CustomerName TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create EMPLOYEE table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS employee (
            EmpID INTEGER PRIMARY KEY AUTOINCREMENT,
            password TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create TABLE table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS restaurant_table (
            TableID INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create ORDER table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            OrderID INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            EmpID INTEGER,
            CustomerID INTEGER,
            customer_name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (EmpID) REFERENCES employee (EmpID),
            FOREIGN KEY (CustomerID) REFERENCES customer (CustomerID)
        )
    ''')
    
    # Create ORDER_ITEM table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS order_item (
            OrderID INTEGER,
            ItemID INTEGER,
            quantity INTEGER NOT NULL,
            PRIMARY KEY (OrderID, ItemID),
            FOREIGN KEY (OrderID) REFERENCES orders (OrderID),
            FOREIGN KEY (ItemID) REFERENCES menu (ItemID)
        )
    ''')
    
    # Create BILL table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS bill (
            billID INTEGER PRIMARY KEY AUTOINCREMENT,
            OrderID INTEGER NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            method TEXT NOT NULL,
            date TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (OrderID) REFERENCES orders (OrderID)
        )
    ''')
    
    # Create REVIEW table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS review (
            ReviewID INTEGER PRIMARY KEY AUTOINCREMENT,
            CustomerID INTEGER,
            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (CustomerID) REFERENCES customer (CustomerID)
        )
    ''')
    
    # Create RESERVATION table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS reservation (
            ReservationID INTEGER PRIMARY KEY AUTOINCREMENT,
            CustomerID INTEGER NOT NULL,
            TableID INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (CustomerID) REFERENCES customer (CustomerID),
            FOREIGN KEY (TableID) REFERENCES restaurant_table (TableID)
        )
    ''')
    
    # Create legacy reviews table for compatibility
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
    
    # Insert sample menu data if table is empty
    menu_count = conn.execute('SELECT COUNT(*) FROM menu').fetchone()[0]
    if menu_count == 0:
        sample_menu = [
            ("Margherita Pizza", 12.99, "Pizza", "Classic pizza with tomato sauce, mozzarella, and basil"),
            ("Pepperoni Pizza", 14.99, "Pizza", "Loaded with pepperoni and mozzarella cheese"),
            ("Classic Burger", 9.99, "Burgers", "Beef patty with lettuce, tomato, and special sauce"),
            ("Cheese Burger", 10.99, "Burgers", "Beef patty with double cheese, lettuce, and pickles"),
            ("French Fries", 4.99, "Sides", "Crispy golden fries with seasoning"),
            ("Onion Rings", 5.99, "Sides", "Crispy battered onion rings"),
            ("Coca Cola", 2.99, "Drinks", "Chilled soft drink"),
            ("Orange Juice", 3.99, "Drinks", "Fresh squeezed orange juice"),
            ("Caesar Salad", 7.99, "Salads", "Fresh romaine lettuce with Caesar dressing"),
            ("Chicken Wings", 11.99, "Appetizers", "Spicy chicken wings with ranch dip")
        ]
        
        conn.executemany(
            'INSERT INTO menu (name, price, category, description) VALUES (?, ?, ?, ?)',
            sample_menu
        )
    
    # Insert sample data for legacy reviews table if empty
    reviews_count = conn.execute('SELECT COUNT(*) FROM reviews').fetchone()[0]
    if reviews_count == 0:
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
    
    # Insert sample restaurant tables
    table_count = conn.execute('SELECT COUNT(*) FROM restaurant_table').fetchone()[0]
    if table_count == 0:
        for i in range(1, 21):  # Create 20 tables
            conn.execute('INSERT INTO restaurant_table (TableID) VALUES (?)', (i,))
    
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

# ==================== MENU MANAGEMENT ENDPOINTS ====================

@app.route('/api/menu', methods=['GET'])
def get_menu():
    """Get all menu items"""
    try:
        conn = get_db_connection()
        menu_items = conn.execute(
            'SELECT ItemID as id, name, price, category, description FROM menu ORDER BY category, name'
        ).fetchall()
        conn.close()
        
        # Convert to list of dictionaries
        menu_list = []
        for item in menu_items:
            menu_list.append({
                'id': item['id'],
                'name': item['name'],
                'price': float(item['price']),
                'category': item['category'],
                'description': item['description']
            })
        
        return jsonify({
            'success': True,
            'menu': menu_list
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/menu', methods=['POST'])
def create_menu_item():
    """Create a new menu item"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'price', 'category', 'description']
        if not data or not all(key in data for key in required_fields):
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(required_fields)}'
            }), 400
        
        # Validate price
        try:
            price = float(data['price'])
            if price <= 0:
                raise ValueError("Price must be positive")
        except (ValueError, TypeError):
            return jsonify({
                'success': False,
                'error': 'Price must be a valid positive number'
            }), 400
        
        # Insert into database
        conn = get_db_connection()
        cursor = conn.execute(
            'INSERT INTO menu (name, price, category, description) VALUES (?, ?, ?, ?)',
            (data['name'], price, data['category'], data['description'])
        )
        item_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Menu item created successfully',
            'item': {
                'id': item_id,
                'name': data['name'],
                'price': price,
                'category': data['category'],
                'description': data['description']
            }
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/menu/<int:item_id>', methods=['GET'])
def get_menu_item(item_id):
    """Get a specific menu item by ID"""
    try:
        conn = get_db_connection()
        item = conn.execute(
            'SELECT ItemID as id, name, price, category, description FROM menu WHERE ItemID = ?',
            (item_id,)
        ).fetchone()
        conn.close()
        
        if item:
            return jsonify({
                'success': True,
                'item': {
                    'id': item['id'],
                    'name': item['name'],
                    'price': float(item['price']),
                    'category': item['category'],
                    'description': item['description']
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Menu item not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/menu/<int:item_id>', methods=['PUT'])
def update_menu_item(item_id):
    """Update a menu item"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'price', 'category', 'description']
        if not data or not all(key in data for key in required_fields):
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(required_fields)}'
            }), 400
        
        # Validate price
        try:
            price = float(data['price'])
            if price <= 0:
                raise ValueError("Price must be positive")
        except (ValueError, TypeError):
            return jsonify({
                'success': False,
                'error': 'Price must be a valid positive number'
            }), 400
        
        # Update in database
        conn = get_db_connection()
        cursor = conn.execute(
            'UPDATE menu SET name = ?, price = ?, category = ?, description = ? WHERE ItemID = ?',
            (data['name'], price, data['category'], data['description'], item_id)
        )
        conn.commit()
        
        if cursor.rowcount > 0:
            conn.close()
            return jsonify({
                'success': True,
                'message': 'Menu item updated successfully',
                'item': {
                    'id': item_id,
                    'name': data['name'],
                    'price': price,
                    'category': data['category'],
                    'description': data['description']
                }
            })
        else:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Menu item not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/menu/<int:item_id>', methods=['DELETE'])
def delete_menu_item(item_id):
    """Delete a menu item"""
    try:
        conn = get_db_connection()
        cursor = conn.execute('DELETE FROM menu WHERE ItemID = ?', (item_id,))
        conn.commit()
        
        if cursor.rowcount > 0:
            conn.close()
            return jsonify({
                'success': True,
                'message': 'Menu item deleted successfully'
            })
        else:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Menu item not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/menu/categories', methods=['GET'])
def get_menu_categories():
    """Get all unique menu categories"""
    try:
        conn = get_db_connection()
        categories = conn.execute(
            'SELECT DISTINCT category FROM menu ORDER BY category'
        ).fetchall()
        conn.close()
        
        category_list = [row['category'] for row in categories]
        
        return jsonify({
            'success': True,
            'categories': category_list
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