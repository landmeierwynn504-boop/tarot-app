import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";
import { getCardById } from "@/lib/tarot-data";
import { buildReadingPrompt, buildThreeCardReadingPrompt } from "@/lib/prompt";
import type { TarotCard } from "@/lib/tarot-data";

const rateMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 10;
const WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) return false;
  entry.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateMap) {
    if (now > entry.resetAt) rateMap.delete(ip);
  }
}, 300_000);

interface CardInput {
  cardId: number;
  isReversed: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "请求过于频繁，请稍后再试" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { cards, question } = body as {
      cards?: CardInput[];
      cardId?: number;
      question: string;
      isReversed?: boolean;
    };

    const safeQuestion = typeof question === "string" ? question.slice(0, 200) : "";

    // Three-card spread
    if (cards && Array.isArray(cards) && cards.length === 3) {
      const resolved: { card: TarotCard; isReversed: boolean }[] = [];
      for (const c of cards) {
        const card = getCardById(c.cardId);
        if (!card) {
          return NextResponse.json({ success: false, error: "无效的牌面" }, { status: 400 });
        }
        resolved.push({ card, isReversed: c.isReversed });
      }

      const prompt = buildThreeCardReadingPrompt(resolved, safeQuestion);
      const reading = await chat(prompt, [{ role: "user", content: "请开始解读" }]);

      return NextResponse.json({
        success: true,
        data: {
          reading,
          cards: resolved.map((r) => ({
            id: r.card.id,
            name: r.card.name,
            nameEn: r.card.nameEn,
            keywords: r.card.keywords,
            isReversed: r.isReversed,
          })),
        },
      });
    }

    // Single card (backward compatible)
    const { cardId, isReversed } = body as {
      cardId: number;
      isReversed: boolean;
    };

    if (typeof cardId !== "number") {
      return NextResponse.json(
        { success: false, error: "缺少牌面信息" },
        { status: 400 }
      );
    }

    const card = getCardById(cardId);
    if (!card) {
      return NextResponse.json({ success: false, error: "无效的牌面" }, { status: 400 });
    }

    const prompt = buildReadingPrompt(card, safeQuestion, isReversed);
    const reading = await chat(prompt, [{ role: "user", content: "请开始解读" }]);

    return NextResponse.json({
      success: true,
      data: {
        reading,
        cards: [{ id: card.id, name: card.name, nameEn: card.nameEn, keywords: card.keywords, isReversed }],
      },
    });
  } catch (error: unknown) {
    console.error("[reading] AI解读失败:", error);
    return NextResponse.json(
      { success: false, error: "解读服务暂时不可用，请稍后再试" },
      { status: 500 }
    );
  }
}
