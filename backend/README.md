# Restaurant Management System Backend

This is the Flask backend for the Restaurant Management System with **THREE MAJOR TRANSACTIONS** involving multiple database tables.

## Project Overview

This system implements three major database transactions:
1. **Ordering Transaction** (5 tables: orders, order_item, menu, customer, employee)
2. **Billing Transaction** (4 tables: bill, orders, order_item, menu)
3. **Reservation Transaction** (3 tables: reservation, customer, restaurant_table)

All transactions use proper database transaction management (BEGIN/COMMIT/ROLLBACK) to ensure ACID properties.

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

## Three Major Transactions

### 1. ORDERING TRANSACTION ✓
**Involves: orders, order_item, menu, customer, employee (5 tables)**

Create an order with multiple items:
```bash
POST /api/orders
{
  "customerName": "John Doe",
  "empId": 1,
  "items": [
    {"itemId": 1, "quantity": 2},
    {"itemId": 3, "quantity": 1}
  ]
}
```

This transaction:
- Validates employee exists
- Creates/retrieves customer
- Creates order record
- Validates menu items
- Creates order_item records
- Calculates total from menu prices

### 2. BILLING TRANSACTION ✓
**Involves: bill, orders, order_item, menu (4 tables)**

Create a bill for an order:
```bash
POST /api/bills
{
  "orderId": 1,
  "paymentMethod": "credit card"
}
```

This transaction:
- Validates order exists
- Prevents duplicate bills
- Retrieves order items with menu details
- Calculates total amount
- Creates bill record

Valid payment methods: cash, credit card, debit card, mobile payment

### 3. RESERVATION TRANSACTION ✓
**Involves: reservation, customer, restaurant_table (3 tables)**

Make a table reservation:
```bash
POST /api/reservations
{
  "tableId": 5,
  "customerName": "Jane Smith",
  "reservationCode": "RES5"
}
```

This transaction:
- Validates table exists
- Checks table availability
- Creates/retrieves customer
- Links customer to table
- Updates reservation status

## API Endpoints

### Customer Management
- `POST /api/customers` - Create/retrieve customer
- `GET /api/customers` - Get all customers

### Ordering (Transaction 1)
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/{id}` - Get specific order

### Billing (Transaction 2)
- `POST /api/bills` - Create bill for order
- `GET /api/bills` - Get all bills
- `GET /api/bills/{id}` - Get specific bill

### Reservation (Transaction 3)
- `POST /api/reservations` - Make reservation
- `GET /api/reservations` - Get all reservations
- `GET /api/reservations/{id}` - Get specific reservation
- `DELETE /api/reservations/{id}` - Cancel reservation
- `GET /api/tables` - Get all tables with status

### Menu Management
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item
- `GET /api/menu/{id}` - Get specific item
- `PUT /api/menu/{id}` - Update menu item
- `DELETE /api/menu/{id}` - Delete menu item
- `GET /api/menu/categories` - Get categories

### Employee Management
- `POST /api/auth/signup` - Register employee
- `POST /api/auth/signin` - Employee login
- `GET /api/employees` - Get all employees

### Reviews
- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/{id}` - Get specific review
- `DELETE /api/reviews/{id}` - Delete review

### Statistics & Health
- `GET /api/stats` - Get review statistics
- `GET /api/health` - API health check

## Testing

Run the comprehensive test script:
```bash
python test_transactions.py
```

This tests all three major transactions and customer creation.

## Database Schema

The system uses SQLite with the following tables:
- **customer** - Customer information
- **employee** - Staff/employee accounts
- **menu** - Menu items with prices
- **orders** - Order records
- **order_item** - Junction table for order items
- **bill** - Billing information
- **restaurant_table** - Restaurant tables (12 tables)
- **reservation** - Table reservations
- **review** - Customer reviews

### Sample Data
On first run, the database is initialized with:
- 12 restaurant tables
- 12 sample menu items across categories (Main Course, Appetizer, Side, Dessert, Beverage)

## Transaction Integrity

All major transactions use proper database transaction management:
```python
try:
    conn.execute('BEGIN TRANSACTION')
    # Multiple table operations
    conn.commit()
except Exception as e:
    conn.rollback()
    raise e
```

This ensures ACID properties:
- **Atomicity**: All operations succeed or all fail
- **Consistency**: Foreign key constraints maintained
- **Isolation**: Concurrent operations don't interfere
- **Durability**: Committed changes persist

## Documentation

- **API Documentation**: See [TRANSACTIONS_API.md](TRANSACTIONS_API.md) for complete endpoint details
- **Test Script**: See [test_transactions.py](test_transactions.py) for testing examples

## Features

✓ Three major multi-table transactions  
✓ Customer creation with duplicate prevention  
✓ Transaction rollback on errors  
✓ Foreign key constraints  
✓ Automatic total calculation  
✓ Comprehensive error handling  
✓ RESTful API design  
✓ Sample data initialization  

## Technology Stack

- **Backend**: Flask (Python 3)
- **Database**: SQLite3
- **API**: RESTful JSON
- **CORS**: Enabled for frontend integration

## CORS

Cross-Origin Resource Sharing (CORS) is enabled for all routes to allow the React frontend to communicate with the backend.