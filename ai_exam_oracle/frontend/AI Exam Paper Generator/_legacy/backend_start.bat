
@echo off
cd backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 > backend.log 2>&1
