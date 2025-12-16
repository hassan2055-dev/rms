# Three Major Transactions - Visual Overview

## Transaction 1: Ordering System
```
┌─────────────────────────────────────────────────────────────────┐
│                    ORDERING TRANSACTION                          │
│                 (Involves 5 Tables)                              │
└─────────────────────────────────────────────────────────────────┘

Input: customerName, empId, items[]

Step 1: Validate Employee
┌──────────────┐
│  employee    │ ← Check if EmpID exists
│  EmpID       │
│  email       │
│  role        │
└──────────────┘
        ↓

Step 2: Create/Get Customer
┌──────────────┐
│  customer    │ ← Check if customer exists by name
│  CustomerID  │   If not, create new customer
│ CustomerName │
└──────────────┘
        ↓

Step 3: Create Order
┌──────────────┐
│   orders     │ ← Create new order record
│   OrderID    │   Link to customer and employee
│   date       │
│   EmpID      │
│  CustomerID  │
│customer_name │
└──────────────┘
        ↓

Step 4: Validate Menu Items & Create Order Items
┌──────────────┐         ┌──────────────┐
│    menu      │         │ order_item   │
│   ItemID     │ ← Join →│   OrderID    │ ← Create records
│   name       │         │   ItemID     │   for each item
│   price      │         │   quantity   │
│   category   │         └──────────────┘
└──────────────┘

Step 5: Calculate Total
Total = Σ(menu.price × order_item.quantity)

Result: Order created with all items and calculated total
```

---

## Transaction 2: Billing System
```
┌─────────────────────────────────────────────────────────────────┐
│                    BILLING TRANSACTION                           │
│                 (Involves 4 Tables)                              │
└─────────────────────────────────────────────────────────────────┘

Input: orderId, paymentMethod

Step 1: Validate Order Exists
┌──────────────┐
│   orders     │ ← Check if order exists
│   OrderID    │
│customer_name │
└──────────────┘
        ↓

Step 2: Check for Duplicate Bill
┌──────────────┐
│    bill      │ ← Check if bill already exists
│   billID     │   for this order
│   OrderID    │   (prevent duplicates)
└──────────────┘
        ↓

Step 3: Get Order Items with Menu Details
┌──────────────┐         ┌──────────────┐
│ order_item   │         │    menu      │
│   OrderID    │ ← Join →│   ItemID     │
│   ItemID     │         │   name       │
│   quantity   │         │   price      │
└──────────────┘         └──────────────┘
        ↓

Step 4: Calculate Total Amount
Total = Σ(order_item.quantity × menu.price)
        ↓

Step 5: Create Bill
┌──────────────┐
│    bill      │ ← Create bill with calculated total
│   billID     │   and payment method
│   OrderID    │
│   amount     │
│   method     │
│   date       │
└──────────────┘

Result: Bill created with itemized breakdown and total
```

---

## Transaction 3: Reservation System
```
┌─────────────────────────────────────────────────────────────────┐
│                  RESERVATION TRANSACTION                         │
│                 (Involves 3 Tables)                              │
└─────────────────────────────────────────────────────────────────┘

Input: tableId, customerName, reservationCode

Step 1: Validate Table Exists
┌──────────────┐
│restaurant_   │ ← Check if table exists
│table         │
│  TableID     │
└──────────────┘
        ↓

Step 2: Check Table Availability
┌──────────────┐
│ reservation  │ ← Check if table is already reserved
│ReservationID │   (no existing reservation for this table)
│  TableID     │
└──────────────┘
        ↓

Step 3: Create/Get Customer
┌──────────────┐
│  customer    │ ← Check if customer exists by name
│  CustomerID  │   If not, create new customer
│ CustomerName │
└──────────────┘
        ↓

Step 4: Create Reservation
┌──────────────┐
│ reservation  │ ← Create reservation linking
│ReservationID │   customer and table
│  CustomerID  │
│  TableID     │
│  created_at  │
└──────────────┘
        ↓

Step 5: Update Table Status
Table status changes from "available" to "reserved"

Result: Table successfully reserved for customer
```

---

## Complete Transaction Flow Example

### Real-World Scenario: Customer Dining Experience

```
1. ORDERING
   Customer arrives → Cashier takes order
   ┌─────────────────────────────────────┐
   │ POST /api/orders                    │
   │ - Customer: "John Doe"              │
   │ - Employee ID: 1                    │
   │ - Items: Burger x2, Fries x1        │
   ├─────────────────────────────────────┤
   │ Creates records in:                 │
   │ ✓ customer (if new)                 │
   │ ✓ orders                            │
   │ ✓ order_item (2 records)            │
   │ Links to:                           │
   │ ✓ employee                          │
   │ ✓ menu                              │
   └─────────────────────────────────────┘
            ↓
   
2. BILLING
   Customer finishes meal → Time to pay
   ┌─────────────────────────────────────┐
   │ POST /api/bills                     │
   │ - Order ID: 1                       │
   │ - Payment: Credit Card              │
   ├─────────────────────────────────────┤
   │ Reads from:                         │
   │ ✓ orders                            │
   │ ✓ order_item                        │
   │ ✓ menu                              │
   │ Calculates total and creates:       │
   │ ✓ bill                              │
   └─────────────────────────────────────┘
            ↓

3. RESERVATION (for next visit)
   Customer wants to reserve table for tomorrow
   ┌─────────────────────────────────────┐
   │ POST /api/reservations              │
   │ - Customer: "John Doe"              │
   │ - Table: 5                          │
   │ - Code: RES5                        │
   ├─────────────────────────────────────┤
   │ Checks:                             │
   │ ✓ restaurant_table (exists?)        │
   │ ✓ reservation (available?)          │
   │ Uses existing:                      │
   │ ✓ customer (John Doe)               │
   │ Creates:                            │
   │ ✓ reservation                       │
   └─────────────────────────────────────┘
```

---

## Transaction Integrity Matrix

| Transaction  | Tables | Atomicity | Consistency | Isolation | Durability |
|--------------|--------|-----------|-------------|-----------|------------|
| Ordering     | 5      | ✓         | ✓           | ✓         | ✓          |
| Billing      | 4      | ✓         | ✓           | ✓         | ✓          |
| Reservation  | 3      | ✓         | ✓           | ✓         | ✓          |

All transactions use:
- BEGIN TRANSACTION
- Multiple table operations
- COMMIT on success
- ROLLBACK on error

---

## Error Handling in Transactions

```
┌─────────────────────────────────────────┐
│         Transaction Begins              │
│     conn.execute('BEGIN TRANSACTION')   │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│     Validation Steps                    │
│ - Check foreign keys exist              │
│ - Validate input data                   │
│ - Check business rules                  │
└─────────────────────────────────────────┘
                  ↓
        ┌─────────────────┐
        │  All Valid?     │
        └─────────────────┘
         Yes ↓      ↓ No
┌──────────────┐  ┌──────────────┐
│   COMMIT     │  │   ROLLBACK   │
│ All changes  │  │ No changes   │
│   saved      │  │   made       │
└──────────────┘  └──────────────┘
        ↓                ↓
┌──────────────┐  ┌──────────────┐
│Success (201) │  │Error (400/404│
│   Response   │  │    /409)     │
└──────────────┘  └──────────────┘
```

---

## Database Relationships

```
                    ┌──────────────┐
          ┌────────<│  customer    │>────────┐
          │         │  CustomerID  │         │
          │         │ CustomerName │         │
          │         └──────────────┘         │
          │                                  │
          ↓                                  ↓
┌──────────────┐                  ┌──────────────┐
│ reservation  │                  │   orders     │
│ReservationID │                  │   OrderID    │
│  CustomerID  │                  │  CustomerID  │
│  TableID     │                  │   EmpID      │
└──────────────┘                  └──────────────┘
          ↓                                  ↓
          ↓                         ┌──────────────┐
          ↓                         │ order_item   │
┌──────────────┐                   │   OrderID    │
│restaurant_   │                   │   ItemID     │
│table         │<──────────────────│  quantity    │
│  TableID     │         ┌─────────└──────────────┘
└──────────────┘         │                 ↓
                         │         ┌──────────────┐
                         └────────<│    menu      │
                                   │   ItemID     │
                                   │    price     │
                                   └──────────────┘
                                          ↓
                                  ┌──────────────┐
                                  │    bill      │
                                  │   billID     │
                                  │   OrderID    │
                                  │   amount     │
                                  └──────────────┘
```

---

## Summary

✅ **3 Major Transactions Implemented**
- Transaction 1: Ordering (5 tables)
- Transaction 2: Billing (4 tables)
- Transaction 3: Reservation (3 tables)

✅ **Each Transaction:**
- Involves minimum 3 tables (requirement met)
- Uses database transactions (BEGIN/COMMIT/ROLLBACK)
- Has proper error handling
- Validates all foreign keys
- Maintains data integrity

✅ **Customer Creation Fixed:**
- Prevents duplicates
- Integrated into transactions
- Reuses existing customers
- Creates new when needed

The system is complete and ready for use!
