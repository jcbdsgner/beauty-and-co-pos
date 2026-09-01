"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Board, BoardEmpty, ChipFilter, Legend } from "@/components/ui/board";
import { PhotoPlaceholder } from "@/components/ui/atoms/photo-placeholder";
import { PRODUCT_CATEGORIES } from "@/lib/data/menu";
import { useAppData } from "@/components/providers/app-data-provider";
import { cn, formatFcfa } from "@/lib/utils";

/**
 * Produits — volet de consultation du Catalogue : chaque produit avec sa photo et son stock
 * restant, en lecture seule. Aucun lien avec l'encaissement (la baisse de stock se fait au
 * Comptoir) — on regarde juste ce qu'il reste en rayon. Le stock lu vient du store, donc il
 * reflète les ventes de la session.
 */
export function CatalogueProduits() {
  const { produits } = useAppData();
  const [category, setCategory] = useState("toutes");

  const options = useMemo(
    () => [
      { value: "toutes", label: "Tous" },
      ...PRODUCT_CATEGORIES.filter((c) => c.id !== "boissons").map((c) => ({ value: c.id, label: c.name })),
    ],
    [],
  );

  // Le Bar (catégorie « boissons ») a son propre volet — ici on ne montre que le rayon revente.
  const filtered = produits.filter(
    (p) => p.active && p.categoryId !== "boissons" && (category === "toutes" || p.categoryId === category),
  );
  const lowCount = filtered.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outCount = filtered.filter((p) => p.stock <= 0).length;

  return (
    <Board
      legend={`${filtered.length} produit${filtered.length > 1 ? "s" : ""}`}
      legendRight={<ChipFilter options={options} value={category} onChange={setCategory} wrap={false} className="max-w-full sm:max-w-[70%]" />}
    >
      {filtered.length === 0 ? (
        <BoardEmpty title="Aucun produit dans cette catégorie" hint="Choisissez une autre catégorie ci-dessus." />
      ) : (
        <>
          {(lowCount > 0 || outCount > 0) && (
            <div className="border-b border-[var(--board-groove)] bg-black/[0.02] px-4 py-2">
              <Legend>
                {outCount > 0 && `${outCount} en rupture`}
                {outCount > 0 && lowCount > 0 && " · "}
                {lowCount > 0 && `${lowCount} à réapprovisionner`}
              </Legend>
            </div>
          )}
          <div className="grid grid-cols-2 gap-px bg-[var(--board-groove)] md:grid-cols-3 xl:grid-cols-4">
            {filtered.map((produit) => {
              const out = produit.stock <= 0;
              const low = !out && produit.stock <= 5;
              return (
                <div key={produit.id} className="flex flex-col bg-white">
                  <div className="relative aspect-[4/3]">
                    {produit.image ? (
                      <Image src={produit.image} alt={produit.name} fill className="object-cover" />
                    ) : (
                      <PhotoPlaceholder className="size-full rounded-none border-0" label="Photo à venir" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 border-t border-[var(--board-groove)] p-3">
                    <p className="line-clamp-2 text-sm font-semibold text-[var(--color-gray-900)]">{produit.name}</p>
                    <p className="text-sm font-semibold tabular-nums text-[var(--button-2-color)]">{formatFcfa(produit.price)}</p>
                    <span
                      className={cn(
                        "mt-auto pt-1 text-xs font-semibold tabular-nums",
                        out
                          ? "text-[var(--color-error)]"
                          : low
                            ? "text-[var(--board-amber)]"
                            : "text-[var(--color-gray-400)]",
                      )}
                    >
                      {out ? "Rupture de stock" : `${produit.stock} en stock`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Board>
  );
}
