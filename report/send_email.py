import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
from pathlib import Path

# Get the absolute path to the project root
dotenv_path = Path(__file__).resolve().parent.parent / '.env'
print("[DEBUG] .env loaded?")
print("ALERT_EMAIL_FROM =", os.getenv("ALERT_EMAIL_FROM"))
load_dotenv(dotenv_path=dotenv_path)

def send_email_with_pdf(
    subject="AI Firewall Report",
    body="Attached is the latest firewall activity report.",
    to_email=None,
    attachment_path="logs/firewall_report.pdf"
):
    # Load config from environment
    EMAIL_HOST = os.getenv("ALERT_EMAIL_HOST", "smtp.gmail.com")
    EMAIL_PORT = int(os.getenv("ALERT_EMAIL_PORT", 465))
    EMAIL_ADDRESS = os.getenv("ALERT_EMAIL_FROM")
    EMAIL_PASSWORD = os.getenv("ALERT_EMAIL_PASS")
    TO_EMAIL = to_email or os.getenv("ALERT_EMAIL_TO")

    # Debug print to verify .env values
    print(f"[DEBUG] Sending from: {EMAIL_ADDRESS} to: {TO_EMAIL}")
    print(f"[DEBUG] Using password: {EMAIL_PASSWORD[:4]}******")

    if not all([EMAIL_HOST, EMAIL_PORT, EMAIL_ADDRESS, EMAIL_PASSWORD, TO_EMAIL]):
        print("[❌] Email credentials or configuration missing in .env")
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = TO_EMAIL
    msg.set_content(body)

    try:
        with open(attachment_path, "rb") as f:
            file_data = f.read()
            file_name = os.path.basename(attachment_path)
            msg.add_attachment(file_data, maintype="application", subtype="pdf", filename=file_name)

        print(f"[🔐] Connecting to {EMAIL_HOST}:{EMAIL_PORT} as {EMAIL_ADDRESS}")

        with smtplib.SMTP_SSL(EMAIL_HOST, EMAIL_PORT) as smtp:
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)

        print(f"[📤] Report emailed successfully to {TO_EMAIL}")

    except FileNotFoundError:
        print(f"[❌] Attachment file not found: {attachment_path}")
    except smtplib.SMTPAuthenticationError:
        print("[❌] Authentication failed. Check email and app password.")
    except Exception as e:
        print(f"[❌] Failed to send email: {e}")

if __name__ == "__main__":
    send_email_with_pdf()
