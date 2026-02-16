import requests
import json

BASE_URL = "http://localhost:8000"

def test_root():
    try:
        r = requests.get(f"{BASE_URL}/")
        print(f"[ROOT] Status: {r.status_code}, Response: {r.json()}")
    except Exception as e:
        print(f"[ROOT] Failed: {e}")

def test_gamification():
    try:
        r = requests.get(f"{BASE_URL}/api/gamification/1")
        print(f"[GAMIFICATION] Status: {r.status_code}")
        if r.status_code == 200:
            print(f"[GAMIFICATION] Data: {r.json()}")
        else:
            print(f"[GAMIFICATION] Error: {r.text}")
    except Exception as e:
        print(f"[GAMIFICATION] Failed: {e}")

def test_generate():
    try:
        payload = {
            "subject_name": "Computer Science",
            "topic_name": "AI",
            "blooms_level": "Recall",
            "count": 1
        }
        print("[GENERATE] Sending request... (may take time)")
        r = requests.post(f"{BASE_URL}/api/generate/questions", json=payload)
        print(f"[GENERATE] Status: {r.status_code}")
        if r.status_code == 200:
            print(f"[GENERATE] Success! (First question: {r.json()[0]['question'][:30]}...)")
        else:
            print(f"[GENERATE] Error: {r.text}")
    except Exception as e:
        print(f"[GENERATE] Failed: {e}")

def test_upload():
    try:
        # Create dummy file
        with open("test.txt", "w") as f:
            f.write("This is a test document about Artificial Intelligence.")
        
        files = {'file': open('test.txt', 'rb')}
        data = {'subject_id': 1}
        
        r = requests.post(f"{BASE_URL}/api/training/upload", files=files, data=data)
        print(f"[UPLOAD] Status: {r.status_code}")
        if r.status_code == 200:
            print(f"[UPLOAD] Response: {r.json()}")
        else:
            print(f"[UPLOAD] Error: {r.text}")
    except Exception as e:
        print(f"[UPLOAD] Failed: {e}")

if __name__ == "__main__":
    test_root()
    test_gamification()
    test_upload()
    test_generate()
