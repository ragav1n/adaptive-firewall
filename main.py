# main.py
import fire

class AdaptiveFirewall:
    def sniff(self):
        print("[*] Capturing traffic...")
        from flow_sniffer.flow_sniffer import capture_live
        flow_data = capture_live(timeout=30)
        print("[+] Flow capture complete.")

    def detect(self):
        print("[*] Running anomaly detection...")
        from flow_sniffer.flow_sniffer import capture_live
        from anomaly_detection.detector import analyze_flows
        from flow_sniffer.flow_logger import save_flows_to_csv, save_anomalies_to_csv

        flow_data = capture_live(timeout=30)
        save_flows_to_csv(flow_data)

        anomalies = analyze_flows(flow_data)

        if anomalies:
            print(f"[!] {len(anomalies)} suspicious flows detected:")
            for fid, reason in anomalies:
                print(f" -> {fid}: {reason}")
            save_anomalies_to_csv(anomalies)
        else:
            print("[+] No anomalies detected.")

    def alerts(self):
        print("[*] Parsing Suricata alerts...")
        from suricata_alerts.alert_parser import parse_suricata_alerts
        alerts = parse_suricata_alerts()
        if not alerts:
            print("[+] No alerts found.")

    def explain(self, model="mistral", mode="summary"):
        print(f"[*] Using model: {model} | Mode: {mode}")
        from llm_reasoner.reasoner import load_alerts, summarize_alerts

        alerts = load_alerts("logs/suricata_alerts.csv")
        if not alerts:
            print("[!] No alerts to summarize.")
            return

        summarize_alerts(alerts, model=model, mode=mode)

    def enforce(self, file="logs/rule_suggestions.txt"):
        print("[*] Enforcing firewall rules from LLM output...")
        from rule_engine.pf_rule_enforcer import apply_rule, is_valid_pf_rule, is_table_command, parse_table_command, modify_table

        try:
            with open(file, "r") as f:
                lines = f.readlines()

            for line in lines:
                rule = line.strip()

                if is_table_command(rule):
                    parsed = parse_table_command(rule)
                    if parsed:
                        action, ip, table = parsed
                        modify_table(action, ip, table)
                    else:
                        print(f"[❌] Invalid table command format:\n    → {rule}")
                elif is_valid_pf_rule(rule):
                    apply_rule(rule)

        except FileNotFoundError:
            print(f"[!] File not found: {file}")


    def clean_logs(self):
        import os
        for f in ["logs/summary_report.txt", "logs/rule_suggestions.txt"]:
            if os.path.exists(f):
                open(f, "w").close()
        print("[+] Cleared previous logs.")


if __name__ == "__main__":
    fire.Fire(AdaptiveFirewall)
