export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductSeoSection {
  title: string;
  content: string;
}

export interface ProductFaq {
  question: string;
  answer: string;
}

export interface ProductReview {
  id: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: number;
  sku: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  oldPrice: number;
  discountPercent: number;
  stock: number;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  imageAlts?: string[];
  videoUrl?: string;
  isBestseller: boolean;
  isFeatured: boolean;
  isSuperDeal: boolean;
  shortDescription: string;
  highlights: string[];
  specs: ProductSpec[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoSections: ProductSeoSection[];
  faqs: ProductFaq[];
  reviews: ProductReview[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  count: number;
  icon: string;
  parentSlug?: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
}

export interface Coupon {
  code: string;
  type: "fixed" | "percent";
  value: number;
  minOrder: number;
  active: boolean;
  description: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: "admin" | "member";
  city: string;
  district: string;
  address: string;
  createdAt: string;
}

export interface OrderItem {
  productId: number;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus =
  | "Yeni Sipariş"
  | "Onaylandı"
  | "Hazırlanıyor"
  | "Kargoya Verildi"
  | "Teslim Edildi"
  | "İptal Edildi";

export interface Order {
  id: string;
  orderType: "quick_order" | "cart_order";
  userId: string | null;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  customerEmail?: string;
  customerCity: string;
  customerDistrict: string;
  customerAddress: string;
  items: OrderItem[];
  subtotal: number;
  couponCode: string;
  couponDiscount: number;
  havaleDiscount: number;
  totalAmount: number;
  paymentMethod: "Kapıda Nakit" | "Kapıda Kredi Kartı" | "Havale - EFT";
  notes: string;
  status: OrderStatus;
  trackingNumber: string;
  mailSent: boolean;
  mailPreviewHtml?: string;
  createdAt: string;
}

export interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export interface SiteSettings {
  siteName: string;
  siteSlogan: string;
  phone: string;
  whatsapp: string;
  whatsappDisplay: string;
  supportPhone: string;
  email: string;
  notificationEmail: string;
  address: string;
  companyName: string;
  havaleDiscountRate: number;
  bankAccountHolder: string;
  bankIban: string;
  bankName: string;
  freeShippingText: string;
  codBannerTitle: string;
  codBannerSub: string;
  smtp: SmtpSettings;
}

export interface DatabaseSchema {
  settings: SiteSettings;
  categories: Category[];
  products: Product[];
  coupons: Coupon[];
  users: User[];
  orders: Order[];
}

export interface BlogImage {
  url: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
  isFeatured?: boolean;
}

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  topicType: string;
  categorySlug: string;
  categoryName: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  wordCount: number;
  tldrSummary: string;
  featuredImage?: BlogImage | null;
  images: BlogImage[];
  productSlugs: string[];
  contentHtml: string;
  faqs: ProductFaq[];
  schemaJsonLd?: Record<string, unknown>;
}
