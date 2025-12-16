from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os
from werkzeug.security import generate_password_hash, check_password_hash

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
            phone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create EMPLOYEE table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS employee (
            EmpID INTEGER PRIMARY KEY AUTOINCREMENT,
            password TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            role TEXT NOT NULL DEFAULT 'cashier',
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
            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    
    # Initialize default tables if none exist
    table_count = conn.execute('SELECT COUNT(*) FROM restaurant_table').fetchone()[0]
    if table_count == 0:
        # Create 12 tables by default
        for i in range(1, 13):
            conn.execute('INSERT INTO restaurant_table (TableID) VALUES (?)', (i,))
    
    # Initialize sample menu items if none exist
    menu_count = conn.execute('SELECT COUNT(*) FROM menu').fetchone()[0]
    if menu_count == 0:
        sample_menu = [
            ('Classic Burger', 8.99, 'Main Course', 'Juicy beef patty with lettuce, tomato, and special sauce'),
            ('Grilled Chicken', 12.99, 'Main Course', 'Tender grilled chicken breast with herbs'),
            ('Caesar Salad', 7.99, 'Appetizer', 'Fresh romaine lettuce with Caesar dressing and croutons'),
            ('French Fries', 3.99, 'Side', 'Crispy golden fries'),
            ('Onion Rings', 4.99, 'Side', 'Beer-battered crispy onion rings'),
            ('Spaghetti Carbonara', 11.99, 'Main Course', 'Classic Italian pasta with bacon and cream sauce'),
            ('Margherita Pizza', 10.99, 'Main Course', 'Traditional pizza with tomato, mozzarella, and basil'),
            ('Chocolate Cake', 5.99, 'Dessert', 'Rich chocolate layer cake with ganache'),
            ('Ice Cream Sundae', 4.99, 'Dessert', 'Vanilla ice cream with chocolate syrup and toppings'),
            ('Soft Drink', 2.49, 'Beverage', 'Choice of cola, lemon-lime, or orange'),
            ('Fresh Juice', 3.99, 'Beverage', 'Freshly squeezed orange or apple juice'),
            ('Coffee', 2.99, 'Beverage', 'Hot brewed coffee')
        ]
        
        for item in sample_menu:
            conn.execute(
                'INSERT INTO menu (name, price, category, description) VALUES (?, ?, ?, ?)',
                item
            )
    
    conn.commit()
    conn.close()

# ==================== AUTHENTICATION ENDPOINTS ====================

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Register a new employee"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(key in data for key in ['email', 'password', 'role']):
            return jsonify({
                'success': False,
                'error': 'Missing required fields: email, password, role'
            }), 400
        
        # Validate email format
        email = data['email'].strip().lower()
        if '@' not in email or '.' not in email:
            return jsonify({
                'success': False,
                'error': 'Invalid email format'
            }), 400
        
        # Validate password length
        if len(data['password']) < 6:
            return jsonify({
                'success': False,
                'error': 'Password must be at least 6 characters long'
            }), 400
        
        # Validate role
        role = data['role'].lower()
        if role not in ['admin', 'cashier']:
            return jsonify({
                'success': False,
                'error': 'Invalid role. Must be admin or cashier'
            }), 400
        
        # Check if email already exists
        conn = get_db_connection()
        existing_user = conn.execute(
            'SELECT EmpID FROM employee WHERE email = ?',
            (email,)
        ).fetchone()
        
        if existing_user:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Email already registered'
            }), 409
        
        # Hash the password
        hashed_password = generate_password_hash(data['password'])
        
        # Insert new employee
        cursor = conn.execute(
            'INSERT INTO employee (email, password, role) VALUES (?, ?, ?)',
            (email, hashed_password, role)
        )
        emp_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Employee registered successfully',
            'employee': {
                'id': emp_id,
                'email': email,
                'role': role
            }
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/auth/signin', methods=['POST'])
def signin():
    """Authenticate an employee"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(key in data for key in ['email', 'password']):
            return jsonify({
                'success': False,
                'error': 'Missing required fields: email, password'
            }), 400
        
        email = data['email'].strip().lower()
        
        # Find employee by email
        conn = get_db_connection()
        employee = conn.execute(
            'SELECT EmpID, email, password, role FROM employee WHERE email = ?',
            (email,)
        ).fetchone()
        conn.close()
        
        if not employee:
            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401
        
        # Verify password
        if not check_password_hash(employee['password'], data['password']):
            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'employee': {
                'id': employee['EmpID'],
                'email': employee['email'],
                'role': employee['role']
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ==================== REVIEWS ENDPOINTS ====================

@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    """Get all reviews"""
    try:
        conn = get_db_connection()
        reviews = conn.execute(
            'SELECT ReviewID, name, rating, description, created_at FROM review ORDER BY created_at DESC'
        ).fetchall()
        conn.close()
        
        # Convert to list of dictionaries
        reviews_list = []
        for review in reviews:
            reviews_list.append({
                'id': review['ReviewID'],
                'name': review['name'],
                'rating': review['rating'],
                'comment': review['description'],
                'date': review['created_at'].split()[0] if review['created_at'] else ''
            })
        
        return jsonify({
            'success': True,
            'reviews': reviews_list,
            'message': 'No reviews present' if len(reviews_list) == 0 else None
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
        
        # Insert into database (CustomerID is optional/nullable)
        conn = get_db_connection()
        cursor = conn.execute(
            'INSERT INTO review (name, rating, description) VALUES (?, ?, ?)',
            (data['name'], data['rating'], data['comment'])
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
            'SELECT ReviewID, name, rating, description, created_at FROM review WHERE ReviewID = ?',
            (review_id,)
        ).fetchone()
        conn.close()
        
        if review:
            return jsonify({
                'success': True,
                'review': {
                    'id': review['ReviewID'],
                    'name': review['name'],
                    'rating': review['rating'],
                    'comment': review['description'],
                    'date': review['created_at'].split()[0] if review['created_at'] else ''
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
        cursor = conn.execute('DELETE FROM review WHERE ReviewID = ?', (review_id,))
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
        total_reviews = conn.execute('SELECT COUNT(*) FROM review').fetchone()[0]
        
        # Get average rating
        avg_rating = conn.execute('SELECT AVG(rating) FROM review').fetchone()[0]
        avg_rating = round(avg_rating, 1) if avg_rating else 0
        
        # Get rating distribution
        rating_dist = conn.execute('''
            SELECT rating, COUNT(*) as count 
            FROM review 
            GROUP BY rating 
            ORDER BY rating DESC
        ''').fetchall()
        
        # Get recent reviews count (last 7 days)
        recent_reviews = conn.execute('''
            SELECT COUNT(*) FROM review 
            WHERE created_at >= datetime('now', '-7 days')
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
            'menu': menu_list,
            'message': 'No menu items present' if len(menu_list) == 0 else None
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
            'categories': category_list,
            'message': 'No categories present' if len(category_list) == 0 else None
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ==================== CUSTOMER ENDPOINTS ====================

@app.route('/api/customers', methods=['POST'])
def create_customer():
    """Create a new customer (always creates new even if name exists)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'name' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: name'
            }), 400
        
        customer_name = data['name'].strip()
        phone = data.get('phone', '').strip()  # Optional phone number
        
        if not customer_name:
            return jsonify({
                'success': False,
                'error': 'Customer name cannot be empty'
            }), 400
        
        conn = get_db_connection()
        
        # Always create new customer (no duplicate check)
        cursor = conn.execute(
            'INSERT INTO customer (CustomerName, phone) VALUES (?, ?)',
            (customer_name, phone)
        )
        customer_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'customer': {
                'id': customer_id,
                'name': customer_name,
                'phone': phone
            },
            'message': 'Customer created successfully'
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/customers', methods=['GET'])
def get_customers():
    """Get all customers"""
    try:
        conn = get_db_connection()
        customers = conn.execute(
            'SELECT CustomerID, CustomerName, phone, created_at FROM customer ORDER BY CustomerID DESC'
        ).fetchall()
        conn.close()
        
        customers_list = []
        for customer in customers:
            customers_list.append({
                'id': customer['CustomerID'],
                'name': customer['CustomerName'],
                'phone': customer['phone'] or '',
                'createdAt': customer['created_at']
            })
        
        return jsonify({
            'success': True,
            'customers': customers_list
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ==================== EMPLOYEE ENDPOINTS ====================

@app.route('/api/employees', methods=['GET'])
def get_employees():
    """Get all employees"""
    try:
        conn = get_db_connection()
        employees = conn.execute(
            'SELECT EmpID, email, role FROM employee ORDER BY EmpID'
        ).fetchall()
        conn.close()
        
        # Convert to list of dictionaries with availability status
        employees_list = []
        for emp in employees:
            employees_list.append({
                'id': emp['EmpID'],
                'email': emp['email'],
                'role': emp['role'],
                'availability': 'available'  # Default to available (no schema change needed)
            })
        
        return jsonify({
            'success': True,
            'employees': employees_list
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ==================== ORDERING TRANSACTION ENDPOINTS ====================
# Transaction involves: orders, order_item, menu, customer, employee tables

@app.route('/api/orders', methods=['POST'])
def create_order():
    """
    Create a new order (TRANSACTION 1: Ordering)
    Involves tables: orders, order_item, menu, customer, employee
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['customerName', 'empId', 'items']
        if not data or not all(key in data for key in required_fields):
            return jsonify({
                'success': False,
                'error': 'Missing required fields: customerName, empId, items'
            }), 400
        
        customer_name = data['customerName'].strip()
        emp_id = data['empId']
        items = data['items']  # List of {itemId, quantity}
        
        if not customer_name:
            return jsonify({
                'success': False,
                'error': 'Customer name cannot be empty'
            }), 400
        
        if not items or len(items) == 0:
            return jsonify({
                'success': False,
                'error': 'Order must contain at least one item'
            }), 400
        
        conn = get_db_connection()
        
        try:
            # Start transaction
            conn.execute('BEGIN TRANSACTION')
            
            # 1. Verify employee exists
            employee = conn.execute(
                'SELECT EmpID FROM employee WHERE EmpID = ?',
                (emp_id,)
            ).fetchone()
            
            if not employee:
                conn.rollback()
                conn.close()
                return jsonify({
                    'success': False,
                    'error': 'Employee not found'
                }), 404
            
            # 2. Create customer (always create new, even if name exists)
            phone = data.get('phone', '')  # Optional phone number
            cursor = conn.execute(
                'INSERT INTO customer (CustomerName, phone) VALUES (?, ?)',
                (customer_name, phone)
            )
            customer_id = cursor.lastrowid
            
            # 3. Create order
            current_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            cursor = conn.execute(
                'INSERT INTO orders (date, EmpID, CustomerID, customer_name) VALUES (?, ?, ?, ?)',
                (current_date, emp_id, customer_id, customer_name)
            )
            order_id = cursor.lastrowid
            
            # 4. Verify all menu items exist and add order items
            order_items = []
            total_amount = 0
            
            for item in items:
                if 'itemId' not in item or 'quantity' not in item:
                    conn.rollback()
                    conn.close()
                    return jsonify({
                        'success': False,
                        'error': 'Each item must have itemId and quantity'
                    }), 400
                
                item_id = item['itemId']
                quantity = item['quantity']
                
                if quantity <= 0:
                    conn.rollback()
                    conn.close()
                    return jsonify({
                        'success': False,
                        'error': 'Quantity must be greater than 0'
                    }), 400
                
                # Verify menu item exists and get price
                menu_item = conn.execute(
                    'SELECT ItemID, name, price FROM menu WHERE ItemID = ?',
                    (item_id,)
                ).fetchone()
                
                if not menu_item:
                    conn.rollback()
                    conn.close()
                    return jsonify({
                        'success': False,
                        'error': f'Menu item with ID {item_id} not found'
                    }), 404
                
                # Insert order item
                conn.execute(
                    'INSERT INTO order_item (OrderID, ItemID, quantity) VALUES (?, ?, ?)',
                    (order_id, item_id, quantity)
                )
                
                item_total = menu_item['price'] * quantity
                total_amount += item_total
                
                order_items.append({
                    'itemId': item_id,
                    'name': menu_item['name'],
                    'quantity': quantity,
                    'price': menu_item['price'],
                    'total': item_total
                })
            
            # Commit transaction
            conn.commit()
            conn.close()
            
            return jsonify({
                'success': True,
                'message': 'Order created successfully',
                'order': {
                    'orderId': order_id,
                    'customerId': customer_id,
                    'customerName': customer_name,
                    'empId': emp_id,
                    'date': current_date,
                    'items': order_items,
                    'totalAmount': round(total_amount, 2)
                }
            }), 201
            
        except Exception as e:
            conn.rollback()
            conn.close()
            raise e
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/orders', methods=['GET'])
def get_orders():
    """Get all orders with their items"""
    try:
        conn = get_db_connection()
        
        # Get all orders
        orders = conn.execute('''
            SELECT 
                o.OrderID,
                o.date,
                o.customer_name,
                o.CustomerID,
                o.EmpID,
                e.email as emp_email
            FROM orders o
            LEFT JOIN employee e ON o.EmpID = e.EmpID
            ORDER BY o.OrderID DESC
        ''').fetchall()
        
        orders_list = []
        for order in orders:
            order_id = order['OrderID']
            
            # Get order items with menu details
            items = conn.execute('''
                SELECT 
                    oi.ItemID,
                    oi.quantity,
                    m.name,
                    m.price,
                    (oi.quantity * m.price) as item_total
                FROM order_item oi
                JOIN menu m ON oi.ItemID = m.ItemID
                WHERE oi.OrderID = ?
            ''', (order_id,)).fetchall()
            
            items_list = []
            total_amount = 0
            for item in items:
                items_list.append({
                    'itemId': item['ItemID'],
                    'name': item['name'],
                    'quantity': item['quantity'],
                    'price': item['price'],
                    'total': item['item_total']
                })
                total_amount += item['item_total']
            
            orders_list.append({
                'orderId': order_id,
                'date': order['date'],
                'customerName': order['customer_name'],
                'customerId': order['CustomerID'],
                'empId': order['EmpID'],
                'empEmail': order['emp_email'],
                'items': items_list,
                'totalAmount': round(total_amount, 2)
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'orders': orders_list
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """Get a specific order with its items"""
    try:
        conn = get_db_connection()
        
        # Get order details
        order = conn.execute('''
            SELECT 
                o.OrderID,
                o.date,
                o.customer_name,
                o.CustomerID,
                o.EmpID,
                e.email as emp_email
            FROM orders o
            LEFT JOIN employee e ON o.EmpID = e.EmpID
            WHERE o.OrderID = ?
        ''', (order_id,)).fetchone()
        
        if not order:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Order not found'
            }), 404
        
        # Get order items
        items = conn.execute('''
            SELECT 
                oi.ItemID,
                oi.quantity,
                m.name,
                m.price,
                (oi.quantity * m.price) as item_total
            FROM order_item oi
            JOIN menu m ON oi.ItemID = m.ItemID
            WHERE oi.OrderID = ?
        ''', (order_id,)).fetchall()
        
        items_list = []
        total_amount = 0
        for item in items:
            items_list.append({
                'itemId': item['ItemID'],
                'name': item['name'],
                'quantity': item['quantity'],
                'price': item['price'],
                'total': item['item_total']
            })
            total_amount += item['item_total']
        
        conn.close()
        
        return jsonify({
            'success': True,
            'order': {
                'orderId': order['OrderID'],
                'date': order['date'],
                'customerName': order['customer_name'],
                'customerId': order['CustomerID'],
                'empId': order['EmpID'],
                'empEmail': order['emp_email'],
                'items': items_list,
                'totalAmount': round(total_amount, 2)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    """Delete an order and its related order items"""
    try:
        conn = get_db_connection()
        
        # Check if order exists
        order = conn.execute(
            'SELECT OrderID FROM orders WHERE OrderID = ?',
            (order_id,)
        ).fetchone()
        
        if not order:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Order not found'
            }), 404
        
        # Check if order has been billed
        bill = conn.execute(
            'SELECT billID FROM bill WHERE OrderID = ?',
            (order_id,)
        ).fetchone()
        
        if bill:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Cannot delete order that has been billed'
            }), 400
        
        try:
            # Start transaction
            conn.execute('BEGIN TRANSACTION')
            
            # Delete order items first (foreign key constraint)
            conn.execute('DELETE FROM order_item WHERE OrderID = ?', (order_id,))
            
            # Delete order
            conn.execute('DELETE FROM orders WHERE OrderID = ?', (order_id,))
            
            # Commit transaction
            conn.commit()
            conn.close()
            
            return jsonify({
                'success': True,
                'message': 'Order deleted successfully'
            })
            
        except Exception as e:
            conn.rollback()
            conn.close()
            return jsonify({
                'success': False,
                'error': f'Failed to delete order: {str(e)}'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ==================== BILLING TRANSACTION ENDPOINTS ====================
# Transaction involves: bill, orders, order_item, menu tables

@app.route('/api/bills', methods=['POST'])
def create_bill():
    """
    Create a bill for an order (TRANSACTION 2: Billing)
    Involves tables: bill, orders, order_item, menu
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['orderId', 'paymentMethod']
        if not data or not all(key in data for key in required_fields):
            return jsonify({
                'success': False,
                'error': 'Missing required fields: orderId, paymentMethod'
            }), 400
        
        order_id = data['orderId']
        payment_method = data['paymentMethod'].strip().lower()
        
        # Validate payment method
        valid_methods = ['cash', 'credit card', 'debit card', 'mobile payment']
        if payment_method not in valid_methods:
            return jsonify({
                'success': False,
                'error': f'Invalid payment method. Must be one of: {", ".join(valid_methods)}'
            }), 400
        
        conn = get_db_connection()
        
        try:
            # Start transaction
            conn.execute('BEGIN TRANSACTION')
            
            # 1. Verify order exists
            order = conn.execute(
                'SELECT OrderID, customer_name FROM orders WHERE OrderID = ?',
                (order_id,)
            ).fetchone()
            
            if not order:
                conn.rollback()
                conn.close()
                return jsonify({
                    'success': False,
                    'error': 'Order not found'
                }), 404
            
            # 2. Check if bill already exists for this order
            existing_bill = conn.execute(
                'SELECT billID FROM bill WHERE OrderID = ?',
                (order_id,)
            ).fetchone()
            
            if existing_bill:
                conn.rollback()
                conn.close()
                return jsonify({
                    'success': False,
                    'error': 'Bill already exists for this order'
                }), 409
            
            # 3. Calculate total amount from order items and menu prices
            order_items = conn.execute('''
                SELECT 
                    oi.ItemID,
                    oi.quantity,
                    m.name,
                    m.price,
                    (oi.quantity * m.price) as item_total
                FROM order_item oi
                JOIN menu m ON oi.ItemID = m.ItemID
                WHERE oi.OrderID = ?
            ''', (order_id,)).fetchall()
            
            if not order_items or len(order_items) == 0:
                conn.rollback()
                conn.close()
                return jsonify({
                    'success': False,
                    'error': 'Order has no items'
                }), 400
            
            # Calculate total
            total_amount = sum(item['item_total'] for item in order_items)
            
            # 4. Create bill
            current_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            cursor = conn.execute(
                'INSERT INTO bill (OrderID, amount, method, date) VALUES (?, ?, ?, ?)',
                (order_id, total_amount, payment_method, current_date)
            )
            bill_id = cursor.lastrowid
            
            # Get bill items for response
            items_list = []
            for item in order_items:
                items_list.append({
                    'itemId': item['ItemID'],
                    'name': item['name'],
                    'quantity': item['quantity'],
                    'price': item['price'],
                    'total': item['item_total']
                })
            
            # Commit transaction
            conn.commit()
            conn.close()
            
            return jsonify({
                'success': True,
                'message': 'Bill created successfully',
                'bill': {
                    'billId': bill_id,
                    'orderId': order_id,
                    'customerName': order['customer_name'],
                    'amount': round(total_amount, 2),
                    'paymentMethod': payment_method,
                    'date': current_date,
                    'items': items_list
                }
            }), 201
            
        except Exception as e:
            conn.rollback()
            conn.close()
            raise e
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/bills', methods=['GET'])
def get_bills():
    """Get all bills with their order details"""
    try:
        conn = get_db_connection()
        
        # Get all bills with order information
        bills = conn.execute('''
            SELECT 
                b.billID,
                b.OrderID,
                b.amount,
                b.method,
                b.date,
                o.customer_name,
                o.CustomerID
            FROM bill b
            JOIN orders o ON b.OrderID = o.OrderID
            ORDER BY b.billID DESC
        ''').fetchall()
        
        bills_list = []
        for bill in bills:
            order_id = bill['OrderID']
            
            # Get order items
            items = conn.execute('''
                SELECT 
                    oi.ItemID,
                    oi.quantity,
                    m.name,
                    m.price
                FROM order_item oi
                JOIN menu m ON oi.ItemID = m.ItemID
                WHERE oi.OrderID = ?
            ''', (order_id,)).fetchall()
            
            items_list = []
            for item in items:
                items_list.append({
                    'itemId': item['ItemID'],
                    'name': item['name'],
                    'quantity': item['quantity'],
                    'price': item['price']
                })
            
            bills_list.append({
                'billId': bill['billID'],
                'orderId': order_id,
                'customerName': bill['customer_name'],
                'customerId': bill['CustomerID'],
                'amount': bill['amount'],
                'paymentMethod': bill['method'],
                'date': bill['date'],
                'items': items_list
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'bills': bills_list
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/bills/<int:bill_id>', methods=['GET'])
def get_bill(bill_id):
    """Get a specific bill with order details"""
    try:
        conn = get_db_connection()
        
        # Get bill details
        bill = conn.execute('''
            SELECT 
                b.billID,
                b.OrderID,
                b.amount,
                b.method,
                b.date,
                o.customer_name,
                o.CustomerID
            FROM bill b
            JOIN orders o ON b.OrderID = o.OrderID
            WHERE b.billID = ?
        ''', (bill_id,)).fetchone()
        
        if not bill:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Bill not found'
            }), 404
        
        # Get order items
        items = conn.execute('''
            SELECT 
                oi.ItemID,
                oi.quantity,
                m.name,
                m.price,
                (oi.quantity * m.price) as item_total
            FROM order_item oi
            JOIN menu m ON oi.ItemID = m.ItemID
            WHERE oi.OrderID = ?
        ''', (bill['OrderID'],)).fetchall()
        
        items_list = []
        for item in items:
            items_list.append({
                'itemId': item['ItemID'],
                'name': item['name'],
                'quantity': item['quantity'],
                'price': item['price'],
                'total': item['item_total']
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'bill': {
                'billId': bill['billID'],
                'orderId': bill['OrderID'],
                'customerName': bill['customer_name'],
                'customerId': bill['CustomerID'],
                'amount': bill['amount'],
                'paymentMethod': bill['method'],
                'date': bill['date'],
                'items': items_list
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ==================== RESERVATION ENDPOINTS ====================

@app.route('/api/tables', methods=['GET'])
def get_tables():
    """Get all tables with their reservation status"""
    try:
        conn = get_db_connection()
        
        # Get all tables with their reservation status
        tables = conn.execute('''
            SELECT 
                t.TableID,
                r.ReservationID,
                r.CustomerID,
                c.CustomerName
            FROM restaurant_table t
            LEFT JOIN reservation r ON t.TableID = r.TableID
            LEFT JOIN customer c ON r.CustomerID = c.CustomerID
            ORDER BY t.TableID
        ''').fetchall()
        
        conn.close()
        
        # Format the response
        tables_list = []
        for table in tables:
            table_data = {
                'id': table['TableID'],
                'status': 'reserved' if table['ReservationID'] else 'available',
                'customerName': table['CustomerName'] if table['CustomerName'] else None,
                'customerId': table['CustomerID'] if table['CustomerID'] else None,
                'reservationId': table['ReservationID'] if table['ReservationID'] else None
            }
            tables_list.append(table_data)
        
        return jsonify({
            'success': True,
            'tables': tables_list
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/reservations', methods=['GET'])
def get_reservations():
    """Get all reservations with customer and table details"""
    try:
        conn = get_db_connection()
        
        reservations = conn.execute('''
            SELECT 
                r.ReservationID,
                r.CustomerID,
                r.TableID,
                r.created_at,
                c.CustomerName,
                t.TableID as table_number
            FROM reservation r
            JOIN customer c ON r.CustomerID = c.CustomerID
            JOIN restaurant_table t ON r.TableID = t.TableID
            ORDER BY r.ReservationID DESC
        ''').fetchall()
        
        reservations_list = []
        for res in reservations:
            reservations_list.append({
                'reservationId': res['ReservationID'],
                'customerId': res['CustomerID'],
                'customerName': res['CustomerName'],
                'tableId': res['TableID'],
                'tableNumber': res['table_number'],
                'createdAt': res['created_at']
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'reservations': reservations_list
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/reservations', methods=['POST'])
def make_reservation():
    """
    Make a table reservation (TRANSACTION 3: Reservation)
    Involves tables: reservation, customer, restaurant_table
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(key in data for key in ['tableId', 'reservationCode', 'customerName']):
            return jsonify({
                'success': False,
                'error': 'Missing required fields: tableId, reservationCode, customerName'
            }), 400
        
        table_id = data['tableId']
        reservation_code = data['reservationCode'].strip()
        customer_name = data['customerName'].strip()
        
        if not customer_name:
            return jsonify({
                'success': False,
                'error': 'Customer name cannot be empty'
            }), 400
        
        # Verify the reservation code (for demo purposes, we'll use a simple verification)
        # In a real system, this would check against a database of valid codes
        # For now, let's accept codes that match the pattern: RES + TableID (e.g., "RES1", "RES2")
        expected_code = f"RES{table_id}"
        
        if reservation_code.upper() != expected_code:
            return jsonify({
                'success': False,
                'error': 'Invalid reservation code. Please check your code and try again.'
            }), 400
        
        conn = get_db_connection()
        
        try:
            # Start transaction
            conn.execute('BEGIN TRANSACTION')
            
            # 1. Check if table exists in restaurant_table
            table = conn.execute(
                'SELECT TableID FROM restaurant_table WHERE TableID = ?',
                (table_id,)
            ).fetchone()
            
            if not table:
                conn.rollback()
                conn.close()
                return jsonify({
                    'success': False,
                    'error': 'Table not found'
                }), 404
            
            # 2. Check if table is already reserved
            existing_reservation = conn.execute(
                'SELECT ReservationID FROM reservation WHERE TableID = ?',
                (table_id,)
            ).fetchone()
            
            if existing_reservation:
                conn.rollback()
                conn.close()
                return jsonify({
                    'success': False,
                    'error': 'This table is already reserved'
                }), 409
            
            # 3. Create customer (always create new)
            phone = data.get('phone', '')  # Optional phone number
            cursor = conn.execute(
                'INSERT INTO customer (CustomerName, phone) VALUES (?, ?)',
                (customer_name, phone)
            )
            customer_id = cursor.lastrowid
            
            # 4. Create reservation linking customer and table
            cursor = conn.execute(
                'INSERT INTO reservation (CustomerID, TableID) VALUES (?, ?)',
                (customer_id, table_id)
            )
            reservation_id = cursor.lastrowid
            
            # Get the created_at timestamp
            created_at = conn.execute(
                'SELECT created_at FROM reservation WHERE ReservationID = ?',
                (reservation_id,)
            ).fetchone()['created_at']
            
            # Commit transaction
            conn.commit()
            conn.close()
            
            return jsonify({
                'success': True,
                'message': 'Table reserved successfully',
                'reservation': {
                    'reservationId': reservation_id,
                    'tableId': table_id,
                    'customerId': customer_id,
                    'customerName': customer_name,
                    'createdAt': created_at
                }
            }), 201
            
        except Exception as e:
            conn.rollback()
            conn.close()
            raise e
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/reservations/<int:reservation_id>', methods=['GET'])
def get_reservation(reservation_id):
    """Get a specific reservation with customer and table details"""
    try:
        conn = get_db_connection()
        
        reservation = conn.execute('''
            SELECT 
                r.ReservationID,
                r.CustomerID,
                r.TableID,
                r.created_at,
                c.CustomerName,
                t.TableID as table_number
            FROM reservation r
            JOIN customer c ON r.CustomerID = c.CustomerID
            JOIN restaurant_table t ON r.TableID = t.TableID
            WHERE r.ReservationID = ?
        ''', (reservation_id,)).fetchone()
        
        if not reservation:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Reservation not found'
            }), 404
        
        conn.close()
        
        return jsonify({
            'success': True,
            'reservation': {
                'reservationId': reservation['ReservationID'],
                'customerId': reservation['CustomerID'],
                'customerName': reservation['CustomerName'],
                'tableId': reservation['TableID'],
                'tableNumber': reservation['table_number'],
                'createdAt': reservation['created_at']
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/reservations/<int:reservation_id>', methods=['DELETE'])
def cancel_reservation(reservation_id):
    """Cancel a table reservation"""
    try:
        conn = get_db_connection()
        cursor = conn.execute(
            'DELETE FROM reservation WHERE ReservationID = ?',
            (reservation_id,)
        )
        conn.commit()
        
        if cursor.rowcount > 0:
            conn.close()
            return jsonify({
                'success': True,
                'message': 'Reservation cancelled successfully'
            })
        else:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Reservation not found'
            }), 404
            
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