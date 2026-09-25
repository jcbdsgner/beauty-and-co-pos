"use client";

import { useRef, useState } from "react";
import { MessageCircle, Mail, Download, Printer } from "lucide-react";
import { BoardHeader, Board, BoardEmpty } from "@/components/ui/board";
import { Button } from "@/components/ui/atoms/button";
import { LoyaltyCard, qrCells } from "@/components/clientele/loyalty-card";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import { TIER_LABEL } from "@/lib/data/tiers";
import { cn } from "@/lib/utils";

type FideliteViewProps = { clientId: string };


export function FideliteView({ clientId }: FideliteViewProps) {
  const { clients } = useAppData();
  const client = clients.find((c) => c.id === clientId);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  if (!client) {
    return (
      <Board legend="Carte introuvable">
        <BoardEmpty
          title="Cette cliente est introuvable"
          hint="Impossible d'afficher une carte de fidélité pour cette fiche."
          action={
            <Button href="/clientele" variant="outline">
              Retour à la Clientèle
            </Button>
          }
        />
      </Board>
    );
  }

  function handleDownload() {
    if (!client) return;
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvasRef.current = canvas;
    const width = 900;
    const height = 560;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flat taupe plate with two soft rose accent circles — same visual language as the on-screen card.
    ctx.fillStyle = "#886666";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(253,207,202,0.18)";
    ctx.beginPath();
    ctx.arc(width - 60, 40, 160, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(253,207,202,0.10)";
    ctx.beginPath();
    ctx.arc(30, height - 30, 140, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "600 20px Arial";
    ctx.fillText("BEAUTY AND CO", 48, 64);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "400 16px Arial";
    ctx.fillText("Carte de fidélité", 48, 90);

    if (client.tier) {
      const label = TIER_LABEL[client.tier];
      const tokens = getComputedStyle(document.documentElement);
      ctx.font = "600 18px Arial";
      const w = ctx.measureText(label).width;
      const x = width - w - 90;
      const tierFill = ctx.createLinearGradient(x, 40, x + w + 42, 80);
      const stop = (s: string) => tokens.getPropertyValue(`--pos-tier-${client.tier}-${s}`).trim();
      tierFill.addColorStop(0, stop("from"));
      tierFill.addColorStop(0.55, stop("via"));
      tierFill.addColorStop(1, stop("to"));
      ctx.fillStyle = tierFill;
      roundRect(ctx, x, 40, w + 42, 40, 20);
      ctx.fill();
      ctx.fillStyle = tokens.getPropertyValue(`--pos-tier-${client.tier}-ink`).trim();
      ctx.fillText(label, width - w - 68, 66);
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "600 30px Arial";
    ctx.fillText(clientFullName(client), 48, height - 150);
    ctx.font = "400 64px Georgia";
    ctx.fillText(String(client.points), 48, height - 90);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "400 16px Arial";
    ctx.fillText("points fidélité", 48, height - 60);

    // Demo QR block, bottom-right — same deterministic pattern as the on-screen card.
    const cells = qrCells(client.id);
    const qrSize = 140;
    const cellSize = qrSize / 6;
    const qrX = width - qrSize - 48;
    const qrY = height - qrSize - 48;
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 12);
    ctx.fill();
    ctx.fillStyle = "#886666";
    cells.forEach((on, i) => {
      if (!on) return;
      const col = i % 6;
      const row = Math.floor(i / 6);
      ctx.fillRect(qrX + col * cellSize + 1, qrY + row * cellSize + 1, cellSize - 2, cellSize - 2);
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carte-fidelite-${client.firstName}-${client.lastName}.png`.toLowerCase();
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="print:hidden">
        <BoardHeader section="Carte de fidélité" backHref={`/clientele/${client.id}`} backLabel="Fiche cliente" />
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4 print:hidden">
          <div>
            <p className="text-sm font-semibold text-base-content">{clientFullName(client)}</p>
            <p className="text-xs text-base-content/60">
              {client.points} points fidélité{client.tier ? ` · ${TIER_LABEL[client.tier]}` : ""}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? "Masquer l'aperçu" : "Aperçu"}
          </Button>
        </div>

        {/* Rendue hors-écran quand l'aperçu est masqué : l'impression (window.print, print:block) en a besoin. */}
        <LoyaltyCard
          name={clientFullName(client)}
          tier={client.tier}
          points={client.points}
          clientId={client.id}
          className={cn(!showPreview && "hidden print:block")}
        />

        <div className="grid grid-cols-2 gap-3 print:hidden sm:grid-cols-4">
          <div>
            <Button
              variant={client.whatsapp ? "dark" : "outline"}
              size="sm"
              disabled={!client.whatsapp}
              icon={<MessageCircle className="size-4" />}
              onClick={() => client.whatsapp && window.open(`https://wa.me/${client.whatsapp.replace(/\D/g, "")}`, "_blank")}
              className="w-full"
            >
              WhatsApp
            </Button>
            {!client.whatsapp && <p className="mt-1 text-center text-xs text-base-content/45">Pas de WhatsApp</p>}
          </div>
          <div>
            <Button
              variant={client.email ? "dark" : "outline"}
              size="sm"
              disabled={!client.email}
              icon={<Mail className="size-4" />}
              onClick={() => client.email && window.open(`mailto:${client.email}`, "_blank")}
              className="w-full"
            >
              Email
            </Button>
            {!client.email && <p className="mt-1 text-center text-xs text-base-content/45">Pas d&rsquo;email</p>}
          </div>
          <Button variant="dark" size="sm" icon={<Download className="size-4" />} onClick={handleDownload} className="w-full">
            Télécharger
          </Button>
          <Button variant="outline" size="sm" icon={<Printer className="size-4" />} onClick={() => window.print()} className="w-full">
            Imprimer
          </Button>
        </div>
      </div>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
