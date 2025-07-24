#!/usr/bin/env python3
"""Test script to check Flask API"""

from app import create_app
import json

# Create Flask app
app = create_app()

# Test the API endpoint
with app.test_client() as client:
    response = client.get('/api/snippets')
    print(f"Status Code: {response.status_code}")
    print(f"Response Data: {response.get_data(as_text=True)}")
    
    if response.status_code == 200:
        data = response.get_json()
        print(f"Number of snippets returned: {len(data)}")
        for snippet in data:
            print(f"  - {snippet['title']} ({snippet['category']})")
    else:
        print("API endpoint failed!")