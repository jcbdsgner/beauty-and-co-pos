"use client";

import Image from "next/image";
import { Board, BoardEmpty } from "@/components/ui/board";
import { PhotoPlaceholder } from "@/components/ui/atoms/photo-placeholder";
import { useAppData } from "@/components/providers/app-data-provider";
import { formatFcfa } from "@/lib/utils";

/**
 * Boissons — le Bar Beauty & Co, en lecture : chaque boisson avec sa photo, sa composition et son
 * prix. On feuillette avec la cliente pendant qu'elle patiente ; l'ajout au panier se fait au
 * Comptoir (catégorie « Boissons » du Menu). Les mêmes références que la prise de RDV b&co.
 */
export function CatalogueBoissons() {
  const { produits } = useAppData();
  const boissons = produits.filter((p) => p.active && p.categoryId === "boissons");

  return (
    <Board legend={`${boissons.length} boisson${boissons.length > 1 ? "s" : ""}`} tone="plain">
      {boissons.length === 0 ? (
        <BoardEmpty title="Aucune boisson" hint="Le bar n'a rien à la carte pour le moment." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-px bg-[var(--board-groove)] md:grid-cols-3 xl:grid-cols-4">
            {boissons.map((b) => (
              <div key={b.id} className="flex flex-col bg-white">
                <div className="relative aspect-[4/5]">
                  {b.image ? (
                    <Image src={b.image} alt={b.name} fill className="object-cover" />
                  ) : (
                    <PhotoPlaceholder className="size-full rounded-none border-0" label="Photo à venir" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 border-t border-[var(--board-groove)] p-3">
                  <p className="text-sm font-semibold text-[var(--color-gray-900)]">{b.name}</p>
                  {b.description && (
                    <p className="text-xs leading-snug text-[var(--color-gray-500)]">{b.description}</p>
                  )}
                  <p className="mt-auto pt-1 text-sm font-semibold tabular-nums text-[var(--button-2-color)]">
                    {formatFcfa(b.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--board-groove)] bg-black/[0.02] px-4 py-2 text-xs text-[var(--color-gray-500)]">
            Lait avec ou sans lactose au choix.
          </div>
        </>
      )}
    </Board>
  );
}
