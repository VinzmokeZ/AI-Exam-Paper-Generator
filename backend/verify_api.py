import requests
import time
import sys
import subprocess
import os

BASE_URL = "http://localhost:8000"

def test_endpoint(method, endpoint, data=None):
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        
        print(f"[{method}] {endpoint}: {response.status_code}")
        if response.status_code >= 400:
            print(f"Error: {response.text}")
            return False
        return True
    except Exception as e:
        print(f"Failed to connect to {url}: {e}")
        return False

def verify_api():
    print("Verifying API Endpoints...")
    
    # Wait for server
    for i in range(10):
        if test_endpoint("GET", "/"):
            break
        print("Waiting for server...")
        time.sleep(2)
    else:
        print("Server failed to start.")
        sys.exit(1)

    # Test Subjects
    if not test_endpoint("GET", "/api/subjects/"):
        print("Failed to get subjects.")
    
    # Test Create Subject
    new_subject = {
        "name": "Test Subject",
        "code": "TEST101",
        "color": "#FFFFFF",
        "gradient": "from-white to-black",
        "introduction": "Test Intro"
    }
    if not test_endpoint("POST", "/api/subjects/", new_subject):
        print("Failed to create subject.")

    # Test Topics
    # Need to get subject ID first?
    # For now just check the route exists or returns 404/422 if invalid
    
    print("Verification Complete.")

if __name__ == "__main__":
    verify_api()
