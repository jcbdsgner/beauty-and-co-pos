"use client";

import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";
import { Board, Legend } from "@/components/ui/board";
import { Button } from "@/components/ui/atoms/button";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { GiftCard } from "@/components/shared/gift-card";
import { CARTES_CADEAUX } from "@/lib/data/cartes-cadeaux";
import { formatFcfa } from "@/lib/utils";
import type { CarteCadeau } from "@/lib/data/types";

const PRINT_PAGE_STYLE = `@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`;

/**
 * Cartes cadeaux à imprimer — une pastille par dénomination active du catalogue démo. Pas de
 * génération de code à la volée (ADR 0002) : on imprime la face du code déjà provisionné, cohérent
 * avec l'application par code fixe au paiement. `CARTES_CADEAUX` est un module mutable (pas le
 * store Zustand) — lu à chaque rendu, donc à jour à chaque arrivée sur l'Accueil, mais pas
 * réactif si un paiement dépense une carte pendant qu'on reste sur cette page. Connu, sans
 * conséquence pratique sur un poste mono-utilisateur.
 */
export function GiftCardsBoard() {
  const denominations = [...CARTES_CADEAUX].filter((c) => c.status === "active").sort((a, b) => a.balance - b.balance);
  const [printing, setPrinting] = useState<CarteCadeau | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const print = useReactToPrint({
    contentRef: cardRef,
    documentTitle: printing ? `Carte-cadeau-${printing.code}` : "Carte-cadeau",
    pageStyle: PRINT_PAGE_STYLE,
  });

  if (denominations.length === 0) return null;

  return (
    <>
      <Board legend="Cartes cadeaux à imprimer" tone="plain">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          {denominations.map((card) => (
            <div key={card.code} className="flex items-center gap-3 rounded-full border border-[var(--board-groove)] py-1.5 pr-1.5 pl-4">
              <span className="font-[family-name:var(--font-heading)] text-[15px] font-semibold tabular-nums text-[var(--color-gray-900)]">
                {formatFcfa(card.balance)}
              </span>
              <Button variant="outline" size="sm" icon={<Printer className="size-3.5" />} onClick={() => setPrinting(card)}>
                Imprimer
              </Button>
            </div>
          ))}
        </div>
      </Board>

      <Dialog open={printing !== null} labelledBy="gift-card-print-title" className="relative w-full max-w-sm rounded-3xl p-6">
        <CloseButton onClick={() => setPrinting(null)} />
        {printing && (
          <div className="flex flex-col gap-4">
            <div>
              <Legend>Carte cadeau</Legend>
              <h2
                id="gift-card-print-title"
                className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-gray-900)]"
              >
                {formatFcfa(printing.balance)}
              </h2>
            </div>
            <div ref={cardRef}>
              <GiftCard code={printing.code} balance={printing.balance} />
            </div>
            <Button variant="brand" size="default" className="w-full" icon={<Printer className="size-4" />} onClick={() => print()}>
              Imprimer
            </Button>
          </div>
        )}
      </Dialog>
    </>
  );
}
