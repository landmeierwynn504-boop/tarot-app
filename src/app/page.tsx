"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import MysticBg from "@/components/MysticBg";
import CardDeck from "@/components/CardDeck";
import { getRandomCards } from "@/lib/tarot-data";
import { getRemainingReadings, useReading } from "@/lib/storage";
import type { TarotCard } from "@/lib/tarot-data";

export default function HomePage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [showDeck, setShowDeck] = useState(false);
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(99);
  const [hydrated, setHydrated] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const loadingCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setRemaining(getRemainingReadings());
    setHydrated(true);
  }, []);

  // Loading screen meteor animation
  useEffect(() => {
    if (!transitioning) return;

    const canvas = loadingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface LoadingMeteor {
      x: number; y: number;
      vx: number; vy: number;
      len: number;
      hue: number;
      alpha: number;
      life: number;
      maxLife: number;
    }

    const meteors: LoadingMeteor[] = [];
    let animId: number;
    let spawnTimer = 0;

    const cw = canvas.width;
    const ch = canvas.height;

    function spawn() {
      // Start from random off-screen edge
      let x: number, y: number;
      const edge = Math.random();
      if (edge < 0.5) {
        // From left or top edge
        x = edge < 0.25 ? -30 : Math.random() * cw;
        y = edge < 0.25 ? Math.random() * ch * 0.5 : -30;
      } else {
        // From right edge
        x = cw + 30;
        y = Math.random() * ch * 0.6;
      }

      const angle = Math.random() * 0.5 + 0.3; // 17°–46° downward
      const spd = Math.random() * 3 + 5;
      const isGold = Math.random() < 0.55;
      meteors.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        len: Math.random() * 160 + 100,
        hue: isGold ? Math.random() * 14 + 42 : Math.random() * 18 + 202,
        alpha: Math.random() * 0.25 + 0.75,
        life: 0,
        maxLife: Math.random() * 140 + 100,
      });
    }

    function draw() {
      spawnTimer++;
      // Spawn randomly every ~0.8-3s
      if (spawnTimer > Math.random() * 50 + 18 && meteors.length < 6) {
        spawn();
        spawnTimer = 0;
      }

      ctx!.clearRect(0, 0, cw, ch);

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life++;

        const progress = m.life / m.maxLife;
        const fade = progress < 0.15
          ? progress / 0.15
          : 1 - (progress - 0.15) / 0.85;
        const alpha = m.alpha * fade;

        if (alpha <= 0.01 || m.x > cw + 80 || m.y > ch + 80 || m.x < -80) {
          meteors.splice(i, 1);
          continue;
        }

        const tailX = m.x - m.vx * m.len * 0.013;
        const tailY = m.y - m.vy * m.len * 0.013;

        // Outer glow trail
        const grad = ctx!.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, `hsla(${m.hue}, 70%, 78%, ${alpha})`);
        grad.addColorStop(0.12, `hsla(${m.hue}, 60%, 60%, ${alpha * 0.65})`);
        grad.addColorStop(0.45, `hsla(${m.hue}, 40%, 38%, ${alpha * 0.2})`);
        grad.addColorStop(1, `hsla(${m.hue}, 20%, 20%, 0)`);

        ctx!.beginPath();
        ctx!.moveTo(m.x, m.y);
        ctx!.lineTo(tailX, tailY);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.8;
        ctx!.stroke();

        // Bright core
        const coreGrad = ctx!.createLinearGradient(m.x, m.y, tailX, tailY);
        coreGrad.addColorStop(0, `hsla(${m.hue}, 80%, 90%, ${alpha})`);
        coreGrad.addColorStop(0.25, `hsla(${m.hue}, 65%, 65%, ${alpha * 0.35})`);
        coreGrad.addColorStop(1, `hsla(${m.hue}, 30%, 30%, 0)`);

        ctx!.beginPath();
        ctx!.moveTo(m.x, m.y);
        ctx!.lineTo(tailX, tailY);
        ctx!.strokeStyle = coreGrad;
        ctx!.lineWidth = 0.6;
        ctx!.stroke();

        // Head glow
        ctx!.beginPath();
        ctx!.arc(m.x, m.y, 2.5, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${m.hue}, 80%, 88%, ${alpha})`;
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(m.x, m.y, 6, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${m.hue}, 65%, 60%, ${alpha * 0.22})`;
        ctx!.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    // Seed 1-2 initial meteors
    for (let i = 0; i < 2; i++) {
      const m: LoadingMeteor = (() => {
        const x = Math.random() * cw * 0.7;
        const y = Math.random() * ch * 0.3 - 20;
        const angle = Math.random() * 0.5 + 0.3;
        const spd = Math.random() * 3 + 5;
        const isGold = Math.random() < 0.55;
        return {
          x, y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          len: Math.random() * 160 + 100,
          hue: isGold ? Math.random() * 14 + 42 : Math.random() * 18 + 202,
          alpha: Math.random() * 0.25 + 0.75,
          life: Math.floor(Math.random() * 80),
          maxLife: Math.random() * 140 + 100,
        };
      })();
      meteors.push(m);
    }

    draw();

    return () => cancelAnimationFrame(animId);
  }, [transitioning]);

  const handleDraw = useCallback(() => {
    if (!useReading()) {
      setError("今日免费次数已用完，分享给朋友可再获一次解读");
      return;
    }
    setError("");
    const drawn = getRandomCards(42);
    setCards(drawn);
    setShowDeck(true);
  }, []);

  const handleComplete = useCallback(
    async (selected: { card: TarotCard; isReversed: boolean }[]) => {
      setTransitioning(true);
      setLoadingText("星象正在排列...");

      const params = new URLSearchParams();
      params.set("cards", selected.map((s) => s.card.id).join(","));
      params.set("reversed", selected.map((s) => (s.isReversed ? "1" : "0")).join(","));
      params.set("question", question.trim());

      // Cycle loading text
      const texts = ["星象正在排列...", "牌面正在解读...", "命运正在编织...", "即将揭示..."];
      let idx = 0;
      const textInterval = setInterval(() => {
        idx = (idx + 1) % texts.length;
        setLoadingText(texts[idx]);
      }, 1800);

      try {
        const body: Record<string, unknown> = {
          cards: selected.map((s) => ({ cardId: s.card.id, isReversed: s.isReversed })),
          question: question.trim(),
        };
        const res = await fetch("/api/reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
          sessionStorage.setItem("tarot-reading", JSON.stringify(data.data));
        }
      } catch {
        // Fall back to API call on reading page
      }

      clearInterval(textInterval);
      router.push(`/reading?${params.toString()}`);
    },
    [question, router]
  );

  return (
    <main className="relative min-h-dvh flex flex-col">
      <MysticBg />

      <div className="relative z-10 flex-1 flex flex-col items-center px-4 py-6 max-w-lg mx-auto w-full">
        {/* Header — ritual entrance */}
        <header
          className={`text-center transition-all duration-1000 ${showDeck ? "mt-0 mb-4" : "mt-4 mb-6"}`}
        >
          {/* Mystical symbol — celestical geometric */}
          {!showDeck && (
            <div className="flex justify-center mb-4 animate-ritual-rise" style={{ animationDelay: "0.1s" }}>
              <svg
                viewBox="0 0 80 80"
                className="w-14 h-14 sm:w-16 sm:h-16 opacity-70"
                style={{ animation: "symbol-spin 60s linear infinite" }}
              >
                {/* Outer ring */}
                <circle cx="40" cy="40" r="37" fill="none" stroke="rgba(180,140,60,0.2)" strokeWidth="0.5" />
                <circle cx="40" cy="40" r="33" fill="none" stroke="rgba(180,140,60,0.12)" strokeWidth="0.3" />
                {/* Compass/star geometry */}
                {[0, 45, 90, 135].map((deg) => (
                  <line
                    key={deg}
                    x1="40" y1="8" x2="40" y2="72"
                    stroke="rgba(180,140,60,0.15)"
                    strokeWidth="0.3"
                    transform={`rotate(${deg} 40 40)`}
                  />
                ))}
                {/* Inner star */}
                <polygon
                  points="40,12 46,32 68,32 51,44 58,64 40,52 22,64 29,44 12,32 34,32"
                  fill="none"
                  stroke="rgba(212,168,83,0.3)"
                  strokeWidth="0.6"
                />
                {/* Center dot */}
                <circle cx="40" cy="40" r="2.5" fill="rgba(212,168,83,0.5)" />
                {/* Orbiting dot */}
                <circle cx="40" cy="40" r="1.2" fill="rgba(212,168,83,0.6)">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 40 40"
                    to="360 40 40"
                    dur="12s"
                    repeatCount="indefinite"
                  />
                  <animate attributeName="cx" values="40;40;40" dur="12s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="8;8;8" dur="12s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          )}

          {/* Title */}
          <h1
            className={`font-serif tracking-[0.2em] mb-2 animate-ritual-fade ${
              showDeck ? "text-2xl" : "text-4xl sm:text-5xl"
            }`}
            style={{
              background: "linear-gradient(180deg, #e8c870 0%, #c49a40 40%, #8b6914 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 60px rgba(212,168,83,0.3)",
            }}
          >
            {showDeck ? "灵 熙 塔 罗" : "灵  熙  塔  罗"}
          </h1>

          {/* Subtitle */}
          <p
            className="text-[#7a6ea0] text-sm tracking-[0.12em] animate-ritual-rise"
            style={{ animationDelay: "0.5s" }}
          >
            {showDeck
              ? "凭直觉，选出三张属于你的牌"
              : "闭眼 · 深呼吸 · 问出你的问题"}
          </p>
        </header>

        {!showDeck ? (
          <div className="w-full space-y-6 ritual-entrance">
            {/* Oracle Divider */}
            <div className="flex items-center gap-3" style={{ animationDelay: "0.15s" }}>
              <span className="flex-1 h-px bg-gradient-to-r from-transparent via-[#3a2a60] to-transparent animate-line-extend" />
              <span className="text-[#4a3a70] text-[10px] tracking-[0.3em] whitespace-nowrap">
                ✦ 灵 魂 之 镜 ✦
              </span>
              <span className="flex-1 h-px bg-gradient-to-r from-transparent via-[#3a2a60] to-transparent animate-line-extend" />
            </div>

            {/* Input portal */}
            <div
              className="relative animate-breath-glow rounded-2xl"
              style={{ animationDelay: "0.35s" }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#d4a853]/5 to-transparent pointer-events-none" />
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="默念你想问的问题，或留空测今日运势..."
                rows={3}
                maxLength={200}
                className="w-full bg-[#0d0820]/90 border border-[#2a1a55] rounded-2xl p-5 pb-9 text-[#e0d8f0] placeholder-[#5a4a80] text-sm resize-none focus:outline-none focus:border-[#d4a853]/40 focus:ring-1 focus:ring-[#d4a853]/20 transition-all duration-500 animate-border-glow"
              />
              <span className="absolute bottom-4 right-4 text-[#3a2a60] text-xs tracking-wide">
                {question.length}/200
              </span>
            </div>

            {/* Draw button */}
            <button
              onClick={handleDraw}
              disabled={!hydrated || remaining <= 0 || question.trim() === ""}
              className="relative w-full group" style={{ animationDelay: "0.55s" }}
            >
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-2xl bg-[#d4a853]/10 blur-xl group-hover:bg-[#d4a853]/20 transition-all duration-700" />
              <div
                className={`
                  relative w-full py-4 rounded-2xl text-base font-medium tracking-[0.2em]
                  transition-all duration-500
                  ${hydrated && remaining > 0 && question.trim() !== ""
                    ? "bg-gradient-to-b from-[rgba(212,168,83,0.2)] to-[rgba(180,130,50,0.1)] border border-[#d4a853]/25 text-[#d4a853] hover:text-[#e8d890] hover:border-[#d4a853]/50 hover:shadow-[0_0_40px_rgba(212,168,83,0.15)] active:scale-[0.98]"
                    : "bg-[#1a1035] border border-[#2a1a55] text-[#5a4a80] cursor-not-allowed"
                  }
                `}
              >
                {/* Inner shimmer */}
                {(!hydrated || remaining > 0) && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                      style={{
                        background: "linear-gradient(90deg, transparent 0%, rgba(212,168,83,0.08) 30%, rgba(255,220,150,0.12) 50%, rgba(212,168,83,0.08) 70%, transparent 100%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 3s ease-in-out infinite",
                      }}
                    />
                  </div>
                )}
                <span className="relative z-10">
                  {!hydrated
                    ? "开  始  抽  牌"
                    : question.trim() === ""
                      ? "先写下你的问题"
                      : remaining > 0
                        ? "开  始  抽  牌"
                        : "今日次数已用完"}
                </span>
              </div>
            </button>

            {/* Remaining */}
            <div className="text-center" style={{ animationDelay: "0.75s" }}>
              <span className="text-[#4a3a70] text-xs tracking-[0.15em]">
                今日剩余{" "}
                <span className="text-[#b8943a] font-medium">
                  {!hydrated ? 99 : remaining}
                </span>{" "}
                次免费解读
              </span>
              {hydrated && remaining <= 0 && (
                <p className="text-[#6a5a90] text-xs mt-1.5 tracking-wide">
                  分享给朋友可额外获得一次解读机会
                </p>
              )}
            </div>

            {error && (
              <p className="text-[#e8945a] text-xs text-center animate-fade-in tracking-wide">
                {error}
              </p>
            )}
          </div>
        ) : (
          <div className="w-full animate-fade-in">
            {question.trim() && (
              <p className="text-center text-[#7a6ea0]/60 text-xs mb-6 tracking-wide">
                你问的是：「{question.trim()}」
              </p>
            )}

            <CardDeck cards={cards} onComplete={handleComplete} />
          </div>
        )}

        {/* Transition / Loading overlay */}
        {transitioning && (
          <div className="fixed inset-0 z-50 bg-[#07040f]/95 animate-fade-in flex flex-col items-center justify-center gap-8">
            {/* Meteor comets canvas */}
            <canvas ref={loadingCanvasRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />

            {/* Animated mystic symbol */}
            <div className="relative w-20 h-20">
              {/* Outer rotating ring */}
              <div className="absolute inset-0 rounded-full border border-[#d4a853]/15 animate-breath-glow" />
              {/* Inner rotating star */}
              <svg
                viewBox="0 0 80 80"
                className="absolute inset-0 w-full h-full"
                style={{ animation: "symbol-spin 8s linear infinite" }}
              >
                <polygon
                  points="40,12 46,32 68,32 51,44 58,64 40,52 22,64 29,44 12,32 34,32"
                  fill="none"
                  stroke="rgba(212,168,83,0.25)"
                  strokeWidth="0.6"
                />
                <circle cx="40" cy="40" r="2.5" fill="rgba(212,168,83,0.4)" />
              </svg>
              {/* Center pulsing dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#d4a853]/40 animate-pulse" />
              </div>
            </div>

            {/* Cycling text */}
            <p
              className="text-[#d4a853]/55 text-sm tracking-[0.2em] font-serif transition-all duration-500"
              key={loadingText}
            >
              {loadingText}
            </p>

            {/* Subtle dots animation */}
            <div className="flex gap-2">
              {[0, 1, 2].map((n) => (
                <div
                  key={n}
                  className="w-1.5 h-1.5 rounded-full bg-[#d4a853]/30"
                  style={{ animation: `fade-in 1s ease-in-out ${n * 0.3}s infinite alternate` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-auto pt-10 pb-6 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <span className="w-8 h-px bg-gradient-to-r from-transparent to-[#2a1a55]" />
            <span className="text-[#3a2a60] text-[10px] tracking-[0.25em]">心灵探索工具</span>
            <span className="w-8 h-px bg-gradient-to-l from-transparent to-[#2a1a55]" />
          </div>
          <p className="text-[#2a1a60] text-[10px] tracking-wide">
            以上解读由 AI 生成，仅供参考
          </p>
        </footer>
      </div>
    </main>
  );
}
