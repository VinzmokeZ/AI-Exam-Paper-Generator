import requests
import json

def list_gemini_models(api_key):
    print("Listing available models...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            models = response.json().get('models', [])
            print(f"Found {len(models)} models.")
            for m in models:
                print(f"- {m['name']} (Supported: {','.join(m['supportedGenerationMethods'])})")
            return models
        else:
            print(f"Error {response.status_code}: {response.text}")
            return []
    except Exception as e:
        print(f"Exception: {e}")
        return []

if __name__ == "__main__":
    key = "AIzaSyD-X6b9qetMC5JDZJymBVXzkJW08_7n87M"
    list_gemini_models(key)
