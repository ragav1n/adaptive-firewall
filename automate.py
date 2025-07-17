# automate.py
import schedule
import time
import subprocess
from datetime import datetime

def run_full_pipeline():
    print("\n[🟢] Running full pipeline at:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    subprocess.run(["python", "main.py", "alerts"])
    subprocess.run(["python", "main.py", "explain"])
    subprocess.run(["sudo", "python", "main.py", "enforce"])
    subprocess.run(["python", "report/report_generator.py"])

def send_email():
    print("\n[📧] Sending PDF report via email at:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    subprocess.run(["python", "report/send_email.py"])

if __name__ == "__main__":
    print("[🔄] Starting automation pipeline...\n")

    run_full_pipeline()
    send_email()

    schedule.every(10).minutes.do(run_full_pipeline)
    schedule.every(30).minutes.do(send_email)

    while True:
        schedule.run_pending()
        time.sleep(10)
