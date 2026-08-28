"use client";

import { useRef } from "react";
import { MessageCircle, Mail, Download, Printer } from "lucide-react";
import { BoardHeader, Board, BoardEmpty } from "@/components/ui/board";
import { Button } from "@/components/ui/atoms/button";
import { LoyaltyCard, qrCells } from "@/components/clientele/loyalty-card";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";

type FideliteViewProps = { clientId: string };

const TIER_LABEL: Record<string, string> = { vip: "VIP", gold: "Gold", silver: "Silver" };

export function FideliteView({ clientId }: FideliteViewProps) {
  const { clients } = useAppData();
  const client = clients.find((c) => c.id === clientId);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!client) {
    return (
      <Board legend="Carte introuvable">
        <BoardEmpty
          title="Cette cliente est introuvable"
          hint="Impossible d'afficher une carte de fidélité pour cette fiche."
          action={
            <Button href="/clientele" variant="outline">
              Retour au répertoire
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
      const label = TIER_LABEL[client.tier] ?? "";
      ctx.font = "600 18px Arial";
      const w = ctx.measureText(label).width;
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      roundRect(ctx, width - w - 90, 40, w + 42, 40, 20);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
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
        <BoardHeader section="Carte de fidélité" context={clientFullName(client)} backHref={`/clientele/${client.id}`} />
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
        <LoyaltyCard name={clientFullName(client)} tier={client.tier} points={client.points} clientId={client.id} />

        <div className="grid grid-cols-2 gap-3 print:hidden sm:grid-cols-4">
          <div>
            <Button
              variant={client.whatsapp ? "success" : "outline"}
              size="sm"
              disabled={!client.whatsapp}
              icon={<MessageCircle className="size-4" />}
              onClick={() => client.whatsapp && window.open(`https://wa.me/${client.whatsapp.replace(/\D/g, "")}`, "_blank")}
              className="w-full"
            >
              WhatsApp
            </Button>
            {!client.whatsapp && <p className="mt-1 text-center text-xs text-[var(--color-gray-400)]">Pas de WhatsApp</p>}
          </div>
          <div>
            <Button
              variant={client.email ? "info" : "outline"}
              size="sm"
              disabled={!client.email}
              icon={<Mail className="size-4" />}
              onClick={() => client.email && window.open(`mailto:${client.email}`, "_blank")}
              className="w-full"
            >
              Email
            </Button>
            {!client.email && <p className="mt-1 text-center text-xs text-[var(--color-gray-400)]">Pas d&rsquo;email</p>}
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
