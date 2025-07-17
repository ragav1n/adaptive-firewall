import subprocess
import re

PF_CONF_PATH = "logs/test_pf.conf"

def is_valid_pf_rule(rule: str) -> bool:
    rule = rule.strip().lower()
    if not (rule.startswith("block") or rule.startswith("pass")):
        return False
    if any(x in rule for x in ["$", "iptables", "-j", "accept", "drop", "table", "pf add", "kernal", "`", "*"]):
        return False
    if len(rule.split()) < 4:
        return False
    return True

def normalize_rule(rule):
    rule = rule.replace("quick", "")
    if "log" not in rule:
        rule = rule.replace("block", "block log", 1)
    rule = re.sub(r"\s+", " ", rule).strip()
    return rule

def is_table_command(line):
    return re.match(r"^\s*(ADD|REMOVE)\s+\S+\s+TO\s+TABLE\s+\S+", line, re.IGNORECASE)

def parse_table_command(line):
    # Strip trailing comments
    line = line.split('#')[0].strip()

    match = re.match(r"^(ADD|REMOVE)\s+([\d\.:a-fA-F/]+)\s+TO\s+TABLE\s+(\S+)", line, re.IGNORECASE)
    if not match:
        return None
    action, ip, table = match.groups()
    return action.upper(), ip, table

def modify_table(action, ip, table):
    cmd = ["sudo", "pfctl", "-t", table, "-T" + ("add" if action == "ADD" else "delete"), ip]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"[✅] {action.title()}ed {ip} to table <{table}>")
    else:
        print(f"[❌] Failed to {action.lower()} {ip} to table <{table}>\n    Reason: {result.stderr.strip()}")

def apply_rule(rule):
    try:
        rule = normalize_rule(rule)

        with open(PF_CONF_PATH, "r") as f:
            rules = f.read()
        if rule in rules:
            print(f"[ℹ️] Rule already exists, skipping:\n    → {rule}")
            return
        if 'port any' in rule or 'port = any' in rule:
            rule = rule.replace('port any', '').replace('port = any', '').strip()

        with open(PF_CONF_PATH, "a") as f:
            f.write("\n" + rule + "\n")

        subprocess.run(["sudo", "pfctl", "-f", PF_CONF_PATH], check=True)
        print(f"[✅] Rule applied successfully:\n    → {rule}")
    except Exception as e:
        print(f"[❌] Failed to apply rule:\n    → {rule}\n    Reason: {e}")
