"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";
import { Badge } from "@/components/ui/atoms/badge";
import { Button } from "@/components/ui/atoms/button";
import { BoardHeader, Legend } from "@/components/ui/board";
import { GiftCard } from "@/components/shared/gift-card";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import { cn } from "@/lib/utils";
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
 * déjà payé. Deux grilles de blocs pour les deux gestes ; une commande `remise` / `livree` quitte
 * la file. Chaque bloc affiche la carte elle-même (c'est aussi la cible d'impression) plutôt
 * qu'une ligne de liste : l'objet qu'on prépare doit se reconnaître d'un coup d'œil.
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
        <div className="rounded-field border border-dashed border-base-300 px-4 py-12 text-center">
          <p className="font-[family-name:var(--font-heading)] text-[15px] font-semibold text-base-content/60">
            Aucune carte à préparer
          </p>
          <p className="mt-1 text-sm text-base-content/45">
            Les cartes cadeaux achetées en version imprimée apparaîtront ici.
          </p>
        </div>
      ) : (
        <>
          {toPrint.length > 0 && (
            <section>
              <Legend className="mb-2 block pl-1">À imprimer · {toPrint.length}</Legend>
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                {toPrint.map((order) => (
                  <GiftCardQueueTile key={order.id} order={order} />
                ))}
              </div>
            </section>
          )}
          {toHandOver.length > 0 && (
            <section>
              <Legend className="mb-2 block pl-1">Prêtes à remettre · {toHandOver.length}</Legend>
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                {toHandOver.map((order) => (
                  <GiftCardQueueTile key={order.id} order={order} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function GiftCardQueueTile({ order }: { order: GiftCardOrder }) {
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

  const detail = isLivraison
    ? printed
      ? `Livrer à ${order.recipientName} — ${order.recipientPhone} · ${order.deliveryAddress}`
      : `Pour ${order.recipientName}`
    : printed && buyer
      ? `Retrait au comptoir — prévenir au ${buyer.phone}`
      : "Retrait au comptoir";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-field border bg-base-100 p-4",
        stale ? "border-warning" : "border-base-300",
      )}
    >
      {/* the print target is the card itself — react-to-print reads this live DOM node */}
      <div ref={cardRef}>
        <GiftCard code={order.code} balance={order.amount} />
      </div>

      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="block truncate font-[family-name:var(--font-heading)] text-[15px] font-semibold text-base-content">
            {buyerName}
          </span>
          <span className="mt-0.5 line-clamp-2 text-[13px] text-base-content/55">{detail}</span>
        </span>
        <Badge variant={isLivraison ? "info" : "neutral"} className="shrink-0">
          {isLivraison ? "Livraison" : "Retrait"}
        </Badge>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-base-300 pt-3">
        <span
          className={cn(
            "shrink-0 whitespace-nowrap text-[0.7rem] font-semibold tabular-nums",
            stale ? "text-warning" : "text-base-content/45",
          )}
        >
          {waitLabel(days)}
        </span>

        {printed ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={<Printer className="size-4" />} onClick={() => print()}>
              Réimprimer
            </Button>
            <Button variant="dark" size="sm" onClick={() => markGiftCardOrderHandedOver(order.id)}>
              {isLivraison ? "Marquer comme expédiée" : "Marquer comme remise"}
            </Button>
          </div>
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
      </div>
    </div>
  );
}
