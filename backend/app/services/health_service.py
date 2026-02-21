import os
import time
import requests
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import SessionLocal
from ..models import ActivityLog
import json

class HealthService:
    def __init__(self):
        self.health_log_path = "system_health.log"

    def log_health(self, component, status, detail=""):
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        with open(self.health_log_path, "a") as f:
            f.write(f"[{timestamp}] {component.upper()}: {status} - {detail}\n")
    def check_database(self):
        db = SessionLocal()
        try:
            # Simple query to check connectivity
            db.execute(text("SELECT 1"))
            self.log_health("database", "ONLINE", "Connection successful")
            return True
        except Exception as e:
            self.log_health("database", "OFFLINE", str(e))
            return False
        finally:
            db.close()

    def check_ollama(self):
        try:
            response = requests.get("http://localhost:11434/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get("models", [])
                model_names = [m.get("name", m.get("model")) for m in models]
                self.log_health("ollama", "ONLINE", f"Models found: {', '.join(model_names)}")
                return True
            else:
                self.log_health("ollama", "DEGRADED", f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_health("ollama", "OFFLINE", str(e))
            return False

    def get_available_models(self):
        """Returns list of available Ollama models, empty list if service is down"""
        try:
            response = requests.get("http://localhost:11434/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get("models", [])
                return [m.get("name", m.get("model")) for m in models]
            return []
        except Exception:
            return []

    def run_full_audit(self):
        print("\n[HEALTH] Running System Audit...")
        db_ok = self.check_database()
        ai_ok = self.check_ollama()
        
        if db_ok and ai_ok:
            print("[HEALTH] ALL SYSTEMS NOMINAL ✅")
        else:
            print("[HEALTH] SYSTEM DEGRADED ⚠️ Check system_health.log")

health_service = HealthService()
