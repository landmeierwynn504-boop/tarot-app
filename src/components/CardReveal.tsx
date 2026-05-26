"use client";

import { useState, useEffect } from "react";
import type { TarotCard } from "@/lib/tarot-data";

interface CardRevealProps {
  card: TarotCard;
  isReversed: boolean;
}

const suitEmoji: Record<string, string> = {
  wands: "🪄",
  cups: "🏆",
  swords: "⚔",
  pentacles: "🪙",
};

const suitLabel: Record<string, string> = {
  wands: "权杖",
  cups: "圣杯",
  swords: "宝剑",
  pentacles: "星币",
};

export default function CardReveal({ card, isReversed }: CardRevealProps) {
  const [flipped, setFlipped] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFlipped(true), 400);
    const t2 = setTimeout(() => setShowDetails(true), 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const typeBadge = card.type === "major"
    ? "大阿卡纳"
    : card.suit ? suitLabel[card.suit] : "";

  return (
    <section className="flex flex-col items-center py-6">
      {/* --- 3D Card --- */}
      <div className="relative w-44 h-64 sm:w-52 sm:h-72 mb-10" style={{ perspective: "800px" }}>
        <div
          className={`card-flip relative w-full h-full ${flipped ? "flipped" : ""}`}
        >
          {/* Front: card back */}
          <div className="card-front rounded-2xl bg-gradient-to-br from-[#1a0f35] via-[#221545] to-[#160d30] border border-[#3a2560] shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 200 280" className="w-full h-full text-[#d4a853]">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="0.5" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="200" height="280" fill="url(#grid)" />
              </svg>
            </div>
            <div className="relative text-[#d4a853]/30 text-5xl font-serif">✦</div>
            {/* Corner accents */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-[#d4a853]/15 rounded-tl" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-[#d4a853]/15 rounded-tr" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-[#d4a853]/15 rounded-bl" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-[#d4a853]/15 rounded-br" />
          </div>

          {/* Back: card face */}
          <div
            className="card-back rounded-2xl bg-gradient-to-br from-[#120a24] via-[#1a1038] to-[#0e081c] border-2 border-[#4a3070] shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-5 overflow-hidden"
            style={{ transform: isReversed ? "rotateY(180deg) rotate(180deg)" : "rotateY(180deg)" }}
          >
            {/* Gold corner accents */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#d4a853]/40" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#d4a853]/40" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#d4a853]/40" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#d4a853]/40" />

            {/* Card type indicator */}
            <span className="text-[#d4a853]/50 text-[10px] tracking-[0.15em] mb-3 uppercase font-sans">
              {typeBadge}{card.number ? ` ${card.number}` : ""}
            </span>

            {/* Card name */}
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#d4a853] mb-1 tracking-[0.08em]">
              {card.name}
            </h2>
            <p className="text-[#8a7ea8] text-[11px] mb-4 tracking-wide font-sans">
              {card.nameEn}
            </p>

            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#d4a853]/15 to-[#d4a853]/5 border border-[#d4a853]/20 flex items-center justify-center mb-3">
              <span className="text-2xl" role="img" aria-label={card.type}>
                {card.type === "major" ? "✧" : card.suit ? suitEmoji[card.suit] : "✦"}
              </span>
            </div>

            {/* Reversed indicator */}
            {isReversed && (
              <div className="mt-1 px-3 py-1 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center min-w-[48px]">
                <span className="text-[10px] text-[#ef4444]/80 tracking-wider text-center">逆位</span>
              </div>
            )}
            {!isReversed && (
              <div className="mt-1 px-3 py-1 rounded-full bg-[#d4a853]/10 border border-[#d4a853]/20 flex items-center justify-center min-w-[48px]">
                <span className="text-[10px] text-[#d4a853]/70 tracking-wider text-center">正位</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Keywords below card --- */}
      <div
        className={`text-center transition-all duration-700 ${showDetails ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div className="flex flex-wrap justify-center gap-1.5">
          {card.keywords.map((kw) => (
            <span
              key={kw}
              className="px-3 py-1 text-[11px] rounded-full bg-[#d4a853]/8 text-[#d4a853]/80 border border-[#d4a853]/15 font-sans tracking-wide"
            >
              {kw}
            </span>
          ))}
        </div>
        {isReversed && (
          <p className="text-[#ef9944]/60 text-[11px] mt-3 tracking-wide font-sans">
            逆位解读 · 看向问题的另一面
          </p>
        )}
      </div>
    </section>
  );
}
