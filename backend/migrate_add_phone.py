"""
Migration script to add phone column to customer table
Run this once to update existing database
"""
import sqlite3

DATABASE = 'restaurant.db'

def migrate():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    try:
        # Check if phone column already exists
        cursor.execute("PRAGMA table_info(customer)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'phone' not in columns:
            print("Adding 'phone' column to customer table...")
            cursor.execute("ALTER TABLE customer ADD COLUMN phone TEXT")
            conn.commit()
            print("✓ Migration completed successfully!")
        else:
            print("✓ Phone column already exists. No migration needed.")
            
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
