import os
import requests
from dotenv import load_dotenv

load_dotenv()

def verify_gemini():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("❌ Error: GOOGLE_API_KEY not found in .env")
        return

    print(f"Testing API key: {api_key[:4]}...{api_key[-4:]}")
    
    # List models endpoint
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            print("✅ Success! API key is valid.")
            models = response.json().get('models', [])
            with open("models_list.txt", "w") as f:
                for m in models:
                    f.write(f"{m['name']}\n")
            print(f"Written {len(models)} models to models_list.txt")
        else:
            print(f"❌ Failed: {response.status_code}")
            print("Error Details:", response.text)
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    verify_gemini()
