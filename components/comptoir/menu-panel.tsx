"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { LayoutGrid, Users } from "lucide-react";
import { SegmentedToggle } from "@/components/ui/molecules/segmented-toggle";
import { SearchInput } from "@/components/ui/atoms/search-input";
import { Pills } from "@/components/ui/molecules/pills";
import { PRODUCT_CATEGORIES, PRODUITS, SERVICE_CATEGORIES, SERVICES } from "@/lib/data/menu";
import { useAppData } from "@/components/providers/app-data-provider";
import { cn, formatFcfa } from "@/lib/utils";

type MenuMode = "services" | "produits";

/** Category → rail icon. Missing keys fall back to a generic grid glyph. */
const CATEGORY_ICON: Record<string, string> = {
  coiffure: "/images/services/service-coiffure.svg",
  "manucure-pedicure": "/images/services/service-manucure-pedicure.svg",
  onglerie: "/images/services/icon-onglerie.svg",
  spa: "/images/services/service-spa.svg",
  "soin-du-visage": "/images/services/service-soin-visage.svg",
  epilation: "/images/services/service-epilation.svg",
  "mini-co-hair": "/images/services/service-mini-co.png",
  "mini-co-spa": "/images/services/service-mini-co.png",
};

export function MenuPanel({ saleId }: { saleId: string }) {
  const { addCartLine, sales } = useAppData();
  const [mode, setMode] = useState<MenuMode>("services");
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string>("toutes");
  const [subcategory, setSubcategory] = useState<string>("");

  const countByRef = useMemo(() => {
    const cart = sales.find((s) => s.id === saleId)?.cart ?? [];
    const m: Record<string, number> = {};
    for (const l of cart) m[l.refId] = (m[l.refId] ?? 0) + l.qty;
    return m;
  }, [sales, saleId]);

  const categories = mode === "services" ? SERVICE_CATEGORIES : PRODUCT_CATEGORIES;
  const items = mode === "services" ? SERVICES : PRODUITS;

  const railTiles = useMemo(
    () => [
      { id: "toutes", name: "Toutes", count: items.filter((i) => i.active).length },
      ...categories.map((c) => ({ id: c.id, name: c.name, count: items.filter((i) => i.categoryId === c.id).length })),
    ],
    [categories, items],
  );

  // Subcategories exist only on services and only within a chosen category.
  const subcats = useMemo(() => {
    if (mode !== "services" || categoryId === "toutes") return [];
    const set = new Set<string>();
    for (const s of SERVICES) if (s.categoryId === categoryId && "subcategory" in s && s.subcategory) set.add(s.subcategory);
    return [...set];
  }, [mode, categoryId]);

  const filtered = items.filter((item) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || item.name.toLowerCase().includes(q);
    const matchesCategory = categoryId === "toutes" || item.categoryId === categoryId;
    const matchesSub = !subcategory || ("subcategory" in item && item.subcategory === subcategory);
    return matchesQuery && matchesCategory && matchesSub && item.active;
  });

  function pickCategory(id: string) {
    setCategoryId(id);
    setSubcategory("");
  }

  return (
    <div className="flex h-full min-h-0 gap-4">
      {/* Vertical category rail */}
      <nav className="flex w-[88px] shrink-0 flex-col gap-1.5 overflow-y-auto pb-2" aria-label="Catégories">
        {railTiles.map((cat) => {
          const active = cat.id === categoryId;
          const icon = CATEGORY_ICON[cat.id];
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => pickCategory(cat.id)}
              aria-pressed={active}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-1 py-3 text-center transition active:scale-[0.95]",
                active ? "bg-secondary text-white" : "bg-white text-[var(--color-gray-500)] hover:bg-accent",
              )}
            >
              {icon ? (
                <Image src={icon} alt="" width={28} height={28} className={cn("size-7 object-contain", active && "brightness-0 invert")} />
              ) : (
                <LayoutGrid aria-hidden className="size-7" />
              )}
              <span className="line-clamp-2 text-[10px] leading-tight font-semibold">{cat.name}</span>
              <span className={cn("text-[10px] tabular-nums", active ? "text-white/70" : "text-[var(--color-gray-400)]")}>{cat.count}</span>
            </button>
          );
        })}
      </nav>

      {/* Menu */}
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex shrink-0 items-center gap-3">
          <SegmentedToggle
            className="shrink-0"
            options={[
              { value: "services", label: "Services" },
              { value: "produits", label: "Produits" },
            ]}
            value={mode}
            onChange={(v) => {
              setMode(v as MenuMode);
              pickCategory("toutes");
            }}
          />
          <SearchInput
            placeholder="Rechercher une prestation…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        {subcats.length > 0 && (
          <Pills
            className="shrink-0 flex-nowrap overflow-x-auto"
            options={[{ value: "", label: "Tout" }, ...subcats.map((s) => ({ value: s, label: s }))]}
            value={subcategory}
            onChange={setSubcategory}
          />
        )}

        <div className="min-h-0 flex-1 overflow-y-auto pb-2">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-[var(--color-gray-400)]">Aucune prestation ne correspond.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(158px,1fr))] gap-3">
              {filtered.map((item) => {
                const inCart = countByRef[item.id] ?? 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      addCartLine(saleId, {
                        refId: item.id,
                        kind: mode === "services" ? "service" : "produit",
                        name: item.name,
                        unitPrice: item.price,
                      })
                    }
                    className={cn(
                      "relative flex min-h-[112px] flex-col justify-between rounded-2xl border bg-white p-3.5 text-left transition active:scale-[0.96]",
                      inCart > 0 ? "border-secondary" : "border-border hover:border-secondary/50",
                    )}
                  >
                    {inCart > 0 && (
                      <span className="absolute -top-2 -right-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground tabular-nums">
                        {inCart}
                      </span>
                    )}
                    <span className="line-clamp-2 text-[13px] leading-snug font-semibold text-[var(--color-gray-900)]">{item.name}</span>
                    <span className="mt-2 flex items-center justify-between gap-1">
                      <span className="text-[15px] font-bold text-[var(--button-2-color)] tabular-nums">{formatFcfa(item.price)}</span>
                      <span className="flex items-center gap-1">
                        {"twoPractitionersEligible" in item && item.twoPractitionersEligible && (
                          <span
                            title="Réalisable à deux praticiennes"
                            className="flex items-center gap-0.5 rounded-full bg-[var(--brand-rose-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--brand-taupe-muted)]"
                          >
                            <Users aria-hidden className="size-3" /> 2
                          </span>
                        )}
                        {"durationMinutes" in item && (
                          <span className="rounded-full bg-[var(--color-gray-100)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-gray-500)] tabular-nums">
                            {item.durationMinutes} min
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
