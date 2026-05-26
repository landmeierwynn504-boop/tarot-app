"use client";

import { useState, useEffect, useRef } from "react";
import type { TarotCard } from "@/lib/tarot-data";

interface CardDeckProps {
  cards: TarotCard[];
  onComplete: (selected: { card: TarotCard; isReversed: boolean }[]) => void;
}

const positionLabels = ["过去", "现在", "未来"];

export default function CardDeck({ cards, onComplete }: CardDeckProps) {
  const [phase, setPhase] = useState<"entering" | "selecting" | "gathering" | "revealing" | "done">("entering");
  const [selected, setSelected] = useState<{ idx: number; order: number }[]>([]);
  const [rotation, setRotation] = useState(0);
  const [dimensions, setDimensions] = useState({ w: 360, h: 500 });
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ w: rect.width, h: rect.height });
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Continuous ring rotation during selecting phase
  useEffect(() => {
    if (phase !== "selecting" && phase !== "entering") return;
    let last = performance.now();
    function tick(now: number) {
      const dt = now - last;
      last = now;
      const speed = phase === "entering" ? 0.0015 : 0.0006;
      setRotation((prev) => (prev + speed * (dt / 16)) % (Math.PI * 2));
      animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase]);

  // Entering → selecting
  useEffect(() => {
    timerRef.current = setTimeout(() => setPhase("selecting"), 1500);
    return () => clearTimeout(timerRef.current);
  }, []);

  const ringRadius = Math.max(dimensions.w * 0.72, 260);
  const ringCenterX = dimensions.w / 2;
  const ringCenterY = dimensions.h + ringRadius * 0.35;

  function getCardPos(i: number) {
    const angle = rotation + (i / cards.length) * Math.PI * 2;
    return {
      x: ringCenterX + ringRadius * Math.cos(angle),
      y: ringCenterY + ringRadius * Math.sin(angle),
    };
  }

  // Gather targets — 3 cards slide to center row
  const gatherTargets = [
    { x: dimensions.w / 2 - 85, y: dimensions.h / 2 + 10, rot: -4 },
    { x: dimensions.w / 2, y: dimensions.h / 2 - 30, rot: 2 },
    { x: dimensions.w / 2 + 85, y: dimensions.h / 2 + 10, rot: 6 },
  ];

  function handleTap(idx: number) {
    if (phase !== "selecting") return;
    if (selected.some((s) => s.idx === idx)) return;
    if (selected.length >= 3) return;

    const order = selected.length;
    const newSelected = [...selected, { idx, order }];
    setSelected(newSelected);

    if (newSelected.length >= 3) {
      setPhase("gathering");
      timerRef.current = setTimeout(() => {
        setPhase("revealing");
        timerRef.current = setTimeout(() => {
          setPhase("done");
          const result = newSelected.map((s) => ({
            card: cards[s.idx],
            isReversed: Math.random() > 0.5,
          }));
          timerRef.current = setTimeout(() => {
            onComplete(result);
          }, 1400);
        }, 1000);
      }, 900);
    }
  }

  function getOrderLabel(idx: number) {
    const s = selected.find((x) => x.idx === idx);
    return s !== undefined ? positionLabels[s.order] : null;
  }

  const cardW = 80;
  const cardH = 114;

  return (
    <div
      ref={containerRef}
      className="relative mx-auto overflow-hidden"
      style={{ height: "520px", maxWidth: "480px", touchAction: "none" }}
    >
      {/* Hint */}
      <div className="absolute top-3 left-0 right-0 text-center z-20 pointer-events-none">
        {phase === "entering" && (
          <p className="text-[#8a80a0]/50 text-xs tracking-[0.25em] animate-pulse">✦ 命运之轮正在转动 ✦</p>
        )}
        {phase === "selecting" && selected.length === 0 && (
          <p className="text-[#8a80a0]/70 text-xs tracking-wide">命运之轮转动不止，选出三张属于你的牌</p>
        )}
        {phase === "selecting" && selected.length === 1 && (
          <p className="text-[#d4a853]/80 text-xs tracking-wide animate-fade-in">第二张 · 代表「现在」</p>
        )}
        {phase === "selecting" && selected.length === 2 && (
          <p className="text-[#d4a853]/80 text-xs tracking-wide animate-fade-in">最后一张 · 代表「未来」</p>
        )}
        {phase === "gathering" && (
          <p className="text-[#d4a853] text-xs tracking-[0.2em] animate-fade-in">三张牌正在汇聚...</p>
        )}
        {phase === "revealing" && (
          <p className="text-[#d4a853] text-xs tracking-[0.15em] animate-fade-in">命运正在显现</p>
        )}
        {phase === "done" && (
          <p className="text-[#d4a853]/60 text-xs tracking-[0.15em]">牌面已为你展开</p>
        )}
      </div>

      {/* Cards on ring */}
      {cards.map((card, i) => {
        const pos = getCardPos(i);
        const isSelected = selected.some((s) => s.idx === i);
        const label = getOrderLabel(i);
        const selEntry = selected.find((s) => s.idx === i);
        const isRevealing = phase === "revealing" && isSelected;
        const isGathering = phase === "gathering" && isSelected;
        const target = selEntry ? gatherTargets[selEntry.order] : null;

        // Only render cards that are in or near the visible area
        const inView = pos.y > -100 && pos.y < dimensions.h + 120;

        let tx = pos.x;
        let ty = pos.y;
        let sc = 1;
        let z = 20 + i;
        let opacity = phase === "entering" ? 0 : 1;

        // Opacity fade near edges of visible area
        if (phase !== "gathering" && phase !== "revealing" && phase !== "done") {
          const topFade = Math.max(0, Math.min(1, pos.y / 120));
          const bottomFade = Math.max(0, Math.min(1, (dimensions.h - pos.y) / 120));
          opacity *= Math.min(topFade, bottomFade);
          if (pos.y < -40 || pos.y > dimensions.h + 80) opacity = 0;
        }

        if ((isGathering || phase === "revealing" || phase === "done") && target) {
          tx = target.x;
          ty = target.y;
          sc = 1.08;
          z = 100;
          opacity = 1;
        }

        if (phase === "done" && !isSelected) {
          opacity = 0;
        }

        const useTransition = isGathering || phase === "revealing" || phase === "done";

        return (
          <div
            key={card.id}
            className="absolute"
            style={{
              width: cardW,
              height: cardH,
              left: 0,
              top: 0,
              marginLeft: -cardW / 2,
              marginTop: -cardH / 2,
              transform: `translate(${tx}px, ${ty}px) rotate(${isGathering || phase === "revealing" || phase === "done" ? (target?.rot ?? 0) : 0}deg) scale(${sc})`,
              transformOrigin: "center center",
              transition: useTransition
                ? "transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s"
                : "opacity 0.3s",
              opacity,
              zIndex: isSelected ? 100 : z,
              pointerEvents: phase === "selecting" ? "auto" : isSelected ? "auto" : "none",
            }}
          >
            {/* Position label */}
            {label && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.15em] font-serif text-[#d4a853] whitespace-nowrap">
                {label}
              </div>
            )}

            <button
              onClick={() => handleTap(i)}
              disabled={phase !== "selecting" || isSelected}
              className={`
                relative w-full h-full rounded-lg
                bg-gradient-to-br from-[#1a1040] via-[#221550] to-[#160d35]
                border outline-none select-none cursor-pointer
                transition-all duration-500 ease-out
                ${isRevealing
                  ? "!border-[#d4a853] !border-2 !shadow-[0_0_40px_rgba(212,168,83,0.55),0_0_80px_rgba(212,168,83,0.15)] scale-110"
                  : isSelected || isGathering
                    ? "!border-[#d4a853]/50 !border !shadow-[0_0_22px_rgba(212,168,83,0.3),0_0_48px_rgba(200,150,70,0.12)]"
                    : phase === "selecting"
                      ? "border-[#2a1850]/80 hover:border-[#d4a853]/50 hover:shadow-[0_0_24px_rgba(212,168,83,0.28),0_0_48px_rgba(200,150,60,0.1)] shadow-md shadow-purple-900/8"
                      : "border-[#2a1850]/80 shadow-md shadow-purple-900/8"
                }
              `}
              aria-label="牌背"
            >
              <div
                className={`absolute inset-1.5 rounded-md border border-[#3a2a60]/50 flex items-center justify-center transition-opacity duration-500 ${
                  isRevealing ? "opacity-0" : "opacity-100"
                }`}
              >
                <svg viewBox="0 0 30 30" className="w-10 h-10 text-[#d4a853]/12">
                  <polygon
                    points="15,1 19,11 30,11 22,18 25,28 15,22 5,28 8,18 0,11 11,11"
                    fill="currentColor"
                  />
                  <circle cx="15" cy="15" r="13" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.5" />
                </svg>
              </div>

              {isRevealing && (
                <div className="absolute inset-1.5 rounded-md flex flex-col items-center justify-center animate-fade-in">
                  <span className="text-[#d4a853] text-[10px] font-serif font-bold text-center leading-tight px-0.5">
                    {card.name}
                  </span>
                </div>
              )}
            </button>

            {isSelected && !isRevealing && (
              <div
                className="absolute -inset-2 rounded-xl pointer-events-none animate-breath-glow"
                style={{
                  background: "radial-gradient(ellipse at center, rgba(212,168,83,0.12) 0%, rgba(200,150,70,0.04) 40%, transparent 70%)",
                }}
              />
            )}
          </div>
        );
      })}

      {/* Selection dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {[0, 1, 2].map((n) => (
          <div
            key={n}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
              n < selected.length
                ? "bg-[#d4a853] shadow-[0_0_12px_rgba(212,168,83,0.6)] scale-110"
                : "bg-[#3a2a60]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
