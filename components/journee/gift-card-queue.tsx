"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Badge } from "@/components/ui/atoms/badge";
import { Button } from "@/components/ui/atoms/button";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { Board, BoardHeader, BoardEmpty, FlipChip } from "@/components/ui/board";
import { GiftCard } from "@/components/shared/gift-card";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import { formatFcfa } from "@/lib/utils";
import type { GiftCardOrder } from "@/lib/data/types";

const PRINT_PAGE_STYLE = `@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`;

/**
 * Cartes cadeaux à préparer (ADR 0012) — la file des cartes achetées en version imprimée, à
 * imprimer puis remettre (retrait) ou confier à la livraison. Aucun encaissement : c'est déjà
 * payé. Une commande `remise` / `livree` quitte la file.
 */
export function GiftCardQueue() {
  const { giftCardOrders } = useAppData();

  const open = giftCardOrders
    .filter((o) => o.status === "a_imprimer" || o.status === "imprimee")
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "a_imprimer" ? -1 : 1;
      return a.orderedAt.localeCompare(b.orderedAt);
    });

  return (
    <div className="flex flex-col gap-6">
      <BoardHeader section="Cartes cadeaux à préparer" backHref="/" />

      {open.length === 0 ? (
        <Board legend="File">
          <BoardEmpty
            title="Aucune carte à préparer"
            hint="Les cartes cadeaux achetées en version imprimée apparaîtront ici."
          />
        </Board>
      ) : (
        <Board legend={`File · ${open.length}`}>
          <div className="flex flex-col gap-1.5 p-2.5">
            {open.map((order) => (
              <GiftCardQueueRow key={order.id} order={order} />
            ))}
          </div>
        </Board>
      )}
    </div>
  );
}

function GiftCardQueueRow({ order }: { order: GiftCardOrder }) {
  const { clients, printGiftCardOrder, markGiftCardOrderHandedOver } = useAppData();
  const buyer = clients.find((c) => c.id === order.buyerClientId);

  const cardRef = useRef<HTMLDivElement>(null);
  const print = useReactToPrint({
    contentRef: cardRef,
    documentTitle: `Carte-cadeau-${order.code}`,
    pageStyle: PRINT_PAGE_STYLE,
  });

  const printed = order.status === "imprimee";
  const isLivraison = order.fulfillment === "livraison";

  return (
    <div className="rounded-[10px] border border-[var(--board-groove)] px-4 py-2.5">
      {/* Off-screen print target — react-to-print reads the live DOM, so keep it mounted. */}
      <div aria-hidden className="pointer-events-none fixed -left-[9999px] top-0">
        <div ref={cardRef}>
          <GiftCard code={order.code} balance={order.amount} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Avatar
          initial={buyer ? clientInitial(buyer) : "?"}
          size={38}
          className="bg-accent font-semibold text-secondary"
        />
        <span className="flex min-w-0 flex-1 items-center gap-x-2">
          <span className="truncate font-[family-name:var(--font-heading)] text-[15px] font-semibold text-[var(--color-gray-900)]">
            {buyer ? clientFullName(buyer) : "Cliente inconnue"}
          </span>
          <span className="shrink-0 font-[family-name:var(--font-heading)] text-[15px] font-semibold tabular-nums text-[var(--button-2-color)]">
            {formatFcfa(order.amount)}
          </span>
          <Badge variant={isLivraison ? "info" : "neutral"}>{isLivraison ? "Livraison" : "Retrait"}</Badge>
        </span>
        <div className="flex shrink-0 items-center gap-2.5">
          <FlipChip
            value={printed ? "Imprimée" : "À imprimer"}
            tone={printed ? "neutral" : "signal"}
            className="min-w-0 px-2"
          />
          {printed ? (
            <>
              <IconButton
                aria-label="Réimprimer la carte"
                onClick={() => print()}
                className="size-11 rounded-full text-[var(--color-gray-500)] transition active:scale-90 hover:bg-[var(--color-gray-100)]"
              >
                <Printer aria-hidden className="size-4" />
              </IconButton>
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
        </div>
      </div>

      {isLivraison && (
        <p className="mt-1 pl-[50px] text-xs leading-snug text-[var(--color-gray-500)]">
          {order.recipientName} · {order.recipientPhone} · {order.deliveryAddress}
        </p>
      )}
    </div>
  );
}
