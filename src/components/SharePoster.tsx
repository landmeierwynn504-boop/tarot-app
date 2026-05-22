"use client";

import { useRef, useState } from "react";
import { grantShareBonus } from "@/lib/storage";

interface SharePosterProps {
  cardName: string;
  cardNameEn: string;
  summary: string;
}

export default function SharePoster({ cardName, cardNameEn, summary }: SharePosterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shared, setShared] = useState(false);
  const [generating, setGenerating] = useState(false);

  function generatePoster() {
    setGenerating(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 400;
    const H = 640;
    canvas.width = W;
    canvas.height = H;

    // --- Background ---
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0c0820");
    bg.addColorStop(0.4, "#120c28");
    bg.addColorStop(1, "#070410");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle noise texture via dots
    for (let i = 0; i < 60; i++) {
      const dx = Math.random() * W;
      const dy = Math.random() * H;
      ctx.fillStyle = `rgba(212, 168, 83, ${Math.random() * 0.04})`;
      ctx.fillRect(dx, dy, 1, 1);
    }

    // --- Outer frame ---
    ctx.strokeStyle = "rgba(212, 168, 83, 0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // Inner frame
    ctx.strokeStyle = "rgba(212, 168, 83, 0.12)";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(28, 28, W - 56, H - 56);

    // Corner ornaments
    const corners = [
      { x: 20, y: 20, rx: 1, ry: 1 },
      { x: W - 20, y: 20, rx: -1, ry: 1 },
      { x: 20, y: H - 20, rx: 1, ry: -1 },
      { x: W - 20, y: H - 20, rx: -1, ry: -1 },
    ];
    corners.forEach(({ x, y, rx, ry }) => {
      ctx.strokeStyle = "rgba(212, 168, 83, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + 12 * ry);
      ctx.lineTo(x, y);
      ctx.lineTo(x + 12 * rx, y);
      ctx.stroke();

      ctx.fillStyle = "rgba(212, 168, 83, 0.2)";
      ctx.beginPath();
      ctx.arc(x + 3 * rx, y + 3 * ry, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // --- Brand header ---
    const cx = W / 2;

    // Hexagram / star symbol
    ctx.fillStyle = "rgba(212, 168, 83, 0.35)";
    ctx.font = "20px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦", cx, 68);

    // Brand name
    ctx.fillStyle = "#d4a853";
    ctx.font = "600 18px 'Noto Serif SC', serif";
    ctx.fillText("灵 熙 塔 罗", cx, 102);

    // Gold divider
    const divY = 125;
    ctx.strokeStyle = "rgba(212, 168, 83, 0.3)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - 50, divY);
    ctx.lineTo(cx - 14, divY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 14, divY);
    ctx.lineTo(cx + 50, divY);
    ctx.stroke();
    ctx.fillStyle = "rgba(212, 168, 83, 0.25)";
    ctx.font = "8px serif";
    ctx.fillText("◇", cx, divY);

    // --- Card info panel ---
    const panelY = 155;
    const panelH = 100;
    const panelX = 40;
    const panelW = W - 80;

    // Panel background
    ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 12);
    ctx.fill();

    ctx.strokeStyle = "rgba(212, 168, 83, 0.13)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 12);
    ctx.stroke();

    // Card name
    ctx.fillStyle = "#e8e2f0";
    ctx.font = "600 22px 'Noto Serif SC', serif";
    ctx.fillText(cardName, cx, panelY + 36);

    // Card name EN
    ctx.fillStyle = "#8a7ea8";
    ctx.font = "400 12px 'Noto Sans SC', sans-serif";
    ctx.fillText(cardNameEn, cx, panelY + 62);

    // Position badge
    ctx.fillStyle = "rgba(212, 168, 83, 0.08)";
    ctx.beginPath();
    ctx.roundRect(cx - 30, panelY + 74, 60, 20, 10);
    ctx.fill();
    ctx.fillStyle = "rgba(212, 168, 83, 0.5)";
    ctx.font = "9px 'Noto Sans SC', sans-serif";
    ctx.fillText("今日运势指引", cx, panelY + 88);

    // --- Quote section ---
    const quoteY = 290;
    const quoteMaxW = W - 100;

    // Quote marks
    ctx.fillStyle = "rgba(212, 168, 83, 0.12)";
    ctx.font = "36px serif";
    ctx.fillText("“", 46, quoteY);

    // Quote text
    ctx.fillStyle = "#d0c6e8";
    ctx.font = "400 14px 'Noto Sans SC', sans-serif";
    const quoteLines = wrapText(ctx, summary, quoteMaxW);
    quoteLines.forEach((line, i) => {
      ctx.fillText(line, cx, quoteY + 10 + i * 26);
    });

    // --- Bottom decoration ---
    const bottomY = quoteY + quoteLines.length * 26 + 50;

    // Divider
    ctx.strokeStyle = "rgba(212, 168, 83, 0.15)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(60, bottomY);
    ctx.lineTo(W - 60, bottomY);
    ctx.stroke();

    ctx.fillStyle = "rgba(212, 168, 83, 0.18)";
    ctx.font = "9px serif";
    ctx.fillText("✦", cx, bottomY);

    // --- QR area ---
    const qrAreaY = bottomY + 30;
    const qrSize = 68;
    const qrX = cx - qrSize / 2;

    // QR background
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(qrX - 2, qrAreaY - 2, qrSize + 4, qrSize + 4, 8);
    ctx.fill();

    // QR placeholder pattern
    ctx.fillStyle = "#0a0612";
    ctx.fillRect(qrX, qrAreaY, qrSize, qrSize);
    // Simple QR-like pattern
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if ((row + col) % 3 !== 0 && Math.random() > 0.3) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(qrX + 6 + col * 8, qrAreaY + 6 + row * 8, 6, 6);
        }
      }
    }

    // QR label
    ctx.fillStyle = "rgba(138, 126, 168, 0.6)";
    ctx.font = "10px 'Noto Sans SC', sans-serif";
    ctx.fillText("扫码测测你的今日运势", cx, qrAreaY + qrSize + 20);

    // --- Footer ---
    ctx.fillStyle = "rgba(138, 126, 168, 0.35)";
    ctx.font = "9px 'Noto Sans SC', sans-serif";
    ctx.fillText("塔罗是自我探索的工具，你的选择永远掌握在自己手中", cx, H - 38);

    setGenerating(false);
  }

  function handleShare() {
    generatePoster();

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = "灵熙塔罗_今日运势.png";
        link.href = dataUrl;
        link.click();

        grantShareBonus();
        setShared(true);
      } catch {
        const dataUrl = canvas.toDataURL("image/png");
        const win = window.open("");
        if (win) {
          win.document.write(`<img src="${dataUrl}" alt="灵熙塔罗" />`);
        }
      }
    }, 100);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="hidden" />

      {/* Preview card */}
      <div
        className="w-full max-w-xs rounded-2xl overflow-hidden border border-[#2a1a50] bg-gradient-to-b from-[#0c0820] via-[#120c28] to-[#070410] shadow-lg"
      >
        {/* Preview header */}
        <div className="flex items-center justify-center gap-3 px-4 pt-5 pb-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#d4a853]/15" />
          <span className="text-[#d4a853]/60 text-[10px] tracking-[0.2em] font-sans">
            运势分享卡
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d4a853]/15" />
        </div>

        {/* Preview content */}
        <div className="px-6 py-4 text-center">
          <p className="text-[#d4a853] text-lg font-serif tracking-[0.1em] mb-1">
            {cardName}
          </p>
          <p className="text-[#8a7ea8] text-[11px] font-sans mb-3">
            {cardNameEn}
          </p>
          <p className="text-[#b0a0c8] text-[13px] leading-relaxed font-sans line-clamp-2">
            {summary}
          </p>
        </div>

        {/* Preview footer */}
        <div className="flex items-center justify-center gap-2 px-4 pb-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
            <div className="w-3.5 h-3.5 bg-white rounded-sm" />
            <span className="text-[#8a7ea8]/50 text-[10px] font-sans">扫码体验</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col items-center gap-2 w-full max-w-xs">
        <button
          onClick={handleShare}
          disabled={shared}
          className={`
            w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium
            transition-all duration-300 font-sans tracking-wide
            ${shared
              ? "bg-[#1a3a1a] text-[#80c080] cursor-default border border-[#2a5a2a]/30"
              : "bg-gradient-to-r from-[#d4a853] to-[#c49a40] text-[#0a0612] hover:shadow-lg hover:shadow-[#d4a853]/15 active:scale-[0.98]"
            }
          `}
        >
          {shared ? (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>已解锁额外次数</span>
            </>
          ) : generating ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-[#0a0612]/30 border-t-[#0a0612] rounded-full animate-spin" />
              生成海报中...
            </span>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
              </svg>
              <span>保存海报 · 分享给朋友</span>
            </>
          )}
        </button>

        {shared ? (
          <p className="text-[#8a80a0]/70 text-[11px] text-center font-sans animate-fade-in">
            分享到朋友圈或微信群，朋友扫码后你也将获得一次额外解读
          </p>
        ) : (
          <p className="text-[#8a80a0]/50 text-[11px] text-center font-sans">
            分享后可获得今日额外一次免费解读
          </p>
        )}
      </div>
    </div>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = "";

  for (const char of text) {
    const test = current + char;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = char;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}
