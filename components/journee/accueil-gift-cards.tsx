"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronRight, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Badge } from "@/components/ui/atoms/badge";
import { Button } from "@/components/ui/atoms/button";
import { Card } from "@/components/ui/atoms/card";
import { Legend } from "@/components/ui/board";
import { GiftCard } from "@/components/shared/gift-card";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import { cn } from "@/lib/utils";
import type { GiftCardOrder } from "@/lib/data/types";

const PRINT_PAGE_STYLE = `@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`;

/** A card left waiting this long carries the amber edge — the one signal, "this needs you now". */
const STALE_DAYS = 4;
/** The Accueil is a triage screen, not the workspace: show only the few most-waited, link the rest. */
const HOME_LIMIT = 3;

function daysWaiting(orderedAt: string): number {
  const then = new Date(`${orderedAt}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((today.getTime() - then.getTime()) / 86_400_000));
}

/**
 * « Cartes cadeaux » sur l'Accueil (Figma 156-69) — un aperçu compact de la file de préparation
 * (docs/adr/0012) : les commandes les plus anciennes en cartes côte à côte, l'action suivante sur
 * chacune (imprimer, puis remettre / expédier). La file complète reste `/cartes-cadeaux`. La
 * section disparaît quand il n'y a rien à préparer — l'Accueil reste calme.
 */
export function AccueilGiftCards() {
  const { giftCardOrders } = useAppData();

  const pending = [...giftCardOrders]
    .filter((o) => o.status === "a_imprimer" || o.status === "imprimee")
    .sort((a, b) => a.orderedAt.localeCompare(b.orderedAt));

  if (pending.length === 0) return null;

  const shown = pending.slice(0, HOME_LIMIT);
  const rest = pending.length - shown.length;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-3 pl-1">
        <Legend>Cartes cadeaux</Legend>
        <Link
          href="/cartes-cadeaux"
          className="flex items-center gap-1 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-primary transition hover:opacity-75"
        >
          {rest > 0 ? `Voir tout · ${pending.length}` : "Ouvrir la file"}
          <ChevronRight aria-hidden className="size-3.5" />
        </Link>
      </div>
      <div className="flex flex-wrap gap-4">
        {shown.map((order) => (
          <GiftCardMiniCard key={order.id} order={order} />
        ))}
      </div>
    </section>
  );
}

function GiftCardMiniCard({ order }: { order: GiftCardOrder }) {
  const { clients, printGiftCardOrder, markGiftCardOrderHandedOver } = useAppData();
  const buyer = clients.find((c) => c.id === order.buyerClientId);
  const buyerName = buyer ? clientFullName(buyer) : "Cliente inconnue";

  const cardRef = useRef<HTMLDivElement>(null);
  const print = useReactToPrint({
    contentRef: cardRef,
    documentTitle: `Carte-cadeau-${order.code}`,
    pageStyle: PRINT_PAGE_STYLE,
  });

  const printed = order.status === "imprimee";
  const isLivraison = order.fulfillment === "livraison";
  const stale = daysWaiting(order.orderedAt) >= STALE_DAYS;

  const who = isLivraison ? (order.recipientName ?? "Destinataire") : buyerName;
  const contact = isLivraison
    ? [order.recipientPhone, order.deliveryAddress].filter(Boolean).join(" · ")
    : printed && buyer
      ? `Retrait au comptoir · prévenir au ${buyer.phone}`
      : "Retrait au comptoir";

  return (
    <Card className="relative flex flex-1 basis-[300px] flex-col overflow-hidden">
      {/* reserved amber signal slot — a card that has waited too long holds the edge */}
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-[3px]", stale ? "bg-warning" : "bg-transparent")}
      />

      {/* Off-screen print target — react-to-print reads the live DOM, so keep it mounted. */}
      <div aria-hidden className="pointer-events-none fixed -left-[9999px] top-0">
        <div ref={cardRef}>
          <GiftCard code={order.code} balance={order.amount} />
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant={isLivraison ? "info" : "neutral"}>{isLivraison ? "Livraison" : "Retrait"}</Badge>
          <span className="truncate text-[13px] font-semibold tabular-nums text-base-content/60">{order.code}</span>
        </div>

        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-[family-name:var(--font-heading)] text-[15px] font-semibold text-base-content">
            {who}
          </span>
          <span className="line-clamp-2 text-[13px] leading-snug text-base-content/55">{contact}</span>
        </div>

        {printed ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => markGiftCardOrderHandedOver(order.id)}
          >
            {isLivraison ? "Marquer comme expédiée" : "Marquer comme remise"}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            icon={<Printer className="size-4" />}
            onClick={() => {
              print();
              printGiftCardOrder(order.id);
            }}
          >
            Imprimer
          </Button>
        )}
      </div>
    </Card>
  );
}
