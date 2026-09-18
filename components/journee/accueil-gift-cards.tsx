"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, Printer, ScanLine } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Badge } from "@/components/ui/atoms/badge";
import { Button } from "@/components/ui/atoms/button";
import { Card } from "@/components/ui/atoms/card";
import { CloseButton, IconButton } from "@/components/ui/atoms/icon-button";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Dialog } from "@/components/ui/molecules/dialog";
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
 * « Cartes cadeaux » sur l'Accueil (Figma 156-72) — un aperçu compact de la file de préparation
 * (docs/adr/0012) : les commandes les plus anciennes en cartes côte à côte, l'action suivante sur
 * chacune (imprimer, puis remettre / expédier). La file complète reste `/cartes-cadeaux`. La
 * section disparaît quand il n'y a rien à préparer — l'Accueil reste calme.
 */
export function AccueilGiftCards() {
  const { giftCardOrders } = useAppData();
  const [scanOpen, setScanOpen] = useState(false);

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
        <button
          type="button"
          onClick={() => setScanOpen(true)}
          className="flex flex-1 basis-[300px] flex-col items-center justify-center gap-2 rounded-box border border-dashed border-base-300 px-4 py-8 text-base-content/55 transition active:scale-[0.99] hover:border-secondary hover:bg-accent hover:text-secondary"
        >
          <ScanLine aria-hidden className="size-6" />
          <span className="text-sm font-semibold">Scanner le code cadeau</span>
        </button>
        {shown.map((order) => (
          <GiftCardMiniCard key={order.id} order={order} />
        ))}
      </div>
      <ScanGiftCardDialog open={scanOpen} onClose={() => setScanOpen(false)} />
    </section>
  );
}

/**
 * Scanner une carte déjà imprimée pour la remettre / marquer son expédition d'un geste, sans avoir
 * à la repérer dans la file (`/cartes-cadeaux`) — le même rôle que le champ code sur une carte de
 * retrait déjà imprimée (`GiftCardMiniCard`), mais accessible même quand elle n'est pas parmi les
 * `HOME_LIMIT` les plus anciennes affichées ici.
 */
function ScanGiftCardDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { giftCardOrders, markGiftCardOrderHandedOver } = useAppData();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function close() {
    setCode("");
    setError(null);
    onClose();
  }

  function resolve() {
    const value = code.trim().toUpperCase();
    if (!value) return;

    const order = giftCardOrders.find((o) => o.code.toUpperCase() === value);
    if (!order) {
      setError("Code non reconnu.");
      return;
    }
    if (order.status === "a_imprimer") {
      setError("Cette carte n'est pas encore imprimée.");
      return;
    }
    if (order.status === "remise" || order.status === "livree") {
      setError("Cette carte a déjà été remise.");
      return;
    }
    markGiftCardOrderHandedOver(order.id);
    close();
  }

  return (
    <Dialog open={open} labelledBy="scan-gift-card-title" className="relative max-w-sm p-6">
      <CloseButton onClick={close} />
      <h2 id="scan-gift-card-title" className="font-[family-name:var(--font-heading)] text-xl font-semibold text-base-content">
        Scanner le code cadeau
      </h2>
      <p className="mt-1 text-sm text-base-content/55">
        Saisissez ou scannez le code imprimé sur la carte pour la marquer remise.
      </p>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          resolve();
        }}
      >
        <TextInput
          size="compact"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code de la carte"
          autoFocus
          autoCapitalize="characters"
          spellCheck={false}
          aria-label="Code de la carte cadeau à scanner"
        />
        <Button type="submit" variant="brand" size="sm" className="shrink-0" disabled={!code.trim()}>
          Valider
        </Button>
      </form>
      {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}
    </Dialog>
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
  // Once a retrait order is printed, the physical card sits at the counter — the header switches
  // from the order code to the buyer's name (who to look for) and the body from contact details
  // to the card's own code, ready to check against what's in hand. Livraison never hands anything
  // over in person, so it keeps showing where the card is headed either way.
  const showCodeField = printed && !isLivraison;

  const recipient = order.recipientName ?? "Destinataire";
  const identityLine = isLivraison
    ? [recipient, order.recipientPhone].filter(Boolean).join(" - ")
    : [buyerName, buyer?.phone].filter(Boolean).join(" - ");
  const secondaryLine = isLivraison ? order.deliveryAddress : buyer?.email;

  return (
    <Card className="relative flex flex-1 basis-[300px] flex-col overflow-hidden">
      {/* reserved amber signal slot — a card that has waited too long holds the edge */}
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1", stale ? "bg-warning" : "bg-transparent")} />

      {/* Off-screen print target — react-to-print reads the live DOM, so keep it mounted. */}
      <div aria-hidden className="pointer-events-none fixed -left-[9999px] top-0">
        <div ref={cardRef}>
          <GiftCard code={order.code} balance={order.amount} />
        </div>
      </div>

      <div className="flex flex-col gap-1 border-b border-base-300 px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <Badge variant={isLivraison ? "info" : "neutral"}>{isLivraison ? "Livraison" : "Retrait"}</Badge>
          <span className="truncate text-[15px] font-semibold text-base-content">
            {showCodeField ? buyerName : order.code}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {showCodeField ? (
            <div className="flex items-start gap-3">
              <TextInput
                size="compact"
                readOnly
                tabIndex={-1}
                value={order.code}
                aria-label="Code de la carte cadeau"
                className="flex-1 text-base-content/50"
              />
              <IconButton
                aria-label="Scanner ou saisir une carte"
                className="size-11 shrink-0 rounded-full border border-border text-secondary transition active:scale-90 hover:border-secondary hover:bg-accent"
              >
                <ScanLine aria-hidden className="size-4" />
              </IconButton>
            </div>
          ) : (
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-[15px] font-semibold text-base-content">{identityLine}</span>
              {secondaryLine && (
                <span className="line-clamp-2 text-[13px] leading-snug text-base-content/55">{secondaryLine}</span>
              )}
            </div>
          )}

          {printed ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => markGiftCardOrderHandedOver(order.id)}
            >
              {isLivraison ? "Marquer comme expédiée" : "Marquer comme remis"}
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
      </div>
    </Card>
  );
}
