import csv
import os
from datetime import datetime

def save_flows_to_csv(flow_data, out_file="flow_log.csv"):
    os.makedirs("logs", exist_ok=True)
    full_path = os.path.join("logs", out_file)

    with open(full_path, mode="w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["flow_id", "timestamp", "length", "flags"])

        for flow_id, packets in flow_data.items():
            for pkt in packets:
                writer.writerow([
                    flow_id,
                    pkt.get("timestamp", ""),
                    pkt.get("length", ""),
                    pkt.get("flags", ""),
                ])

    print(f"[+] All flows saved to: {full_path}")

def save_anomalies_to_csv(anomalies, out_file="alerts.csv"):
    os.makedirs("logs", exist_ok=True)
    full_path = os.path.join("logs", out_file)

    with open(full_path, mode="w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["flow_id", "reason", "timestamp"])

        for flow_id, reason in anomalies:
            writer.writerow([flow_id, reason, datetime.now().isoformat()])

    print(f"[!] Anomalies saved to: {full_path}")
