export interface PromoLineItem {
  price: number;
  quantity: number;
}

/**
 * "2. Üründe %20 İndirim" kampanya hesaplayıcısı:
 * Sepette veya siparişte toplam 2 veya daha fazla adet ürün varsa,
 * 2. ürüne (farklı ürünlerde düşük fiyatlı olana) %20 indirim uygular.
 */
export function calculateSecondItemDiscount(items: PromoLineItem[]): number {
  const unitPrices: number[] = [];
  for (const item of items) {
    const qty = Math.max(0, Math.floor(Number(item.quantity) || 0));
    const price = Math.max(0, Number(item.price) || 0);
    for (let i = 0; i < qty; i++) {
      unitPrices.push(price);
    }
  }
  if (unitPrices.length < 2) return 0;
  unitPrices.sort((a, b) => a - b);
  return Math.round(unitPrices[0] * 0.2);
}
