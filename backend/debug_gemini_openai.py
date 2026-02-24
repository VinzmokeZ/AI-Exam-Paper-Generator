import os
import requests
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(dotenv_path="backend/.env")

def test_config(name, base_url, model_name, api_key):
    print(f"\n--- Testing: {name} ---")
    print(f"Base URL: {base_url}")
    print(f"Model: {model_name}")
    
    try:
        client = OpenAI(api_key=api_key, base_url=base_url)
        response = client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": "Hi"}],
            max_tokens=10
        )
        print(f"✅ Success! Response: {response.choices[0].message.content}")
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        return False

def debug():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("GOOGLE_API_KEY missing")
        return

    configs = [
        ("V1Beta OpenAI Shim", "https://generativelanguage.googleapis.com/v1beta/openai/", "gemini-1.5-flash", api_key),
        ("V1Beta OpenAI Shim (2.0)", "https://generativelanguage.googleapis.com/v1beta/openai/", "gemini-2.0-flash", api_key),
        ("V1Beta OpenAI Shim (2.0 prefix)", "https://generativelanguage.googleapis.com/v1beta/openai/", "models/gemini-2.0-flash", api_key),
        ("V1 OpenAI Shim", "https://generativelanguage.googleapis.com/v1/openai/", "gemini-1.5-flash", api_key),
        ("V1 OpenAI Shim (2.0)", "https://generativelanguage.googleapis.com/v1/openai/", "gemini-2.0-flash", api_key),
        ("Native V1Beta", "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + api_key, "gemini-2.0-flash", api_key),
    ]

    for name, base_url, model, key in configs:
        if name == "Native V1Beta":
            print(f"\n--- Testing: {name} ---")
            try:
                url = base_url
                payload = {"contents": [{"parts": [{"text": "Hi"}]}]}
                res = requests.post(url, json=payload)
                print(f"Status: {res.status_code}")
                print(f"Response: {res.text[:200]}")
            except Exception as e:
                print(f"Failed: {e}")
        else:
            test_config(name, base_url, model, key)

if __name__ == "__main__":
    debug()
