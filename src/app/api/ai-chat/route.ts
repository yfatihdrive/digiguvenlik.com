import { NextRequest, NextResponse } from "next/server";
import { getProducts, getSettings, formatPrice } from "@/lib/db";
import { Product } from "@/lib/types";

interface ChatProductCard {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  image: string;
}

function normalizeTr(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function toCard(p: Product): ChatProductCard {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    price: p.price,
    oldPrice: p.oldPrice,
    image: p.image,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawMsg: string = (body.message || "").trim();
    const currentSlug: string = (body.currentSlug || "").trim();

    if (!rawMsg) {
      return NextResponse.json({ error: "Mesaj boş olamaz." }, { status: 400 });
    }

    const products = getProducts();
    const settings = getSettings();
    const norm = normalizeTr(rawMsg);

    const currentProduct = currentSlug
      ? products.find((p) => p.slug === currentSlug)
      : undefined;

    // 1. Check intent: Order or Connect to Live Representative
    const wantsHandoff =
      /\b(siparis|satin al|almak ist|temsilci|canli destek|musteri hizmet|yetkili|baglan|whatsapp|ara|telefon|numara|kapida odeme ile al)\b/.test(
        norm
      );

    // 2. Check intent: Shipping / Payment / Coupon / Warranty / Return
    const asksShipping = /\b(kargo|teslimat|kac gun|ne zaman gelir|ucretsiz|paketleme|paket)\b/.test(
      norm
    );
    const asksPayment = /\b(kapida|odeme|kredi kart|nakit|havale|eft|taksit|iban)\b/.test(
      norm
    );
    const asksCoupon = /\b(kupon|indirim|kampanya|cek|kod)\b/.test(norm);
    const asksWarranty = /\b(garanti|iade|degisim|bozuk|ariza|kilavuz|kurulum|nasil calisir|sim kart|operator)\b/.test(
      norm
    );
    const asksBestsellers = /\b(en cok satan|populer|oner|tavsiye|en iyi|ne alayim|ucuz|uygun fiyat)\b/.test(
      norm
    );
    const asksPrice = /\b(fiyat|kac tl|ne kadar|ucret)\b/.test(norm);

    // 3. Search matching products from the 291-product catalog
    const stopWords = new Set([
      "ve",
      "ile",
      "icin",
      "bir",
      "bu",
      "su",
      "var",
      "mi",
      "mu",
      "ne",
      "kadar",
      "fiyat",
      "fiyati",
      "nedir",
      "nasil",
      "istiyorum",
      "almak",
      "siparis",
      "vermek",
      "merhaba",
      "selam",
      "iyi",
      "gunler",
      "urun",
      "cihaz",
      "cihazi",
      "kamera",
      "kamerasi",
      "bilgi",
      "hakkinda",
    ]);

    const tokens = norm
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 2 && !stopWords.has(t));

    let matchedProducts: Product[] = [];
    if (tokens.length > 0) {
      const scored = products
        .map((p) => {
          const hay = normalizeTr(`${p.name} ${p.category} ${p.sku} ${p.shortDescription}`);
          let score = 0;
          for (const tk of tokens) {
            if (normalizeTr(p.name).includes(tk)) score += 5;
            else if (normalizeTr(p.category).includes(tk)) score += 3;
            else if (hay.includes(tk)) score += 1;
          }
          if (p.isBestseller && score > 0) score += 1;
          return { p, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score);

      matchedProducts = scored.slice(0, 3).map((x) => x.p);
    }

    // Build intelligent Turkish WhatsApp-style response
    let reply = "";
    let showWhatsAppCta = false;
    let cards: ChatProductCard[] = [];
    let waPrefill = `Merhaba, sitenizdeki WhatsApp asistanından ulaşıyorum. Konu: ${rawMsg}`;

    if (wantsHandoff) {
      showWhatsAppCta = true;
      if (currentProduct) {
        reply = `Harika! "${currentProduct.name}" (${formatPrice(
          currentProduct.price
        )} TL — Ücretsiz Kargo & Kapıda Ödeme) için siparişinizi hemen oluşturabiliriz. 😊\n\nAşağıdaki butondan doğrudan **0 216 825 10 57** numaralı WhatsApp canlı müşteri temsilcimize bağlanabilir veya site üzerinden Hızlı Sipariş formunu doldurabilirsiniz.`;
        cards = [toCard(currentProduct)];
        waPrefill = `Merhaba, "${currentProduct.name}" (${formatPrice(
          currentProduct.price
        )} TL) ürününü sipariş vermek istiyorum. Yardımcı olur musunuz?`;
      } else {
        reply = `Memnuniyetle yardımcı olalım! 😊\n\nSipariş vermek veya canlı müşteri temsilcimizle birebir görüşmek için aşağıdaki yeşil butona tıklayarak doğrudan **0 216 825 10 57** WhatsApp hattımıza bağlanabilirsiniz. Ekibimiz size hemen dönüş yapacaktır.`;
      }
    } else if (/^(merhaba|selam|slm|iyi gunler|iyi aksamlar|gunaydin|hey|hi)\b/.test(norm) && tokens.length === 0) {
      reply = `Merhaba! 👋 Digi Güvenlik WhatsApp Yapay Zeka Asistanına hoş geldiniz.\n\n291 ürünümüz hakkında anında bilgi alabilir, fiyat sorabilir veya kapıda ödemeli sipariş oluşturabilirsiniz. Size nasıl yardımcı olabilirim?\n\n• Örn: *"Uzaktan ses duyma cihazı fiyatı nedir?"*\n• Örn: *"Araç içi veya 30 gün ses kayıt cihazı var mı?"*\n• Örn: *"Kapıda ödeme ve kargo nasıl?"*`;
    } else if (asksCoupon) {
      reply = `Size özel aktif indirim kuponumuz hazır! 🎁\n\n• **Kupon Kodu:** \`4Q4CGNLR\` (**200 TL Anında İndirim**)\n• **Ekstra Fırsat:** Havale / EFT ile ödemelerde sepette ayrıca **%${settings.havaleDiscountRate} indirim** uygulanır!\n\nKuponu Hızlı Sipariş formunda veya Sepet ekranında hemen kullanabilirsiniz. Temsilcimizle indirimli sipariş oluşturmak isterseniz WhatsApp'tan bağlanabilirsiniz.`;
      showWhatsAppCta = true;
    } else if (asksShipping || asksPayment) {
      reply = `Sipariş ve teslimat avantajlarımız şu şekildedir: 🚚💳\n\n• **Önce Teslim Al, Sonra Öde:** Kapıda Nakit veya Kapıda Kredi Kartı ile ödeme yapabilirsiniz.\n• **Havale / EFT Avantajı:** %${settings.havaleDiscountRate} anında ekstra indirim!\n• **Ücretsiz & Güvenli Kargo:** Türkiye'nin 81 iline ücretsiz kargo ile gönderim yapılır. Paket üzerinde ürün içeriği kesinlikle yazmaz (%100 güvenli paketleme).\n• **Teslimat Süresi:** Genellikle 1–3 iş günü içinde kapınızda.\n\nSipariş vermek isterseniz hemen WhatsApp temsilcimize bağlanabilirsiniz!`;
      showWhatsAppCta = true;
    } else if (asksWarranty) {
      if (currentProduct) {
        const specText = currentProduct.specs
          .slice(0, 4)
          .map((s) => `• **${s.label}:** ${s.value}`)
          .join("\n");
        reply = `"${currentProduct.name}" teknik ve garanti bilgileri: 🛡️\n\n${specText}\n• **Kurulum:** Kutu içeriğinde adım adım Türkçe kullanım kılavuzu yer alır, teknik bilgi gerektirmez.\n• **Garanti & İade:** 24 Ay resmi garanti + 14 gün iade/değişim hakkı.\n\nKurulum veya sipariş için 0 216 825 10 57 WhatsApp hattımızdan canlı destek alabilirsiniz!`;
        cards = [toCard(currentProduct)];
      } else {
        reply = `Tüm ürünlerimiz **2 Yıl (24 Ay) Digi Güvenlik Garantili** ve **Türkçe kullanım kılavuzlu** olarak gönderilir. 🛡️\n\n• SIM kartlı cihazlarımız Turkcell, Vodafone ve Türk Telekom hatlarıyla %100 uyumludur.\n• Kurulumu birkaç dakika sürer; takıldığınız her noktada **0 216 825 10 57** WhatsApp destek hattımızdan canlı yardım alabilirsiniz.\n• 14 gün içerisinde koşulsuz iade ve değişim hakkınız vardır.`;
      }
      showWhatsAppCta = true;
    } else if (asksBestsellers && matchedProducts.length === 0) {
      const top = norm.includes("ucuz") || norm.includes("uygun")
        ? [...products].sort((a, b) => a.price - b.price).slice(0, 3)
        : products.filter((p) => p.isBestseller).slice(0, 3);
      cards = top.map(toCard);
      reply =
        norm.includes("ucuz") || norm.includes("uygun")
          ? `En uygun fiyatlı popüler ürünlerimizden öne çıkanlar: 👇\n\nTüm ürünlerde ücretsiz kargo ve kapıda ödeme kolaylığı vardır. İncelemek veya sipariş vermek istediğiniz ürüne tıklayabilirsiniz.`
          : `Müşterilerimizin en çok tercih ettiği çok satan modellerimiz: 🔥👇\n\nTümü ücretsiz kargo, kapıda nakit/kredi kartı ödeme ve 2 yıl garantilidir. Hangisi hakkında detaylı bilgi almak istersiniz?`;
      showWhatsAppCta = true;
    } else if (matchedProducts.length > 0) {
      cards = matchedProducts.map(toCard);
      const first = matchedProducts[0];
      reply = `Aramanıza en uygun ${
        matchedProducts.length === 1 ? "ürünümüzü" : `${matchedProducts.length} ürünümüzü`
      } buldum! 👇\n\nÖne çıkan **${first.name}** şu an indirimli **${formatPrice(
        first.price
      )} TL** (Ücretsiz Kargo & Kapıda Ödeme). Ürün kartına tıklayarak detaylarını inceleyebilir veya doğrudan WhatsApp temsilcimizden sipariş verebilirsiniz.`;
      showWhatsAppCta = true;
      waPrefill = `Merhaba, "${first.name}" (${formatPrice(
        first.price
      )} TL) ürünü hakkında bilgi almak ve sipariş vermek istiyorum.`;
    } else if (currentProduct && (asksPrice || norm.length > 3)) {
      cards = [toCard(currentProduct)];
      reply = `Şu an incelediğiniz **${currentProduct.name}** hakkında özet bilgiler:\n\n• **İndirimli Fiyat:** ${formatPrice(
        currentProduct.price
      )} TL (Eski fiyat: ${formatPrice(currentProduct.oldPrice)} TL)\n• **Havale / EFT İle:** %${
        settings.havaleDiscountRate
      } ekstra indirimli!\n• **Öne Çıkan Özellik:** ${
        currentProduct.highlights[0] || currentProduct.shortDescription
      }\n\nSipariş vermek veya canlı temsilcimize soru sormak için aşağıdaki butondan **0 216 825 10 57** WhatsApp hattımıza bağlanabilirsiniz.`;
      showWhatsAppCta = true;
      waPrefill = `Merhaba, "${currentProduct.name}" (${formatPrice(
        currentProduct.price
      )} TL) ürünü hakkında sorum var.`;
    } else {
      const top = products.filter((p) => p.isBestseller).slice(0, 2);
      cards = top.map(toCard);
      reply = `Sorunuzu aldım! Size en doğru bilgiyi verebilmem için ilgilendiğiniz ürün türünü yazabilirsiniz (ör: *"ses kayıt"*, *"uzaktan ses duyma"*, *"wifi kamera"*, *"saat kamera"* veya *"kalem kamera"*).\n\nDilerseniz doğrudan **0 216 825 10 57** numaralı WhatsApp canlı müşteri temsilcimize bağlanarak anında destek alabilirsiniz. 😊`;
      showWhatsAppCta = true;
    }

    return NextResponse.json({
      reply,
      cards,
      showWhatsAppCta,
      whatsappNumber: "902168251057",
      whatsappDisplay: "0 216 825 10 57",
      waLink: `https://wa.me/902168251057?text=${encodeURIComponent(waPrefill)}`,
    });
  } catch (err) {
    console.error("AI Chat API error:", err);
    return NextResponse.json(
      { error: "Mesaj işlenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
