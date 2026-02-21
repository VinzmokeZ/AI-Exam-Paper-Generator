import requests
import sys
import os

API_URL = "http://localhost:8000/api/training/upload"

def train_model():
    print("============================================================")
    print("🚀 AI Exam Oracle - Offline Training Module")
    print("============================================================")
    
    file_path = input("Enter the path to your subject PDF/Document: ").strip().strip('"')
    
    if not os.path.exists(file_path):
        print(f"[ERROR] File not found: {file_path}")
        return

    subject_id = input("Enter Subject ID (e.g., 1): ").strip()
    
    print(f"\n[INFO] Uploading and training on: {os.path.basename(file_path)}...")
    
    try:
        with open(file_path, 'rb') as f:
            files = {'file': f}
            data = {'subject_id': subject_id}
            response = requests.post(API_URL, files=files, data=data)
            
        if response.status_code == 200:
            result = response.json()
            print("\n[SUCCESS] Training Completed!")
            print(f"Stats: {result}")
            print("\nThe model now 'knows' this document and can generate questions from it.")
        else:
            print(f"\n[ERROR] Training failed: {response.text}")
            
    except Exception as e:
        print(f"\n[ERROR] Connection failed. Is the backend running? ({e})")

if __name__ == "__main__":
    train_model()
