"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Check, LayoutGrid, type LucideIcon, Users } from "lucide-react";
import { SegmentedToggle } from "@/components/ui/molecules/segmented-toggle";
import { SearchInput } from "@/components/ui/atoms/search-input";
import { PhotoPlaceholder } from "@/components/ui/atoms/photo-placeholder";
import {
  CoiffureIcon,
  EpilationIcon,
  ManucurePedicureIcon,
  OnglerieIcon,
  SoinVisageIcon,
  SpaIcon,
} from "@/components/ui/atoms/service-category-icons";
import { PRODUCT_CATEGORIES, SERVICE_CATEGORIES, SERVICES } from "@/lib/data/menu";
import { useAppData } from "@/components/providers/app-data-provider";
import { cn, formatFcfa } from "@/lib/utils";

/** Trois grandes familles encaissables, comme les volets du Catalogue : prestations, revente
 *  (Kérastase & co), et le Bar. Produits par défaut — une vente ouverte à froid est de la
 *  revente (ADR 0013) ; les prestations n'arrivent que d'une réservation. */
type MenuMode = "services" | "produits" | "boissons";

/**
 * Deux niveaux de catégories. Les grandes catégories (Coiffure, Spa, Onglerie…) sont des blocs
 * carrés en grille 2 colonnes dans un rail vertical à gauche de la zone menu, icône en haut,
 * libellé en bas. Sélectionner une catégorie assez profonde (Coiffure) déplie ses sous-catégories
 * en boutons qui reviennent à la ligne au-dessus de la grille — aucune barre à faire défiler.
 * Promouvoir directement les sous-catégories de Coiffure au premier niveau enfouissait toutes les
 * autres grandes catégories. En Produits, le rail porte les gammes Kérastase. Le Bar (Boissons)
 * n'a pas de rail.
 */

/** Icône par grande catégorie de prestations (clé de filtre `c:<id>` ou `all`). Mini&Co reprend
 *  l'icône de sa famille adulte (Hair → Coiffure, Spa → Spa), comme dans le catalogue b&co. */
type CategoryIcon = LucideIcon | ((props: { className?: string }) => React.JSX.Element);
const CATEGORY_ICON: Record<string, CategoryIcon> = {
  all: LayoutGrid,
  "c:coiffure": CoiffureIcon,
  "c:manucure-pedicure": ManucurePedicureIcon,
  "c:onglerie": OnglerieIcon,
  "c:spa": SpaIcon,
  "c:soin-du-visage": SoinVisageIcon,
  "c:epilation": EpilationIcon,
  "c:mini-co-hair": CoiffureIcon,
  "c:mini-co-spa": SpaIcon,
};
type Filter = {
  key: string;
  label: string;
  /** true ⇔ l'article appartient à ce filtre. `Tout` accepte tout ce que la famille affiche. */
  match: (categoryId: string, subcategory: string | undefined) => boolean;
};

/** Rangée du haut + sous-rangées dépliables, indexées par la clé de la grande catégorie. */
type FilterTree = { top: Filter[]; subsByParent: Record<string, Filter[]> };

const ALL: Filter = { key: "all", label: "Tout", match: (c) => c !== "boissons" };
const catFilter = (id: string, label: string): Filter => ({ key: `c:${id}`, label, match: (c) => c === id });
const subFilter = (label: string): Filter => ({ key: `s:${label}`, label, match: (_c, s) => s === label });

/** Sous-catégories présentes sous une catégorie, dans l'ordre des données (= ordre d'affichage). */
function subcategoriesOf(items: ReadonlyArray<{ categoryId: string; subcategory?: string }>, categoryId: string): string[] {
  const seen = new Set<string>();
  for (const it of items) if (it.categoryId === categoryId && it.subcategory) seen.add(it.subcategory);
  return [...seen];
}

function serviceFilterTree(): FilterTree {
  const top: Filter[] = [ALL];
  const subsByParent: Record<string, Filter[]> = {};
  for (const cat of SERVICE_CATEGORIES) {
    const parent = catFilter(cat.id, cat.name);
    top.push(parent);
    const subs = subcategoriesOf(SERVICES, cat.id);
    // Une seule sous-catégorie ne mérite pas sa rangée : la grande catégorie suffit.
    if (subs.length > 1) {
      subsByParent[parent.key] = [{ ...parent, label: "Tout" }, ...subs.map(subFilter)];
    }
  }
  return { top, subsByParent };
}

export function MenuPanel({ saleId }: { saleId: string }) {
  const { addCartLine, sales, produits } = useAppData();
  const [mode, setMode] = useState<MenuMode>("produits");
  const [query, setQuery] = useState("");
  const [filterKey, setFilterKey] = useState("all");

  const countByRef = useMemo(() => {
    const cart = sales.find((s) => s.id === saleId)?.cart ?? [];
    const m: Record<string, number> = {};
    for (const l of cart) m[l.refId] = (m[l.refId] ?? 0) + l.qty;
    return m;
  }, [sales, saleId]);

  const items = mode === "services" ? SERVICES : produits;

  const { top: topFilters, subsByParent } = useMemo<FilterTree>(() => {
    if (mode === "services") return serviceFilterTree();
    if (mode === "produits") {
      const source = produits as ReadonlyArray<{ categoryId: string; subcategory?: string }>;
      const hasKerastase = PRODUCT_CATEGORIES.some((c) => c.id === "kerastase");
      const ranges = hasKerastase ? subcategoriesOf(source, "kerastase") : [];
      return { top: [ALL, ...ranges.map(subFilter)], subsByParent: {} };
    }
    return { top: [], subsByParent: {} };
  }, [mode, produits]);

  // La grande catégorie dépliée : celle qui est sélectionnée, ou le parent de la sous-catégorie active.
  const openParentKey = useMemo(() => {
    if (subsByParent[filterKey]) return filterKey;
    for (const [parentKey, subs] of Object.entries(subsByParent)) {
      if (subs.some((s) => s.key === filterKey)) return parentKey;
    }
    return null;
  }, [filterKey, subsByParent]);

  const subFilters = openParentKey ? subsByParent[openParentKey] : null;
  const allFilters = useMemo(
    () => [...topFilters, ...Object.values(subsByParent).flat()],
    [topFilters, subsByParent],
  );
  const activeFilter = allFilters.find((f) => f.key === filterKey) ?? ALL;

  const filtered = items.filter((item) => {
    if (!item.active) return false;
    const q = query.trim().toLowerCase();
    if (q && !item.name.toLowerCase().includes(q)) return false;
    if (mode === "boissons") return item.categoryId === "boissons";
    const sub = "subcategory" in item ? ((item as { subcategory?: string }).subcategory) : undefined;
    return activeFilter.match(item.categoryId, sub);
  });

  const searchPlaceholder =
    mode === "services"
      ? "Rechercher une prestation…"
      : mode === "boissons"
        ? "Rechercher une boisson…"
        : "Rechercher un produit…";

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* Famille + recherche */}
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
            setFilterKey("all");
            setQuery("");
          }}
        />
        <SearchInput
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Corps : rail des grandes catégories à gauche (blocs verticaux + icône), sous-catégories
          qui reviennent à la ligne + grille à droite. Pas de rail pour le Bar. */}
      <div className="flex min-h-0 flex-1 gap-4">
        {topFilters.length > 1 && (
          <div className="grid w-[184px] shrink-0 auto-rows-min grid-cols-2 gap-1.5 overflow-y-auto pr-0.5">
            {topFilters.map((f) => {
              const active = f.key === activeFilter.key || f.key === openParentKey;
              const Icon = CATEGORY_ICON[f.key];
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilterKey(f.key)}
                  aria-pressed={active}
                  className={cn(
                    "flex aspect-square shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border p-2 text-center text-[12px] leading-[1.15] font-medium transition active:scale-[0.98]",
                    active
                      ? "border-transparent bg-primary text-primary-content"
                      : "border-border bg-white text-base-content/80 hover:bg-base-200",
                  )}
                >
                  {Icon ? (
                    <Icon className="size-5 shrink-0" />
                  ) : (
                    <span aria-hidden className="size-5 shrink-0" />
                  )}
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {/* Sous-catégories (Coiffure) — boutons qui reviennent à la ligne, aucun défilement. */}
          {subFilters && (
            <div className="flex shrink-0 flex-wrap gap-2">
              {subFilters.map((f) => {
                const active = f.key === activeFilter.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilterKey(f.key)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[13.5px] font-medium transition active:scale-[0.97]",
                      active
                        ? "bg-primary text-white"
                        : "border border-border bg-white text-base-content/70 hover:bg-base-200",
                    )}
                  >
                    {active && <Check aria-hidden className="size-3.5" strokeWidth={2.75} />}
                    {f.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Grille */}
          <div className="min-h-0 flex-1 overflow-y-auto pb-2">
            {filtered.length === 0 ? (
              <p className="py-16 text-center text-sm text-base-content/55">
                {mode === "services"
                  ? "Aucune prestation ne correspond."
                  : mode === "boissons"
                    ? "Aucune boisson ne correspond."
                    : "Aucun produit ne correspond."}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">
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
                          ? "cursor-not-allowed border-border bg-base-200"
                          : inCart > 0
                            ? "border-primary bg-primary/10"
                            : "border-border bg-white hover:border-primary/40",
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
                        <span className="line-clamp-3 text-[13px] leading-snug font-semibold text-base-content">
                          {item.name}
                        </span>
                        <span className="flex flex-col gap-1">
                          <span className="flex items-baseline justify-between gap-1.5">
                            <span className="text-[17px] font-bold text-primary tabular-nums">
                              {formatFcfa(item.price)}
                            </span>
                            <span className="flex items-center gap-1.5 text-[11px] font-medium text-base-content/55 tabular-nums">
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
                                  ? "text-error"
                                  : remaining <= 5
                                    ? "text-warning"
                                    : "text-base-content/55",
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
    </div>
  );
}
