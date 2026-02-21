import os
from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"
MODEL_PATH = os.path.join(os.path.dirname(__file__), "local_models", MODEL_NAME)

def download_models():
    print(f"Checking for offline model at: {MODEL_PATH}")
    
    if os.path.exists(MODEL_PATH):
        print("Model already exists locally.")
        return

    print(f"Downloading {MODEL_NAME} for offline use...")
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    
    model = SentenceTransformer(MODEL_NAME)
    model.save(MODEL_PATH)
    
    print("Model downloaded successfully!")

if __name__ == "__main__":
    download_models()
