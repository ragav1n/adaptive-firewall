# automation/scheduler.py
import schedule
import time
import subprocess
from datetime import datetime

from report.report_generator import generate_pdf_report
from emailer.send_report import send_report

def run_full_pipeline():
    print("\n[⏱️] Running full pipeline at:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    # Step 1: Parse alerts
    subprocess.run(["python", "main.py", "alerts"])

    # Step 2: Run LLM summarizer and rulegen
    subprocess.run(["python", "main.py", "explain", "--mode=summary"])
    subprocess.run(["python", "main.py", "explain", "--mode=rulegen"])

    # Step 3: Enforce rules
    subprocess.run(["python", "main.py", "enforce"])

    # Step 4: Generate report
    generate_pdf_report()

    # Step 5: Send email
    send_report()

    print("[✅] Full pipeline run complete.")

# Run once immediately
run_full_pipeline()

# Schedule rulegen + enforce + report + email every 30 minutes
schedule.every(30).minutes.do(run_full_pipeline)

print("[🟢] Scheduler started. Waiting for next run...")
while True:
    schedule.run_pending()
    time.sleep(1)
