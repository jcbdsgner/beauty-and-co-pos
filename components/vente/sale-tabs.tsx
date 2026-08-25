"use client";

import { cn } from "@/lib/utils";
import { PlusIcon, XIcon } from "@/components/ui/icons";
import type { Sale } from "@/lib/data/vente";

type SaleTabsProps = {
  sales: Sale[];
  activeSaleId: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onAdd: () => void;
};

/** Browser-tab style multi-sale switcher — several transactions can stay open in parallel on the same POS. */
export function SaleTabs({ sales, activeSaleId, onSelect, onClose, onAdd }: SaleTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {sales.map((sale) => {
        const active = sale.id === activeSaleId;
        return (
          <div
            key={sale.id}
            className={cn(
              "flex items-center gap-2 rounded-full py-2 pl-4 transition",
              sales.length > 1 ? "pr-2" : "pr-4",
              active
                ? "bg-[var(--core-brand-color)] text-black"
                : "border border-[var(--color-gray-200)] bg-white text-[var(--color-gray-600)] hover:bg-[var(--color-gray-50)]",
            )}
          >
            <button type="button" onClick={() => onSelect(sale.id)} className="text-sm font-semibold">
              {sale.name}
              {sale.cart.length > 0 && (
                <span className={cn("ml-1.5 text-xs", active ? "text-black/60" : "text-[var(--color-gray-400)]")}>
                  {sale.cart.reduce((sum, item) => sum + item.qty, 0)}
                </span>
              )}
            </button>
            {sales.length > 1 && (
              <button
                type="button"
                onClick={() => onClose(sale.id)}
                aria-label={`Fermer ${sale.name}`}
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-xs transition",
                  active ? "hover:bg-black/10" : "hover:bg-[var(--color-gray-100)]",
                )}
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={onAdd}
        aria-label="Nouvelle vente"
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-gray-200)] bg-white text-[var(--color-gray-500)] transition hover:border-[var(--brand-taupe-muted)] hover:text-[var(--brand-taupe-muted)]"
      >
        <PlusIcon />
      </button>
    </div>
  );
}
