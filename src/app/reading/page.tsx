"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MysticBg from "@/components/MysticBg";
import ReadingText from "@/components/ReadingText";
import SharePoster from "@/components/SharePoster";
import CardDetailModal from "@/components/CardDetailModal";
import { getCardById } from "@/lib/tarot-data";
import { saveLastReading } from "@/lib/storage";
import { parseSections, type SectionedReading } from "@/lib/parse-reading";
import type { TarotCard } from "@/lib/tarot-data";

interface CardWithReversed {
  card: TarotCard;
  isReversed: boolean;
}

function ReadingContent() {
  const searchParams = useSearchParams();
  const cardsParam = searchParams.get("cards") || "";
  const reversedParam = searchParams.get("reversed") || "";
  const question = searchParams.get("question") || "";

  const cardIds = cardsParam.split(",").map(Number).filter((n) => !isNaN(n));
  const reversedFlags = reversedParam.split(",").map((s) => s === "1");

  const [cards, setCards] = useState<CardWithReversed[]>([]);
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sections, setSections] = useState<SectionedReading | null>(null);
  const [expandedCardIdx, setExpandedCardIdx] = useState<number | null>(null);

  useEffect(() => {
    const resolved: CardWithReversed[] = [];
    for (let i = 0; i < cardIds.length; i++) {
      const found = getCardById(cardIds[i]);
      if (!found) {
        setError("牌面信息已过期，请重新抽牌");
        setLoading(false);
        return;
      }
      resolved.push({ card: found, isReversed: reversedFlags[i] ?? false });
    }

    if (resolved.length === 0) {
      setError("牌面信息已过期，请重新抽牌");
      setLoading(false);
      return;
    }

    setCards(resolved);

    // Check for pre-fetched reading from home page
    const cached = sessionStorage.getItem("tarot-reading");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        sessionStorage.removeItem("tarot-reading");
        setReading(parsed.reading);
        setSections(parseSections(parsed.reading));
        saveLastReading({
          cardId: resolved[0].card.id,
          cardName: resolved.map((r) => r.card.name).join(" · "),
          isReversed: resolved[0].isReversed,
          question,
          reading: parsed.reading,
          timestamp: Date.now(),
        });
        setLoading(false);
        return;
      } catch { /* fall through to API call */ }
    }

    async function fetchReading() {
      try {
        const body: Record<string, unknown> = {
          question,
        };

        if (resolved.length === 1) {
          body.cardId = resolved[0].card.id;
          body.isReversed = resolved[0].isReversed;
        } else {
          body.cards = resolved.map((r) => ({
            cardId: r.card.id,
            isReversed: r.isReversed,
          }));
        }

        const res = await fetch("/api/reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "解读失败");
        }

        setReading(data.data.reading);
        setSections(parseSections(data.data.reading));
        saveLastReading({
          cardId: resolved[0].card.id,
          cardName: resolved.map((r) => r.card.name).join(" · "),
          isReversed: resolved[0].isReversed,
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
  }, [cardIds.join(","), reversedParam, question]);

  if (cards.length === 0) {
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

  const positionLabels = cards.length === 3 ? ["过去", "现在", "未来"] : [];

  return (
    <div className="relative z-10 px-5 py-6 max-w-lg mx-auto w-full">
      {/* Top Nav */}
      <nav className="flex items-center justify-between mb-4 animate-fade-in">
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

      {/* Three Cards Display — larger, clickable */}
      <section className="flex items-start justify-center gap-3 sm:gap-5 mb-6">
        {cards.map(({ card, isReversed }, i) => {
          const hasDetail = sections?.cardReadings[i]?.interpretation;
          return (
            <button
              key={card.id}
              onClick={() => { if (hasDetail) setExpandedCardIdx(i); }}
              disabled={!hasDetail}
              className="flex flex-col items-center gap-2 animate-fade-up group cursor-pointer outline-none"
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              {/* Position label */}
              <span className="text-[#d4a853]/60 text-[11px] tracking-[0.2em] font-serif">
                {positionLabels[i]}
              </span>
              {/* Card */}
              <div
                className={`relative w-[120px] h-[176px] sm:w-[130px] sm:h-[190px] rounded-xl border-2 overflow-hidden transition-all duration-500 group-hover:border-[#d4a853]/60 group-hover:shadow-[0_0_30px_rgba(212,168,83,0.2)] ${
                  isReversed ? "border-[#ef4444]/30" : "border-[#d4a853]/30"
                } bg-gradient-to-br from-[#0f0a1e] via-[#1a1038] to-[#0e081c] shadow-lg`}
              >
                <div className="flex flex-col items-center justify-center h-full p-3 text-center">
                  <span className="text-[#d4a853]/35 text-[10px] tracking-[0.1em] mb-2 font-serif">
                    {isReversed ? "逆位" : "正位"}
                  </span>
                  {/* Star symbol */}
                  <svg viewBox="0 0 30 30" className="w-7 h-7 text-[#d4a853]/10 mb-2">
                    <polygon points="15,1 19,11 30,11 22,18 25,28 15,22 5,28 8,18 0,11 11,11" fill="currentColor" />
                  </svg>
                  <span className="text-[#d4a853] text-sm sm:text-base font-serif font-medium leading-tight">
                    {card.name}
                  </span>
                  <span className="text-[#6a5a90]/50 text-[10px] mt-0.5">
                    {card.nameEn}
                  </span>
                </div>
                {/* Corner accents */}
                <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-[#d4a853]/15" />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#d4a853]/15" />
                <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-[#d4a853]/15" />
                <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-[#d4a853]/15" />

                {/* Click hint */}
                {hasDetail && (
                  <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-[#d4a853]/40 text-[9px] tracking-wide">点击查看详解</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </section>

      {/* Error */}
      {error && (
        <div className="text-center py-8 animate-fade-up">
          <span className="text-3xl font-serif text-[#d4a853]/20 mb-4 block">✦</span>
          <p className="text-[#ef4444]/70 text-sm mb-6 tracking-wide">{error}</p>
          <Link
            href="/"
            className="inline-block px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#c49a40] text-[#0a0612] text-sm font-medium tracking-wide"
          >
            重新抽牌
          </Link>
        </div>
      )}

      {/* Summary reading */}
      {!loading && !error && (
        <>
          {/* Separator */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4a853]/15 to-[#d4a853]/10" />
            <span className="text-[#d4a853]/15 text-[10px] tracking-[0.2em] font-sans">总 览</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#d4a853]/15 to-[#d4a853]/10" />
          </div>
          <ReadingText text={sections?.summary || reading} loading={false} />

          {/* Share Section */}
          {reading && (
            <section className="mt-10 mb-16 animate-fade-up">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-8 h-px bg-[#d4a853]/15" />
                <span className="text-[#8a7ea8]/50 text-[10px] tracking-[0.2em] font-sans">分 享 你 的 运 势</span>
                <div className="w-8 h-px bg-[#d4a853]/15" />
              </div>
              <SharePoster
                cardName={cards.map((c) => c.card.name).join(" · ")}
                cardNameEn={cards.map((c) => c.card.nameEn).join(" · ")}
                summary={(sections?.summary || reading).slice(0, 50).replace(/\n/g, " ")}
              />
            </section>
          )}
        </>
      )}

      {/* Card detail modal */}
      {expandedCardIdx !== null && cards[expandedCardIdx] && (
        <CardDetailModal
          card={cards[expandedCardIdx].card}
          isReversed={cards[expandedCardIdx].isReversed}
          position={["past", "present", "future"][expandedCardIdx] as "past" | "present" | "future"}
          positionLabel={positionLabels[expandedCardIdx] ?? ""}
          interpretation={sections?.cardReadings[expandedCardIdx]?.interpretation ?? ""}
          onClose={() => setExpandedCardIdx(null)}
        />
      )}

      {/* Question reminder */}
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
