
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"

def test_local_generation():
    print("Testing Local AI Generation (Ollama)...")
    
    payload = {
        "subject_name": "Computer Science",
        "topic_name": "Data Structures",
        "blooms_level": "Advanced",
        "count": 3,
        "engine": "local"
    }
    
    try:
        start_time = time.time()
        print(f"Sending request to {BASE_URL}/generate/questions...")
        response = requests.post(f"{BASE_URL}/generate/questions", json=payload, timeout=120) # Increased timeout
        end_time = time.time()
        
        print(f"Response Status: {response.status_code}")
        print(f"Raw Response: {response.text[:500]}...") # Print beginning of response
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Generated {len(data)} questions in {end_time - start_time:.2f}s")
            
            if len(data) > 0:
                first_q = data[0]
                if "explanation" in first_q:
                    print(f"✅ Explanation Field Present: {first_q['explanation'][:50]}...")
                else:
                    print("⚠️ Explanation Field MISSING")
            # ... (rest of verification logic)
        else:
            print(f"❌ Failed with Status {response.status_code}")
            # Save full error to file
            with open("error.log", "w", encoding="utf-8") as f:
                f.write(response.text)
            print("Full error details saved to error.log")
            print(f"Error Preview: {response.text[:200]}...")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Refused: Is the backend running on localhost:8000?")
    except requests.exceptions.Timeout:
        print("❌ Request Timed Out (Ollama might be slow)")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_local_generation()
