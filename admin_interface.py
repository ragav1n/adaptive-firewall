# admin_interface.py

import json
import os
import re
from datetime import datetime
from colorama import init, Fore, Style
from llm_reasoner.llm_client import query_model

HISTORY_LOG = "logs/admin_history.json"
RULE_LOG = "logs/test_pf.conf"

# Initialize colorama
init(autoreset=True)


def init_pf_conf_if_missing():
    if not os.path.exists(RULE_LOG):
        with open(RULE_LOG, "w") as f:
            f.write("table <suspicious_ips> persist\n")
            f.write("block in quick from <suspicious_ips>\n\n")
            f.write("# Rules below are generated from admin_interface.py\n\n")


def write_rule_to_conf(rule: str) -> bool:
    try:
        with open(RULE_LOG, "a") as f:
            f.write(rule.strip() + "\n")
        return True
    except Exception as e:
        print(Fore.RED + f"[❌] Failed to write rule: {e}")
        return False


def run_once(user_input: str) -> dict:
    print(Fore.YELLOW + "[*] Interpreting admin instruction with LLM...")

    try:
        llm_response = query_model(
            user_input,
            model="llama3:8b",
            system_prompt=(
                "You are a strict PF firewall assistant. Given a firewall instruction in natural language, "
                "convert it into a list of valid PF firewall rules. Only use the following formats:\n"
                "- ADD <IP> TO TABLE suspicious_ips\n"
                "- REMOVE <IP> FROM TABLE suspicious_ips\n"
                "- block in quick on en0 proto tcp from <IP> to any port <PORT>\n"
                "- block in quick on en0 proto udp from <IP> to any port <PORT>\n"
                "- pass in quick on en0 proto tcp from any to any port <PORT>\n"
                "Do not use invalid syntax like 'all', 'except', or undefined tables. Output only valid rules. Do not explain.\n"
                "Examples:\n"
                "→ ADD 192.168.1.25 TO TABLE suspicious_ips\n"
                "→ block in quick on en0 proto tcp from 203.0.113.7 to any port 22\n"
                "→ pass in quick on en0 proto tcp from any to any port 443"
            )
        )
    except Exception as e:
        return {
            "status": "llm-error",
            "error": str(e)
        }

    print(Fore.CYAN + "[🧾] Raw LLM Response:\n" + Style.RESET_ALL, llm_response)

    all_lines = [re.sub(r"^[^a-zA-Z0-9]+", "", line).strip() for line in llm_response.strip().splitlines() if line.strip()]

    parsed_rules = []
    explanation_lines = []
    for line in all_lines:
        if (
            line.upper().startswith("ADD ") or
            line.upper().startswith("REMOVE ") or
            line.lower().startswith("block") or
            line.lower().startswith("pass")
        ):
            parsed_rules.append(line)
        else:
            explanation_lines.append(line)

    print(Fore.CYAN + "[🧠] Parsed PF Commands:")
    for line in parsed_rules:
        print(Fore.CYAN + f"  → {line}")

    actions_applied = []
    for rule in parsed_rules:
        if write_rule_to_conf(rule):
            actions_applied.append(rule)

    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "user_command": user_input,
        "llm_explanation": " ".join(explanation_lines),
        "llm_output": parsed_rules,
        "actions_applied": actions_applied,
        "status": "success" if actions_applied else "no-valid-actions"
    }

    os.makedirs("logs", exist_ok=True)
    with open(HISTORY_LOG, "a") as f:
        f.write(json.dumps(log_entry) + "\n")

    return log_entry


def prompt():
    print(Fore.MAGENTA + "[🛡️] Adaptive Firewall Admin Interface (Type 'exit' to quit)\n")
    init_pf_conf_if_missing()
    while True:
        user_input = input(Fore.LIGHTWHITE_EX + "admin> ").strip()
        if user_input.lower() in ["exit", "quit"]:
            break
        result = run_once(user_input)
        status = result.get("status")
        if status == "llm-error":
            print(Fore.RED + f"[❌] LLM Error: {result.get('error')}")
        elif not result.get("actions_applied"):
            print(Fore.YELLOW + "[⚠️] No rules were written.")
        else:
            print(Fore.GREEN + "[✅] Rule(s) written to test_pf.conf:")
            for action in result["actions_applied"]:
                print(Fore.GREEN + f"  → {action}")


if __name__ == "__main__":
    prompt()
