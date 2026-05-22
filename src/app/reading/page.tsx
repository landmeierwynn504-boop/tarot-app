"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MysticBg from "@/components/MysticBg";
import CardReveal from "@/components/CardReveal";
import ReadingText from "@/components/ReadingText";
import SharePoster from "@/components/SharePoster";
import { getCardById } from "@/lib/tarot-data";
import { saveLastReading } from "@/lib/storage";
import type { TarotCard } from "@/lib/tarot-data";

function ReadingContent() {
  const searchParams = useSearchParams();
  const cardId = parseInt(searchParams.get("cardId") || "0", 10);
  const question = searchParams.get("question") || "";
  const isReversed = searchParams.get("isReversed") === "true";

  const [card, setCard] = useState<TarotCard | null>(null);
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const found = getCardById(cardId);
    if (!found) {
      setError("牌面信息已过期，请重新抽牌");
      setLoading(false);
      return;
    }
    setCard(found);

    async function fetchReading() {
      try {
        const res = await fetch("/api/reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cardId: found!.id,
            question,
            isReversed,
          }),
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "解读失败");
        }

        setReading(data.data.reading);
        saveLastReading({
          cardId: found!.id,
          cardName: found!.name,
          isReversed,
          question,
          reading: data.data.reading,
          timestamp: Date.now(),
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "网络异常，请稍后重试";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    fetchReading();
  }, [cardId, question, isReversed]);

  // --- Error / Loading (no card) ---
  if (!card) {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center min-h-dvh px-6 text-center">
        {error ? (
          <div className="animate-fade-up space-y-5">
            <span className="text-5xl font-serif text-[#d4a853]/30">✦</span>
            <p className="text-[#8a7ea8] text-sm tracking-wide">{error}</p>
            <Link
              href="/"
              className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#c49a40] text-[#0a0612] text-sm font-medium tracking-wide hover:shadow-lg hover:shadow-[#d4a853]/15 transition-all"
            >
              重 新 抽 牌
            </Link>
          </div>
        ) : (
          <p className="text-[#8a7ea8] text-sm tracking-wide animate-pulse">加载中...</p>
        )}
      </div>
    );
  }

  return (
    <div className="relative z-10 px-5 py-6 max-w-lg mx-auto w-full">
      {/* === Top Nav === */}
      <nav className="flex items-center justify-between mb-2 animate-fade-in">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#8a7ea8]/70 hover:text-[#d4a853] transition-colors text-sm font-sans tracking-wide"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          重新抽牌
        </Link>
        <span className="text-[#4a3a70] text-[10px] tracking-[0.15em] font-serif">
          灵 熙 塔 罗
        </span>
      </nav>

      {/* === Card Reveal Section === */}
      <CardReveal card={card} isReversed={isReversed} />

      {/* === Reading or Error === */}
      {error ? (
        <div className="text-center py-10 animate-fade-up">
          <span className="text-3xl font-serif text-[#d4a853]/20 mb-4 block">✦</span>
          <p className="text-[#ef4444]/70 text-sm mb-6 tracking-wide">{error}</p>
          <Link
            href="/"
            className="inline-block px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#c49a40] text-[#0a0612] text-sm font-medium tracking-wide"
          >
            重新抽牌
          </Link>
        </div>
      ) : (
        <>
          {/* Gold separator before reading */}
          <div className="flex items-center gap-4 my-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4a853]/15 to-[#d4a853]/10" />
            <span className="text-[#d4a853]/15 text-[10px] tracking-[0.2em] font-sans">
              解 读
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#d4a853]/15 to-[#d4a853]/10" />
          </div>

          {/* Reading Text */}
          <ReadingText text={reading} loading={loading} />

          {/* === Share Section === */}
          {!loading && reading && (
            <section className="mt-10 mb-16 animate-fade-up">
              {/* Gold accent top */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-8 h-px bg-[#d4a853]/15" />
                <span className="text-[#8a7ea8]/50 text-[10px] tracking-[0.2em] font-sans">
                  分 享 你 的 运 势
                </span>
                <div className="w-8 h-px bg-[#d4a853]/15" />
              </div>

              <SharePoster
                cardName={card.name}
                cardNameEn={card.nameEn}
                summary={reading.slice(0, 50).replace(/\n/g, " ")}
              />
            </section>
          )}
        </>
      )}

      {/* === Question reminder === */}
      {question && (
        <div className="mt-4 p-4 rounded-xl bg-[#0f0a1e]/70 border border-[#1f1540] animate-fade-in">
          <p className="text-[#6a5a88] text-[10px] tracking-[0.15em] mb-1 font-sans">你 问 的 是</p>
          <p className="text-[#b8aed0] text-sm leading-relaxed font-sans">{question}</p>
        </div>
      )}
    </div>
  );
}

export default function ReadingPage() {
  return (
    <main className="relative min-h-dvh flex flex-col">
      <MysticBg />
      <Suspense
        fallback={
          <div className="relative z-10 flex items-center justify-center min-h-dvh">
            <p className="text-[#8a7ea8] text-sm tracking-wide animate-pulse">正在准备你的命运之牌...</p>
          </div>
        }
      >
        <ReadingContent />
      </Suspense>
    </main>
  );
}
