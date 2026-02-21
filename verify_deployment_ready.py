
import os
import sys
import importlib

print("===================================================")
print("     AI EXAM ORACLE - DEPLOYMENT PRE-FLIGHT CHECK")
print("===================================================")

failures = []

def check(name, success):
    if success:
        print(f"[PASS] {name}")
    else:
        print(f"[FAIL] {name}")
        failures.append(name)

# 1. Check render.yaml
check("render.yaml exists", os.path.exists("render.yaml"))

# 2. Check Dependencies
try:
    with open("backend/requirements.txt", "r") as f:
        reqs = f.read()
        check("gunicorn in requirements", "gunicorn" in reqs)
        check("psycopg2-binary in requirements", "psycopg2-binary" in reqs)
except Exception:
    failures.append("Missing backend/requirements.txt")

# 3. Import Check (Simulate Start)
sys.path.insert(0, os.path.abspath("backend"))
try:
    print("[INFO] Attempting to import app.main...")
    from app.main import app
    check("App entry point imports successfully", True)
except Exception as e:
    print(f"[ERROR] Import Failed: {e}")
    check("App entry point imports successfully", False)

# 4. DB Logic Check
try:
    from app.database import RENDER_DB_URL
    check("Database logic updated for Cloud", True)
except ImportError:
    failures.append("Database logic missing Cloud check")

print("\n---------------------------------------------------")
if not failures:
    print("✅ READY FOR DEPLOYMENT! All checks passed.")
    print("Run '.\\SETUP_GIT.bat' to proceed.")
else:
    print(f"❌ NOT READY. Fix these issues: {failures}")
    sys.exit(1)
