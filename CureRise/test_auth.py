#!/usr/bin/env python3
"""
Test authentication endpoints
"""
import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_login():
    """Test login with demo credentials"""
    url = f"{BASE_URL}/auth/login"
    data = {
        "email": "demo@curerise.com",
        "password": "demo123"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Login Test:")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        print()
        
        if response.status_code == 200:
            return response.json().get('access_token')
        return None
        
    except Exception as e:
        print(f"Login Error: {e}")
        return None

def test_register():
    """Test registration with new user"""
    url = f"{BASE_URL}/auth/register"
    data = {
        "email": "test@example.com",
        "password": "test12345",
        "name": "Test User",
        "phone": "+919876543210"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Register Test:")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        print()
        
    except Exception as e:
        print(f"Register Error: {e}")

def test_profile(token):
    """Test profile endpoint with token"""
    if not token:
        print("No token available for profile test")
        return
        
    url = f"{BASE_URL}/auth/profile"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Profile Test:")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        print()
        
    except Exception as e:
        print(f"Profile Error: {e}")

def main():
    print("🧪 Testing CureRise Authentication")
    print("=" * 50)
    
    # Test login
    token = test_login()
    
    # Test registration
    test_register()
    
    # Test profile
    test_profile(token)

if __name__ == "__main__":
    main()