import fire
import json
import os
from datetime import datetime
from llm_reasoner.llm_client import query_model
from rule_engine.pf_rule_enforcer import apply_rule, is_valid_pf_rule, is_table_command, parse_table_command, modify_table

HISTORY_LOG = "logs/admin_history.json"

def prompt():
    print("[🛡️] Adaptive Firewall Admin Interface (Type 'exit' to quit)\n")

    while True:
        user_input = input("admin> ").strip()
        if user_input.lower() in ["exit", "quit"]:
            break

        print("[*] Interpreting admin instruction with LLM...")

        try:
            llm_response = query_model(
                user_input,
                model="llama3:8b",
                system_prompt="You are a PF firewall assistant. Convert admin instructions into a list of valid PF table commands like 'ADD <IP> TO TABLE suspicious_ips'. Only include commands that are valid for pfctl or pf tables."
            )
        except Exception as e:
            print(f"[❌] LLM query failed: {e}")
            continue

        print("[🧠] LLM Output:")
        lines = [line.strip("- ").strip() for line in llm_response.strip().splitlines() if line.strip()]
        for line in lines:
            print(line)

        actions_applied = []
        for rule in lines:
            if is_table_command(rule):
                parsed = parse_table_command(rule)
                if parsed:
                    action, ip, table = parsed
                    success = modify_table(action, ip, table)
                    if success:
                        actions_applied.append(rule)
            elif is_valid_pf_rule(rule):
                success = apply_rule(rule)
                if success:
                    actions_applied.append(rule)
                    print("\n")
            
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "user_command": user_input,
            "llm_output": lines,
            "actions_applied": actions_applied,
            "status": "success" if actions_applied else "no-valid-actions"
        }

        os.makedirs("logs", exist_ok=True)
        with open(HISTORY_LOG, "a") as f:
            f.write(json.dumps(log_entry) + "\n")

if __name__ == "__main__":
    fire.Fire({"prompt": prompt})
