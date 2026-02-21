import os
import sys
import subprocess
import time
import socket
import shutil

def check_port(port):
    import pymysql
    try:
        # We try a real connection test, not just a socket check
        conn = pymysql.connect(host='127.0.0.1', user='root', password='', connect_timeout=2)
        conn.close()
        return True
    except:
        return False

def find_xampp():
    paths = ["C:\\xampp", "D:\\xampp", "E:\\xampp"]
    for p in paths:
        if os.path.exists(p):
            return p
    return None

def kill_mysql_tasks():
    print("[CLEAN] Force-killing any hidden MySQL or Apache tasks...")
    subprocess.run("taskkill /F /IM mysqld.exe /IM httpd.exe >nul 2>&1", shell=True)
    time.sleep(1)

def industrial_clean(xampp_path):
    print(f"[REPAIR] Performing Industrial Clean in {xampp_path}...")
    data_dir = os.path.join(xampp_path, "mysql", "data")
    
    # 1. Standard garbage files
    garbage = [
        "mysql.pid", "ib_logfile0", "ib_logfile1", 
        "aria_log_control", "mysql-bin.index", 
        "multi-master.info", "tc.log"
    ]
    
    # 2. Wildcard cleanup for logs (common corruption sources)
    if os.path.exists(data_dir):
        for f in os.listdir(data_dir):
            if f.startswith("aria_log.") or f.startswith("mysql-bin.") or f.endswith(".err") or f.startswith("ddl_"):
                garbage.append(f)
    
    for f in set(garbage):
        p = os.path.join(data_dir, f)
        if os.path.exists(p):
            try:
                os.remove(p)
                print(f"  > Removed: {f}")
            except:
                pass

def print_mysql_logs(xampp_path):
    log_file = os.path.join(xampp_path, "mysql", "data", "mysql_error.log")
    print("\n" + "-"*30)
    print("📋 LAST 15 LINES OF MYSQL ERROR LOG:")
    print("-"*30)
    if os.path.exists(log_file):
        try:
            with open(log_file, "r") as f:
                lines = f.readlines()
                for line in lines[-15:]:
                    print(f"  {line.strip()}")
        except:
            print("  [ERROR] Could not read log file.")
    else:
        print("  [INFO] No error log file found.")
    print("-"*30)

def nuclear_repair(xampp_path):
    print("\n" + "!"*60)
    print("☢️ NUCLEAR REPAIR INITIATED (Structural Restoration)")
    print("!"*60)
    
    mysql_path = os.path.join(xampp_path, "mysql")
    data_path = os.path.join(mysql_path, "data")
    backup_path = os.path.join(mysql_path, "backup")
    old_data_path = os.path.join(mysql_path, f"data_old_{int(time.time())}")

    if not os.path.exists(backup_path):
        print("[ERROR] XAMPP 'backup' folder not found. Nuclear repair impossible.")
        return False

    try:
        # 1. Stop everything first
        kill_mysql_tasks()
        
        # 2. Rename current data to data_old
        print(f"[REPAIR] Backing up corrupted data to: {os.path.basename(old_data_path)}")
        os.rename(data_path, old_data_path)
        
        # 3. Copy backup folder to new data folder
        print("[REPAIR] Creating fresh data folder from XAMPP backup...")
        shutil.copytree(backup_path, data_path)
        
        # 4. Restore database folders from data_old to data 
        # (Except system ones: mysql, performance_schema, phpmyadmin, test)
        system_db = ["mysql", "performance_schema", "phpmyadmin", "test"]
        if os.path.exists(old_data_path):
            for item in os.listdir(old_data_path):
                item_path = os.path.join(old_data_path, item)
                if os.path.isdir(item_path) and item not in system_db:
                    print(f"  > Restoring database: {item}")
                    shutil.copytree(item_path, os.path.join(data_path, item))
        
        # 5. Restore ibdata1 (The master file for InnoDB)
        ibdata_old = os.path.join(old_data_path, "ibdata1")
        if os.path.exists(ibdata_old):
            print("  > Restoring InnoDB master file (ibdata1)")
            shutil.copy2(ibdata_old, os.path.join(data_path, "ibdata1"))
            
        print("[SUCCESS] Structural repair complete. You can now try starting MySQL.")
        return True
    except Exception as e:
        print(f"[ERROR] Nuclear repair failed: {e}")
        return False

def run_recovery_pulse(xampp_path):
    """Pulse MySQL with force_recovery=6 to reset LSN"""
    my_ini_path = os.path.join(xampp_path, "mysql", "bin", "my.ini")
    mysql_bin = os.path.join(xampp_path, "mysql", "bin", "mysqld.exe")
    
    if not os.path.exists(my_ini_path): return False
    
    # 1. Back up my.ini
    bak_ini = my_ini_path + ".bak"
    shutil.copy2(my_ini_path, bak_ini)
    
    try:
        # 2. Add force_recovery to my.ini
        with open(my_ini_path, "a") as f:
            f.write("\n\n[mysqld]\ninnodb_force_recovery = 6\n")
            
        # 3. Start MySQL standalone
        print("  > Pulsing engine in recovery mode...")
        p = subprocess.Popen([mysql_bin, f"--defaults-file={my_ini_path}", "--standalone"], 
                             creationflags=subprocess.CREATE_NO_WINDOW)
        time.sleep(10)
        p.terminate()
        kill_mysql_tasks()
        
        # 4. Restore original my.ini
        shutil.move(bak_ini, my_ini_path)
        print("  > Recovery pulse complete.")
        return True
    except Exception as e:
        print(f"  > Pulse failed: {e}")
        if os.path.exists(bak_ini): shutil.move(bak_ini, my_ini_path)
        return False

def setup():
    print("\n" + "="*60)
    print("      AI EXAM ORACLE - CRITICAL REPAIR ENGINE")
    print("="*60)
    
    xampp = find_xampp()
    if not xampp:
        print("[ERROR] XAMPP not found. Please install XAMPP to proceed.")
        return False
        
    if "--nuclear" in sys.argv:
        return nuclear_repair(xampp)
        
    kill_mysql_tasks()
    
    # Pre-check port 3306
    if check_port(3306):
        print("[OK] MySQL already running correctly.")
        return True
    
    industrial_clean(xampp)
    
    # NEW: Check if the last log shows LSN in the future error
    log_file = os.path.join(xampp, "mysql", "data", "mysql_error.log")
    has_lsn_error = False
    if os.path.exists(log_file):
        try:
            with open(log_file, "r") as f:
                 last_lines = f.readlines()[-30:]
                 if any("log sequence number" in l and "is in the future" in l for l in last_lines):
                     has_lsn_error = True
        except: pass
    
    if has_lsn_error:
        print("\n[REPAIR] Detected 'LSN in the future' error. Initiating recovery pulse...")
        pulse_success = run_recovery_pulse(xampp)
        if not pulse_success:
            print("[WARNING] Recovery pulse failed. Trying standard startup anyway.")
    
    # Try to start MySQL
    print("[INFO] Attempting clean MySQL startup via 127.0.0.1...")
    mysql_bin = os.path.join(xampp, "mysql", "bin", "mysqld.exe")
    my_ini = os.path.join(xampp, "mysql", "bin", "my.ini")
    
    if not os.path.exists(mysql_bin):
        print(f"[ERROR] MySQL binary missing at {mysql_bin}")
        return False
        
    subprocess.Popen([mysql_bin, f"--defaults-file={my_ini}", "--standalone"], 
                     creationflags=subprocess.CREATE_NO_WINDOW)
    
    # Wait and verify
    print("[WAIT] Stabilizing database engine (Max 20s)...")
    success = False
    for i in range(20):
        sys.stdout.write(".")
        sys.stdout.flush()
        time.sleep(1)
        if check_port(3306):
            print("\n[SUCCESS] MySQL is online and healthy.")
            success = True
            break
    
    if not success:
        print("\n[ERROR] MySQL timed out or CRASHED.")
        print_mysql_logs(xampp)
        return False
    
    return True

if __name__ == "__main__":
    if setup():
        sys.exit(0)
    else:
        sys.exit(1)
