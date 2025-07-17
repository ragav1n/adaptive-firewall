# llm_reasoner/reasoner.py

import csv
import subprocess
from .prompt_templates import summary_prompt, rulegen_prompt

def load_alerts(csv_path):
    alerts = []
    with open(csv_path, newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            alerts.append(row)
    return alerts

def call_ollama(model, prompt):
    try:
        result = subprocess.run(
            ["ollama", "run", model],
            input=prompt.encode(),
            capture_output=True,
            timeout=60
        )
        return result.stdout.decode()
    except Exception as e:
        return f"[!] Error calling {model}: {e}"

# llm_reasoner/reasoner.py

def summarize_alerts(alerts, model="mistral", mode="summary"):
    report_lines = []

    for alert in alerts:
        if mode == "summary":
            prompt = summary_prompt(alert)
            out_file = "logs/summary_report.txt"
        else:
            prompt = rulegen_prompt(alert)
            out_file = "logs/rule_suggestions.txt"

        output = call_ollama(model, prompt)

        report_lines.append("===")
        report_lines.append(prompt.strip())
        report_lines.append("---")
        report_lines.append(output.strip())
        report_lines.append("")

        # Append immediately after each prompt+output
        with open(out_file, "a") as f:
            f.write("\n".join(report_lines) + "\n")
        report_lines.clear()

    print(f"[+] {mode.title()} complete. Output appended to {out_file}")
