"use client";

import { useMemo } from "react";
import { ChevronLeft, Plus } from "lucide-react";
import { Pills } from "@/components/ui/pills";
import { EmptyState } from "@/components/ui/empty-state";
import { NoResultsIcon } from "@/components/vente/icons";
import { formatFcfa, type Category, type Service } from "@/lib/data/vente";

type ServiceCatalogProps = {
  category: Category | null;
  services: Service[];
  search: string;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onBack: () => void;
  onAdd: (service: Service) => void;
  /** Hides the subcategory filter pills — used for the flat Produits list and the cross-category search view. */
  hideFilters?: boolean;
};

const ALL_FILTER = "tous";

/** Filtered grid of services/products — the "catalogue" half of the sale screen (right after a
 * category has been picked, or the flat product list on the Produits tab). */
export function ServiceCatalog({ category, services, search, activeFilter, onFilterChange, onBack, onAdd, hideFilters }: ServiceCatalogProps) {
  const subcats = useMemo(() => Array.from(new Set(services.map((service) => service.subcat))), [services]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return services.filter((service) => {
      const matchesFilter = activeFilter === ALL_FILTER || service.subcat === activeFilter;
      const matchesSearch = !query || service.name.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [services, search, activeFilter]);

  return (
    <div className="flex flex-col gap-4">
      {category && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-full border border-[var(--color-gray-200)] bg-white py-3 pr-5 pl-3 text-[15px] font-semibold text-[var(--brand-taupe-muted)] transition active:scale-[0.97] hover:border-[var(--brand-taupe-muted)] hover:bg-[var(--brand-rose-soft)]"
          >
            <ChevronLeft className="size-5" />
            Catégories
          </button>
          <span className="text-sm font-medium text-[var(--color-gray-500)]">{category.name}</span>
        </div>
      )}

      {!hideFilters && subcats.length > 1 && (
        <Pills
          options={[{ value: ALL_FILTER, label: "Tous" }, ...subcats.map((subcat) => ({ value: subcat, label: subcat }))]}
          value={activeFilter}
          onChange={onFilterChange}
        />
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<NoResultsIcon />}
          title="Aucun résultat"
          subtitle={
            search.trim()
              ? `Aucun service ne correspond à « ${search.trim()} ».`
              : "Aucun service dans cette catégorie pour le moment."
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => onAdd(service)}
              title={service.description}
              className="group relative flex min-h-[104px] flex-col items-start justify-between gap-2 rounded-2xl border border-[var(--color-gray-200)] bg-white p-5 text-left transition active:scale-[0.97] hover:border-[var(--brand-taupe-muted)] hover:shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)]"
            >
              <span className="pr-8 text-[15px] font-semibold text-[var(--color-gray-900)]">{service.name}</span>
              <span className="flex w-full items-end justify-between gap-2 pr-8">
                <span className="font-bold text-[var(--button-2-color)]">{formatFcfa(service.price)}</span>
                {service.duration && <span className="shrink-0 text-xs font-medium text-[var(--color-gray-500)]">{service.duration}</span>}
              </span>
              <span className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-[var(--brand-rose-soft)] text-[var(--brand-taupe-muted)] transition group-hover:bg-[var(--core-brand-color)] group-hover:text-black">
                <Plus className="size-4" />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
