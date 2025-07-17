# report/report_generator.py
import os
import csv
import subprocess
from fpdf import FPDF
from datetime import datetime


def get_suspicious_ips(table_file="logs/suspicious_ips.txt"):
    try:
        os.makedirs("logs", exist_ok=True)
        with open(table_file, "w") as f:
            subprocess.run(["sudo", "pfctl", "-t", "suspicious_ips", "-Tshow"], stdout=f, check=True)
        with open(table_file, "r") as f:
            return [line.strip() for line in f if line.strip()]
    except Exception as e:
        print(f"[!] Failed to fetch suspicious IPs: {e}")
        return []


def clean_text(text):
    return text.encode("ascii", "ignore").decode("ascii")


def generate_pdf(summary_file="logs/summary_report.txt",
                 out_pdf="logs/firewall_report.pdf"):

    print("[*] Checking input files...")
    if not (os.path.exists(summary_file)):
        print("[!] Missing summary report. PDF not generated.")
        return

    print("[+] All input files found. Generating PDF report...")

    suspicious_ips = get_suspicious_ips()
    if not suspicious_ips:
        print("[!] No suspicious IPs found. Skipping report.")
        return

    with open(summary_file, "r") as f:
        summaries = f.read().strip().split("\n\n")

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Helvetica", size=12)

    pdf.set_font("Helvetica", style="B", size=16)
    pdf.cell(0, 10, "Adaptive Firewall Summary Report", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(5)
    pdf.set_font("Helvetica", size=12)
    pdf.cell(0, 10, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)

    pdf.set_font("Helvetica", style="B", size=14)
    pdf.cell(0, 10, "Blocked Suspicious IPs and Reasoning", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    pdf.set_font("Helvetica", size=11)

    for i, ip in enumerate(suspicious_ips):
        pdf.set_font("Helvetica", style="B", size=12)
        pdf.cell(0, 8, f"Suspicious IP: {ip}", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", size=11)
        if i < len(summaries):
            pdf.multi_cell(0, 7, clean_text(summaries[i]))
        else:
            pdf.multi_cell(0, 7, "No explanation found for this IP.")
        pdf.ln(3)

    pdf.output(out_pdf)
    print(f"[📄] PDF report generated: {out_pdf}")


if __name__ == "__main__":
    generate_pdf()
