"use client";

import Link from "next/link";
import { use, useCallback, useMemo, useState } from "react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { buildMockReading } from "@/mocks/build-reading";

interface PageProps {
  params: Promise<{ id: string }>;
}

const CARD_W = 1080;
const CARD_H = 1920;
const COLORS = {
  black: "#08050E",
  deep: "#110C1A",
  gold: "#C9A24A",
  goldDim: "rgba(201,162,74,0.25)",
  bone: "#E8DFD0",
  boneDim: "#9B9284",
} as const;

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  maxWidth: number,
  lineHeight: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  // We only compute lines here; drawing happens in the caller
  void x;
  void lineHeight;
  return lines;
}

function renderShareCard(phrase: string, elementTitle: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, CARD_H);
  grad.addColorStop(0, COLORS.deep);
  grad.addColorStop(0.5, COLORS.black);
  grad.addColorStop(1, COLORS.deep);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Corner ornaments
  const ornSize = 40;
  const ornInset = 60;
  ctx.strokeStyle = COLORS.goldDim;
  ctx.lineWidth = 2;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(ornInset, ornInset + ornSize);
  ctx.lineTo(ornInset, ornInset);
  ctx.lineTo(ornInset + ornSize, ornInset);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(CARD_W - ornInset - ornSize, ornInset);
  ctx.lineTo(CARD_W - ornInset, ornInset);
  ctx.lineTo(CARD_W - ornInset, ornInset + ornSize);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(ornInset, CARD_H - ornInset - ornSize);
  ctx.lineTo(ornInset, CARD_H - ornInset);
  ctx.lineTo(ornInset + ornSize, CARD_H - ornInset);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(CARD_W - ornInset - ornSize, CARD_H - ornInset);
  ctx.lineTo(CARD_W - ornInset, CARD_H - ornInset);
  ctx.lineTo(CARD_W - ornInset, CARD_H - ornInset - ornSize);
  ctx.stroke();

  // Gold accent line at top
  const lineGrad = ctx.createLinearGradient(200, 0, CARD_W - 200, 0);
  lineGrad.addColorStop(0, "transparent");
  lineGrad.addColorStop(0.5, COLORS.gold);
  lineGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(200, 180);
  ctx.lineTo(CARD_W - 200, 180);
  ctx.stroke();

  // Element badge
  ctx.font = '500 28px "Georgia", serif';
  ctx.fillStyle = COLORS.gold;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const badgeText = elementTitle.toUpperCase();
  const badgeMetrics = ctx.measureText(badgeText);
  const badgeW = badgeMetrics.width + 56;
  const badgeH = 52;
  const badgeX = CARD_W / 2;
  const badgeY = 280;
  // Badge background
  ctx.fillStyle = "rgba(201,162,74,0.06)";
  ctx.fillRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH);
  // Badge border
  ctx.strokeStyle = COLORS.goldDim;
  ctx.lineWidth = 1;
  ctx.strokeRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH);
  // Badge text
  ctx.fillStyle = COLORS.gold;
  ctx.font = '28px "Georgia", serif';
  ctx.letterSpacing = "3px";
  ctx.fillText(badgeText, badgeX, badgeY);
  ctx.letterSpacing = "0px";

  // Impact phrase
  const phraseMaxW = CARD_W - 200;
  ctx.font = 'italic 54px "Georgia", serif';
  ctx.fillStyle = COLORS.bone;
  ctx.textAlign = "center";
  const phraseLineHeight = 78;
  const phraseLines = wrapText(
    ctx,
    `\u201C${phrase}\u201D`,
    CARD_W / 2,
    phraseMaxW,
    phraseLineHeight,
  );
  const phraseBlockH = phraseLines.length * phraseLineHeight;
  const phraseStartY = CARD_H / 2 - phraseBlockH / 2 + 40;
  for (let i = 0; i < phraseLines.length; i++) {
    ctx.fillText(phraseLines[i], CARD_W / 2, phraseStartY + i * phraseLineHeight);
  }

  // Gold accent line at bottom
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(200, CARD_H - 260);
  ctx.lineTo(CARD_W - 200, CARD_H - 260);
  ctx.stroke();

  // Diamond separator
  ctx.save();
  ctx.translate(CARD_W / 2, CARD_H - 220);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(-5, -5, 10, 10);
  ctx.restore();

  // Branding
  ctx.font = '48px "Georgia", serif';
  ctx.fillStyle = COLORS.gold;
  ctx.textAlign = "center";
  ctx.letterSpacing = "4px";
  ctx.fillText("MaosFalam", CARD_W / 2, CARD_H - 140);
  ctx.letterSpacing = "0px";

  // Tagline
  ctx.font = '22px "Georgia", serif';
  ctx.fillStyle = COLORS.boneDim;
  ctx.fillText("Me mostre sua mao e eu te conto quem voce e", CARD_W / 2, CARD_H - 90);

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
}

export default function SharePage({ params }: PageProps) {
  const { id } = use(params);
  const data = useMemo(() => buildMockReading("fire"), []);
  const [shared, setShared] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/compartilhar/${data.share_token}`
      : `/compartilhar/${data.share_token}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShared(true);
    } catch {
      setShared(true);
    }
  }, [shareUrl]);

  const handleDownload = useCallback(() => {
    const canvas = renderShareCard(data.report.share_phrase, data.report.element.title);
    const link = document.createElement("a");
    link.download = "maosfalam-leitura.png";
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShared(true);
  }, [data.report.share_phrase, data.report.element.title]);

  const handleShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        const canvas = renderShareCard(data.report.share_phrase, data.report.element.title);
        const blob = await canvasToBlob(canvas);
        if (blob && typeof navigator.canShare === "function") {
          const file = new File([blob], "maosfalam-leitura.png", { type: "image/png" });
          const shareData = {
            title: "MaosFalam",
            text: data.report.share_phrase,
            url: shareUrl,
            files: [file],
          };
          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            setShared(true);
            return;
          }
        }
        // Fallback: share without image
        await navigator.share({
          title: "MaosFalam",
          text: data.report.share_phrase,
          url: shareUrl,
        });
        setShared(true);
        return;
      } catch {
        /* user cancelled or not supported */
      }
    }
    void handleCopy();
  }, [data.report.share_phrase, data.report.element.title, shareUrl, handleCopy]);

  if (shared) {
    return (
      <main className="min-h-dvh bg-black flex flex-col items-center justify-center px-6 gap-6 text-center">
        <p className="font-cormorant italic text-2xl text-bone max-w-sm">
          Sua leitura está no mundo.
        </p>
        <Link href={`/ler/resultado/${id}`}>
          <Button variant="secondary">Voltar pra leitura</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-black px-4 py-10 flex flex-col items-center gap-8">
      <h1 className="font-cinzel text-[18px] text-bone-dim uppercase tracking-widest">
        Compartilhar
      </h1>

      <div className="w-full max-w-xs aspect-[9/16]">
        <Card parchment accentColor="gold" className="h-full">
          <div className="flex flex-col h-full justify-between items-center text-center py-6 px-2">
            <Badge variant="gold">{data.report.element.title}</Badge>
            <p className="font-cormorant italic text-[22px] leading-snug text-bone px-2">
              &ldquo;{data.report.share_phrase}&rdquo;
            </p>
            <p className="font-logo text-[18px] text-gold tracking-wider">MaosFalam</p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button variant="primary" onClick={handleShare}>
          Compartilhar
        </Button>
        <Button variant="secondary" onClick={handleCopy}>
          Copiar link
        </Button>
        <Button variant="ghost" onClick={handleDownload}>
          Baixar imagem
        </Button>
      </div>
    </main>
  );
}
