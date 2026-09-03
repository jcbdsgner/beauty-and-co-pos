"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Check, Users } from "lucide-react";
import { SegmentedToggle } from "@/components/ui/molecules/segmented-toggle";
import { SearchInput } from "@/components/ui/atoms/search-input";
import { PhotoPlaceholder } from "@/components/ui/atoms/photo-placeholder";
import { PRODUCT_CATEGORIES, SERVICE_CATEGORIES, SERVICES } from "@/lib/data/menu";
import { useAppData } from "@/components/providers/app-data-provider";
import { cn, formatFcfa } from "@/lib/utils";

/** Trois grandes familles encaissables, comme les volets du Catalogue : prestations, revente
 *  (Kérastase & co), et le Bar. Produits par défaut — une vente ouverte à froid est de la
 *  revente (ADR 0013) ; les prestations n'arrivent que d'une réservation. */
type MenuMode = "services" | "produits" | "boissons";

/**
 * Barre de catégories horizontale (maquette Figma node 130:2) — le rail vertical a disparu.
 * Une pastille filtre soit une catégorie entière, soit une sous-catégorie : Coiffure, seule
 * catégorie service assez profonde, voit ses sous-catégories promues au premier niveau ; toute
 * autre catégorie est une pastille unique. En Produits, les pastilles sont les gammes Kérastase.
 * Le Bar (Boissons) n'a pas de barre. L'escargot b&co coiffe la barre.
 */
type Filter = {
  key: string;
  label: string;
  /** true ⇔ l'article appartient à ce filtre. `Tout` accepte tout ce que la famille affiche. */
  match: (categoryId: string, subcategory: string | undefined) => boolean;
};

const ALL: Filter = { key: "all", label: "Tout", match: (c) => c !== "boissons" };
const catFilter = (id: string, label: string): Filter => ({ key: `c:${id}`, label, match: (c) => c === id });
const subFilter = (label: string): Filter => ({ key: `s:${label}`, label, match: (_c, s) => s === label });

/** Sous-catégories présentes sous une catégorie, dans l'ordre des données (= ordre d'affichage). */
function subcategoriesOf(items: ReadonlyArray<{ categoryId: string; subcategory?: string }>, categoryId: string): string[] {
  const seen = new Set<string>();
  for (const it of items) if (it.categoryId === categoryId && it.subcategory) seen.add(it.subcategory);
  return [...seen];
}

function serviceFilters(): Filter[] {
  const out: Filter[] = [ALL];
  for (const cat of SERVICE_CATEGORIES) {
    const subs = subcategoriesOf(SERVICES, cat.id);
    if (subs.length > 0) out.push(...subs.map(subFilter));
    else out.push(catFilter(cat.id, cat.name));
  }
  return out;
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

  const filters = useMemo<Filter[]>(() => {
    if (mode === "services") return serviceFilters();
    if (mode === "produits") {
      const source = produits as ReadonlyArray<{ categoryId: string; subcategory?: string }>;
      const hasKerastase = PRODUCT_CATEGORIES.some((c) => c.id === "kerastase");
      const ranges = hasKerastase ? subcategoriesOf(source, "kerastase") : [];
      return [ALL, ...ranges.map(subFilter)];
    }
    return [];
  }, [mode, produits]);

  const activeFilter = filters.find((f) => f.key === filterKey) ?? ALL;

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

      {/* Barre de pastilles — pas pour le Bar. Une seule rangée qui défile à l'horizontale :
          toutes les catégories restent atteignables (le pavé qui s'enroulait sur 2 rangs
          masquait Manucure, Spa, Épilation… sous la ligne de flottaison). */}
      {filters.length > 1 && (
        <div className="flex shrink-0 items-center gap-3">
          <Image
            src="/images/brand/escargot.svg"
            alt=""
            aria-hidden
            width={64}
            height={64}
            className="size-16 shrink-0 object-contain"
          />
          <div className="-mx-1 flex flex-1 gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:thin] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_12px,#000_calc(100%_-_32px),transparent)]">
            {filters.map((f) => {
              const active = f.key === activeFilter.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilterKey(f.key)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex h-14 shrink-0 items-center gap-1.5 rounded-full px-5 text-[15px] font-medium transition active:scale-[0.97]",
                    active
                      ? "bg-[var(--core-brand-color)] text-[var(--on-core-brand-color)]"
                      : "border border-border bg-white text-[var(--color-gray-600)] hover:bg-[var(--color-gray-50)]",
                  )}
                >
                  {active && <Check aria-hidden className="size-3.5" strokeWidth={2.75} />}
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grille */}
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
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
  );
}
