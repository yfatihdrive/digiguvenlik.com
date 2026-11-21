import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { Order, SiteSettings } from "./types";
import { formatPrice } from "./db";
import { escapeHtml } from "./text";

export function buildOrderEmailHtml(order: Order, settings: SiteSettings): string {
  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; color: #222;">
          ${escapeHtml(item.name)}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; color: #555;">
          ${item.quantity} Adet
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 700; color: #FF6000;">
          ${formatPrice(item.price * item.quantity)} ₺
        </td>
      </tr>`
    )
    .join("");

  const cleanPhone = order.customerPhone.replace(/\D/g, "");
  const waPhone = cleanPhone.startsWith("0")
    ? "9" + cleanPhone
    : cleanPhone.startsWith("90")
    ? cleanPhone
    : "90" + cleanPhone;

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <title>Yeni Sipariş Bildirimi - ${escapeHtml(order.id)}</title>
</head>
<body style="margin:0; padding:24px; background-color:#f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
    <div style="background: linear-gradient(135deg, #FF6000 0%, #e55500 100%); padding: 24px; color: #ffffff;">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; font-weight: 700;">
        ${escapeHtml(settings.siteName)} • YENİ SİPARİŞ BİLDİRİMİ
      </div>
      <h1 style="margin: 6px 0 0; font-size: 24px; font-weight: 800;">
        Sipariş No: #${escapeHtml(order.id)}
      </h1>
      <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.95;">
        Tarih: ${new Date(order.createdAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })} • Kaynak: ${
    order.orderType === "quick_order" ? "Hızlı Sipariş Formu" : "Sepet Siparişi"
  }
      </p>
    </div>

    <div style="padding: 24px;">
      <h2 style="margin: 0 0 12px; font-size: 16px; color: #111827; border-bottom: 2px solid #FF6000; padding-bottom: 6px;">
        Müşteri ve Teslimat Bilgileri
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; width: 140px;">Ad Soyad:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #111827;">${escapeHtml(order.customerFirstName)} ${escapeHtml(order.customerLastName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Telefon:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #111827;">
            <a href="tel:${escapeHtml(cleanPhone)}" style="color: #FF6000; text-decoration: none;">${escapeHtml(order.customerPhone)}</a>
            &nbsp;|&nbsp;
            <a href="https://wa.me/${waPhone}" style="color: #16a34a; text-decoration: none; font-weight: 700;">WhatsApp ile Yaz</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">İl / İlçe:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #111827;">${escapeHtml(order.customerCity)} / ${escapeHtml(order.customerDistrict)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Açık Adres:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #111827;">${escapeHtml(order.customerAddress)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Ödeme Yöntemi:</td>
          <td style="padding: 8px 0;">
            <span style="background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; padding: 4px 10px; border-radius: 6px; font-weight: 700;">
              ${escapeHtml(order.paymentMethod)}
            </span>
          </td>
        </tr>
        ${
          order.notes
            ? `<tr>
          <td style="padding: 8px 0; color: #6b7280;">Sipariş Notu:</td>
          <td style="padding: 8px 0; color: #b91c1c; font-weight: 600;">${escapeHtml(order.notes)}</td>
        </tr>`
            : ""
        }
      </table>

      <h2 style="margin: 0 0 12px; font-size: 16px; color: #111827; border-bottom: 2px solid #FF6000; padding-bottom: 6px;">
        Sipariş Edilen Ürünler
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 10px 12px; text-align: left; color: #4b5563;">Ürün</th>
            <th style="padding: 10px 12px; text-align: center; color: #4b5563;">Adet</th>
            <th style="padding: 10px 12px; text-align: right; color: #4b5563;">Tutar</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div style="background: #f9fafb; border-radius: 8px; padding: 16px; font-size: 14px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #6b7280;">Ara Toplam:</span>
          <strong style="color: #111827;">${formatPrice(order.subtotal)} ₺</strong>
        </div>
        ${
          order.couponDiscount > 0
            ? `<div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #16a34a;">
          <span>Kupon İndirimi (${escapeHtml(order.couponCode)}):</span>
          <strong>-${formatPrice(order.couponDiscount)} ₺</strong>
        </div>`
            : ""
        }
        ${
          order.havaleDiscount > 0
            ? `<div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #16a34a;">
          <span>Havale / EFT İndirimi (%${settings.havaleDiscountRate}):</span>
          <strong>-${formatPrice(order.havaleDiscount)} ₺</strong>
        </div>`
            : ""
        }
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #16a34a;">
          <span>Kargo:</span>
          <strong>ÜCRETSİZ KARGO</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 18px;">
          <strong style="color: #111827;">Ödenecek Toplam:</strong>
          <strong style="color: #FF6000;">${formatPrice(order.totalAmount)} ₺</strong>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function sendOrderEmail(
  order: Order,
  settings: SiteSettings
): Promise<{ sent: boolean; html: string; error?: string }> {
  const html = buildOrderEmailHtml(order, settings);

  // Always save a copy to data/mail-logs so admin can inspect every order email even without live SMTP
  try {
    const logDir = path.join(process.cwd(), "data", "mail-logs");
    fs.mkdirSync(logDir, { recursive: true });
    fs.writeFileSync(path.join(logDir, `${order.id}.html`), html, "utf-8");
  } catch (e) {
    console.error("Failed saving mail log:", e);
  }

  const smtpHost = process.env.SMTP_HOST || settings.smtp?.host;
  const smtpPort = Number(process.env.SMTP_PORT || settings.smtp?.port || 587);
  const smtpUser = process.env.SMTP_USER || settings.smtp?.user;
  const smtpPass = process.env.SMTP_PASS || settings.smtp?.pass;
  const targetEmail =
    process.env.ORDER_NOTIFICATION_EMAIL ||
    settings.notificationEmail ||
    settings.email;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return {
      sent: false,
      html,
      error: "SMTP kullanıcı/şifre bilgisi henüz girilmedi (Sipariş Admin Paneline ve Mail Kayıtlarına eklendi).",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465 || Boolean(settings.smtp?.secure),
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const recipients = [targetEmail];
    if (order.customerEmail && order.customerEmail.includes("@")) {
      recipients.push(order.customerEmail);
    }

    await transporter.sendMail({
      from: settings.smtp?.from || `"${settings.siteName} Sipariş" <${smtpUser}>`,
      to: recipients.join(", "),
      subject: `Yeni Sipariş #${order.id} - ${order.customerFirstName} ${order.customerLastName} (${formatPrice(
        order.totalAmount
      )} ₺)`,
      html,
    });

    return { sent: true, html };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("SMTP sendMail error:", message);
    return { sent: false, html, error: message };
  }
}
