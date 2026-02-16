import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.rag_service import rag_service

def train_knowledge_base():
    print("============================================================")
    print("🎓 AI Exam Oracle - Knowledge Base Training")
    print("============================================================")
    print("[INFO] Scanning knowledge_base folder...")
    
    count = rag_service.auto_index_kb()
    
    if count > 0:
        print(f"[SUCCESS] Indexed {count} chunks of knowledge.")
        print("[INFO] The AI model is now 'trained' with your subject data.")
    else:
        print("[WARNING] No knowledge files found to index.")
        print("[HINT] Add .txt, .pdf, or .docx files to 'knowledge_base/subjects/[subject_code]/'")

if __name__ == "__main__":
    train_knowledge_base()
