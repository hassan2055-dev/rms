# Quick Reference Guide - Three Major Transactions

## 🎯 Transaction 1: ORDERING (5 Tables)

**Tables:** orders, order_item, menu, customer, employee

### Create Order
```bash
POST http://localhost:5000/api/orders

{
  "customerName": "John Doe",
  "empId": 1,
  "items": [
    {"itemId": 1, "quantity": 2},
    {"itemId": 3, "quantity": 1}
  ]
}

Response 201:
{
  "success": true,
  "order": {
    "orderId": 1,
    "customerId": 1,
    "totalAmount": 21.97,
    "items": [...]
  }
}
```

### Get Orders
```bash
GET http://localhost:5000/api/orders        # All orders
GET http://localhost:5000/api/orders/1      # Specific order
```

---

## 💰 Transaction 2: BILLING (4 Tables)

**Tables:** bill, orders, order_item, menu

### Create Bill
```bash
POST http://localhost:5000/api/bills

{
  "orderId": 1,
  "paymentMethod": "credit card"
}

Response 201:
{
  "success": true,
  "bill": {
    "billId": 1,
    "orderId": 1,
    "amount": 21.97,
    "items": [...]
  }
}
```

**Payment Methods:** cash, credit card, debit card, mobile payment

### Get Bills
```bash
GET http://localhost:5000/api/bills         # All bills
GET http://localhost:5000/api/bills/1       # Specific bill
```

---

## 🪑 Transaction 3: RESERVATION (3 Tables)

**Tables:** reservation, customer, restaurant_table

### Check Tables
```bash
GET http://localhost:5000/api/tables

Response 200:
{
  "tables": [
    {"id": 1, "status": "available"},
    {"id": 5, "status": "reserved", "customerName": "Jane"}
  ]
}
```

### Make Reservation
```bash
POST http://localhost:5000/api/reservations

{
  "tableId": 5,
  "customerName": "Jane Smith",
  "reservationCode": "RES5"
}

Response 201:
{
  "success": true,
  "reservation": {
    "reservationId": 1,
    "tableId": 5,
    "customerName": "Jane Smith"
  }
}
```

**Reservation Code Format:** RES{tableId} (e.g., RES1, RES2, RES3)

### Manage Reservations
```bash
GET http://localhost:5000/api/reservations          # All reservations
GET http://localhost:5000/api/reservations/1        # Specific reservation
DELETE http://localhost:5000/api/reservations/1     # Cancel reservation
```

---

## 👤 Customer Management

### Create/Get Customer
```bash
POST http://localhost:5000/api/customers

{
  "name": "Alice Johnson"
}

Response 201:
{
  "success": true,
  "customer": {
    "id": 3,
    "name": "Alice Johnson"
  }
}
```

### Get All Customers
```bash
GET http://localhost:5000/api/customers
```

---

## 📋 Complete Workflow Example

### Scenario: Customer Orders, Pays, and Reserves Table

```bash
# 1. Employee signs up (first time)
POST /api/auth/signup
{
  "email": "cashier@restaurant.com",
  "password": "password123",
  "role": "cashier"
}

# 2. Create an order
POST /api/orders
{
  "customerName": "John Doe",
  "empId": 1,
  "items": [
    {"itemId": 1, "quantity": 2},
    {"itemId": 4, "quantity": 1}
  ]
}
# → Returns orderId: 1, totalAmount: 21.97

# 3. Create bill for the order
POST /api/bills
{
  "orderId": 1,
  "paymentMethod": "cash"
}
# → Returns billId: 1, amount: 21.97

# 4. Check available tables
GET /api/tables
# → Shows table 5 is available

# 5. Make reservation for next visit
POST /api/reservations
{
  "tableId": 5,
  "customerName": "John Doe",
  "reservationCode": "RES5"
}
# → Returns reservationId: 1

# 6. Cancel reservation if needed
DELETE /api/reservations/1
# → Table becomes available again
```

---

## 🔍 Verification Commands

### Check Menu Items
```bash
GET http://localhost:5000/api/menu
# Returns 12 sample menu items
```

### Check All Tables
```bash
GET http://localhost:5000/api/tables
# Returns 12 tables with status
```

### Health Check
```bash
GET http://localhost:5000/api/health
# Verify API is running
```

---

## ⚠️ Common Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 400 | Bad Request | Missing required fields |
| 404 | Not Found | Order/Table doesn't exist |
| 409 | Conflict | Bill already exists, Table reserved |
| 500 | Server Error | Database error |

---

## 🧪 Testing

### Run Test Script
```bash
cd backend
python test_transactions.py
```

### Manual cURL Testing
```bash
# Create Order
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test User","empId":1,"items":[{"itemId":1,"quantity":1}]}'

# Create Bill
curl -X POST http://localhost:5000/api/bills \
  -H "Content-Type: application/json" \
  -d '{"orderId":1,"paymentMethod":"cash"}'

# Make Reservation
curl -X POST http://localhost:5000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"tableId":3,"customerName":"Test User","reservationCode":"RES3"}'
```

---

## 📊 Database Tables Quick Reference

| Table | Primary Key | Purpose |
|-------|-------------|---------|
| customer | CustomerID | Customer information |
| employee | EmpID | Staff accounts |
| menu | ItemID | Menu items & prices |
| orders | OrderID | Order records |
| order_item | OrderID+ItemID | Order line items |
| bill | billID | Payment records |
| restaurant_table | TableID | Restaurant tables |
| reservation | ReservationID | Table reservations |

---

## 🚀 Getting Started

1. **Start Backend:**
   ```bash
   cd backend
   python app.py
   ```
   Server runs on: http://localhost:5000

2. **Initialize Data:**
   - Database auto-creates on first run
   - 12 tables initialized
   - 12 menu items created

3. **Create First Employee:**
   ```bash
   POST /api/auth/signup
   {"email": "admin@restaurant.com", "password": "admin123", "role": "admin"}
   ```

4. **Start Testing:**
   Use the test script or make API calls directly

---

## 📚 Documentation Files

- **TRANSACTIONS_API.md** - Detailed API documentation
- **PROJECT_COMPLETION.md** - Implementation summary
- **TRANSACTION_DIAGRAMS.md** - Visual transaction flows
- **README.md** - Complete project documentation
- **test_transactions.py** - Automated testing script

---

## ✅ Requirements Checklist

- [x] Transaction 1: Ordering (5 tables minimum)
- [x] Transaction 2: Billing (4 tables minimum)
- [x] Transaction 3: Reservation (3 tables minimum)
- [x] Customer creation fixed
- [x] Duplicate prevention
- [x] Transaction integrity (ACID)
- [x] Error handling
- [x] Complete documentation
- [x] Test script provided

**All requirements met! ✓**
