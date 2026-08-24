"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Pills, type PillOption } from "@/components/ui/pills";
import { StoreIcon, PaperPlaneIcon } from "@/components/stock/icons";
import { ProductCard } from "@/components/stock/product-card";
import { stockLevel } from "@/components/stock/stock-progress-bar";
import { CATEGORY_LABELS, PRODUCTS, type Product, type ProductCategory, type ProductType } from "@/lib/data/stock";

type TypeFilter = "tous" | ProductType;
type CategoryFilter = "toutes" | ProductCategory;

type SalonTabProps = {
  salonId: string;
  salonLabel: string;
  onReappro: (product: Product) => void;
  onOpenSendDialog: () => void;
};

/** Onglet "Salon" — stock du salon selectionne : filtres Revente/Interne + categorie, 3 tuiles stats, liste groupee. */
export function SalonTab({ salonId, salonLabel, onReappro, onOpenSendDialog }: SalonTabProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("tous");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("toutes");

  const salonProducts = useMemo(() => PRODUCTS.filter((p) => p.salonId === salonId), [salonId]);

  const filtered = useMemo(() => {
    return salonProducts
      .filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
      .filter((p) => typeFilter === "tous" || p.type === typeFilter)
      .filter((p) => categoryFilter === "toutes" || p.category === categoryFilter);
  }, [salonProducts, query, typeFilter, categoryFilter]);

  const typeOptions: PillOption[] = [
    { value: "tous", label: "Tous" },
    { value: "revente", label: "Revente", count: salonProducts.filter((p) => p.type === "revente").length },
    { value: "backbar", label: "Interne", count: salonProducts.filter((p) => p.type === "backbar").length },
  ];

  const categoriesPresent = Array.from(new Set(salonProducts.map((p) => p.category)));
  const categoryOptions: PillOption[] = [
    { value: "toutes", label: "Toutes categories" },
    ...categoriesPresent.map((cat) => ({ value: cat, label: CATEGORY_LABELS[cat] })),
  ];

  const totalUnits = filtered.reduce((sum, p) => sum + (p.salonStock ?? 0), 0);
  const lowStockCount = filtered.filter((p) => stockLevel(p.salonStock ?? 0, p.min) !== "ok").length;

  const grouped = useMemo(() => {
    const map = new Map<ProductCategory, Product[]>();
    for (const product of filtered) {
      const list = map.get(product.category) ?? [];
      list.push(product);
      map.set(product.category, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (salonId === "tous") {
    return (
      <EmptyState
        icon={<StoreIcon className="size-12" />}
        title="Sélectionnez un salon"
        subtitle="Choisissez un salon dans le sélecteur en haut de page pour voir son stock."
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <SearchInput placeholder="Rechercher un produit..." value={query} onChange={(e) => setQuery(e.target.value)} />

      <Pills options={typeOptions} value={typeFilter} onChange={(v) => setTypeFilter(v as TypeFilter)} />

      <div className="overflow-x-auto">
        <Pills
          options={categoryOptions}
          value={categoryFilter}
          onChange={(v) => setCategoryFilter(v as CategoryFilter)}
          className="flex-nowrap"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="font-[var(--font-heading)] text-2xl text-[var(--color-gray-900)]">{filtered.length}</p>
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

      <Button variant="brand" icon={<PaperPlaneIcon />} className="w-full" onClick={onOpenSendDialog}>
        Approvisionner {salonLabel}
      </Button>

      <div className="flex items-center justify-between">
        <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">Stock {salonLabel}</h2>
        <span className="text-sm text-[var(--color-gray-500)]">{filtered.length} articles</span>
      </div>

      {grouped.length === 0 ? (
        <EmptyState icon={<StoreIcon className="size-12" />} title="Aucun produit ne correspond à cette recherche" />
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(([category, products]) => (
            <div key={category} className="flex flex-col gap-3">
              <p className="text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
                {CATEGORY_LABELS[category]} · {products.length} produits
              </p>
              <div className="flex flex-col gap-3">
                {products.map((product) => (
                  <ProductCard key={product.id} variant="salon" product={product} onReappro={onReappro} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
