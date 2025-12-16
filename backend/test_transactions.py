"""
Test script for the three major transactions in the Restaurant Management System.

This script demonstrates:
1. TRANSACTION 1: Ordering (involves orders, order_item, menu, customer, employee)
2. TRANSACTION 2: Billing (involves bill, orders, order_item, menu)
3. TRANSACTION 3: Reservation (involves reservation, customer, restaurant_table)
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def print_response(title, response):
    """Helper function to print formatted responses"""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_ordering_transaction():
    """Test Transaction 1: Ordering System"""
    print("\n" + "="*60)
    print("TESTING TRANSACTION 1: ORDERING SYSTEM")
    print("Tables involved: orders, order_item, menu, customer, employee")
    print("="*60)
    
    # First, create a test employee (if not exists)
    print("\nStep 1: Create employee account...")
    employee_data = {
        "email": "cashier@restaurant.com",
        "password": "password123",
        "role": "cashier"
    }
    response = requests.post(f"{BASE_URL}/auth/signup", json=employee_data)
    print_response("Create Employee", response)
    
    # Get employee ID (you might need to adjust based on your signup response)
    emp_id = 1  # Assuming first employee
    
    # Create an order
    print("\nStep 2: Create an order with multiple items...")
    order_data = {
        "customerName": "John Doe",
        "empId": emp_id,
        "items": [
            {"itemId": 1, "quantity": 2},
            {"itemId": 2, "quantity": 1},
            {"itemId": 3, "quantity": 3}
        ]
    }
    response = requests.post(f"{BASE_URL}/orders", json=order_data)
    print_response("Create Order", response)
    
    if response.status_code == 201:
        order_id = response.json()['order']['orderId']
        print(f"\n✓ Order created successfully with ID: {order_id}")
        
        # Get the order details
        print("\nStep 3: Retrieve order details...")
        response = requests.get(f"{BASE_URL}/orders/{order_id}")
        print_response("Get Order Details", response)
        
        return order_id
    else:
        print("\n✗ Order creation failed!")
        return None

def test_billing_transaction(order_id):
    """Test Transaction 2: Billing System"""
    print("\n" + "="*60)
    print("TESTING TRANSACTION 2: BILLING SYSTEM")
    print("Tables involved: bill, orders, order_item, menu")
    print("="*60)
    
    if not order_id:
        print("\n✗ Skipping billing test - no order ID available")
        return None
    
    # Create a bill for the order
    print("\nStep 1: Create a bill for the order...")
    bill_data = {
        "orderId": order_id,
        "paymentMethod": "credit card"
    }
    response = requests.post(f"{BASE_URL}/bills", json=bill_data)
    print_response("Create Bill", response)
    
    if response.status_code == 201:
        bill_id = response.json()['bill']['billId']
        print(f"\n✓ Bill created successfully with ID: {bill_id}")
        
        # Get the bill details
        print("\nStep 2: Retrieve bill details...")
        response = requests.get(f"{BASE_URL}/bills/{bill_id}")
        print_response("Get Bill Details", response)
        
        return bill_id
    else:
        print("\n✗ Bill creation failed!")
        return None

def test_reservation_transaction():
    """Test Transaction 3: Reservation System"""
    print("\n" + "="*60)
    print("TESTING TRANSACTION 3: RESERVATION SYSTEM")
    print("Tables involved: reservation, customer, restaurant_table")
    print("="*60)
    
    # Get available tables
    print("\nStep 1: Check available tables...")
    response = requests.get(f"{BASE_URL}/tables")
    print_response("Get Tables", response)
    
    # Find an available table
    available_table = None
    if response.status_code == 200:
        tables = response.json()['tables']
        for table in tables:
            if table['status'] == 'available':
                available_table = table['id']
                break
    
    if not available_table:
        print("\n✗ No available tables found!")
        return None
    
    print(f"\n✓ Found available table: {available_table}")
    
    # Make a reservation
    print("\nStep 2: Make a reservation...")
    reservation_data = {
        "tableId": available_table,
        "customerName": "Jane Smith",
        "reservationCode": f"RES{available_table}"
    }
    response = requests.post(f"{BASE_URL}/reservations", json=reservation_data)
    print_response("Create Reservation", response)
    
    if response.status_code == 201:
        reservation_id = response.json()['reservation']['reservationId']
        print(f"\n✓ Reservation created successfully with ID: {reservation_id}")
        
        # Get the reservation details
        print("\nStep 3: Retrieve reservation details...")
        response = requests.get(f"{BASE_URL}/reservations/{reservation_id}")
        print_response("Get Reservation Details", response)
        
        # Verify table is now reserved
        print("\nStep 4: Verify table status changed to reserved...")
        response = requests.get(f"{BASE_URL}/tables")
        if response.status_code == 200:
            tables = response.json()['tables']
            for table in tables:
                if table['id'] == available_table:
                    print(f"Table {available_table} status: {table['status']}")
                    if table['status'] == 'reserved':
                        print("✓ Table successfully marked as reserved")
        
        return reservation_id
    else:
        print("\n✗ Reservation creation failed!")
        return None

def test_customer_creation():
    """Test customer creation endpoint"""
    print("\n" + "="*60)
    print("TESTING CUSTOMER CREATION")
    print("="*60)
    
    # Create a new customer
    print("\nStep 1: Create a new customer...")
    customer_data = {
        "name": "Alice Johnson"
    }
    response = requests.post(f"{BASE_URL}/customers", json=customer_data)
    print_response("Create Customer", response)
    
    # Try to create the same customer again
    print("\nStep 2: Try to create the same customer again...")
    response = requests.post(f"{BASE_URL}/customers", json=customer_data)
    print_response("Create Duplicate Customer", response)
    
    # Get all customers
    print("\nStep 3: Get all customers...")
    response = requests.get(f"{BASE_URL}/customers")
    print_response("Get All Customers", response)

def run_all_tests():
    """Run all transaction tests"""
    print("\n" + "="*60)
    print("RESTAURANT MANAGEMENT SYSTEM - TRANSACTION TESTS")
    print("="*60)
    
    try:
        # Test customer creation
        test_customer_creation()
        
        # Test Transaction 1: Ordering
        order_id = test_ordering_transaction()
        
        # Test Transaction 2: Billing (depends on order)
        bill_id = test_billing_transaction(order_id)
        
        # Test Transaction 3: Reservation
        reservation_id = test_reservation_transaction()
        
        # Summary
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"✓ Transaction 1 (Ordering): {'SUCCESS' if order_id else 'FAILED'}")
        print(f"✓ Transaction 2 (Billing): {'SUCCESS' if bill_id else 'FAILED'}")
        print(f"✓ Transaction 3 (Reservation): {'SUCCESS' if reservation_id else 'FAILED'}")
        print("="*60)
        
    except requests.exceptions.ConnectionError:
        print("\n✗ Error: Could not connect to the server.")
        print("Make sure the Flask backend is running on http://localhost:5000")
    except Exception as e:
        print(f"\n✗ Error during testing: {str(e)}")

if __name__ == "__main__":
    run_all_tests()
