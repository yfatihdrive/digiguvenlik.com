# -*- coding: utf-8 -*-
"""Hata veya taslak bildirimlerini e-posta ve yerel log üzerinden iletir."""

import smtplib
from datetime import datetime, timezone
from email.message import EmailMessage
import config

def send_alert(subject: str, body: str) -> bool:
    """SMTP tanımlıysa e-posta gönderir; her durumda yerel uyarı loguna yazar."""
    config.LOGS_DIR.mkdir(parents=True, exist_ok=True)
    log_file = config.LOGS_DIR / "alerts.log"
    ts = datetime.now(timezone.utc).isoformat()
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(f"[{ts}] {subject}\n{body}\n{'-' * 60}\n")

    if not (config.SMTP_HOST and config.SMTP_USER and config.SMTP_PASS and config.NOTIFY_EMAIL):
        return False

    try:
        msg = EmailMessage()
        msg["Subject"] = f"[Digi Güvenlik Blog Otomasyon] {subject}"
        msg["From"] = config.SMTP_USER
        msg["To"] = config.NOTIFY_EMAIL
        msg.set_content(body)

        with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT, timeout=15) as server:
            server.starttls()
            server.login(config.SMTP_USER, config.SMTP_PASS)
            server.send_message(msg)
        return True
    except Exception as exc:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"[{ts}] SMTP Gönderim Hatası: {type(exc).__name__}\n")
        return False
