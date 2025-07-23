# Step 4: Add POST endpoints to control the firewall

from fastapi import APIRouter, Request
from pydantic import BaseModel
import os
import json
import subprocess

router = APIRouter()

class AdminCommand(BaseModel):
    instruction: str

@router.post("/admin")
def handle_admin_command(cmd: AdminCommand):
    instruction = cmd.instruction.strip()
    print(f"[🛡️] Admin Command Received: {instruction}")

    # Log to admin_actions.txt
    os.makedirs("../logs", exist_ok=True)
    with open("../logs/admin_actions.txt", "a") as f:
        f.write(instruction + "\n")
    print("[📝] Logged to ../logs/admin_actions.txt")

    # Call admin_interface.py logic
    try:
        print(f"[⚙️] Invoking admin_interface.py with: {instruction}")
        result = subprocess.check_output([
            "sudo", "python3", "../admin_interface.py", "prompt", instruction
        ], stderr=subprocess.STDOUT).decode()
        return {"status": "success", "output": result}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "output": e.output.decode()}

@router.post("/trigger-pipeline")
def run_pipeline():
    try:
        print("[🚀] Triggering full automation pipeline...")
        subprocess.Popen(["python3", "../automation/scheduler.py"])  # runs in background
        return {"status": "started"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@router.get("/alerts")
def get_alerts():
    from utils.file_loader import load_csv
    return load_csv("../logs/suricata_alerts.csv")

@router.get("/summaries")
def get_summaries():
    from utils.file_loader import load_text
    return load_text("../logs/summary_report.txt")

@router.get("/rules")
def get_rules():
    from utils.file_loader import load_text
    return load_text("../logs/rule_suggestions.txt")

@router.get("/history")
def get_history():
    from utils.file_loader import load_json_lines
    return load_json_lines("../logs/admin_history.json")
