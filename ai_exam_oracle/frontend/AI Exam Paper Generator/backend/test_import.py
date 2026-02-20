import sys, traceback, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
print("Testing imports...")
try:
    from app.main import app
    print("SUCCESS: app imported OK")
except Exception as e:
    print("FAILED:", e)
    traceback.print_exc()
