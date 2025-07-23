# Step 4: Add POST endpoints to control the firewall

from fastapi import APIRouter
from pydantic import BaseModel
import os
import subprocess
from admin_interface import run_once
import sys

router = APIRouter()

class AdminCommand(BaseModel):
    instruction: str

@router.post("/admin")
def handle_admin_command(cmd: AdminCommand):
    instruction = cmd.instruction.strip()
    print(f"[🛡️] Admin Command Received: {instruction}")

    # Log the instruction to admin_actions.txt
    os.makedirs("../logs", exist_ok=True)
    with open("../logs/admin_actions.txt", "a") as f:
        f.write(instruction + "\n")
    print("[📝] Logged to ../logs/admin_actions.txt")

    # Call the admin interface logic directly (no subprocess!)
    try:
        from admin_interface import run_once  # ✅ Make sure this is imported from refactored module
        result = run_once(instruction)
        return {"status": result["status"], **result}
    except Exception as e:
        print("[❌] Admin logic failed:", e)
        return {"status": "error", "detail": str(e)}


@router.post("/trigger-pipeline")
def run_pipeline():
    try:
        print("[⏳] Triggering full automation pipeline...")
        subprocess.Popen([sys.executable, "../automation/scheduler.py"])  # runs in background
        return {"status": "started"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}
