"""
Migration script to remove reservation_item table
"""
import sqlite3

DATABASE = 'restaurant.db'

def migrate():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    try:
        print("Starting removal of reservation_item table...")
        
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='reservation_item'")
        if cursor.fetchone():
            cursor.execute('DROP TABLE reservation_item')
            print("✓ reservation_item table dropped")
        else:
            print("✓ reservation_item table does not exist (already removed)")
        
        conn.commit()
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
