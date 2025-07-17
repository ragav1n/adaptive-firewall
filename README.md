# 🛡️ AI-Powered Adaptive Firewall

This project implements a fully autonomous, intelligent, and explainable firewall system using Suricata, local LLMs, PF tables (on macOS) for real-time threat detection, rule enforcement, reporting, and natural language control.

---

## 📂 Project Structure

```
new-adaptive-firewall/
├── anomaly_detection/
│   ├── detector.py
│   └── model.py
├── automation/
│   └── scheduler.py
├── flow_sniffer/
│   ├── flow_logger.py
│   ├── flow_sniffer.py
│   └── flow_utils.py
├── llm_reasoner/
│   ├── llm_client.py
│   ├── prompt_templates.py
│   └── reasoner.py
├── logs/
│   ├── admin_actions.txt
│   ├── admin_history.json
│   ├── firewall_report.pdf
│   ├── flow_log.csv
│   ├── rule_suggestions.txt
│   ├── summary_report.txt
│   ├── suricata_alerts.csv
│   ├── suspicious_ips.txt
│   └── test_pf.conf
├── nl_interface/
│   └── admin_interface.py
├── report/
│   ├── report_generator.py
│   └── send_email.py
├── rule_engine/
│   └── pf_rule_enforcer.py
├── suricata_alerts/
│   └── alert_parser.py
├── main.py
└── automate.py
```

---

## ✅ Features

- 🔎 **Suricata Alert Parsing**: Parses `eve.json` into structured CSV alerts.
- 🧠 **LLM Reasoning (via Ollama)**: Summarizes alerts and suggests PF table-based actions.
- ⛔ **Firewall Rule Enforcement**: Applies `ADD/REMOVE IP TO/FROM TABLE` commands safely.
- 📄 **PDF Reporting**: Generates clean summary of alert insights and active blocks.
- 📧 **Email Reports**: Sends firewall report PDF to configured email every 30 mins.
- 🧑‍💻 **Admin Interface**: Natural language to firewall control via LLM interpretation.
- 📜 **History Logging**: All admin actions and LLM decisions are tracked in JSONL.
- 🔁 **Automation**: Complete pipeline runs every 10 mins, sends email every 30.

---

## 🛠️ Usage

### Parse Alerts
```bash
python main.py alerts
```

---

### Generate Summaries and Rules
```bash
python main.py explain
```

---

### Enforce Firewall Rules
```bash
sudo python main.py enforce
```

---

### Generate PDF Report
```bash
python report/report_generator.py
```

---

### Send Email Report
```bash
python report/send_email.py
```
---

### 🔧 Running the Pipeline

```bash
source venv/bin/activate
sudo python automate.py
```

- Every 10 mins: Parses Suricata → Summarizes with LLM → Applies table rules
- Every 30 mins: Generates & emails PDF report

---

### 📥 Admin Interface (NL Commanding)

```bash
python admin_interface.py prompt
```

Sample inputs:
- `Block all SSH except 192.168.1.10`
- `Allow DNS only to 8.8.8.8`

---

## 📧 .env File (Email Config)

```env
ALERT_EMAIL_HOST=smtp.gmail.com
ALERT_EMAIL_PORT=587
ALERT_EMAIL_FROM=your_email@gmail.com
ALERT_EMAIL_PASS=your_app_password
ALERT_EMAIL_TO=recipient@gmail.com
```

---

## 📁 Logs and Outputs

- `logs/suricata_alerts.csv`: Parsed Suricata alerts
- `logs/summary_report.txt`: LLM alert explanations
- `logs/rule_suggestions.txt`: PF table commands
- `logs/firewall_report.pdf`: Final compiled report
- `logs/admin_history.jsonl`: Admin actions and LLM reasoning history
- `logs/test_pf.conf`: Contains PF table rule references

---


## 📑 PDF Report Contains

- Summary of suspicious activity
- LLM explanations for rule decisions
- Suspicious IPs + timestamps (from table)

---

## 🧠 LLM Prompts

See `prompt_templates.py` for tuned prompts for:
- Alert summarization
- PF table action generation
- Admin interface instruction parsing

---

## 🔐 Security Notes

- Uses PF tables: safer and faster rule management
- Email uses Gmail App Passwords
- Logs are stored locally, not sent to cloud

---

## 📌 Dependencies

- `fpdf2`, `schedule`, `fire`, `dotenv`, `scapy`, `ollama` (for local LLMs)
- Suricata IDS
- PF (macOS Packet Filter)

## 👨‍💻 Authors

Built by Ragav