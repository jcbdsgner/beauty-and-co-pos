"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Legend } from "@/components/ui/board";
import { GIFT_CARD_GRID, GiftCardTile } from "@/components/journee/gift-card-tile";
import { useAppData } from "@/components/providers/app-data-provider";

/** The Accueil is a triage screen, not the workspace: show only the few most-waited, link the rest. */
const HOME_LIMIT = 3;

/**
 * « Cartes cadeaux » sur l'Accueil — un aperçu de la file de préparation (docs/adr/0012) : les
 * commandes les plus anciennes, dans exactement les mêmes tuiles et la même grille que
 * `/cartes-cadeaux` (`GiftCardTile`). La recherche et le scan vivent sur la page dédiée. La
 * section disparaît quand il n'y a rien à préparer — l'Accueil reste calme.
 */
export function AccueilGiftCards() {
  const { giftCardOrders } = useAppData();

  const pending = giftCardOrders
    .filter((o) => o.status === "a_imprimer" || o.status === "imprimee")
    .sort((a, b) => a.orderedAt.localeCompare(b.orderedAt));

  if (pending.length === 0) return null;

  const shown = pending.slice(0, HOME_LIMIT);
  const rest = pending.length - shown.length;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-3 pl-1">
        <Legend size="section">Cartes cadeaux</Legend>
        <Link
          href="/cartes-cadeaux"
          className="flex min-h-12 items-center gap-1 text-xs font-bold uppercase tracking-[0.1em] text-primary transition hover:opacity-75"
        >
          {rest > 0 ? `Voir tout · ${pending.length}` : "Ouvrir la file"}
          <ChevronRight aria-hidden className="size-3.5" />
        </Link>
      </div>
      <div className={GIFT_CARD_GRID}>
        {shown.map((order) => (
          <GiftCardTile key={order.id} order={order} />
        ))}
      </div>
    </section>
  );
}
