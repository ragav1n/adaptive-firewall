# llm_reasoner/prompt_templates.py

def summary_prompt(alert):
    return f"""
[{alert['timestamp']}] {alert['src_ip']} → {alert['dest_ip']} | {alert['proto']} | {alert['signature']} (Severity: {alert['severity']})

Summarize this network alert and explain the potential impact in simple terms. Also recommend any actions the administrator should take.
"""

def rulegen_prompt(alert):
    return f"""
[{alert['timestamp']}] {alert['src_ip']} → {alert['dest_ip']} | {alert['proto']} | {alert['signature']} (Severity: {alert['severity']})

Generate a PF table-based firewall rule to mitigate the threat.
Respond with only:
→ ADD <IP> TO TABLE suspicious_ips
→ REMOVE <IP> FROM TABLE suspicious_ips
Only suggest blocking known malicious source or destination IPs.
"""

def admin_command_prompt(instruction):
    return f"""
You are a firewall command translator. Convert the following natural language instruction into an appropriate PF firewall command.

Respond only with the command in this format (do not add comments or explanation):
- ADD <IP> TO TABLE suspicious_ips
- REMOVE <IP> FROM TABLE suspicious_ips
- block in quick on en0 proto tcp from any to any port 22
- pass out quick on en0 proto udp from any to 8.8.8.8 port 53

Instruction:
{instruction}
"""