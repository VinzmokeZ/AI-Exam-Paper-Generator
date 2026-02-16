import requests
import time
import os
from datetime import datetime
import sys

API_URL = "http://localhost:8000/api/logs/monitor"

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def monitor():
    print("Starting User Activity Monitor...")
    print("Press Ctrl+C to stop.")
    
    last_log_id = 0
    
    try:
        while True:
            try:
                response = requests.get(f"{API_URL}?limit=10")
                if response.status_code == 200:
                    logs = response.json()
                    # simplistic display, just show latest 10
                    clear_screen()
                    print(f"--- User Activity Monitor [{datetime.now().strftime('%H:%M:%S')}] ---")
                    print(f"{'TIMESTAMP':<20} | {'ACTION':<20} | {'DETAILS'}")
                    print("-" * 60)
                    
                    for log in logs:
                        dt = datetime.fromisoformat(log['timestamp'])
                        time_str = dt.strftime('%H:%M:%S')
                        action = log['action'][:20]
                        details = str(log['details'])[:50]
                        print(f"{time_str:<20} | {action:<20} | {details}")
                else:
                    print(f"Error fetching logs: {response.status_code}")
            except requests.exceptions.ConnectionError:
                 clear_screen()
                 print("Waiting for server...")

            time.sleep(2)
    except KeyboardInterrupt:
        print("\nMonitor stopped.")

if __name__ == "__main__":
    monitor()
