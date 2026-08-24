"use client";

import { useMemo } from "react";
import { Pills } from "@/components/ui/pills";
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
            className="text-sm font-medium text-[var(--brand-taupe-muted)] hover:underline"
          >
            ‹ Categories
          </button>
          <span className="text-sm text-[var(--color-gray-500)]">{category.name}</span>
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
        <p className="py-10 text-center text-sm text-[var(--color-gray-500)]">Aucun service ne correspond à cette recherche.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => onAdd(service)}
              className="flex flex-col items-start gap-1 rounded-2xl border border-[var(--color-gray-200)] bg-white p-4 text-left transition hover:border-[var(--brand-taupe-muted)]"
            >
              <span className="text-[15px] font-semibold text-[var(--color-gray-900)]">{service.name}</span>
              <span className="font-bold text-[var(--button-2-color)]">{formatFcfa(service.price)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
