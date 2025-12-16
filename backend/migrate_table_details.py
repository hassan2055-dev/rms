"""
Migration script to add category, price, and capacity to restaurant_table
"""
import sqlite3

DATABASE = 'restaurant.db'

def migrate():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    try:
        print("Starting table details migration...")
        
        # Check and add columns to restaurant_table
        cursor.execute("PRAGMA table_info(restaurant_table)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'category' not in columns:
            print("Adding category column to restaurant_table...")
            cursor.execute("ALTER TABLE restaurant_table ADD COLUMN category TEXT NOT NULL DEFAULT 'Standard'")
            print("✓ category column added")
        
        if 'price' not in columns:
            print("Adding price column to restaurant_table...")
            cursor.execute("ALTER TABLE restaurant_table ADD COLUMN price DECIMAL(10, 2) NOT NULL DEFAULT 50.00")
            print("✓ price column added")
        
        if 'capacity' not in columns:
            print("Adding capacity column to restaurant_table...")
            cursor.execute("ALTER TABLE restaurant_table ADD COLUMN capacity INTEGER NOT NULL DEFAULT 4")
            print("✓ capacity column added")
        
        # Update existing tables with realistic values
        print("\nUpdating existing tables with categories, prices, and capacities...")
        
        # Tables 1-4: Standard tables (4 capacity, $2)
        cursor.execute("""
            UPDATE restaurant_table 
            SET category = 'Standard', price = 2.00, capacity = 4 
            WHERE TableID BETWEEN 1 AND 4
        """)
        
        # Tables 5-8: Premium tables (6 capacity, $5)
        cursor.execute("""
            UPDATE restaurant_table 
            SET category = 'Premium', price = 5.00, capacity = 6 
            WHERE TableID BETWEEN 5 AND 8
        """)
        
        # Tables 9-10: VIP tables (8 capacity, $10)
        cursor.execute("""
            UPDATE restaurant_table 
            SET category = 'VIP', price = 10.00, capacity = 8 
            WHERE TableID BETWEEN 9 AND 10
        """)
        
        # Tables 11-12: Family tables (10 capacity, $7)
        cursor.execute("""
            UPDATE restaurant_table 
            SET category = 'Family', price = 7.00, capacity = 10 
            WHERE TableID BETWEEN 11 AND 12
        """)
        
        conn.commit()
        print("✓ All tables updated")
        
        print("\n✅ Migration completed successfully!")
        print("\n📊 Table Categories:")
        print("  • Standard (Tables 1-4): 4 capacity, $2")
        print("  • Premium (Tables 5-8): 6 capacity, $5")
        print("  • VIP (Tables 9-10): 8 capacity, $10")
        print("  • Family (Tables 11-12): 10 capacity, $7")
        
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
