"use client";

import { useMemo, useState } from "react";
import { SegmentedToggle } from "@/components/ui/molecules/segmented-toggle";
import { SearchInput } from "@/components/ui/atoms/search-input";
import { Pills, type PillOption } from "@/components/ui/molecules/pills";
import { Card } from "@/components/ui/atoms/card";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { PRODUCT_CATEGORIES, PRODUITS, SERVICE_CATEGORIES, SERVICES } from "@/lib/data/catalogue";
import { useAppData } from "@/components/providers/app-data-provider";
import { formatFcfa } from "@/lib/utils";

type CatalogueMode = "services" | "produits";

export function CataloguePanel({ saleId }: { saleId: string }) {
  const { addCartLine } = useAppData();
  const [mode, setMode] = useState<CatalogueMode>("services");
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string>("toutes");

  const categories = mode === "services" ? SERVICE_CATEGORIES : PRODUCT_CATEGORIES;
  const items = mode === "services" ? SERVICES : PRODUITS;

  const categoryOptions: PillOption[] = useMemo(
    () => [
      { value: "toutes", label: "Toutes" },
      ...categories.map((c) => ({ value: c.id, label: c.name, count: items.filter((i) => i.categoryId === c.id).length })),
    ],
    [categories, items],
  );

  const filtered = items.filter((item) => {
    const matchesQuery = item.name.toLowerCase().includes(query.trim().toLowerCase());
    const matchesCategory = categoryId === "toutes" || item.categoryId === categoryId;
    return matchesQuery && matchesCategory && item.active;
  });

  return (
    <div className="flex flex-col gap-4">
      <SegmentedToggle
        options={[
          { value: "services", label: "Services" },
          { value: "produits", label: "Produits" },
        ]}
        value={mode}
        onChange={(v) => {
          setMode(v as CatalogueMode);
          setCategoryId("toutes");
        }}
      />

      <SearchInput placeholder="Rechercher un article…" value={query} onChange={(e) => setQuery(e.target.value)} />

      <div className="overflow-x-auto">
        <Pills options={categoryOptions} value={categoryId} onChange={setCategoryId} className="flex-nowrap" />
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-[var(--color-gray-400)]">Aucun article ne correspond à cette recherche.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {filtered.map((item) => (
            <Card
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() =>
                addCartLine(saleId, {
                  refId: item.id,
                  kind: mode === "services" ? "service" : "produit",
                  name: item.name,
                  unitPrice: item.price,
                })
              }
              className="flex cursor-pointer flex-col gap-1 p-4 text-left transition active:scale-[0.97] hover:border-[var(--brand-taupe-muted)]"
            >
              <p className="line-clamp-2 text-sm font-semibold text-[var(--color-gray-900)]">{item.name}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--button-2-color)]">{formatFcfa(item.price)}</span>
                {"durationMinutes" in item && <FieldLabel className="text-[11px]">{item.durationMinutes} min</FieldLabel>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
