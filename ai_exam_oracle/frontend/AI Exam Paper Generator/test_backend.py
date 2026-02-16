import requests

def test_api():
    base_url = "http://localhost:8000/api"
    try:
        r = requests.get(f"{base_url}/subjects/")
        print(f"Subjects response: {r.status_code}")
        print(r.json())
        
        r = requests.get(f"{base_url}/questions/vetting")
        print(f"Vetting questions response: {r.status_code}")
        print(r.json())
    except Exception as e:
        print(f"Error connecting to API: {e}")

if __name__ == "__main__":
    test_api()
