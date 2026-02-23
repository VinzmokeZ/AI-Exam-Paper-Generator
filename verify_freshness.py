import requests
import time
import json

BASE_URL = "http://localhost:8000"

def test_fresh_generation():
    print("--- Testing Fresh Generation ---")
    payload = {
        "subject_name": "Computer Science",
        "topic_name": "Data Structures",
        "blooms_level": "Apply",
        "count": 2,
        "engine": "local"
    }
    
    # 1. Normal Generate (Cached)
    print("Requesting normal generation...")
    r1 = requests.post(f"{BASE_URL}/generate/questions", json=payload)
    if r1.status_code != 200:
        print(f"Error: {r1.text}")
        return
    q1 = r1.json()
    print(f"Generated {len(q1)} questions.")
    
    # 2. Fresh Generate (Bypass Cache)
    print("\nRequesting fresh generation...")
    payload["fresh"] = True
    r2 = requests.post(f"{BASE_URL}/generate/questions", json=payload)
    q2 = r2.json()
    
    # Check if results are different
    ids1 = [q.get('question', '')[:20] for q in q1]
    ids2 = [q.get('question', '')[:20] for q in q2]
    
    print(f"Set 1 Questions: {ids1}")
    print(f"Set 2 Questions: {ids2}")
    
    if ids1 != ids2:
        print("PASS: Questions are different.")
    else:
        print("FAIL: Questions are identical (cache not bypassed or AI returned same result).")

def test_dynamic_co_mapping():
    print("\n--- Testing Dynamic CO Mapping ---")
    payload = {
        "subject_name": "Mathematics",
        "topic_name": "Calculus",
        "blooms_level": "Analyze",
        "count": 3,
        "engine": "local",
        "fresh": True
    }
    
    r = requests.post(f"{BASE_URL}/generate/questions", json=payload)
    questions = r.json()
    
    all_co_sets = []
    for i, q in enumerate(questions):
        co = q.get('courseOutcomes') or q.get('course_outcomes', {})
        print(f"Question {i+1} CO: {co}")
        all_co_sets.append(json.dumps(co, sort_keys=True))
        
        # Verify structure
        if not all(f"co{j}" in co for j in range(1, 6)):
            print(f"FAIL: Missing CO keys in Q{i+1}")
    
    if len(set(all_co_sets)) > 1:
        print("PASS: CO mappings are varied.")
    else:
        print("FAIL: CO mappings are static/identical across questions.")

if __name__ == "__main__":
    try:
        test_freshness = True
        test_fresh_generation()
        test_dynamic_co_mapping()
    except Exception as e:
        print(f"Connection Error: {e}. Is the backend running?")
