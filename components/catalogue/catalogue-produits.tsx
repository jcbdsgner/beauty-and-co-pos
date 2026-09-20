"use client";

import { useMemo, useState } from "react";
import { CatalogueCard, CatalogueEmpty, CategoryRail, StatPill, StockLine, SubFilter } from "@/components/catalogue/catalogue-parts";
import { CatalogueLightbox } from "@/components/catalogue/catalogue-lightbox";
import { KERASTASE_GAMMES, PRODUCT_CATEGORIES } from "@/lib/data/menu";
import { useAppData } from "@/components/providers/app-data-provider";
import type { Produit } from "@/lib/data/types";

/**
 * Produits — volet de consultation du Catalogue : chaque produit avec sa photo et son stock
 * restant, en lecture seule. Aucun lien avec l'encaissement (la baisse de stock se fait au
 * Comptoir) — on regarde juste ce qu'il reste en rayon. Le stock lu vient du store, donc il
 * reflète les ventes de la session.
 *
 * Deux niveaux : une catégorie (Kérastase, Saryna Keys, Nefertiti, Beccy Wave, Autres) et, pour
 * Kérastase, ses gammes. En vitrine (ADR 0021) — rail de catégories + grille de cartes flottantes,
 * plus le tableau à rainures d'avant.
 */
const GAMME_ORDER = new Map(KERASTASE_GAMMES.map((g, i) => [g as string, i]));

export function CatalogueProduits() {
  const { produits } = useAppData();

  const [categoryId, setCategoryId] = useState<string>("toutes");
  const [subcategory, setSubcategory] = useState<string>("toutes");
  const [stockFilter, setStockFilter] = useState<"toutes" | "rupture" | "reappro">("toutes");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Le Bar a son propre volet — ici, uniquement le rayon revente.
  const inScope = useMemo(() => produits.filter((p) => p.active), [produits]);
  const catScoped = categoryId === "toutes" ? inScope : inScope.filter((p) => p.categoryId === categoryId);

  const subcats = useMemo(() => {
    const set = new Set<string>();
    for (const p of catScoped) if (p.subcategory) set.add(p.subcategory);
    return [...set].sort((a, b) => (GAMME_ORDER.get(a) ?? 99) - (GAMME_ORDER.get(b) ?? 99) || a.localeCompare(b, "fr"));
  }, [catScoped]);

  const bySubcategory = subcategory === "toutes" ? catScoped : catScoped.filter((p) => p.subcategory === subcategory);

  const categoryOptions = [
    { value: "toutes", label: "Tous les produits", count: inScope.length },
    ...PRODUCT_CATEGORIES.map((c) => ({ value: c.id, label: c.name, count: inScope.filter((p) => p.categoryId === c.id).length })),
  ];
  const subcatOptions = [
    { value: "toutes", label: "Toutes les gammes" },
    ...subcats.map((s) => ({ value: s, label: s })),
  ];

  const lowCount = bySubcategory.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outCount = bySubcategory.filter((p) => p.stock <= 0).length;

  const filtered =
    stockFilter === "rupture"
      ? bySubcategory.filter((p) => p.stock <= 0)
      : stockFilter === "reappro"
        ? bySubcategory.filter((p) => p.stock > 0 && p.stock <= 5)
        : bySubcategory;

  // Groupé par gamme quand aucune gamme n'est choisie et qu'il y en a plusieurs ; à plat sinon.
  const grouped = subcategory === "toutes" && subcats.length > 1;
  const groups = grouped
    ? subcats.map((s) => ({ label: s, items: filtered.filter((p) => p.subcategory === s) })).filter((g) => g.items.length > 0)
    : [{ label: null as string | null, items: filtered }];

  function pickCategory(id: string) {
    setCategoryId(id);
    setSubcategory("toutes");
    setStockFilter("toutes");
  }

  function toggleStockFilter(value: "rupture" | "reappro") {
    setStockFilter((current) => (current === value ? "toutes" : value));
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
      <CategoryRail options={categoryOptions} value={categoryId} onChange={pickCategory} />

      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {subcats.length > 0 ? (
            <SubFilter options={subcatOptions} value={subcategory} onChange={setSubcategory} />
          ) : (
            <p className="text-sm font-semibold text-base-content/60">
              {filtered.length} produit{filtered.length > 1 ? "s" : ""}
            </p>
          )}
          {(lowCount > 0 || outCount > 0) && (
            <div className="flex shrink-0 items-center gap-2">
              {outCount > 0 && (
                <StatPill tone="error" active={stockFilter === "rupture"} onClick={() => toggleStockFilter("rupture")}>
                  {outCount} en rupture
                </StatPill>
              )}
              {lowCount > 0 && (
                <StatPill tone="warning" active={stockFilter === "reappro"} onClick={() => toggleStockFilter("reappro")}>
                  {lowCount} à réapprovisionner
                </StatPill>
              )}
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <CatalogueEmpty title="Aucun produit ici" hint="Choisissez une autre catégorie ou gamme dans le rail." />
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.label ?? "all"} className="space-y-3">
                {group.label && (
                  <p className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-[0.12em] text-base-content/40">
                    {group.label}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {group.items.map((produit) => (
                    <ProductCard key={produit.id} produit={produit} onOpen={() => setOpenIndex(filtered.indexOf(produit))} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CatalogueLightbox
        items={filtered.map((p) => ({ id: p.id, name: p.name, price: p.price, image: p.image, description: p.description, stock: p.stock }))}
        index={openIndex}
        onNavigate={setOpenIndex}
        onClose={() => setOpenIndex(null)}
      />
    </div>
  );
}

function ProductCard({ produit, onOpen }: { produit: Produit; onOpen: () => void }) {
  return (
    <CatalogueCard
      name={produit.name}
      price={produit.price}
      image={produit.image}
      description={produit.description}
      footer={<StockLine stock={produit.stock} />}
      onOpen={onOpen}
    />
  );
}
