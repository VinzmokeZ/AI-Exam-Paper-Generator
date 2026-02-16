import os
from PyPDF2 import PdfReader
from docx import Document as DocxDocument
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings

class RAGService:
    def __init__(self):
        model_name = "all-MiniLM-L6-v2"
        local_model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "local_models", model_name)
        
        if os.path.exists(local_model_path):
            print(f"Loading local model from {local_model_path}")
            try:
                self.model = SentenceTransformer(local_model_path)
            except Exception as e:
                print(f"[WARNING] Failed to load local model: {e}. Falling back to HuggingFace.")
                self.model = SentenceTransformer(model_name)
        else:
            print(f"Loading model from CACHE/HuggingFace: {model_name}")
            self.model = SentenceTransformer(model_name)

        self.chroma_client = chromadb.Client(Settings(persist_directory="./chroma_db", is_persistent=True))
        self.collection = self.chroma_client.get_or_create_collection("exam_content")
        # Go up 4 levels from backend/app/services/rag_service.py to reach root
        self.kb_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "knowledge_base")

    def auto_index_kb(self):
        """Indexes everything in the knowledge_base folder."""
        subjects_path = os.path.join(self.kb_path, "subjects")
        if not os.path.exists(subjects_path):
            print(f"[RAG] Knowledge base subjects path not found: {subjects_path}")
            return 0
        
        count = 0
        print(f"[RAG] Starting auto-indexing from: {subjects_path}")
        for subject_code in os.listdir(subjects_path):
            subj_dir = os.path.join(subjects_path, subject_code)
            if not os.path.isdir(subj_dir): continue
            
            for file_name in os.listdir(subj_dir):
                if file_name.lower().endswith(('.txt', '.pdf', '.docx', '.csv')):
                    file_path = os.path.join(subj_dir, file_name)
                    print(f"  > [RAG] Indexing {file_name} for {subject_code}...")
                    try:
                        count += self.process_file(file_path, subject_id=subject_code)
                    except Exception as e:
                        print(f"  > [ERROR] Failed to index {file_name}: {e}")
        
        print(f"[RAG] Auto-indexing complete. indexed {count} chunks.")
        return count

    def process_file(self, file_path, subject_id, topic_id=None):
        _, ext = os.path.splitext(file_path)
        text = ""
        try:
            if ext.lower() == '.pdf':
                reader = PdfReader(file_path)
                for page in reader.pages:
                    text_page = page.extract_text()
                    if text_page: text += text_page
            elif ext.lower() == '.docx':
                doc = DocxDocument(file_path)
                for para in doc.paragraphs:
                    text += para.text + "\n"
            elif ext.lower() == '.csv':
                import csv
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
            else:
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
        except Exception as e:
            print(f"[RAG] Error reading {file_path}: {e}")
            return 0
        
        if not text.strip():
            return 0

        # Simple chunking
        chunks = [text[i:i+1000] for i in range(0, len(text), 1000)]
        ids = [f"s{subject_id}_t{topic_id or 'none'}_{file_path.split(os.sep)[-1]}_{i}" for i in range(len(chunks))]
        metadatas = [{"subject_id": str(subject_id), "topic_id": str(topic_id or 0)} for _ in chunks]
        
        self.collection.add(
            ids=ids,
            documents=chunks,
            metadatas=metadatas
        )
        return len(chunks)

    def query_context(self, query, subject_id, topic_id=None, n_results=5):
        # Handle both integer and string IDs (like 'cs301') by converting to string
        filter_dict = {"subject_id": str(subject_id)}
        
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                where=filter_dict
            )
            if results['documents'] and len(results['documents']) > 0 and len(results['documents'][0]) > 0:
                return results['documents'][0]
        except Exception as e:
            print(f"[RAG] Query error: {e}")
            
        return ["No specific context found for this topic. Use general knowledge."]

rag_service = RAGService()
