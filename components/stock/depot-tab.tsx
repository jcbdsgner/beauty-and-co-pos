"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { ChevronIcon } from "@/components/ui/icons";
import { ClockIcon, DocumentIcon, PaperPlaneIcon } from "@/components/stock/icons";
import { ProductCard } from "@/components/stock/product-card";
import { stockLevel } from "@/components/stock/stock-progress-bar";
import { CATEGORY_LABELS, PRODUCTS, type Product, type ProductCategory } from "@/lib/data/stock";
import { cn } from "@/lib/utils";

type DepotTabProps = {
  entrepriseId: string;
  entrepriseLabel: string;
  onReappro: (product: Product) => void;
  onOpenSendDialog: () => void;
};

/** Onglet "Depot" — stock central de l'entreprise selectionnee, groupe par categorie. */
export function DepotTab({ entrepriseId, entrepriseLabel, onReappro, onOpenSendDialog }: DepotTabProps) {
  const [query, setQuery] = useState("");
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const depotProducts = useMemo(() => {
    return PRODUCTS.filter((p) => p.entrepriseId === entrepriseId)
      .filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
      .filter((p) => !onlyLowStock || stockLevel(p.depotStock, p.min) !== "ok");
  }, [entrepriseId, query, onlyLowStock]);

  const totalUnits = depotProducts.reduce((sum, p) => sum + p.depotStock, 0);
  const lowStockCount = depotProducts.filter((p) => stockLevel(p.depotStock, p.min) !== "ok").length;

  const grouped = useMemo(() => {
    const map = new Map<ProductCategory, Product[]>();
    for (const product of depotProducts) {
      const list = map.get(product.category) ?? [];
      list.push(product);
      map.set(product.category, list);
    }
    return Array.from(map.entries());
  }, [depotProducts]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          placeholder="Rechercher un produit..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => setOnlyLowStock((v) => !v)}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium",
            onlyLowStock
              ? "border-[var(--pos-accent-dark)] bg-[var(--brand-rose-soft)] text-[var(--pos-accent-dark)]"
              : "border-[var(--color-gray-200)] bg-white text-[var(--color-gray-600)]",
          )}
        >
          Filtres <ChevronIcon className="rotate-90" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="font-[var(--font-heading)] text-2xl text-[var(--color-gray-900)]">{depotProducts.length}</p>
          <p className="text-xs text-[var(--color-gray-500)]">Produits</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="font-[var(--font-heading)] text-2xl text-[var(--color-success)]">{totalUnits}</p>
          <p className="text-xs text-[var(--color-gray-500)]">Total unites</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="font-[var(--font-heading)] text-2xl text-[var(--color-warning)]">{lowStockCount}</p>
          <p className="text-xs text-[var(--color-gray-500)]">Stock bas</p>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="brand" icon={<DocumentIcon />} className="flex-1">
          Entrée dépôt
        </Button>
        <Button variant="outline" icon={<PaperPlaneIcon />} className="flex-1" onClick={onOpenSendDialog}>
          Envoi salon
        </Button>
      </div>

      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-gray-500)]">
        <ClockIcon /> Historique receptions <ChevronIcon className="rotate-90" />
      </span>

      <div className="flex items-center justify-between">
        <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">Depot {entrepriseLabel}</h2>
        <span className="text-sm text-[var(--color-gray-500)]">{depotProducts.length} articles</span>
      </div>

      {grouped.length === 0 ? (
        <EmptyState icon={<DocumentIcon className="size-12" />} title="Aucun produit ne correspond à cette recherche" />
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(([category, products]) => (
            <div key={category} className="flex flex-col gap-3">
              <p className="text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
                {CATEGORY_LABELS[category]} · {products.length} produits
              </p>
              <div className="flex flex-col gap-3">
                {products.map((product) => (
                  <ProductCard key={product.id} variant="depot" product={product} onReappro={onReappro} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
