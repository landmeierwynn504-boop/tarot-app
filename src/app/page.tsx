"use client";

import { useState, useCallback, useEffect } from "react";
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
  const [cardSelected, setCardSelected] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(99);
  const [hydrated, setHydrated] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    setRemaining(getRemainingReadings());
    setHydrated(true);
  }, []);

  const handleDraw = useCallback(() => {
    if (!useReading()) {
      setError("今日免费次数已用完，分享给朋友可再获一次解读");
      return;
    }
    setError("");
    const drawn = getRandomCards(3);
    setCards(drawn);
    setCardSelected(false);
    setShowDeck(true);
  }, []);

  const handleSelect = useCallback((card: TarotCard) => {
    setCardSelected(true);
    const isReversed = Math.random() > 0.5;
    const params = new URLSearchParams({
      cardId: String(card.id),
      question: question.trim(),
      isReversed: String(isReversed),
    });
    // Smooth transition: fade overlay then navigate
    setTransitioning(true);
    setTimeout(() => {
      router.push(`/reading?${params.toString()}`);
    }, 600);
  }, [question, router]);

  return (
    <main className="relative min-h-dvh flex flex-col">
      <MysticBg />

      <div className="relative z-10 flex-1 flex flex-col items-center px-4 py-8 max-w-lg mx-auto w-full">
        {/* Header */}
        <header
          className={`text-center mb-6 transition-all duration-700 ${showDeck ? "mt-0" : "mt-8"}`}
        >
          <h1 className="text-3xl sm:text-4xl font-serif text-[#d4a853] tracking-[0.15em] mb-1.5">
            灵 熙 塔 罗
          </h1>
          <p className="text-[#8a80a0] text-sm tracking-wide">
            {showDeck ? "静心感受，选出吸引你的那张牌" : "闭上眼睛，深呼吸，然后问出你的问题"}
          </p>
        </header>

        {!showDeck ? (
          <div className="w-full space-y-5 animate-fade-up">
            <div className="relative">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="默念你想问的问题，或留空测今日运势..."
                rows={3}
                maxLength={200}
                className="w-full bg-[#120c1f]/80 border border-[#3a2a60] rounded-xl p-4 text-[#e8e0f0] placeholder-[#6a6090] text-sm resize-none focus:outline-none focus:border-[#d4a853]/50 focus:ring-1 focus:ring-[#d4a853]/30 transition-all"
              />
              <span className="absolute bottom-3 right-3 text-[#4a3a70] text-xs">
                {question.length}/200
              </span>
            </div>

            <button
              onClick={handleDraw}
              disabled={hydrated && remaining <= 0}
              className={`
                w-full py-4 rounded-xl text-base font-medium
                transition-all duration-300
                ${!hydrated || remaining > 0
                  ? "bg-gradient-to-r from-[#d4a853] to-[#c49a40] text-[#0a0612] hover:shadow-lg hover:shadow-[#d4a853]/20 active:scale-[0.98]"
                  : "bg-[#2a1a50] text-[#6a6090] cursor-not-allowed"
                }
              `}
            >
              {!hydrated ? "开 始 抽 牌" : remaining > 0 ? "开 始 抽 牌" : "今日次数已用完"}
            </button>

            <div className="text-center">
              <span className="text-[#6a6090] text-xs tracking-wide">
                今日剩余{" "}
                <span className="text-[#d4a853] font-medium">
                  {!hydrated ? 99 : remaining}
                </span>{" "}
                次免费解读
              </span>
              {hydrated && remaining <= 0 && (
                <p className="text-[#8a80a0] text-xs mt-1">
                  分享给朋友可额外获得一次解读机会
                </p>
              )}
            </div>

            {error && (
              <p className="text-[#ef9944] text-xs text-center animate-fade-in">{error}</p>
            )}
          </div>
        ) : (
          <div className="w-full animate-fade-in">
            {/* Question reminder */}
            {question.trim() && !cardSelected && (
              <p className="text-center text-[#8a80a0]/70 text-xs mb-6 tracking-wide">
                你问的是：「{question.trim()}」
              </p>
            )}
            {cardSelected && (
              <p className="text-center text-[#d4a853]/80 text-xs mb-6 animate-fade-in tracking-widest">
                ✦ 命运之牌正在为你显现 ✦
              </p>
            )}

            <CardDeck cards={cards} onSelect={handleSelect} />
          </div>
        )}

        {/* Transition overlay */}
        {transitioning && (
          <div className="fixed inset-0 z-50 bg-[#07040f]/95 animate-fade-in flex flex-col items-center justify-center gap-4">
            <span className="text-4xl font-serif text-[#d4a853]/40 animate-soft-float">✦</span>
            <p className="text-[#d4a853]/60 text-sm tracking-[0.2em] font-serif">
              命运之牌正在为你显现
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-auto pt-12 pb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="w-6 h-px bg-[#3a2a60]" />
            <span className="text-[#4a3a70] text-[10px] tracking-widest">心灵探索工具</span>
            <span className="w-6 h-px bg-[#3a2a60]" />
          </div>
          <p className="text-[#4a3a70] text-[10px]">
            以上解读由 AI 生成，仅供参考
          </p>
        </footer>
      </div>
    </main>
  );
}
