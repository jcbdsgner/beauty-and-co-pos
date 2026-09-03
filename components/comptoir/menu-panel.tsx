"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { LayoutGrid, Users } from "lucide-react";
import { SegmentedToggle } from "@/components/ui/molecules/segmented-toggle";
import { SearchInput } from "@/components/ui/atoms/search-input";
import { Pills } from "@/components/ui/molecules/pills";
import { PhotoPlaceholder } from "@/components/ui/atoms/photo-placeholder";
import { PRODUCT_CATEGORIES, SERVICE_CATEGORIES, SERVICES } from "@/lib/data/menu";
import { useAppData } from "@/components/providers/app-data-provider";
import { cn, formatFcfa } from "@/lib/utils";

/** Trois grandes familles encaissables, comme les volets du Catalogue : prestations, revente
 *  (Kérastase & co), et le Bar. Produits par défaut — une vente ouverte à froid est de la
 *  revente (ADR 0013) ; les prestations n'arrivent que d'une réservation. */
type MenuMode = "services" | "produits" | "boissons";

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
  const { addCartLine, sales, produits } = useAppData();
  const [mode, setMode] = useState<MenuMode>("produits");
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string>("toutes");
  const [subcategory, setSubcategory] = useState<string>("");

  const countByRef = useMemo(() => {
    const cart = sales.find((s) => s.id === saleId)?.cart ?? [];
    const m: Record<string, number> = {};
    for (const l of cart) m[l.refId] = (m[l.refId] ?? 0) + l.qty;
    return m;
  }, [sales, saleId]);

  // Le Bar est sa propre famille (comme le volet Boissons du Catalogue) : il ne vit plus dans le
  // rail de la revente.
  const categories =
    mode === "services" ? SERVICE_CATEGORIES : PRODUCT_CATEGORIES.filter((c) => c.id !== "boissons");
  const items = mode === "services" ? SERVICES : produits;
  const showRail = mode !== "boissons" && categories.length > 0;

  const railTiles = useMemo(
    () => [
      { id: "toutes", name: "Toutes", count: items.filter((i) => i.active && i.categoryId !== "boissons").length },
      ...categories.map((c) => ({ id: c.id, name: c.name, count: items.filter((i) => i.categoryId === c.id).length })),
    ],
    [categories, items],
  );

  // Subcategories exist within a chosen category — service subcategories, or product ranges
  // (a Kérastase gamme). The data is stored in range order, so Set insertion order is display order.
  const subcats = useMemo(() => {
    if (categoryId === "toutes") return [];
    const set = new Set<string>();
    const source = mode === "services" ? SERVICES : produits;
    for (const it of source) {
      if (it.categoryId === categoryId && "subcategory" in it && it.subcategory) set.add(it.subcategory);
    }
    return [...set];
  }, [mode, categoryId, produits]);

  const filtered = items.filter((item) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || item.name.toLowerCase().includes(q);
    const matchesCategory =
      mode === "boissons"
        ? item.categoryId === "boissons"
        : categoryId === "toutes"
          ? item.categoryId !== "boissons"
          : item.categoryId === categoryId;
    const matchesSub = !subcategory || ("subcategory" in item && item.subcategory === subcategory);
    return matchesQuery && matchesCategory && matchesSub && item.active;
  });

  function pickCategory(id: string) {
    setCategoryId(id);
    setSubcategory("");
  }

  const activeCategory = categoryId === "toutes" ? null : railTiles.find((t) => t.id === categoryId);
  const activeCategoryIcon = CATEGORY_ICON[categoryId];

  const searchPlaceholder =
    mode === "services" ? "Rechercher une prestation…" : mode === "boissons" ? "Rechercher une boisson…" : "Rechercher un produit…";

  return (
    <div className="flex h-full min-h-0 gap-4">
      {/* Vertical category rail — pas pour le Bar (aucune sous-catégorie) */}
      {showRail && (
        <nav className="flex w-[112px] shrink-0 flex-col gap-1.5 overflow-y-auto pb-2" aria-label="Catégories">
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
                  "flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-[14px] px-1.5 py-2.5 text-center transition active:scale-[0.95]",
                  active ? "bg-secondary text-white" : "bg-white text-[var(--color-gray-600)] hover:bg-accent",
                )}
              >
                {icon ? (
                  <Image src={icon} alt="" width={26} height={26} className={cn("size-6 object-contain", active && "brightness-0 invert")} />
                ) : (
                  <LayoutGrid aria-hidden className="size-6" />
                )}
                <span className="w-full truncate text-[11px] font-semibold leading-tight">{cat.name}</span>
                <span className={cn("text-[10px] tabular-nums", active ? "text-white/70" : "text-[var(--color-gray-500)]")}>{cat.count}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Menu */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
        <div className="flex shrink-0 items-center gap-3">
          <SegmentedToggle
            className="shrink-0"
            options={[
              { value: "services", label: "Services" },
              { value: "produits", label: "Produits" },
              { value: "boissons", label: "Boissons" },
            ]}
            value={mode}
            onChange={(v) => {
              setMode(v as MenuMode);
              pickCategory("toutes");
            }}
          />
          <SearchInput
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        {subcats.length > 0 && (
          <Pills
            className="shrink-0"
            wrap={false}
            options={[{ value: "", label: "Tout" }, ...subcats.map((s) => ({ value: s, label: s }))]}
            value={subcategory}
            onChange={setSubcategory}
          />
        )}

        {activeCategory && (
          <div className="flex shrink-0 items-center gap-2 px-0.5">
            {activeCategoryIcon ? (
              <Image src={activeCategoryIcon} alt="" width={22} height={22} className="size-[22px] shrink-0 object-contain" />
            ) : (
              <LayoutGrid aria-hidden className="size-[22px] shrink-0 text-[var(--color-gray-500)]" />
            )}
            <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-[var(--color-gray-900)]">
              {activeCategory.name}
            </h3>
            <span className="text-xs tabular-nums text-[var(--color-gray-500)]">{filtered.length}</span>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto pb-2">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-[var(--color-gray-500)]">
              {mode === "services"
                ? "Aucune prestation ne correspond."
                : mode === "boissons"
                  ? "Aucune boisson ne correspond."
                  : "Aucun produit ne correspond."}
            </p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(158px,1fr))] gap-3">
              {filtered.map((item) => {
                const inCart = countByRef[item.id] ?? 0;
                const isProduit = !("durationMinutes" in item);
                // Les boissons du Bar ne portent pas de stock affiché (un bar ne compte pas au verre).
                const tracksStock = "stock" in item && item.categoryId !== "boissons";
                const remaining = tracksStock ? item.stock - inCart : null;
                const soldOut = remaining !== null && remaining <= 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={soldOut}
                    onClick={() =>
                      addCartLine(saleId, {
                        refId: item.id,
                        kind: isProduit ? "produit" : "service",
                        name: item.name,
                        unitPrice: item.price,
                      })
                    }
                    title={item.name}
                    className={cn(
                      "relative flex min-h-[120px] flex-col rounded-[14px] border-2 text-left transition active:scale-[0.96]",
                      soldOut
                        ? "cursor-not-allowed border-border bg-[var(--color-gray-50)]"
                        : inCart > 0
                          ? "border-[var(--brand-taupe-muted)] bg-[var(--board-taupe-plaque)]"
                          : "border-border bg-white hover:border-[var(--brand-taupe-muted)]/40",
                    )}
                  >
                    {inCart > 0 && (
                      <span className="absolute top-1.5 right-1.5 z-10 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground tabular-nums shadow-sm">
                        {inCart}
                      </span>
                    )}
                    {isProduit && (
                      <div
                        className={cn(
                          "relative aspect-[5/3] w-full overflow-hidden rounded-t-[12px] bg-white",
                          soldOut && "opacity-60 grayscale",
                        )}
                      >
                        {"image" in item && item.image ? (
                          <Image src={item.image} alt="" fill sizes="200px" className="object-contain p-1.5" />
                        ) : (
                          <PhotoPlaceholder className="size-full rounded-none border-0 bg-transparent" label="Photo" />
                        )}
                      </div>
                    )}
                    <div className="flex flex-1 flex-col justify-between gap-2 p-3.5">
                      <span className="line-clamp-3 text-[13px] leading-snug font-semibold text-[var(--color-gray-900)]">
                        {item.name}
                      </span>
                      <span className="flex flex-col gap-1">
                        <span className="flex items-baseline justify-between gap-1.5">
                          <span className="text-[17px] font-bold text-[var(--button-2-color)] tabular-nums">
                            {formatFcfa(item.price)}
                          </span>
                          <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-gray-500)] tabular-nums">
                            {"twoPractitionersEligible" in item && item.twoPractitionersEligible && (
                              <span title="Réalisable à deux praticiennes" className="flex items-center gap-0.5">
                                <Users aria-hidden className="size-3" />2
                              </span>
                            )}
                            {"durationMinutes" in item && <span>{item.durationMinutes} min</span>}
                          </span>
                        </span>
                        {remaining !== null && (
                          <span
                            className={cn(
                              "text-[11px] font-semibold tabular-nums",
                              soldOut
                                ? "text-[var(--color-error)]"
                                : remaining <= 5
                                  ? "text-[var(--board-amber)]"
                                  : "text-[var(--color-gray-500)]",
                            )}
                          >
                            {soldOut ? "Rupture" : `${remaining} en stock`}
                          </span>
                        )}
                      </span>
                    </div>
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
