from fastapi import APIRouter, UploadFile, File, Form
from ..services.training_service import training_service
import shutil
import os

router = APIRouter()

@router.post("/upload")
async def upload_document(
    subject_id: int = Form(...),
    topic_id: int = Form(None),
    file: UploadFile = File(...)
):
    # Save file temporarily
    os.makedirs("temp", exist_ok=True)
    file_path = f"temp/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    
    # Process with Training Service
    result = await training_service.train_on_document(file_path, subject_id, topic_id)
    
    # Cleanup
    os.remove(file_path)
    
    return {"message": "Document processed", "details": result}

@router.get("/files/{subject_code}")
async def list_files(subject_code: str):
    # Knowledge base root is 4 levels up from this file's grandparent's parent? 
    # Let's use a simpler way to find the KB path.
    kb_path = os.path.abspath(os.path.join(os.getcwd(), "..", "knowledge_base", "subjects", subject_code))
    # If not found at root, try relative to backend
    if not os.path.exists(kb_path):
        kb_path = os.path.abspath(os.path.join(os.getcwd(), "knowledge_base", "subjects", subject_code))
    
    if not os.path.exists(kb_path):
        return []
    
    files = []
    for f in os.listdir(kb_path):
        f_path = os.path.join(kb_path, f)
        if os.path.isfile(f_path):
            files.append({
                "id": f,
                "name": f,
                "size": f"{os.path.getsize(f_path) / (1024 * 1024):.1f} MB",
                "status": "ready"
            })
    return files

@router.delete("/files/{subject_code}/{filename}")
async def delete_file(subject_code: str, filename: str):
    kb_path = os.path.abspath(os.path.join(os.getcwd(), "..", "knowledge_base", "subjects", subject_code))
    if not os.path.exists(kb_path):
        kb_path = os.path.abspath(os.path.join(os.getcwd(), "knowledge_base", "subjects", subject_code))
    
    file_path = os.path.join(kb_path, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        # Note: In a production system, we'd also remove from ChromaDB collection
        # But for this prototype, we'll rely on the next 'sync_external_knowledge' run
        return {"message": "File deleted"}
    return {"message": "File not found"}
