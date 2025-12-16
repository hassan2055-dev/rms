"""
Migration script to add payment-based reservation system
Adds: payment table and updates reservation table structure
Run this once to update existing database
"""
import sqlite3

DATABASE = 'restaurant.db'

def migrate():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    try:
        print("Starting reservation payment migration...")
        
        # Check if payment table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='payment'")
        if not cursor.fetchone():
            print("Creating payment table...")
            cursor.execute('''
                CREATE TABLE payment (
                    PaymentID INTEGER PRIMARY KEY AUTOINCREMENT,
                    CustomerID INTEGER NOT NULL,
                    amount DECIMAL(10, 2) NOT NULL,
                    payment_method TEXT NOT NULL,
                    payment_status TEXT NOT NULL DEFAULT 'completed',
                    transaction_date TEXT NOT NULL,
                    reservation_code TEXT UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (CustomerID) REFERENCES customer (CustomerID)
                )
            ''')
            print("✓ payment table created")
        else:
            print("✓ payment table already exists")
        
        # Check and add columns to reservation table
        cursor.execute("PRAGMA table_info(reservation)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'PaymentID' not in columns:
            print("Adding PaymentID column to reservation table...")
            cursor.execute("ALTER TABLE reservation ADD COLUMN PaymentID INTEGER REFERENCES payment(PaymentID)")
            print("✓ PaymentID column added")
        
        if 'EmpID' not in columns:
            print("Adding EmpID column to reservation table...")
            cursor.execute("ALTER TABLE reservation ADD COLUMN EmpID INTEGER REFERENCES employee(EmpID)")
            print("✓ EmpID column added")
        
        if 'reservation_date' not in columns:
            print("Adding reservation_date column to reservation table...")
            cursor.execute("ALTER TABLE reservation ADD COLUMN reservation_date TEXT NOT NULL DEFAULT '2025-01-01'")
            print("✓ reservation_date column added")
        
        if 'party_size' not in columns:
            print("Adding party_size column to reservation table...")
            cursor.execute("ALTER TABLE reservation ADD COLUMN party_size INTEGER NOT NULL DEFAULT 2")
            print("✓ party_size column added")
        
        if 'reservation_code' not in columns:
            print("Adding reservation_code column to reservation table...")
            cursor.execute("ALTER TABLE reservation ADD COLUMN reservation_code TEXT")
            print("✓ reservation_code column added")
        
        if 'special_requests' not in columns:
            print("Adding special_requests column to reservation table...")
            cursor.execute("ALTER TABLE reservation ADD COLUMN special_requests TEXT")
            print("✓ special_requests column added")
        
        conn.commit()
        print("\n✅ Migration completed successfully!")
        print("\n📊 Reservation Transaction Now Involves 5 Tables:")
        print("  1. customer - Customer information")
        print("  2. payment - Reservation payment (generates code)")
        print("  3. restaurant_table - Table availability check")
        print("  4. employee - Staff processing reservation")
        print("  5. reservation - Final reservation record")
        print("\n💡 Flow: Payment First → Code Generated → Reservation Created")
        
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
