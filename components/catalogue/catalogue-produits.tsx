"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Board, BoardEmpty, ChipFilter, Legend } from "@/components/ui/board";
import { PhotoPlaceholder } from "@/components/ui/atoms/photo-placeholder";
import { KERASTASE_GAMMES, PRODUCT_CATEGORIES } from "@/lib/data/menu";
import { useAppData } from "@/components/providers/app-data-provider";
import { cn, formatFcfa } from "@/lib/utils";
import type { Produit } from "@/lib/data/types";

/**
 * Produits — volet de consultation du Catalogue : chaque produit avec sa photo et son stock
 * restant, en lecture seule. Aucun lien avec l'encaissement (la baisse de stock se fait au
 * Comptoir) — on regarde juste ce qu'il reste en rayon. Le stock lu vient du store, donc il
 * reflète les ventes de la session.
 *
 * Deux niveaux : une catégorie (Kérastase, d'autres à venir) et ses sous-catégories — pour
 * Kérastase, les gammes. Même principe que « coiffure » et ses sous-catégories côté prestations.
 */
const GAMME_ORDER = new Map(KERASTASE_GAMMES.map((g, i) => [g as string, i]));

export function CatalogueProduits() {
  const { produits } = useAppData();

  const categories = useMemo(() => PRODUCT_CATEGORIES.filter((c) => c.id !== "boissons"), []);
  const [categoryId, setCategoryId] = useState<string>(categories.length === 1 ? categories[0].id : "toutes");
  const [subcategory, setSubcategory] = useState<string>("toutes");

  // Le Bar (catégorie « boissons ») a son propre volet — ici on ne montre que le rayon revente.
  const inScope = useMemo(
    () => produits.filter((p) => p.active && p.categoryId !== "boissons"),
    [produits],
  );
  const catScoped = categoryId === "toutes" ? inScope : inScope.filter((p) => p.categoryId === categoryId);

  const subcats = useMemo(() => {
    const set = new Set<string>();
    for (const p of catScoped) if (p.subcategory) set.add(p.subcategory);
    return [...set].sort((a, b) => (GAMME_ORDER.get(a) ?? 99) - (GAMME_ORDER.get(b) ?? 99) || a.localeCompare(b, "fr"));
  }, [catScoped]);

  const filtered = subcategory === "toutes" ? catScoped : catScoped.filter((p) => p.subcategory === subcategory);

  const categoryOptions = [
    { value: "toutes", label: "Tous" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];
  const subcatOptions = [
    { value: "toutes", label: "Toutes" },
    ...subcats.map((s) => ({ value: s, label: s })),
  ];

  const lowCount = filtered.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outCount = filtered.filter((p) => p.stock <= 0).length;

  // Grouped by gamme when no gamme is picked and more than one exists; flat otherwise.
  const grouped = subcategory === "toutes" && subcats.length > 1;
  const groups = grouped
    ? subcats.map((s) => ({ label: s, items: filtered.filter((p) => p.subcategory === s) }))
    : [{ label: null as string | null, items: filtered }];

  function pickCategory(id: string) {
    setCategoryId(id);
    setSubcategory("toutes");
  }

  return (
    <Board
      legend={`${filtered.length} produit${filtered.length > 1 ? "s" : ""}`}
      legendRight={
        categories.length > 1 ? (
          <ChipFilter options={categoryOptions} value={categoryId} onChange={pickCategory} wrap={false} className="max-w-full sm:max-w-[70%]" />
        ) : null
      }
    >
      {subcats.length > 0 && (
        <div className="border-b border-[var(--board-groove)] px-3 py-2">
          <ChipFilter options={subcatOptions} value={subcategory} onChange={setSubcategory} wrap={false} />
        </div>
      )}

      {filtered.length === 0 ? (
        <BoardEmpty title="Aucun produit ici" hint="Choisissez une autre catégorie ou gamme ci-dessus." />
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
          {groups.map((group) => (
            <div key={group.label ?? "all"}>
              {group.label && (
                <div className="border-b border-[var(--board-groove)] bg-black/[0.02] px-4 py-2">
                  <Legend>{group.label} · {group.items.length}</Legend>
                </div>
              )}
              <div className="grid grid-cols-2 gap-px bg-[var(--board-groove)] md:grid-cols-3 xl:grid-cols-4">
                {group.items.map((produit) => (
                  <ProductTile key={produit.id} produit={produit} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </Board>
  );
}

function ProductTile({ produit }: { produit: Produit }) {
  const out = produit.stock <= 0;
  const low = !out && produit.stock <= 5;
  return (
    <div className="flex flex-col bg-white">
      <div className="relative aspect-[4/3] bg-white">
        {produit.image ? (
          <Image src={produit.image} alt={produit.name} fill sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw" className="object-contain p-3" />
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
            out ? "text-[var(--color-error)]" : low ? "text-[var(--board-amber)]" : "text-[var(--color-gray-400)]",
          )}
        >
          {out ? "Rupture de stock" : `${produit.stock} en stock`}
        </span>
      </div>
    </div>
  );
}
