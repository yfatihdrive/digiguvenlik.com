"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product } from "@/lib/types";

export interface CartItem {
  productId: number;
  name: string;
  slug: string;
  price: number;
  oldPrice: number;
  image: string;
  category: string;
  quantity: number;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "admin" | "member";
  city: string;
  district: string;
  address: string;
}

export interface LightboxState {
  images: string[];
  imageAlts?: string[];
  title: string;
  slug: string;
  index: number;
}

interface ShopContextValue {
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (product: Product | CartItem, qty?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, qty: number) => void;
  clearCart: () => void;
  favorites: number[];
  toggleFavorite: (productId: number) => void;
  quickOrderProduct: Product | null;
  openQuickOrder: (product: Product) => void;
  closeQuickOrder: () => void;
  lightbox: LightboxState | null;
  openLightbox: (data: LightboxState) => void;
  closeLightbox: () => void;
  setLightboxIndex: (index: number) => void;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  activeCoupon: { code: string; discount: number } | null;
  applyWheelCoupon: (code: string, discount: number) => void;
  clearWheelCoupon: () => void;
  toast: { message: string; type: "success" | "info" } | null;
  showToast: (message: string, type?: "success" | "info") => void;
}

const ShopContext = createContext<ShopContextValue | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [quickOrderProduct, setQuickOrderProduct] = useState<Product | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3200);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("digi güvenlik_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
      const savedFavs = localStorage.getItem("digi güvenlik_favs");
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      const savedCoupon = localStorage.getItem("digiguvenlik_wheel_coupon_v1");
      if (savedCoupon) setActiveCoupon(JSON.parse(savedCoupon));
    } catch {
      // ignore
    }
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    try {
      localStorage.setItem("digi güvenlik_cart", JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("digi güvenlik_favs", JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const addToCart = useCallback(
    (product: Product | CartItem, qty = 1) => {
      const pid = "id" in product ? product.id : product.productId;
      setCart((prev) => {
        const existing = prev.find((it) => it.productId === pid);
        if (existing) {
          return prev.map((it) =>
            it.productId === pid ? { ...it, quantity: it.quantity + qty } : it
          );
        }
        return [
          ...prev,
          {
            productId: pid,
            name: product.name,
            slug: product.slug,
            price: product.price,
            oldPrice: product.oldPrice,
            image: product.image,
            category: product.category,
            quantity: qty,
          },
        ];
      });
      showToast(`"${product.name}" sepete eklendi!`);
    },
    [showToast]
  );

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((it) => it.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((it) => it.productId !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((it) => (it.productId === productId ? { ...it, quantity: qty } : it))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleFavorite = useCallback(
    (productId: number) => {
      setFavorites((prev) => {
        const exists = prev.includes(productId);
        const next = exists
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];
        showToast(
          exists ? "Ürün favorilerden çıkarıldı." : "Ürün favorilerinize eklendi!",
          "info"
        );
        return next;
      });
    },
    [showToast]
  );

  const openQuickOrder = useCallback((product: Product) => {
    setQuickOrderProduct(product);
  }, []);

  const closeQuickOrder = useCallback(() => {
    setQuickOrderProduct(null);
  }, []);

  const openLightbox = useCallback((data: LightboxState) => {
    setLightbox(data);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
  }, []);

  const setLightboxIndex = useCallback((index: number) => {
    setLightbox((prev) => (prev ? { ...prev, index } : null));
  }, []);

  const applyWheelCoupon = useCallback((code: string, discount: number) => {
    const clean = { code: code.trim().toUpperCase(), discount };
    setActiveCoupon(clean);
    try {
      localStorage.setItem("digiguvenlik_wheel_coupon_v1", JSON.stringify(clean));
    } catch {
      // ignore
    }
  }, []);

  const clearWheelCoupon = useCallback(() => {
    setActiveCoupon(null);
    try {
      localStorage.removeItem("digiguvenlik_wheel_coupon_v1");
    } catch {
      // ignore
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setUser(null);
    showToast("Başarıyla çıkış yapıldı.", "info");
  }, [showToast]);

  const cartCount = cart.reduce((acc, it) => acc + it.quantity, 0);
  const cartSubtotal = cart.reduce((acc, it) => acc + it.price * it.quantity, 0);

  return (
    <ShopContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        favorites,
        toggleFavorite,
        quickOrderProduct,
        openQuickOrder,
        closeQuickOrder,
        lightbox,
        openLightbox,
        closeLightbox,
        setLightboxIndex,
        user,
        setUser,
        refreshUser,
        logout,
        activeCoupon,
        applyWheelCoupon,
        clearWheelCoupon,
        toast,
        showToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return ctx;
}
