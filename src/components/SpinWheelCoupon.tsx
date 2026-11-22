"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Gift,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  ShoppingCart,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";

interface WheelSlice {
  label: string;
  amount: number;
  code: string;
  color: string;
  textColor: string;
}

const SLICES: WheelSlice[] = [
  { label: "200 TL", amount: 200, code: "DIGI200", color: "#FF6000", textColor: "#FFFFFF" },
  { label: "300 TL", amount: 300, code: "DIGI300", color: "#1E293B", textColor: "#FACC15" },
  { label: "400 TL", amount: 400, code: "DIGI400", color: "#16A34A", textColor: "#FFFFFF" },
  { label: "500 TL", amount: 500, code: "DIGI500", color: "#7C3AED", textColor: "#FFFFFF" },
  { label: "200 TL", amount: 200, code: "DIGI200", color: "#0284C7", textColor: "#FFFFFF" },
  { label: "300 TL", amount: 300, code: "DIGI300", color: "#EA580C", textColor: "#FFFFFF" },
  { label: "400 TL", amount: 400, code: "DIGI400", color: "#0F766E", textColor: "#FFFFFF" },
  { label: "500 TL", amount: 500, code: "DIGI500", color: "#DC2626", textColor: "#FFFFFF" },
];

const STORAGE_KEY_RESULT = "digiguvenlik_wheel_result_v1";
const STORAGE_KEY_DISMISSED = "digiguvenlik_wheel_dismissed_v1";

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeSlice(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

export default function SpinWheelCoupon() {
  const { activeCoupon, applyWheelCoupon, showToast } = useShop();

  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonSlice, setWonSlice] = useState<WheelSlice | null>(null);
  const [copied, setCopied] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pointerBounce, setPointerBounce] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const tickTimersRef = useRef<number[]>([]);

  const getAudioCtx = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AC) audioCtxRef.current = new AC();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  // Crisp mechanical wheel peg click sound (Web Audio API)
  const playTick = useCallback(
    (pitchFactor = 1) => {
      if (!soundEnabled) return;
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(680 * pitchFactor, now);
      osc.frequency.exponentialRampToValueAtTime(190, now + 0.045);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.055);
    },
    [soundEnabled, getAudioCtx]
  );

  // Celebratory ascending victory fanfare chime
  const playWinFanfare = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const now = ctx.currentTime + i * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    });
  }, [soundEnabled, getAudioCtx]);

  // Restore previous win & trigger 10-second auto-open for visitors
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RESULT);
      if (saved) {
        const parsed: WheelSlice = JSON.parse(saved);
        setWonSlice(parsed);
        return; // Already spun before, don't auto-popup
      }
      const dismissed = sessionStorage.getItem(STORAGE_KEY_DISMISSED);
      if (dismissed) return;
    } catch {
      // ignore
    }

    const timer = window.setTimeout(() => {
      setOpen(true);
    }, 10000); // 10 seconds stay trigger

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !spinning) {
        setOpen(false);
        try {
          sessionStorage.setItem(STORAGE_KEY_DISMISSED, "1");
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, spinning]);

  useEffect(() => {
    return () => {
      tickTimersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const handleClose = () => {
    if (spinning) return;
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY_DISMISSED, "1");
    } catch {
      // ignore
    }
  };

  const handleSpin = () => {
    if (spinning) return;
    getAudioCtx(); // Unlock audio on user gesture
    setSpinning(true);
    setWonSlice(null);
    setCopied(false);

    // Pick random winning slice among all 8 slices (200 / 300 / 400 / 500 TL)
    const targetIdx = Math.floor(Math.random() * SLICES.length);
    const sliceDeg = 360 / SLICES.length; // 45 deg
    // Pointer is at 0 deg (12 o'clock). Center of targetIdx is at targetIdx * 45 + 22.5
    // To land targetIdx center under 0 deg, wheel final angle mod 360 must be (360 - (targetIdx * 45 + 22.5))
    const targetCenter = targetIdx * sliceDeg + sliceDeg / 2;
    const jitter = (Math.random() - 0.5) * 18; // realistic offset inside slice
    const desiredMod = (360 - targetCenter + jitter + 360) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    const delta = (desiredMod - currentMod + 360) % 360;
    const fullSpins = 6 * 360; // 6 full exciting rotations
    const finalRotation = rotation + fullSpins + delta;

    setRotation(finalRotation);

    // Schedule synchronized decelerating peg ticks over 4.7 seconds
    tickTimersRef.current.forEach((id) => window.clearTimeout(id));
    tickTimersRef.current = [];

    const totalTicks = 42;
    const durationMs = 4650;
    for (let i = 0; i < totalTicks; i++) {
      // Ease-out timing curve matching CSS cubic-bezier deceleration
      const progress = i / totalTicks;
      const tMs = Math.round(durationMs * (1 - Math.pow(1 - progress, 2.35)));
      const tid = window.setTimeout(() => {
        playTick(0.92 + (1 - progress) * 0.25);
        setPointerBounce(true);
        window.setTimeout(() => setPointerBounce(false), 60);
      }, tMs);
      tickTimersRef.current.push(tid);
    }

    const doneTid = window.setTimeout(() => {
      const winner = SLICES[targetIdx];
      setSpinning(false);
      setWonSlice(winner);
      playWinFanfare();
      try {
        localStorage.setItem(STORAGE_KEY_RESULT, JSON.stringify(winner));
      } catch {
        // ignore
      }
    }, 4850);
    tickTimersRef.current.push(doneTid);
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    showToast(`Kupon kodu kopyalandı: ${code}`, "success");
    window.setTimeout(() => setCopied(false), 2500);
  };

  const handleApplyToCart = (slice: WheelSlice) => {
    applyWheelCoupon(slice.code, slice.amount);
    showToast(
      `${slice.code} (${slice.amount} TL İndirim) sepet ve siparişlerinize otomatik uygulandı!`,
      "success"
    );
    setOpen(false);
  };

  const sliceDeg = 360 / SLICES.length;

  return (
    <>
      {/* Compact Floating Bottom-Left Gift Trigger Pill */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-3 left-3 z-40 flex cursor-pointer items-center gap-2 rounded-full border border-amber-300/70 bg-gradient-to-r from-[#FF6000] via-[#ff7b1c] to-[#e04800] px-3 py-2 text-white shadow-[0_6px_20px_rgba(255,96,0,0.45)] transition hover:scale-105 sm:bottom-5 sm:left-5 sm:px-3.5 sm:py-2.5"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
          <Gift className="h-4 w-4 animate-bounce text-amber-200" />
        </span>
        <div className="text-left leading-tight">
          <p className="text-[10px] font-extrabold tracking-wide uppercase text-amber-100">
            {activeCoupon ? "Kuponun Aktif!" : "Şansını Dene"}
          </p>
          <p className="text-[12px] font-black text-white">
            {activeCoupon ? `${activeCoupon.code} (-${activeCoupon.discount} TL)` : "Çarkı Çevir"}
          </p>
        </div>
      </button>

      {/* Spin Wheel Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-3 backdrop-blur-xs"
          onClick={handleClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Çarkı Çevir Kuponu Kap"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-[#FF6000]/40 bg-gradient-to-b from-[#111827] via-[#1a2234] to-[#111827] text-white shadow-2xl"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF6000] text-white shadow-md">
                  <Gift className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-[16px] leading-tight font-extrabold text-white">
                    Çarkı Çevir, Kuponu Kap!
                  </h3>
                  <p className="text-[12px] font-medium text-amber-300">
                    200 TL • 300 TL • 400 TL • 500 TL Anında İndirim
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSoundEnabled((s) => !s)}
                  title={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4 text-amber-300" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={spinning}
                  aria-label="Kapat"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body: Wheel + Result */}
            <div className="flex flex-col items-center px-5 py-5">
              {/* Wheel Container */}
              <div className="relative flex items-center justify-center">
                {/* Top Golden Pointer Arrow */}
                <div
                  className={`absolute -top-3 left-1/2 z-20 -translate-x-1/2 transition-transform duration-75 ${
                    pointerBounce ? "-rotate-12 scale-110" : "rotate-0"
                  }`}
                >
                  <svg width="36" height="40" viewBox="0 0 36 40" fill="none">
                    <path
                      d="M18 38L4 10C2.5 6.8 4.8 3 8.4 3H27.6C31.2 3 33.5 6.8 32 10L18 38Z"
                      fill="#FACC15"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                    />
                    <circle cx="18" cy="12" r="4" fill="#B45309" />
                  </svg>
                </div>

                {/* Outer Glowing Rim with LED Bulbs */}
                <div className="relative rounded-full border-[6px] border-amber-400/90 bg-[#0b101b] p-2 shadow-[0_0_35px_rgba(255,96,0,0.45)]">
                  <div
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: spinning
                        ? "transform 4.8s cubic-bezier(0.12, 0.85, 0.18, 1)"
                        : "none",
                    }}
                    className="h-[250px] w-[250px] sm:h-[280px] sm:w-[280px]"
                  >
                    <svg viewBox="0 0 300 300" className="h-full w-full drop-shadow-lg">
                      {SLICES.map((slice, idx) => {
                        const startAngle = idx * sliceDeg;
                        const endAngle = startAngle + sliceDeg;
                        const midAngle = startAngle + sliceDeg / 2;
                        const textPos = polarToCartesian(150, 150, 102, midAngle);
                        return (
                          <g key={idx}>
                            <path
                              d={describeSlice(150, 150, 146, startAngle, endAngle)}
                              fill={slice.color}
                              stroke="#FFFFFF"
                              strokeWidth="2"
                            />
                            <text
                              x={textPos.x}
                              y={textPos.y}
                              fill={slice.textColor}
                              fontSize="16"
                              fontWeight="900"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              transform={`rotate(${midAngle}, ${textPos.x}, ${textPos.y})`}
                            >
                              {slice.label}
                            </text>
                          </g>
                        );
                      })}
                      {/* Rim Peg Dots */}
                      {SLICES.map((_, idx) => {
                        const peg = polarToCartesian(150, 150, 142, idx * sliceDeg);
                        return (
                          <circle
                            key={`peg-${idx}`}
                            cx={peg.x}
                            cy={peg.y}
                            r="4"
                            fill="#FDE047"
                            stroke="#78350F"
                            strokeWidth="1"
                          />
                        );
                      })}
                    </svg>
                  </div>

                  {/* Center Spin Hub Button */}
                  <button
                    type="button"
                    onClick={handleSpin}
                    disabled={spinning}
                    className="absolute top-1/2 left-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center justify-center rounded-full border-4 border-white bg-gradient-to-b from-[#FF7A1A] to-[#D94600] text-white shadow-[0_6px_18px_rgba(0,0,0,0.5)] transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
                  >
                    <span className="text-[12px] font-black tracking-wide">
                      {spinning ? "..." : "ÇEVİR"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Action / Winner Area */}
              {!wonSlice ? (
                <div className="mt-5 w-full space-y-2.5 text-center">
                  <button
                    type="button"
                    onClick={handleSpin}
                    disabled={spinning}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6000] to-[#ff8524] py-3.5 text-[16px] font-black text-white shadow-lg shadow-orange-600/35 transition hover:brightness-110 disabled:opacity-60"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>
                      {spinning
                        ? "Çark Dönüyor... Bol Şans!"
                        : "ÇARKI ÇEVİR & KUPONU KAP!"}
                    </span>
                  </button>
                  <p className="text-[12px] text-gray-300">
                    Kazandığınız indirim kodu tüm ürünlerde anında geçerlidir.
                  </p>
                </div>
              ) : (
                <div className="mt-5 w-full space-y-3 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-center">
                  <p className="text-[13px] font-extrabold tracking-wide text-amber-300 uppercase">
                    🎉 Tebrikler! Anında İndirim Kazandınız!
                  </p>
                  <p className="text-[26px] leading-none font-black text-white">
                    {wonSlice.label} İNDİRİM
                  </p>

                  {/* Copyable Coupon Code Box */}
                  <div className="flex items-center justify-between gap-2 rounded-xl border-2 border-dashed border-amber-400/80 bg-[#0b101b] px-3.5 py-2.5">
                    <span className="font-mono text-[19px] font-black tracking-widest text-amber-300">
                      {wonSlice.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(wonSlice.code)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-[13px] font-bold text-white transition hover:bg-white/25"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-400" />
                          <span>Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Kodu Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* One-Click Apply to Cart & Orders */}
                  <button
                    type="button"
                    onClick={() => handleApplyToCart(wonSlice)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-[15px] font-black text-white shadow-lg shadow-emerald-600/35 transition hover:bg-[#1ebe5d]"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Sepete &amp; Siparişe Otomatik Uygula (-{wonSlice.label})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
