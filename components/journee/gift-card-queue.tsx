"use client";

import { useState } from "react";
import { ScanLine, Search, X } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { CloseButton, IconButton } from "@/components/ui/atoms/icon-button";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Dialog } from "@/components/ui/molecules/dialog";
import { BoardHeader, Legend } from "@/components/ui/board";
import { ScanCamera } from "@/components/shared/scan-camera";
import { GIFT_CARD_GRID, GiftCardTile } from "@/components/journee/gift-card-tile";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import { giftCardContent, normalizeGiftCardCode } from "@/lib/data/cartes-cadeaux";
import type { Cliente, GiftCardOrder } from "@/lib/data/types";

const byOrdered = (a: GiftCardOrder, b: GiftCardOrder) => a.orderedAt.localeCompare(b.orderedAt);
const isOpen = (o: GiftCardOrder) => o.status === "a_imprimer" || o.status === "imprimee";

/** Accents and case don't matter when searching a name. */
function fold(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function matches(order: GiftCardOrder, buyer: Cliente | undefined, query: string): boolean {
  const q = fold(query.trim());
  if (!q) return true;
  const code = normalizeGiftCardCode(query);
  if (code.length >= 3 && normalizeGiftCardCode(order.code).includes(code)) return true;
  const content = giftCardContent(order);
  const haystack = [
    buyer ? clientFullName(buyer) : "",
    order.recipientName ?? "",
    content.kind === "prestations" ? content.services.join(" ") : "",
  ];
  if (haystack.some((field) => fold(field).includes(q))) return true;
  const digits = query.replace(/\D/g, "");
  if (digits.length >= 4) {
    const phones = [buyer?.phone, order.recipientPhone].map((p) => (p ?? "").replace(/\D/g, ""));
    if (phones.some((p) => p.includes(digits))) return true;
  }
  return false;
}

/**
 * Cartes cadeaux à préparer (ADR 0012) — les cartes achetées en version imprimée : d'abord les
 * imprimer, puis les remettre (retrait) ou les confier à la livraison. Aucun encaissement, c'est
 * déjà payé. Deux grilles pour les deux gestes, avec les mêmes tuiles que l'aperçu de l'Accueil
 * (`GiftCardTile`). En tête : recherche (nom, n° de carte, prestation, téléphone) + scan. Une
 * recherche remonte aussi les cartes déjà remises / expédiées, en lecture seule ; un code exact
 * met sa tuile en évidence (ombre rosée) ; après un scan, le focus va sur son action.
 */
export function GiftCardQueue() {
  const { giftCardOrders, clients } = useAppData();
  const [query, setQuery] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  // Focus jumps to the found tile's action only after a scan — never while typing in the field.
  const [scanned, setScanned] = useState(false);

  const searching = query.trim().length > 0;
  const exactCode = normalizeGiftCardCode(query);
  const found = giftCardOrders.filter((o) =>
    matches(o, clients.find((c) => c.id === o.buyerClientId), query),
  );

  const toPrint = found.filter((o) => o.status === "a_imprimer").sort(byOrdered);
  const toHandOver = found.filter((o) => o.status === "imprimee").sort(byOrdered);
  const history = searching
    ? found
        .filter((o) => !isOpen(o))
        .sort((a, b) => (b.handedOverAt ?? b.orderedAt).localeCompare(a.handedOverAt ?? a.orderedAt))
    : [];
  const total = toPrint.length + toHandOver.length + history.length;

  const highlightedId =
    exactCode.length > 0 ? found.find((o) => normalizeGiftCardCode(o.code) === exactCode)?.id : undefined;

  const section = (title: string, orders: GiftCardOrder[]) =>
    orders.length > 0 && (
      <section>
        <Legend size="section" className="mb-2 block pl-1">
          {title} · {orders.length}
        </Legend>
        <div className={GIFT_CARD_GRID}>
          {orders.map((order) => (
            <GiftCardTile
              key={order.id}
              order={order}
              highlighted={order.id === highlightedId}
              focusAction={scanned && order.id === highlightedId}
            />
          ))}
        </div>
      </section>
    );

  return (
    <div className="flex flex-col gap-6">
      <BoardHeader section="Cartes cadeaux" backHref="/" backLabel="Accueil" />

      <div className="flex max-w-3xl gap-3">
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2 text-base-content/45" />
          <TextInput
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setScanned(false);
            }}
            placeholder="Nom, n° de carte, prestation ou téléphone"
            aria-label="Rechercher une carte cadeau"
            spellCheck={false}
            className="pl-12 pr-14 [&::-webkit-search-cancel-button]:hidden"
          />
          {searching && (
            <IconButton
              aria-label="Effacer la recherche"
              onClick={() => {
                setQuery("");
                setScanned(false);
              }}
              className="absolute right-1 top-1/2 size-12 -translate-y-1/2 rounded-full text-base-content/55 hover:bg-base-200 active:bg-base-300"
            >
              <X className="size-5" />
            </IconButton>
          )}
        </div>
        <button
          type="button"
          onClick={() => setScanOpen(true)}
          className="highlight-rose flex h-14 shrink-0 items-center gap-2 rounded-field border bg-base-100 px-5 text-[15px] font-semibold text-primary transition hover:bg-accent active:scale-[0.99]"
        >
          <ScanLine aria-hidden className="size-5" />
          Scanner une carte
        </button>
      </div>

      {total === 0 ? (
        <div className="rounded-field border border-dashed border-base-300 px-4 py-12 text-center">
          <p className="font-[family-name:var(--font-heading)] text-[15px] font-semibold text-base-content/60">
            {searching ? `Aucune carte ne correspond à « ${query.trim()} »` : "Aucune carte à préparer"}
          </p>
          <p className="mt-1 text-sm text-base-content/45">
            {searching
              ? "Essayez le nom de l'acheteuse, de la destinataire, ou le code imprimé sur la carte."
              : "Les cartes cadeaux achetées en version imprimée apparaîtront ici."}
          </p>
        </div>
      ) : (
        <>
          {section("À imprimer", toPrint)}
          {section("Prêtes à remettre", toHandOver)}
          {section("Remises / expédiées", history)}
        </>
      )}

      <ScanGiftCardDialog
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onFound={(code) => {
          setQuery(code);
          setScanned(true);
          setScanOpen(false);
        }}
      />
    </div>
  );
}

/** Prototype: no real card carries a resolvable code or QR payload, so whatever is scanned or
 *  typed and matches nothing stands in for a real one — the oldest card awaiting hand-over, or
 *  failing that the oldest still in the queue. C'est le parcours qui compte pour la démo. */
function demoScanFallback(orders: GiftCardOrder[]) {
  const open = orders.filter(isOpen).sort(byOrdered);
  return open.find((o) => o.status === "imprimee") ?? open[0];
}

/**
 * Scanner (ou saisir) le code d'une carte : la recherche de la page se remplit avec ce code, et la
 * tuile trouvée ressort — y compris une carte déjà remise, qui le dit alors d'elle-même.
 * Même dialogue que l'identification cliente côté comptoir (caméra + champ code, `ScanCamera`).
 */
function ScanGiftCardDialog({
  open,
  onClose,
  onFound,
}: {
  open: boolean;
  onClose: () => void;
  onFound: (code: string) => void;
}) {
  const { giftCardOrders } = useAppData();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function close() {
    setCode("");
    setError(null);
    onClose();
  }

  function resolve(raw: string) {
    const value = normalizeGiftCardCode(raw);
    if (!value) return;
    const order =
      giftCardOrders.find((o) => normalizeGiftCardCode(o.code) === value) ?? demoScanFallback(giftCardOrders);
    if (!order) {
      setError("Aucune carte cadeau ne correspond à ce code.");
      return;
    }
    setCode("");
    setError(null);
    onFound(order.code);
  }

  return (
    <Dialog open={open} labelledBy="scan-gift-card-title" className="relative max-w-sm rounded-3xl p-6">
      <CloseButton onClick={close} />
      <h2 id="scan-gift-card-title" className="font-[family-name:var(--font-heading)] text-xl font-semibold text-base-content">
        Scanner une carte cadeau
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
          aria-label="Code de la carte cadeau"
        />
        <Button type="submit" variant="brand" size="sm" className="shrink-0" disabled={!code.trim()}>
          Valider
        </Button>
      </form>
      {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}
    </Dialog>
  );
}
