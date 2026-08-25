"use client";

import { ScissorsIcon } from "@/components/vente/icons";
import { formatFcfa, groupServicesBySubcat, type Service } from "@/lib/data/vente";

type FullCatalogProps = {
  services: Service[];
  onAdd: (service: Service) => void;
};

/** Full browsable catalogue, grouped by subcategory — sits below the CategoryGrid on the
 * "categories" landing step so a cashier can scroll straight to a service without picking a
 * category card first (matches the Figma capture, where the grid isn't the only way in). */
export function FullCatalog({ services, onAdd }: FullCatalogProps) {
  const groups = groupServicesBySubcat(services);

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.subcat} className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--brand-cream)] px-3 py-1.5 text-sm font-semibold text-[var(--brand-taupe-muted)]">
            <ScissorsIcon className="size-4" />
            {group.subcat}
            <span className="font-normal text-[var(--color-gray-500)]">({group.services.length})</span>
          </span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {group.services.map((service) => (
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
        </div>
      ))}
    </div>
  );
}
