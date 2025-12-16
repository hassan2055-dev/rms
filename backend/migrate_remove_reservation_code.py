"""
Migration script to remove reservation_code columns from payment and reservation tables
"""
import sqlite3

DATABASE = 'restaurant.db'

def migrate():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    try:
        print("Starting removal of reservation_code columns...")
        
        # Cleanup any leftover tables from previous failed migrations
        cursor.execute("DROP TABLE IF EXISTS payment_new")
        cursor.execute("DROP TABLE IF EXISTS reservation_new")
        
        # SQLite doesn't support DROP COLUMN directly, so we need to recreate tables
        
        # 1. Recreate payment table without reservation_code
        print("Recreating payment table without reservation_code...")
        cursor.execute('''
            CREATE TABLE payment_new (
                PaymentID INTEGER PRIMARY KEY AUTOINCREMENT,
                CustomerID INTEGER NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                payment_method TEXT NOT NULL,
                payment_status TEXT NOT NULL DEFAULT 'completed',
                transaction_date TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (CustomerID) REFERENCES customer (CustomerID)
            )
        ''')
        
        # Copy data from old table
        cursor.execute('''
            INSERT INTO payment_new (PaymentID, CustomerID, amount, payment_method, payment_status, transaction_date, created_at)
            SELECT PaymentID, CustomerID, amount, payment_method, payment_status, transaction_date, created_at
            FROM payment
        ''')
        
        # Drop old table and rename new one
        cursor.execute('DROP TABLE payment')
        cursor.execute('ALTER TABLE payment_new RENAME TO payment')
        print("✓ payment table recreated without reservation_code")
        
        # 2. Recreate reservation table without reservation_code
        print("Recreating reservation table without reservation_code...")
        cursor.execute('''
            CREATE TABLE reservation_new (
                ReservationID INTEGER PRIMARY KEY AUTOINCREMENT,
                CustomerID INTEGER NOT NULL,
                TableID INTEGER NOT NULL,
                PaymentID INTEGER,
                EmpID INTEGER,
                reservation_date TEXT NOT NULL,
                party_size INTEGER NOT NULL DEFAULT 2,
                special_requests TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (CustomerID) REFERENCES customer (CustomerID),
                FOREIGN KEY (TableID) REFERENCES restaurant_table (TableID),
                FOREIGN KEY (PaymentID) REFERENCES payment (PaymentID),
                FOREIGN KEY (EmpID) REFERENCES employee (EmpID)
            )
        ''')
        
        # Copy data from old table - only copy rows that have all required fields
        cursor.execute('''
            INSERT INTO reservation_new (ReservationID, CustomerID, TableID, PaymentID, EmpID, reservation_date, party_size, special_requests, created_at)
            SELECT ReservationID, CustomerID, TableID, PaymentID, EmpID, 
                   COALESCE(reservation_date, date('now')), 
                   COALESCE(party_size, 2), 
                   special_requests, 
                   created_at
            FROM reservation
        ''')
        
        # Drop old table and rename new one
        cursor.execute('DROP TABLE reservation')
        cursor.execute('ALTER TABLE reservation_new RENAME TO reservation')
        print("✓ reservation table recreated without reservation_code")
        
        conn.commit()
        print("\n✅ Migration completed successfully!")
        print("\n📊 Database Updated:")
        print("  • payment table: reservation_code column removed")
        print("  • reservation table: reservation_code column removed")
        
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
