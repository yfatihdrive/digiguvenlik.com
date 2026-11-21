/**
 * HTML özel karakterlerini güvenli entity'lere dönüştürür (XSS koruması).
 */
export function escapeHtml(input: unknown): string {
  const str = String(input ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Türkçe karakter duyarsız arama normalleştirici:
 * "kulaklik" <-> "kulaklık", "İ/I/ı" <-> "i", "ş/ğ/ü/ö/ç" <-> "s/g/u/o/c"
 */
export function normalizeTurkish(input: string): string {
  return (input || "")
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/ı/g, "i")
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/\s+/g, " ")
    .trim();
}
