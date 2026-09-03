"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";
import { Badge } from "@/components/ui/atoms/badge";
import { Button } from "@/components/ui/atoms/button";
import { Board, BoardHeader, BoardEmpty } from "@/components/ui/board";
import { GiftCard } from "@/components/shared/gift-card";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import { cn, formatFcfa } from "@/lib/utils";
import type { GiftCardOrder } from "@/lib/data/types";

const PRINT_PAGE_STYLE = `@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`;

/** A card left waiting this long carries the amber edge — the one signal, "this needs you now". */
const STALE_DAYS = 4;

function daysWaiting(orderedAt: string): number {
  const then = new Date(`${orderedAt}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((today.getTime() - then.getTime()) / 86_400_000));
}

function waitLabel(days: number): string {
  if (days <= 0) return "auj.";
  if (days === 1) return "hier";
  return `${days} j`;
}

/**
 * Cartes cadeaux à préparer (ADR 0012) — les cartes achetées en version imprimée : d'abord les
 * imprimer, puis les remettre (retrait) ou les confier à la livraison. Aucun encaissement, c'est
 * déjà payé. Deux plaques pour les deux gestes ; une commande `remise` / `livree` quitte la file.
 */
export function GiftCardQueue() {
  const { giftCardOrders } = useAppData();

  const byWait = (a: GiftCardOrder, b: GiftCardOrder) => a.orderedAt.localeCompare(b.orderedAt);
  const toPrint = giftCardOrders.filter((o) => o.status === "a_imprimer").sort(byWait);
  const toHandOver = giftCardOrders.filter((o) => o.status === "imprimee").sort(byWait);
  const total = toPrint.length + toHandOver.length;

  return (
    <div className="flex flex-col gap-6">
      <BoardHeader section="Cartes cadeaux" backHref="/" backLabel="Accueil" />

      {total === 0 ? (
        <Board legend="À préparer">
          <BoardEmpty
            title="Aucune carte à préparer"
            hint="Les cartes cadeaux achetées en version imprimée apparaîtront ici."
          />
        </Board>
      ) : (
        <>
          {toPrint.length > 0 && (
            <Board legend={`À imprimer · ${toPrint.length}`}>
              {toPrint.map((order) => (
                <GiftCardQueueRow key={order.id} order={order} />
              ))}
            </Board>
          )}
          {toHandOver.length > 0 && (
            <Board legend={`Prêtes à remettre · ${toHandOver.length}`}>
              {toHandOver.map((order) => (
                <GiftCardQueueRow key={order.id} order={order} />
              ))}
            </Board>
          )}
        </>
      )}
    </div>
  );
}

function GiftCardQueueRow({ order }: { order: GiftCardOrder }) {
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
  const days = daysWaiting(order.orderedAt);
  const stale = days >= STALE_DAYS;

  return (
    <div
      className={cn(
        "relative flex items-center gap-4 border-b border-[var(--board-groove)] px-4 py-2.5 last:border-b-0",
        "min-h-[var(--board-lane-h)]",
      )}
    >
      {/* reserved amber signal slot — a card that has waited too long holds the edge */}
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-[3px]", stale ? "bg-[var(--board-amber)]" : "bg-transparent")}
      />

      {/* Off-screen print target — react-to-print reads the live DOM, so keep it mounted. */}
      <div aria-hidden className="pointer-events-none fixed -left-[9999px] top-0">
        <div ref={cardRef}>
          <GiftCard code={order.code} balance={order.amount} />
        </div>
      </div>

      {/* figure column — amount over wait, aligned down the board */}
      <span className="flex w-[76px] shrink-0 flex-col leading-tight">
        <span className="font-[family-name:var(--font-heading)] text-[15px] font-semibold tabular-nums text-[var(--color-gray-900)]">
          {formatFcfa(order.amount)}
        </span>
        <span
          className={cn(
            "text-[0.7rem] font-semibold tabular-nums",
            stale ? "text-[var(--board-amber)]" : "text-[var(--color-gray-400)]",
          )}
        >
          {waitLabel(days)}
        </span>
      </span>

      {/* identity + hand-over target */}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 py-1.5">
        <span className="flex items-center gap-2">
          <span className="truncate font-[family-name:var(--font-heading)] text-[15px] font-semibold text-[var(--color-gray-900)]">
            {buyerName}
          </span>
          <Badge variant={isLivraison ? "info" : "neutral"}>{isLivraison ? "Livraison" : "Retrait"}</Badge>
        </span>

        {isLivraison ? (
          printed ? (
            <span className="text-[13px] leading-snug text-[var(--color-gray-500)]">
              <span className="text-[var(--color-gray-700)]">Livrer à {order.recipientName}</span>
              {" — "}
              {order.recipientPhone} · {order.deliveryAddress}
            </span>
          ) : (
            <span className="truncate text-[13px] text-[var(--color-gray-500)]">Pour {order.recipientName}</span>
          )
        ) : (
          <span className="text-[13px] text-[var(--color-gray-500)]">
            Retrait au comptoir
            {printed && buyer ? ` — prévenir au ${buyer.phone}` : ""}
          </span>
        )}
      </span>

      {/* actions */}
      <span className="flex shrink-0 items-center gap-2">
        {printed ? (
          <>
            <Button variant="outline" size="sm" icon={<Printer className="size-4" />} onClick={() => print()}>
              Réimprimer
            </Button>
            <Button variant="dark" size="sm" onClick={() => markGiftCardOrderHandedOver(order.id)}>
              {isLivraison ? "Marquer comme expédiée" : "Marquer comme remise"}
            </Button>
          </>
        ) : (
          <Button
            variant="dark"
            size="sm"
            icon={<Printer className="size-4" />}
            onClick={() => {
              print();
              printGiftCardOrder(order.id);
            }}
          >
            Imprimer
          </Button>
        )}
      </span>
    </div>
  );
}
