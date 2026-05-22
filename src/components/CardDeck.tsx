"use client";

import { useState, useEffect, useRef } from "react";
import type { TarotCard } from "@/lib/tarot-data";

interface CardDeckProps {
  cards: TarotCard[];
  onSelect: (card: TarotCard) => void;
}

export default function CardDeck({ cards, onSelect }: CardDeckProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [phase, setPhase] = useState<"shuffling" | "selecting" | "flipping" | "done">("shuffling");
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => setPhase("selecting"), 1500);
    return () => clearTimeout(timerRef.current);
  }, []);

  function handleSelect(idx: number) {
    if (phase !== "selecting" || selectedIdx !== null) return;
    clearTimeout(timerRef.current);
    setSelectedIdx(idx);
    setPhase("flipping");

    // After flip animation, hold for viewing then navigate
    timerRef.current = setTimeout(() => {
      setPhase("done");
    }, 1000);

    timerRef.current = setTimeout(() => {
      onSelect(cards[idx]);
    }, 2200);
  }

  const spreadPositions = [
    { x: -56, rot: -10, y: 8 },
    { x: 0, rot: 3, y: -4 },
    { x: 56, rot: 12, y: 6 },
  ];

  return (
    <div className="relative flex items-center justify-center py-8 min-h-[300px] sm:min-h-[360px]">
      {/* Hint text */}
      {phase === "selecting" && (
        <p className="absolute top-0 left-0 right-0 text-center text-[#8a80a0]/80 text-sm animate-fade-in">
          凭第一直觉，选一张牌
        </p>
      )}

      {/* Glow aura behind selected card */}
      {selectedIdx !== null && phase !== "done" && (
        <div
          className="absolute w-36 h-48 sm:w-44 sm:h-56 rounded-full bg-[#d4a853]/20 blur-3xl transition-all duration-1000 animate-pulse z-0"
          style={{
            transform: `translateX(${spreadPositions[selectedIdx].x}px)`,
          }}
        />
      )}

      <div className="relative flex items-center justify-center gap-3 sm:gap-5 z-10">
        {cards.map((card, i) => {
          const pos = spreadPositions[i];
          const isSelected = selectedIdx === i;
          const isFading = selectedIdx !== null && !isSelected;
          const isRevealing = isSelected && phase === "flipping";

          return (
            <button
              key={card.id}
              onClick={() => handleSelect(i)}
              disabled={phase !== "selecting"}
              className={`
                relative w-28 h-40 sm:w-36 sm:h-52 rounded-2xl
                bg-gradient-to-br from-[#1a1040] via-[#221550] to-[#160d35]
                border transition-all
                outline-none select-none
                ${phase === "shuffling"
                  ? "opacity-0 translate-y-16 scale-75"
                  : "opacity-100"
                }
                ${isFading
                  ? "!opacity-0 !scale-75 blur-md pointer-events-none duration-700"
                  : ""
                }
                ${isRevealing
                  ? "!border-[#d4a853] !border-2 !shadow-[0_0_40px_rgba(212,168,83,0.3)] !scale-110 !z-20 !-translate-y-4 duration-1000"
                  : phase === "selecting"
                    ? "border-[#3a2a60] hover:border-[#8a70c0] hover:-translate-y-3 hover:shadow-[0_8px_32px_rgba(138,112,192,0.25)] cursor-pointer shadow-lg shadow-purple-900/20 duration-300"
                    : "border-[#3a2a60] shadow-lg shadow-purple-900/20"
                }
              `}
              style={{
                transform: [
                  `translateX(${pos.x}px)`,
                  `rotate(${pos.rot}deg)`,
                  `translateY(${pos.y}px)`,
                  phase === "shuffling" ? "scale(0.85)" : "",
                ].join(" "),
                transition: isFading
                  ? "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)"
                  : isRevealing
                    ? "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                    : "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                transitionDelay: phase === "shuffling" ? `${i * 0.2}s` : "0ms",
              }}
              aria-label={`选择第${i + 1}张牌`}
            >
              {/* Card back design */}
              <div className="absolute inset-2.5 rounded-xl border border-[#3a2a60]/80 flex flex-col items-center justify-center overflow-hidden">
                {/* Geometric pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-[#d4a853]">
                      <polygon
                        points="50,5 61,35 95,35 68,55 78,88 50,68 22,88 32,55 5,35 39,35"
                        fill="currentColor"
                        opacity="0.5"
                      />
                    </svg>
                  </div>
                  {/* Corner ornaments */}
                  <div className="absolute top-2 left-2 w-4 h-4 rounded-full border border-[#d4a853]/20" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full border border-[#d4a853]/20" />
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#d4a853]/15" />
                  <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-[#d4a853]/15" />
                </div>

                {/* Center star */}
                <span className="relative text-[#d4a853]/30 text-3xl sm:text-4xl font-serif">
                  ✦
                </span>

                {/* Moon crescent at top */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-5 h-5 opacity-20">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-[#d4a853]">
                    <path
                      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>

              {/* Shuffling overlay */}
              {phase === "shuffling" && (
                <div className="absolute inset-0 rounded-2xl bg-[#0a0612]/50 flex items-center justify-center">
                  <span className="text-[#d4a853]/40 text-xs tracking-widest animate-pulse">
                    洗牌中
                  </span>
                </div>
              )}

              {/* Selection number glow */}
              {phase === "selecting" && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[#5a4a80]/60 text-xs">
                  {i + 1}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
