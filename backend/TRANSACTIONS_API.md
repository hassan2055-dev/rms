# Restaurant Management System - Transaction APIs

This document describes the three major transactions implemented in the system, each involving a minimum of three database tables.

## Database Schema Overview

### Tables Involved:
- **customer**: Stores customer information
- **employee**: Stores employee/staff information
- **menu**: Stores menu items
- **orders**: Stores order information
- **order_item**: Stores items in each order (junction table)
- **bill**: Stores billing information
- **restaurant_table**: Stores table information
- **reservation**: Stores table reservations

---

## Transaction 1: Ordering System

**Involves tables:** `orders`, `order_item`, `menu`, `customer`, `employee` (5 tables)

### Create Order
**Endpoint:** `POST /api/orders`

Creates a new order with multiple items. This transaction:
1. Verifies the employee exists
2. Creates or retrieves the customer
3. Creates an order record
4. Validates all menu items exist
5. Creates order_item records for each item
6. Calculates total amount from menu prices

**Request Body:**
```json
{
  "customerName": "John Doe",
  "empId": 1,
  "items": [
    {
      "itemId": 1,
      "quantity": 2
    },
    {
      "itemId": 3,
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "orderId": 1,
    "customerId": 1,
    "customerName": "John Doe",
    "empId": 1,
    "date": "2025-12-16 10:30:45",
    "items": [
      {
        "itemId": 1,
        "name": "Burger",
        "quantity": 2,
        "price": 8.99,
        "total": 17.98
      },
      {
        "itemId": 3,
        "name": "Fries",
        "quantity": 1,
        "price": 3.99,
        "total": 3.99
      }
    ],
    "totalAmount": 21.97
  }
}
```

### Get All Orders
**Endpoint:** `GET /api/orders`

Retrieves all orders with their items and calculated totals.

### Get Single Order
**Endpoint:** `GET /api/orders/{orderId}`

Retrieves a specific order with all its details.

---

## Transaction 2: Billing System

**Involves tables:** `bill`, `orders`, `order_item`, `menu` (4 tables)

### Create Bill
**Endpoint:** `POST /api/bills`

Creates a bill for an existing order. This transaction:
1. Verifies the order exists
2. Checks if a bill already exists for the order
3. Retrieves all order items with menu details
4. Calculates total amount from order_item quantities and menu prices
5. Creates a bill record with payment method

**Request Body:**
```json
{
  "orderId": 1,
  "paymentMethod": "cash"
}
```

**Valid Payment Methods:**
- cash
- credit card
- debit card
- mobile payment

**Response:**
```json
{
  "success": true,
  "message": "Bill created successfully",
  "bill": {
    "billId": 1,
    "orderId": 1,
    "customerName": "John Doe",
    "amount": 21.97,
    "paymentMethod": "cash",
    "date": "2025-12-16 10:35:20",
    "items": [
      {
        "itemId": 1,
        "name": "Burger",
        "quantity": 2,
        "price": 8.99,
        "total": 17.98
      },
      {
        "itemId": 3,
        "name": "Fries",
        "quantity": 1,
        "price": 3.99,
        "total": 3.99
      }
    ]
  }
}
```

### Get All Bills
**Endpoint:** `GET /api/bills`

Retrieves all bills with their order and item details.

### Get Single Bill
**Endpoint:** `GET /api/bills/{billId}`

Retrieves a specific bill with all its details.

---

## Transaction 3: Reservation System

**Involves tables:** `reservation`, `customer`, `restaurant_table` (3 tables)

### Make Reservation
**Endpoint:** `POST /api/reservations`

Creates a table reservation. This transaction:
1. Verifies the table exists in restaurant_table
2. Checks if the table is already reserved
3. Creates or retrieves the customer
4. Creates a reservation linking customer and table
5. Requires a reservation code for verification (format: RES{tableId})

**Request Body:**
```json
{
  "tableId": 5,
  "customerName": "Jane Smith",
  "reservationCode": "RES5"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Table reserved successfully",
  "reservation": {
    "reservationId": 1,
    "tableId": 5,
    "customerId": 2,
    "customerName": "Jane Smith",
    "createdAt": "2025-12-16 11:00:00"
  }
}
```

### Get All Reservations
**Endpoint:** `GET /api/reservations`

Retrieves all reservations with customer and table details.

### Get Single Reservation
**Endpoint:** `GET /api/reservations/{reservationId}`

Retrieves a specific reservation with all its details.

### Get All Tables
**Endpoint:** `GET /api/tables`

Retrieves all tables with their reservation status (available/reserved).

**Response:**
```json
{
  "success": true,
  "tables": [
    {
      "id": 1,
      "status": "available",
      "customerName": null,
      "customerId": null,
      "reservationId": null
    },
    {
      "id": 5,
      "status": "reserved",
      "customerName": "Jane Smith",
      "customerId": 2,
      "reservationId": 1
    }
  ]
}
```

### Cancel Reservation
**Endpoint:** `DELETE /api/reservations/{reservationId}`

Cancels an existing reservation, making the table available again.

---

## Customer Management

### Create Customer
**Endpoint:** `POST /api/customers`

Creates a new customer or returns existing one if name already exists.

**Request Body:**
```json
{
  "name": "Alice Johnson"
}
```

**Response:**
```json
{
  "success": true,
  "customer": {
    "id": 3,
    "name": "Alice Johnson"
  },
  "message": "Customer created successfully"
}
```

### Get All Customers
**Endpoint:** `GET /api/customers`

Retrieves all customers in the system.

---

## Transaction Flow Examples

### Complete Order-to-Bill Flow:

1. **Create an Order:**
   ```
   POST /api/orders
   {
     "customerName": "Bob Wilson",
     "empId": 1,
     "items": [{"itemId": 2, "quantity": 3}]
   }
   → Returns orderId: 10
   ```

2. **Create a Bill for the Order:**
   ```
   POST /api/bills
   {
     "orderId": 10,
     "paymentMethod": "credit card"
   }
   → Returns billId: 5
   ```

### Complete Reservation Flow:

1. **Check Available Tables:**
   ```
   GET /api/tables
   → Shows which tables are available
   ```

2. **Make Reservation:**
   ```
   POST /api/reservations
   {
     "tableId": 3,
     "customerName": "Sarah Brown",
     "reservationCode": "RES3"
   }
   → Returns reservationId: 7
   ```

3. **Cancel Reservation (if needed):**
   ```
   DELETE /api/reservations/7
   → Table becomes available again
   ```

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "error": "Error description here"
}
```

### Common HTTP Status Codes:
- **200**: Success (GET requests)
- **201**: Created (POST requests)
- **400**: Bad Request (validation errors)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (e.g., bill already exists, table already reserved)
- **500**: Internal Server Error

---

## Transaction Integrity

All three major transactions use database transactions (BEGIN/COMMIT/ROLLBACK) to ensure:
- **Atomicity**: All operations succeed or all fail
- **Consistency**: Database constraints are maintained
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed changes are permanent

If any step in a transaction fails, all changes are rolled back automatically.
