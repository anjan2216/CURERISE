#!/usr/bin/env python3
"""
Test script for CureRise API endpoints
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_endpoint(method, endpoint, data=None, headers=None):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=headers)
        
        print(f"{method} {endpoint}")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print("-" * 50)
        return response
    except Exception as e:
        print(f"Error testing {method} {endpoint}: {e}")
        return None

def main():
    print("Testing CureRise API Endpoints")
    print("=" * 50)
    
    # Test health check
    test_endpoint("GET", "/api/health")
    
    # Test home endpoint
    test_endpoint("GET", "/")
    
    # Test patient endpoints
    test_endpoint("GET", "/api/patients")
    test_endpoint("GET", "/api/patients?page=1&per_page=5")
    test_endpoint("GET", "/api/patients?category=cardiac")
    
    # Test hospital endpoints
    test_endpoint("GET", "/api/hospitals")
    
    # Test education endpoints
    test_endpoint("GET", "/api/education")
    
    # Test food bank stats
    test_endpoint("GET", "/api/food-bank/stats")
    
    # Test user registration
    test_endpoint("POST", "/api/auth/register", {
        "email": "test@example.com",
        "password": "testpassword123",
        "name": "Test User",
        "phone": "+91-9876543210"
    })
    
    # Test user login
    login_response = test_endpoint("POST", "/api/auth/login", {
        "email": "test@example.com",
        "password": "testpassword123"
    })
    
    # Test authenticated endpoints if login was successful
    if login_response and login_response.status_code == 200:
        token = login_response.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test profile endpoint
        test_endpoint("GET", "/api/auth/profile", headers=headers)
        
        # Test donation creation
        test_endpoint("POST", "/api/donations", {
            "amount": 1000,
            "donation_type": "patient",
            "patient_id": "1",  # This will fail if patient doesn't exist, but tests the endpoint
            "donor_name": "Test Donor",
            "donor_email": "donor@example.com",
            "donor_phone": "+91-9876543210",
            "payment_method": "card"
        })
        
        # Test food bank donation
        test_endpoint("POST", "/api/food-bank/donations", {
            "amount": 500,
            "donation_type": "monthly",
            "donor_name": "Test Donor",
            "donor_email": "donor@example.com",
            "donor_phone": "+91-9876543210",
            "payment_method": "upi"
        })
    
    print("API testing completed!")

if __name__ == "__main__":
    main()
