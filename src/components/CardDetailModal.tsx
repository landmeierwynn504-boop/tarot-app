"use client";

import { useState, useEffect, useCallback } from "react";
import type { TarotCard } from "@/lib/tarot-data";

interface CardDetailModalProps {
  card: TarotCard;
  isReversed: boolean;
  position: "past" | "present" | "future";
  positionLabel: string;
  interpretation: string;
  onClose: () => void;
}

const suitLabels: Record<string, string> = {
  wands: "权杖",
  cups: "圣杯",
  swords: "宝剑",
  pentacles: "星币",
};

const suitEmoji: Record<string, string> = {
  wands: "🪄",
  cups: "🏆",
  swords: "⚔️",
  pentacles: "🪙",
};

export default function CardDetailModal({
  card,
  isReversed,
  positionLabel,
  interpretation,
  onClose,
}: CardDetailModalProps) {
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 280);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto ${
        closing ? "animate-modal-exit" : "animate-fade-in"
      }`}
      style={{ background: "rgba(4,2,12,0.93)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={`relative w-full max-w-sm mx-auto px-4 py-6 pt-14 pb-16 ${
          closing ? "animate-modal-exit" : "animate-modal-enter"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="fixed top-5 right-5 z-[60] w-9 h-9 rounded-full border border-[#d4a853]/25 bg-[#0f0a1e]/90 flex items-center justify-center text-[#d4a853]/60 hover:text-[#d4a853] hover:border-[#d4a853]/50 transition-all duration-300"
          aria-label="关闭"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* ====== The Card: unified frame containing everything ====== */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(175deg, #150e32 0%, #0d0822 30%, #060310 70%, #0a0520 100%)",
            border: "1.5px solid rgba(180,140,60,0.28)",
            boxShadow: "0 0 60px rgba(180,130,50,0.08), 0 0 120px rgba(160,100,40,0.04), inset 0 1px 0 rgba(255,255,255,0.02)",
          }}
        >
          {/* Top ornamental line */}
          <div className="h-px mx-4 mt-4 bg-gradient-to-r from-transparent via-[#d4a853]/20 to-transparent" />

          {/* Card Header — position + type */}
          <div className="flex items-center justify-between px-5 pt-3 pb-1">
            <span className="px-3 py-0.5 rounded-full border border-[#d4a853]/25 bg-[#d4a853]/6 text-[#d4a853]/80 text-[10px] tracking-[0.15em] font-serif">
              {positionLabel}
            </span>
            <span className="text-[#5a4a80]/50 text-[10px] tracking-[0.1em] font-serif">
              {card.type === "major" ? "大阿卡纳" : card.suit ? `${suitLabels[card.suit]}${card.number ?? ""}` : ""}
            </span>
          </div>

          {/* Central visual area */}
          <div className="flex flex-col items-center px-5 pt-3 pb-4">
            {/* Star ornament */}
            <svg viewBox="0 0 60 60" className="w-14 h-14 mb-3" style={{ opacity: 0.12 }}>
              <circle cx="30" cy="30" r="28" fill="none" stroke="#d4a853" strokeWidth="0.3" />
              <circle cx="30" cy="30" r="22" fill="none" stroke="#d4a853" strokeWidth="0.2" />
              <polygon points="30,6 34,22 50,22 38,32 42,48 30,38 18,48 22,32 10,22 26,22" fill="none" stroke="#d4a853" strokeWidth="0.5" />
              <circle cx="30" cy="30" r="2" fill="#d4a853" opacity="0.3" />
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <line key={deg} x1="30" y1="8" x2="30" y2="14" stroke="#d4a853" strokeWidth="0.3" transform={`rotate(${deg} 30 30)`} />
              ))}
            </svg>

            {/* Card name */}
            <h2 className="text-[#d4a853] text-2xl font-serif font-bold tracking-[0.12em] leading-tight">
              {card.name}
            </h2>
            <p className="text-[#6a5a90]/50 text-[11px] tracking-[0.08em] mt-0.5 font-serif">
              {card.nameEn}
            </p>

            {/* Upright/Reversed badge */}
            <div className="mt-3">
              <span
                className={`text-[10px] tracking-[0.15em] font-serif px-3 py-0.5 rounded-full border ${
                  isReversed
                    ? "text-[#ef4444]/65 border-[#ef4444]/20 bg-[#ef4444]/6"
                    : "text-[#d4a853]/65 border-[#d4a853]/20 bg-[#d4a853]/6"
                }`}
              >
                {isReversed ? "逆 位" : "正 位"}
              </span>
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {card.keywords.slice(0, 4).map((kw) => (
                <span
                  key={kw}
                  className="px-2.5 py-0.5 rounded-full text-[9px] border border-[#3a2a60]/50 bg-[#150f2a]/60 text-[#8a7ea8]/60 tracking-wide"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom ornamental line */}
          <div className="h-px mx-4 bg-gradient-to-r from-transparent via-[#d4a853]/20 to-transparent" />

          {/* ====== Interpretation INSIDE the card frame ====== */}
          <div className="px-5 py-5">
            {interpretation ? (
              <div className="text-[#c8bee0]/80 text-[13px] leading-[2.1] tracking-wide whitespace-pre-line font-sans">
                {interpretation}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-[#6a5a90]/40 text-xs">深度解读正在生成中...</p>
              </div>
            )}
          </div>

          {/* Card bottom ornaments */}
          <div className="h-px mx-4 mb-4 bg-gradient-to-r from-transparent via-[#d4a853]/10 to-transparent" />
          <div className="flex justify-center pb-4">
            <svg viewBox="0 0 40 8" className="w-12 h-2 text-[#d4a853]/10">
              <circle cx="20" cy="4" r="2" fill="currentColor" />
              <line x1="6" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="0.3" />
              <line x1="26" y1="4" x2="34" y2="4" stroke="currentColor" strokeWidth="0.3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
