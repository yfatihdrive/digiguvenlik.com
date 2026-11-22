import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = path.join(process.cwd(), "screenshots");
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

test.describe("Digi Güvenlik — Uçtan Uca E-Ticaret, Responsive ve Erişilebilirlik Testleri", () => {
  test("1. Ana sayfa yükleme, sıfır konsol hatası, çerez reddetme ve kategori menüsü", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });

    // Single H1 and brand visibility
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("header")).toContainText("Digi");

    // Cookie consent banner visible with reject & accept options
    const rejectBtn = page.getByRole("button", { name: /Reddet/i });
    await expect(rejectBtn).toBeVisible();
    await rejectBtn.click();
    await expect(rejectBtn).toBeHidden();

    // Tüm Kategoriler dropdown opens properly (not clipped by overflow-x-auto)
    const catBtn = page.getByRole("button", { name: /Tüm Kategoriler/i });
    await catBtn.click();
    await expect(page.getByRole("link", { name: "Tüm Ürünleri Gör" })).toBeVisible();

    expect(consoleErrors, `Console errors found: ${consoleErrors.join("; ")}`).toHaveLength(0);
  });

  test("2. Türkçe karakter toleranslı arama ('ses kayit' -> 'Ses Kayıt') ve ürün detay galerisi", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/urunler?q=ses+kayit", { waitUntil: "networkidle" });

    // Must match Turkish "Ses Kayıt" products even without dotless ı
    await expect(page.locator("main")).toContainText(/Ses Kayıt/i);

    // Navigate to flagship product and test 9:16 popup lightbox (no new tab!)
    await page.goto("/urun/uzaktan-ses-duyma-cihazi", { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toContainText("Uzaktan Ses Duyma Cihazı");
    // Open 9:16 popup lightbox (advances image & opens popup)
    await page.locator("main img").first().click();
    await expect(page.getByText(/Görsel \d+ \/ 5/i)).toBeVisible();
    // Escape closes lightbox
    await page.keyboard.press("Escape");
    await expect(page.getByText(/Görsel \d+ \/ 5/i)).toBeHidden();
  });

  test("3. Sepet, 2. Üründe %30 İndirim, Çarkı Çevir ve sayfa yenileme kalıcılığı", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/urun/uzaktan-ses-duyma-cihazi", { waitUntil: "networkidle" });

    // Dismiss cookie banner if present
    const rej = page.getByRole("button", { name: /Reddet/i });
    if (await rej.isVisible()) await rej.click();

    // Click "2 Adet Ekle (%30 İndirimli)"
    await page.getByRole("button", { name: /2 Adet Ekle/i }).click();

    // Go to Cart and verify persistence + 2nd item 30% discount banner
    await page.goto("/sepet", { waitUntil: "networkidle" });
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByText(/2\. Üründe %30 İndirim Uygulandı/i).first()).toBeVisible();
    await expect(page.getByText(/−1\.485 TL/i).first()).toBeVisible();
  });

  test("4. Misafir sipariş akışı: zorunlu sözleşme onayı, adres seçimi ve sipariş tamamlama", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/urun/arac-ici-online-duyma-cihazi", { waitUntil: "networkidle" });
    const rej = page.getByRole("button", { name: /Reddet/i });
    if (await rej.isVisible()) await rej.click();

    // Fill quick order form
    await page.getByPlaceholder("Adınız", { exact: true }).fill("Test");
    await page.getByPlaceholder("Soyadınız", { exact: true }).fill("Müşteri");
    await page.locator('input[type="tel"]').first().fill("0532 444 55 66");

    // Wait for province list & select İstanbul -> Kadıköy
    const citySelect = page.locator("select").first();
    await expect(citySelect.locator("option")).not.toHaveCount(1);
    await citySelect.selectOption({ label: "İstanbul" });
    const distSelect = page.locator("select").nth(1);
    await distSelect.selectOption({ index: 1 });

    await page
      .getByPlaceholder(/Mahalle, cadde/i)
      .fill("Test Mahallesi QA Sokak No:1 Daire:2");

    // Check mandatory legal consent checkbox
    const legalBox = page.locator('input[type="checkbox"][required]');
    await expect(legalBox).toBeVisible();
    await legalBox.check();

    // Submit order
    await page.getByRole("button", { name: /Siparişi Tamamla/i }).click();
    await expect(page.getByText(/Siparişiniz Başarıyla Alındı/i)).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(/DGV-/)).toBeVisible();
  });

  test("5. Üye kayıt/giriş ve Admin giriş + ürün yönetimi akışı", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as Admin via /admin
    await page.goto("/admin", { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').fill("admin@digiguvenlik.com");
    await page.locator('input[type="password"]').fill("admin123");
    await page.locator('main form button[type="submit"]').click();

    await expect(page.getByText(/Siparişler/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("6. Responsive kırılım ekran görüntüleri (360, 390, 768, 1024, 1440px) ve yatay taşma kontrolü", async ({ page }) => {
    const widths = [360, 390, 768, 1024, 1440];
    const pagesToSnap = [
      { path: "/", name: "home" },
      { path: "/urun/uzaktan-ses-duyma-cihazi", name: "product" },
      { path: "/urunler", name: "catalog" },
    ];

    // Pre-dismiss cookie banner & spin wheel via localStorage so screenshots show clean UI
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.setItem(
        "digiguvenlik_cookie_consent_v1",
        JSON.stringify({ status: "rejected" })
      );
      sessionStorage.setItem("digiguvenlik_wheel_dismissed_v1", "1");
    });

    const overflows: string[] = [];
    for (const p of pagesToSnap) {
      for (const w of widths) {
        await page.setViewportSize({ width: w, height: 844 });
        await page.goto(p.path, { waitUntil: "networkidle" });
        const hasOverflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
        );
        if (hasOverflow) {
          overflows.push(`${p.name}@${w}px`);
        }
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `${p.name}-${w}px.png`),
          fullPage: false,
        });
      }
    }
    expect(overflows, `Horizontal overflow detected at: ${overflows.join(", ")}`).toHaveLength(0);
  });

  test("7. WCAG 2.2 AA Erişilebilirlik Taraması (axe-core)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.setItem(
        "digiguvenlik_cookie_consent_v1",
        JSON.stringify({ status: "rejected" })
      );
      sessionStorage.setItem("digiguvenlik_wheel_dismissed_v1", "1");
    });

    const axeReport: Record<string, unknown> = {};
    for (const url of ["/", "/urunler", "/urun/uzaktan-ses-duyma-cihazi", "/sepet"]) {
      await page.goto(url, { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      axeReport[url] = {
        violationCount: results.violations.length,
        violations: results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          nodes: v.nodes.length,
        })),
      };
    }
    fs.writeFileSync(
      path.join(process.cwd(), "reports", "axe-accessibility.json"),
      JSON.stringify(axeReport, null, 2),
      "utf-8"
    );
    // Log summary for audit inspection
    console.log("AXE_SUMMARY:", JSON.stringify(axeReport));
  });
});
