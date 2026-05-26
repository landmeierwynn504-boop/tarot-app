"use client";

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/`(.+?)`/g, "$1")
    .replace(/~~(.+?)~~/g, "$1");
}

interface ReadingTextProps {
  text: string;
  loading: boolean;
}

export default function ReadingText({ text, loading }: ReadingTextProps) {
  if (loading) {
    return (
      <section className="py-6 px-1">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-px bg-[#d4a853]/20" />
          <span className="text-[#d4a853]/70 text-xs tracking-[0.15em] font-serif">
            灵熙正在为你解读
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-[#d4a853]/20 to-transparent" />
        </div>

        {/* Skeleton card */}
        <div className="rounded-2xl border border-[#2a1a50]/60 bg-[#0f0a1e]/60 p-6 space-y-3">
          <div className="h-3 rounded-full bg-[#d4a853]/8 animate-pulse" style={{ width: "85%" }} />
          <div className="h-3 rounded-full bg-[#d4a853]/8 animate-pulse" style={{ width: "70%", animationDelay: "0.15s" }} />
          <div className="h-3 rounded-full bg-[#d4a853]/8 animate-pulse" style={{ width: "78%", animationDelay: "0.3s" }} />
          <div className="h-3 rounded-full bg-[#d4a853]/5 animate-pulse" style={{ width: "60%", animationDelay: "0.45s" }} />
          <div className="h-3 rounded-full bg-[#d4a853]/5 animate-pulse" style={{ width: "72%", animationDelay: "0.6s" }} />
          <div className="h-3 rounded-full bg-[#d4a853]/5 animate-pulse" style={{ width: "45%", animationDelay: "0.75s" }} />
        </div>

        <p className="text-center text-[#5a4a78] text-[11px] mt-5 tracking-wide font-sans">
          每张牌都是宇宙独特的回应，正在为你生成专属解读
        </p>
      </section>
    );
  }

  if (!text) return null;

  const cleanText = stripMarkdown(text);

  const paragraphs = cleanText.split(/\n\n+/).filter((s) => s.trim());
  if (paragraphs.length === 0) return null;

  return (
    <section className="py-6 px-1">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[#d4a853]/40 text-base font-serif">✦</span>
        <span className="text-[#d4a853]/85 text-xs tracking-[0.12em] font-serif">
          灵熙的解读
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#d4a853]/20 to-transparent" />
      </div>

      {/* Reading card */}
      <div className="relative rounded-2xl border border-[#2a1a50]/50 bg-gradient-to-b from-[#0f0a1e]/80 to-[#0a0612]/60 overflow-hidden">
        {/* Gold corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#d4a853]/20 rounded-tl" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#d4a853]/20 rounded-tr" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#d4a853]/20 rounded-bl" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#d4a853]/20 rounded-br" />

        <div className="px-6 py-6 space-y-5">
          {paragraphs.map((para, i) => {
            const isFirst = i === 0;
            const isLast = i === paragraphs.length - 1;
            return (
              <div key={i}>
                {isFirst && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#d4a853]/10" />
                    <span className="text-[#d4a853]/30 text-[9px] tracking-[0.2em] font-serif">
                      牌 面 启 示
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d4a853]/10" />
                  </div>
                )}
                <p
                  className="text-[#d0c6e8]/90 leading-[2] text-[14px] font-sans tracking-[0.02em] animate-fade-up"
                  style={{ animationDelay: `${i * 0.25}s` }}
                >
                  {para.trim()}
                </p>
                {!isLast && (
                  <div className="mt-4 mb-1 flex justify-center">
                    <span className="text-[#d4a853]/10 text-[8px]">◇</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom decoration line */}
        <div className="h-px mx-6 bg-gradient-to-r from-[#d4a853]/10 via-[#d4a853]/5 to-[#d4a853]/10" />
        <div className="flex justify-center py-2">
          <span className="text-[#d4a853]/15 text-[8px]">✦</span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 text-center space-y-1">
        <p className="text-[#5a4a78] text-[11px] tracking-wide font-sans">
          以上解读由 AI 生成
        </p>
        <p className="text-[#4a3a68] text-[10px] tracking-wide font-sans">
          塔罗是自我探索的工具，你的选择永远掌握在自己手中
        </p>
      </div>
    </section>
  );
}
