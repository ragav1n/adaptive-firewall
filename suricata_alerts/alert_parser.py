import json
import os
import csv
from datetime import datetime

DEFAULT_EVE_PATH = "/usr/local/var/log/suricata/eve.json"

def parse_suricata_alerts(eve_path=DEFAULT_EVE_PATH, out_csv="suricata_alerts.csv"):
    if not os.path.exists(eve_path):
        print(f"[!] Suricata eve.json not found at: {eve_path}")
        return []

    alerts = []
    total_lines = 0
    alert_lines = 0
    skipped_lines = 0

    with open(eve_path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            total_lines += 1
            try:
                event = json.loads(line)
                if event.get("event_type") == "alert":
                    alert_lines += 1
                    alerts.append({
                        "timestamp": event.get("timestamp", ""),
                        "src_ip": event.get("src_ip", ""),
                        "dest_ip": event.get("dest_ip", ""),
                        "proto": event.get("proto", ""),
                        "signature": event["alert"]["signature"],
                        "severity": event["alert"]["severity"],
                    })
            except json.JSONDecodeError:
                skipped_lines += 1

    if alerts:
        os.makedirs("logs", exist_ok=True)
        csv_path = os.path.join("logs", out_csv)
        with open(csv_path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=alerts[0].keys())
            writer.writeheader()
            writer.writerows(alerts)

    print(f"[+] Total lines read: {total_lines}")
    print(f"[+] Alerts parsed:    {len(alerts)} / {alert_lines} potential alert lines")
    print(f"[!] Malformed lines skipped: {skipped_lines}")
    print(f"[+] Alerts saved to: logs/{out_csv}")

    return alerts
