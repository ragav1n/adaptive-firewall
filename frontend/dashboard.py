# Streamlit Dashboard - adaptive-firewall/frontend/dashboard.py

import streamlit as st
import pandas as pd
import os
import json
import re
import matplotlib.pyplot as plt
from datetime import datetime
import pytz

# File Paths
LOG_DIR = "../logs"
SUMMARY_FILE = os.path.join(LOG_DIR, "summary_report.txt")
RULES_FILE = os.path.join(LOG_DIR, "rule_suggestions.txt")
ALERTS_FILE = os.path.join(LOG_DIR, "suricata_alerts.csv")

# Loaders

def load_text_sections(filepath, max_sections=10):
    if not os.path.exists(filepath):
        return ["⚠️ File not found."]
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        blocks = content.split("\n\n")  # double newline separates logical blocks

        cleaned = [block.strip() for block in blocks if block.strip()]
        return cleaned[:max_sections] if cleaned else [content.strip()]

def load_alerts(filepath):
    if not os.path.exists(filepath):
        return pd.DataFrame()
    try:
        return pd.read_csv(filepath)
    except Exception as e:
        return pd.DataFrame({"error": [str(e)]})

def parse_rule_suggestions(filepath):
    if not os.path.exists(filepath):
        return pd.DataFrame()
    with open(filepath, "r", encoding="utf-8") as f:
        raw = f.read()

    pattern = re.compile(r"ALERT:\n(.+?)---\n(ADD.+?)(?:\n+Explanation:\s*(.+?))?(?===|\Z)", re.DOTALL)
    matches = pattern.findall(raw)
    entries = []
    for alert, rule, explanation in matches:
        entry = {
            "Raw Alert": alert.strip(),
            "Rule": rule.strip(),
            "Explanation": explanation.strip() if explanation else None
        }
        for line in alert.split("\n"):
            if line.startswith("Timestamp"):
                entry["Timestamp"] = line.split(":", 1)[1].strip()
            elif line.startswith("Source IP"):
                entry["Source IP"] = line.split(":", 1)[1].strip()
            elif line.startswith("Destination IP"):
                entry["Destination IP"] = line.split(":", 1)[1].strip()
            elif line.startswith("Protocol"):
                entry["Protocol"] = line.split(":", 1)[1].strip()
            elif line.startswith("Signature"):
                entry["Signature"] = line.split(":", 1)[1].strip()
            elif line.startswith("Severity"):
                entry["Severity"] = line.split(":", 1)[1].strip()
        entries.append(entry)

    df = pd.DataFrame(entries)
    df["Timestamp"] = pd.to_datetime(df["Timestamp"], errors='coerce')
    if df["Timestamp"].dt.tz is None:
        df["Timestamp"] = df["Timestamp"].dt.tz_localize("UTC")
    df["Timestamp"] = df["Timestamp"].dt.tz_convert("Asia/Kolkata")
    return df.sort_values("Timestamp", ascending=False)

# Page Config
st.set_page_config(page_title="Adaptive Firewall Dashboard", layout="wide")

# Tabs
tab1, tab2, tab3 = st.tabs(["📋 Summary", "🧾 Rule Suggestions", "🚨 Alerts"])

# Summary Tab
with tab1:
    st.title("📋 Summary Report (LLM Generated)")
    summaries = load_text_sections(SUMMARY_FILE, max_sections=50)
    st.download_button("📥 Download Full Summary", data="\n\n".join(summaries), file_name="summary_report.txt")

    summary_entries = []
    for block in summaries:
        lines = block.split("\n")
        meta = lines[0].strip() if lines else ""
        summary_text, explanation, actions = "", "", ""
        capturing = None
        for line in lines[1:]:
            if line.startswith("Summary:"):
                capturing = "summary"
                summary_text = line.replace("Summary:", "").strip()
            elif line.startswith("Explanation:"):
                capturing = "explanation"
                explanation = line.replace("Explanation:", "").strip()
            elif line.startswith("Recommended Actions:"):
                capturing = "actions"
                actions = ""
            elif capturing == "summary":
                summary_text += " " + line.strip()
            elif capturing == "explanation":
                explanation += " " + line.strip()
            elif capturing == "actions":
                actions += line.strip() + "\n"

        ts_match = re.search(r"\[(.*?)\]", meta)
        ips_proto = meta.split("|") if "|" in meta else ["", "", ""]
        ts = ts_match.group(1) if ts_match else ""
        try:
            ts_ist = pd.to_datetime(ts).tz_localize("UTC").tz_convert("Asia/Kolkata").strftime('%Y-%m-%d %H:%M:%S')
        except:
            ts_ist = ts

        src, dst = "", ""
        ip_match = re.findall(r"(\d+\.\d+\.\d+\.\d+)", meta)
        if len(ip_match) >= 2:
            src, dst = ip_match[0], ip_match[1]
        proto = ips_proto[1].strip() if len(ips_proto) >= 2 else ""
        signature = ips_proto[2].strip().replace("(", "").replace(")", "") if len(ips_proto) >= 3 else ""

        summary_entries.append({
            "Timestamp (IST)": ts_ist,
            "Source IP": src,
            "Destination IP": dst,
            "Protocol": proto,
            "Signature": signature,
            "Summary": summary_text,
            "Explanation": explanation,
            "Recommended Actions": actions.strip()
        })

    if summary_entries:
        st.dataframe(pd.DataFrame(summary_entries), use_container_width=True)
    else:
        st.warning("No structured summaries found.")
    
# Rule Suggestions Tab
with tab2:
    st.title("🧾 Firewall Rule Suggestions")
    rules_df = parse_rule_suggestions(RULES_FILE)
    if not rules_df.empty:
        rules_df["Timestamp"] = rules_df["Timestamp"].dt.strftime('%Y-%m-%d %H:%M:%S IST')
        st.dataframe(
            rules_df[["Timestamp", "Source IP", "Destination IP", "Protocol", "Signature", "Severity", "Rule", "Explanation"]],
            use_container_width=True,
            height=600
        )
    else:
        st.warning("No rule suggestions found or improperly formatted file.")

# Alerts Tab
with tab3:
    st.title("🚨 Threat Alerts Dashboard")
    df = load_alerts(ALERTS_FILE)

    if not df.empty and "timestamp" in df.columns:
        st.metric("Total Threats", len(df))

        def extract(alert_json, key):
            try:
                data = json.loads(alert_json.replace("'", '"'))
                return data.get(key, "Unknown")
            except:
                return "Unknown"

        if "alert" in df.columns:
            df["Category"] = df["alert"].apply(lambda x: extract(x, "category"))
            df["Severity"] = df["alert"].apply(lambda x: extract(x, "severity"))

            st.subheader("📊 Alert Category Distribution")
            cat_counts = df["Category"].value_counts()
            st.bar_chart(cat_counts)

            st.subheader("🧁 Severity Breakdown")
            severity_counts = df["Severity"].value_counts()
            fig, ax = plt.subplots()
            ax.pie(severity_counts, labels=severity_counts.index, autopct='%1.1f%%', startangle=140)
            ax.axis('equal')
            st.pyplot(fig)

        show_cols = [c for c in ["timestamp", "src_ip", "dest_ip", "Category", "Severity"] if c in df.columns]
        st.subheader("📄 Alert Summary Table")
        st.dataframe(df[show_cols], use_container_width=True)
    else:
        st.warning("No alerts available or CSV improperly formatted.")
