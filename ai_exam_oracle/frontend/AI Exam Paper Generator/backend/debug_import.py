import sys
sys.path.insert(0, '.')

try:
    from app.main import app
    print("✅ SUCCESS! App loaded correctly!")
except Exception as e:
    print(f"❌ ERROR: {type(e).__name__}")
    print(f"Message: {str(e)}")
    import traceback
    print("\nFull Traceback:")
    traceback.print_exc()
