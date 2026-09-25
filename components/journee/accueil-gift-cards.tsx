"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, Printer, ScanLine } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Badge } from "@/components/ui/atoms/badge";
import { Button } from "@/components/ui/atoms/button";
import { Card } from "@/components/ui/atoms/card";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Dialog } from "@/components/ui/molecules/dialog";
import { Legend } from "@/components/ui/board";
import { GiftCard } from "@/components/shared/gift-card";
import { ScanCamera } from "@/components/shared/scan-camera";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import { cn } from "@/lib/utils";
import { daysWaiting, STALE_DAYS } from "@/components/journee/gift-card-queue";
import type { GiftCardOrder } from "@/lib/data/types";

const PRINT_PAGE_STYLE = `@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`;

/** The Accueil is a triage screen, not the workspace: show only the few most-waited, link the rest. */
const HOME_LIMIT = 3;

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
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.1em] text-primary transition hover:opacity-75"
        >
          {rest > 0 ? `Voir tout · ${pending.length}` : "Ouvrir la file"}
          <ChevronRight aria-hidden className="size-3.5" />
        </Link>
      </div>
      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => setScanOpen(true)}
          className="flex w-40 shrink-0 flex-col items-center justify-center gap-2 rounded-box border border-primary bg-base-100 px-4 py-8 text-center text-primary shadow-[0_4px_17.5px_rgba(253,207,202,0.65)] transition active:scale-[0.99] hover:bg-accent"
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

/** Prototype: no real card carries a resolvable code or QR payload, so whatever is scanned or
 *  typed stands in for a real one — the oldest card still awaiting hand-over, or failing that the
 *  oldest still in the queue. C'est le parcours qui compte pour la démo, pas la valeur du code. */
function demoScanFallback(orders: GiftCardOrder[]) {
  const pending = orders.filter((o) => o.status === "a_imprimer" || o.status === "imprimee");
  const printed = pending.filter((o) => o.status === "imprimee").sort((a, b) => a.orderedAt.localeCompare(b.orderedAt));
  return printed[0] ?? [...pending].sort((a, b) => a.orderedAt.localeCompare(b.orderedAt))[0];
}

/**
 * Scanner une carte déjà imprimée pour la remettre / marquer son expédition d'un geste, sans avoir
 * à la repérer dans la file (`/cartes-cadeaux`) — le même rôle que le champ code sur une carte de
 * retrait déjà imprimée (`GiftCardMiniCard`), mais accessible même quand elle n'est pas parmi les
 * `HOME_LIMIT` les plus anciennes affichées ici. Même dialogue que l'identification cliente côté
 * comptoir (caméra + champ code, `ScanCamera`).
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

  function resolve(raw: string) {
    const value = raw.trim().toUpperCase();
    if (!value) return;
    setError(null);

    const order = giftCardOrders.find((o) => o.code.toUpperCase() === value) ?? demoScanFallback(giftCardOrders);

    if (!order) {
      setError("Aucune carte cadeau à préparer pour le moment.");
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
    <Dialog open={open} labelledBy="scan-gift-card-title" className="relative max-w-sm rounded-3xl p-6">
      <CloseButton onClick={close} />
      <h2 id="scan-gift-card-title" className="font-[family-name:var(--font-heading)] text-xl font-semibold text-base-content">
        Scanner le code cadeau
      </h2>

      <ScanCamera
        active={open}
        onDetect={(raw) => resolve(raw)}
        hint="Présentez le QR de la carte cadeau, ou saisissez son code."
      />

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          resolve(code);
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

  const recipient = order.recipientName ?? "Destinataire";
  const identityLine = isLivraison
    ? [recipient, order.recipientPhone].filter(Boolean).join(" - ")
    : [buyerName, buyer?.phone].filter(Boolean).join(" - ");
  const secondaryLine = isLivraison ? order.deliveryAddress : buyer?.email;

  return (
    <Card className={cn("relative flex flex-1 basis-[260px] flex-col overflow-hidden", stale && "border-warning")}>
      {/* the edge names the fulfillment type (Figma 268:1675), same soft coral as the badge */}
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-1", isLivraison ? "bg-[var(--pos-fulfillment-livraison)]" : "bg-transparent")}
      />

      {/* Off-screen print target — react-to-print reads the live DOM, so keep it mounted. */}
      <div aria-hidden className="pointer-events-none fixed -left-[9999px] top-0">
        <div ref={cardRef}>
          <GiftCard code={order.code} balance={order.amount} />
        </div>
      </div>

      <div className="flex h-full flex-1 flex-col justify-between gap-3 border-b border-base-300 px-4 py-2.5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant={isLivraison ? "livraison" : "neutral"}>{isLivraison ? "Livraison" : "Retrait"}</Badge>
            <span className="truncate text-[15px] font-semibold text-base-content">{order.code}</span>
          </div>

          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-[15px] font-semibold text-base-content">{identityLine}</span>
            {secondaryLine && (
              <span className="line-clamp-2 text-[13px] leading-snug text-base-content/55">{secondaryLine}</span>
            )}
          </div>
        </div>

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
    </Card>
  );
}
