"""
Debug startup script - captures full traceback to debug_startup_output.txt
"""
import sys
import traceback
import os

# Change to backend directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

output_lines = []

def log(msg):
    print(msg)
    output_lines.append(msg)

log("=== BACKEND STARTUP DEBUG ===")
log(f"Python: {sys.version}")
log(f"CWD: {os.getcwd()}")
log("")

# Test each import
modules_to_test = [
    ("fastapi", "FastAPI"),
    ("uvicorn", "uvicorn"),
    ("sqlalchemy", "SQLAlchemy"),
    ("sentence_transformers", "SentenceTransformer"),
    ("chromadb", "ChromaDB"),
    ("ollama", "Ollama"),
    ("PyPDF2", "PyPDF2"),
    ("docx", "python-docx"),
]

for module, name in modules_to_test:
    try:
        __import__(module)
        log(f"  ✅ {name} ({module}) - OK")
    except ImportError as e:
        log(f"  ❌ {name} ({module}) - MISSING: {e}")
    except Exception as e:
        log(f"  ⚠️ {name} ({module}) - ERROR: {e}")

log("")
log("=== Testing App Import ===")
try:
    from app.main import app
    log("✅ App imported successfully!")
except Exception as e:
    log(f"❌ App import FAILED:")
    log(traceback.format_exc())

log("")
log("=== Port 8000 Check ===")
import socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
result = sock.connect_ex(('127.0.0.1', 8000))
sock.close()
if result == 0:
    log("⚠️ Port 8000 is ALREADY IN USE!")
else:
    log("✅ Port 8000 is FREE")

# Write to file
with open("debug_startup_output.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(output_lines))

log("")
log("=== Output saved to debug_startup_output.txt ===")
