"use client";

import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Check, Printer, Store, Truck } from "lucide-react";
import { Badge } from "@/components/ui/atoms/badge";
import { Button } from "@/components/ui/atoms/button";
import { GiftCard } from "@/components/shared/gift-card";
import { Toast } from "@/components/ui/molecules/toast";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import { giftCardContent } from "@/lib/data/cartes-cadeaux";
import { cn, formatFcfa, formatPhone } from "@/lib/utils";
import type { GiftCardOrder } from "@/lib/data/types";

const PRINT_PAGE_STYLE = `@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`;

export function daysWaiting(orderedAt: string): number {
  const then = new Date(`${orderedAt}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((today.getTime() - then.getTime()) / 86_400_000));
}

function orderedLabel(days: number): string {
  if (days <= 0) return "Commandée aujourd'hui";
  if (days === 1) return "Commandée hier";
  return `Commandée il y a ${days} j`;
}

function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

/** The grid both screens lay tiles in — the Accueil preview and `/cartes-cadeaux` must look alike. */
export const GIFT_CARD_GRID = "grid grid-cols-2 gap-4 xl:grid-cols-3";

/**
 * Une commande de carte cadeau (ADR 0012) — LA tuile, identique sur l'Accueil et dans la file
 * `/cartes-cadeaux`. Haut : mode de remise + code ; qui l'a achetée ; ce que la carte offre
 * (montant, ou prestations — jamais de prix pour une carte prestations) ; où elle va. Pied : les
 * gestes (Imprimer → Réimprimer + Marquer comme remise/expédiée), ou, une fois sortie de la file,
 * la date de remise en lecture seule. `highlighted` = trouvée par la recherche / le scan : ombre
 * rosée (`highlight-rose`) ; `focusAction` (après un scan) y place le focus.
 */
export function GiftCardTile({
  order,
  highlighted = false,
  focusAction = false,
}: {
  order: GiftCardOrder;
  highlighted?: boolean;
  /** Found by a scan: move focus to the tile's action so one tap (or Entrée) completes it. */
  focusAction?: boolean;
}) {
  const { clients, printGiftCardOrder, markGiftCardOrderHandedOver } = useAppData();
  const buyer = clients.find((c) => c.id === order.buyerClientId);
  const buyerName = buyer ? clientFullName(buyer) : "Cliente inconnue";
  const [toast, setToast] = useState<string | null>(null);

  const tileRef = useRef<HTMLElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const print = useReactToPrint({
    contentRef: cardRef,
    documentTitle: `Carte-cadeau-${order.code}`,
    pageStyle: PRINT_PAGE_STYLE,
  });

  useEffect(() => {
    if (!highlighted) return;
    tileRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    if (focusAction) actionRef.current?.querySelector<HTMLElement>("[data-primary-action]")?.focus({ preventScroll: true });
  }, [highlighted, focusAction]);

  const content = giftCardContent(order);
  const isLivraison = order.fulfillment === "livraison";
  const done = order.status === "remise" || order.status === "livree";
  const printed = order.status === "imprimee";

  const handOverLabel = isLivraison ? "Marquer comme expédiée" : "Marquer comme remise";
  const printToast = () => setToast(`Carte-cadeau ${order.code} envoyée à l'impression.`);

  return (
    <article
      ref={tileRef}
      className={cn(
        "flex flex-col rounded-field border bg-base-100 transition-shadow",
        highlighted ? "highlight-rose" : "border-base-300",
      )}
    >
      {/* Off-screen print target — react-to-print reads the live DOM, so keep it mounted (pas d'aperçu à l'écran). */}
      <div aria-hidden className="pointer-events-none fixed -left-[9999px] top-0">
        <div ref={cardRef}>
          <GiftCard
            code={order.code}
            balance={order.amount}
            services={content.kind === "prestations" ? content.services : undefined}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="neutral"
            icon={isLivraison ? <Truck aria-hidden className="size-3.5" /> : <Store aria-hidden className="size-3.5" />}
          >
            {isLivraison ? "Livraison" : "Retrait"}
          </Badge>
          <span className="truncate font-mono text-xs tracking-wide text-base-content/55">{order.code}</span>
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate font-[family-name:var(--font-heading)] text-base font-semibold text-base-content">
            {buyerName}
          </span>
          {content.kind === "montant" ? (
            <span className="text-[15px] font-semibold tabular-nums text-primary">{formatFcfa(content.amount)}</span>
          ) : (
            <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-primary">
              {content.services.join(" · ")}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-0.5 text-[13px] leading-snug text-base-content/60">
          {isLivraison ? (
            <>
              <span className="text-base-content/80">Livrer à {order.recipientName ?? "la destinataire"}</span>
              {order.recipientPhone && (
                <span className="whitespace-nowrap tabular-nums">{formatPhone(order.recipientPhone)}</span>
              )}
              {order.deliveryAddress && <span>{order.deliveryAddress}</span>}
            </>
          ) : (
            <>
              <span className="text-base-content/80">Retrait au comptoir</span>
              {buyer?.phone && (
                <span className="whitespace-nowrap tabular-nums">Prévenir au {formatPhone(buyer.phone)}</span>
              )}
            </>
          )}
        </div>

        <span className="mt-auto text-xs text-base-content/45">{orderedLabel(daysWaiting(order.orderedAt))}</span>
      </div>

      <div ref={actionRef} className="flex items-center gap-2 border-t border-base-300 p-3">
        {done ? (
          <span className="flex min-h-14 items-center gap-2 px-1 text-sm font-medium text-base-content/70">
            <Check aria-hidden className="size-4 text-success" />
            {isLivraison
              ? `Expédiée le ${order.handedOverAt ? shortDate(order.handedOverAt) : "—"}`
              : `Remise le ${order.handedOverAt ? shortDate(order.handedOverAt) : "—"}`}
          </span>
        ) : printed ? (
          <>
            <Button
              variant="outline"
              size="icon"
              aria-label="Réimprimer"
              title="Réimprimer"
              onClick={() => {
                print();
                printToast();
              }}
            >
              <Printer aria-hidden className="size-5" />
            </Button>
            <Button
              data-primary-action
              variant="brand"
              className="min-w-0 flex-1"
              onClick={() => markGiftCardOrderHandedOver(order.id)}
            >
              {handOverLabel}
            </Button>
          </>
        ) : (
          <Button
            data-primary-action
            variant="brand"
            className="flex-1"
            icon={<Printer aria-hidden className="size-5" />}
            onClick={() => {
              print();
              printGiftCardOrder(order.id);
              printToast();
            }}
          >
            Imprimer
          </Button>
        )}
      </div>
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </article>
  );
}
