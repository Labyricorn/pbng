#!/usr/bin/env python3
"""Test script to check database contents"""

import sqlite3
import os

# Check if database file exists
db_path = 'instance/db.sqlite3'
if not os.path.exists(db_path):
    print(f"Database file does not exist at: {db_path}")
    exit(1)

print(f"Database file exists at: {db_path}")

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print(f"Tables in database: {tables}")

# Check snippets table
try:
    cursor.execute("SELECT COUNT(*) FROM snippets")
    count = cursor.fetchone()[0]
    print(f"Number of snippets in database: {count}")
    
    if count > 0:
        cursor.execute("SELECT id, title, category FROM snippets LIMIT 5")
        snippets = cursor.fetchall()
        print("Sample snippets:")
        for snippet in snippets:
            print(f"  ID: {snippet[0]}, Title: {snippet[1]}, Category: {snippet[2]}")
except Exception as e:
    print(f"Error querying snippets table: {e}")

conn.close()