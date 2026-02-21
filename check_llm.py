import requests
import json

def check_llm():
    print("============================================================")
    print("🔍 AI Exam Oracle - LLM Diagnostic")
    print("============================================================")
    
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": "ai-exam-oracle",
        "prompt": "Hello, are you working? Reply with one word: YES.",
        "stream": False
    }
    
    try:
        print("[INFO] Contacting Ollama at http://localhost:11434...")
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            answer = result.get("response", "").strip()
            print(f"[SUCCESS] Language Model Response: {answer}")
            print("[INFO] Connectivity: OK")
        else:
            print(f"[ERROR] Ollama returned status code: {response.status_code}")
            print(f"[DETAIL] {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("[CRITICAL] Could not connect to Ollama.")
        print("[HINT] Make sure Ollama is running and the 'ai-exam-oracle' model is pulled.")
        print("[HINT] Run 'ollama run ai-exam-oracle' in a separate terminal to check.")
    except Exception as e:
        print(f"[ERROR] An unexpected error occurred: {e}")

if __name__ == "__main__":
    check_llm()
