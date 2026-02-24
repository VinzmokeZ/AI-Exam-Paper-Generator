import os
import requests
import re
from typing import List, Optional
from sqlalchemy.orm import Session
from ..models import KnowledgeBase, KnowledgeChunk

# NOTE: sentence_transformers and chromadb are imported lazily inside the class
# to prevent blocking network downloads at module load time.

_rag_service = None

def get_rag_service():
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service

class RAGService:
    def __init__(self):
        self.model = None
        self.chroma_client = None
        self.collection = None
        self._enabled = False
        # Step 0: Check if we are on Render (Free tier memory limits)
        if os.getenv("RENDER") == "true":
            print("[RAG] Detected Render environment. Disabling RAG for stability (Free Tier).")
            return

        # Step 1: Load embedding model (crash-proof, lazy import)
        try:
            from sentence_transformers import SentenceTransformer
            model_name = "all-MiniLM-L6-v2"
            local_model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "local_models", model_name)
            
            if os.path.exists(local_model_path):
                print(f"Loading local model from {local_model_path}")
                self.model = SentenceTransformer(local_model_path)
            else:
                print(f"[RAG] Local model not found. Skipping RAG (no network download).")
                print("[RAG] RAG features will be disabled. Core API is unaffected.")
                return  # Don't try to download from HuggingFace
            print("[RAG] ✅ Embedding model loaded.")
        except Exception as e:
            print(f"[RAG] ⚠️ Embedding model failed to load: {e}")
            print("[RAG] RAG features will be disabled. Core API is unaffected.")
            return  # Exit __init__ early — service stays disabled
        
        # Step 2: Initialize ChromaDB (crash-proof, lazy import)
        db_dir = "./chroma_db"
        try:
            import chromadb
            from chromadb.config import Settings
            self.chroma_client = chromadb.Client(Settings(persist_directory=db_dir, is_persistent=True))
            self.collection = self.chroma_client.get_or_create_collection("exam_content")
            print(f"[RAG] ✅ ChromaDB initialized successfully at {db_dir}")
            self._enabled = True
        except Exception as e:
            print(f"[RAG] ❌ ChromaDB Initialization Failed: {e}")
            print(f"[RAG] If this persists, please delete the '{db_dir}' folder manually.")
            self.chroma_client = None
            self.collection = None

        # Go up 4 levels from backend/app/services/rag_service.py to reach root
        self.kb_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "knowledge_base")

    def auto_index_kb(self):
        """Indexes everything in the knowledge_base folder."""
        if not self._enabled or not self.collection:
            print("[RAG] ⚠️ Skipping auto-indexing: RAG service is disabled or not initialized.")
            return 0
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
                from PyPDF2 import PdfReader
                reader = PdfReader(file_path)
                for page in reader.pages:
                    text_page = page.extract_text()
                    if text_page: text += text_page
            elif ext.lower() == '.docx':
                from docx import Document as DocxDocument
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

    def fetch_wikipedia_context(self, query):
        """Fetches a summary from Wikipedia as a fallback context."""
        import requests
        print(f"[RAG] 🌐 Fetching Wikipedia context for: {query}")
        try:
            # Use Wikipedia API to get the summary
            url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{query.replace(' ', '_')}"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                extract = data.get('extract', '')
                if extract:
                    print(f"[RAG] ✅ Found Wikipedia summary for {query}")
                    return [f"Source: Wikipedia\nContent: {extract}"]
        except Exception as e:
            print(f"[RAG] ❌ Wikipedia fetch failed: {e}")
        
        return []

    def query_context(self, query, subject_id, topic_id=None, n_results=5):
        # Handle both integer and string IDs (like 'cs301') by converting to string
        subject_id_str = str(subject_id)
        filter_dict = {"subject_id": subject_id_str}
        
        col = self.collection
        if col is None:
            print("[RAG] ⚠️ Local collection is None. Skipping local query.")
            return self.fetch_wikipedia_context(query)
            
        try:
            results = col.query(
                query_texts=[query],
                n_results=n_results,
                where=filter_dict
            )
            if results and 'documents' in results and len(results['documents']) > 0 and len(results['documents'][0]) > 0:
                print(f"[RAG] 📚 Found {len(results['documents'][0])} local chunks for {query}")
                return results['documents'][0]
        except Exception as e:
            print(f"[RAG] Internal Query Failure: {e}")
            
        # Wikipedia Fallback
        wiki_context = self.fetch_wikipedia_context(query.replace("Questions about ", ""))
        if wiki_context:
            return wiki_context
            
        return []

    async def process_knowledge_base(self, kb: KnowledgeBase, db: Session):
        """Processes a KnowledgeBase entry: downloads, extracts text, and chunks."""
        print(f"[RAG] Processing KnowledgeBase: {kb.title} ({kb.source_type})")
        
        text = ""
        if kb.source_type == "drive":
            text = self._process_drive_link(kb.source_url)
        
        if not text:
            print(f"[RAG] ❌ No text extracted for KB: {kb.title}")
            return

        # Simple chunking logic
        chunk_size = 1500
        chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
        
        # Save chunks to DB
        for chunk_content in chunks:
            chunk = KnowledgeChunk(
                kb_id=kb.id,
                content=chunk_content
            )
            db.add(chunk)
        
        db.commit()
        print(f"[RAG] ✅ Processed {len(chunks)} chunks for KB: {kb.title}")

    def _process_drive_link(self, url: str) -> str:
        """Extracts text from a Google Drive PDF link."""
        file_id = self._extract_drive_id(url)
        if not file_id:
            print(f"[RAG] ❌ Could not extract file ID from: {url}")
            return ""
        
        # Construct direct download link
        download_url = f"https://docs.google.com/uc?export=download&id={file_id}"
        
        try:
            response = requests.get(download_url, timeout=30)
            if response.status_code != 200:
                print(f"[RAG] ❌ Drive download failed: {response.status_code}")
                return ""
            
            # Save temporary file to read
            temp_path = f"temp_{file_id}.pdf"
            with open(temp_path, "wb") as f:
                f.write(response.content)
            
            # Extract text using PyPDF2 (already in requirements)
            from PyPDF2 import PdfReader
            reader = PdfReader(temp_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            
            # Cleanup
            os.remove(temp_path)
            return text
        except Exception as e:
            print(f"[RAG] ❌ Error processing Drive link: {e}")
            return ""

    def _extract_drive_id(self, url: str) -> Optional[str]:
        """Regex to find Google Drive file ID."""
        patterns = [
            r'[-\w]{25,}', # Generic ID match
            r'd/([-\w]{25,})',
            r'id=([-\w]{25,})'
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                # If it's the more specific match, the ID is in group 1
                return match.group(1) if len(match.groups()) > 0 else match.group(0)
        return None

    def get_context_from_kb(self, kb_id: int, query: str, db: Session, n_results: int = 5) -> List[str]:
        """Retrieves relevant chunks from a specific KnowledgeBase."""
        # For now, since we haven't implemented full vector search in SQL yet, 
        # we'll do a simple keyword match or just return top chunks.
        # Once pgvector is up, this will be a vector search.
        chunks = db.query(KnowledgeChunk).filter(KnowledgeChunk.kb_id == kb_id).limit(n_results).all()
        return [c.content for c in chunks]

