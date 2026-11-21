"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, UserPlus, Lock, Mail, Phone, ShieldCheck } from "lucide-react";
import { useShop } from "@/context/ShopContext";

export default function GirisPage() {
  const router = useRouter();
  const { setUser, showToast } = useShop();

  const [tab, setTab] = useState<"login" | "register">("login");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email: loginEmail,
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Giriş başarısız.");
        setLoading(false);
        return;
      }
      setUser(data.user);
      showToast(`Hoş geldiniz, ${data.user.firstName}!`);
      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/hesabim");
      }
    } catch {
      setError("Sunucu bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          firstName,
          lastName,
          email: regEmail,
          phone,
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Kayıt işlemi başarısız.");
        setLoading(false);
        return;
      }
      setUser(data.user);
      showToast("Üyeliğiniz başarıyla oluşturuldu!");
      router.push("/hesabim");
    } catch {
      setError("Sunucu bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
        {/* Hepsiburada Style Two-Tab Header */}
        <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setError("");
            }}
            className={`flex cursor-pointer items-center justify-center gap-2 py-4 text-sm font-extrabold transition ${
              tab === "login"
                ? "border-b-3 border-[#FF6000] bg-white text-[#FF6000]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Giriş Yap</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("register");
              setError("");
            }}
            className={`flex cursor-pointer items-center justify-center gap-2 py-4 text-sm font-extrabold transition ${
              tab === "register"
                ? "border-b-3 border-[#FF6000] bg-white text-[#FF6000]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Üye Ol</span>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600">
              {error}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-extrabold text-gray-700 uppercase">
                  E-Posta Adresiniz
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ornek@eposta.com"
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pr-3.5 pl-10 text-sm text-gray-900 focus:border-[#FF6000] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-gray-700 uppercase">
                  Şifreniz
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pr-3.5 pl-10 text-sm text-gray-900 focus:border-[#FF6000] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer rounded-xl bg-[#FF6000] py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-[#e55500]"
              >
                {loading ? "Giriş Yapılıyor..." : "GİRİŞ YAP"}
              </button>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-[13px] text-gray-600">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#FF6000]" />
                <span>
                  Hesap bilgileriniz 256-bit şifreleme ile korunur. Şifrenizi hatırlamıyorsanız destek hattımızdan yardım alabilirsiniz.
                </span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-gray-700">
                    Adınız *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Adınız"
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#FF6000] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-gray-700">
                    Soyadınız *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Soyadınız"
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#FF6000] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-gray-700">
                  E-Posta Adresiniz *
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ornek@eposta.com"
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 py-2.5 pr-3.5 pl-10 text-sm text-gray-900 focus:border-[#FF6000] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-gray-700">
                  Telefon Numaranız *
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05xx xxx xx xx"
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 py-2.5 pr-3.5 pl-10 text-sm text-gray-900 focus:border-[#FF6000] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-gray-700">
                  Şifre Belirleyin *
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="En az 4 karakter"
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 py-2.5 pr-3.5 pl-10 text-sm text-gray-900 focus:border-[#FF6000] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer rounded-xl bg-[#FF6000] py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-[#e55500]"
              >
                {loading ? "Hesap Oluşturuluyor..." : "HEMEN ÜYE OL"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
