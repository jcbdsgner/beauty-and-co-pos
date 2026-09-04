"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { useAppData, computeTotals } from "@/components/providers/app-data-provider";
import { cn, formatFcfa } from "@/lib/utils";

/**
 * A document-tab strip (not Pills — a filter chip has no close affordance). The active tab drops
 * its bottom edge and takes the cream sheet's colour so it reads as physically attached to the
 * sheet below. Each inactive tab shows its running total so a receptionist juggling several
 * clientes sees where each basket stands without switching.
 */
export function SaleTabsBar() {
  const { sales, openTabIds, activeSaleId, switchTab, closeTab, openNewTab } = useAppData();
  const [pendingCloseId, setPendingCloseId] = useState<string | null>(null);

  const tabs = openTabIds.map((id) => sales.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => !!s);

  function handleCloseRequest(id: string) {
    const sale = sales.find((s) => s.id === id);
    if (sale && sale.cart.length > 0) setPendingCloseId(id);
    else closeTab(id);
  }

  return (
    <>
      <div className="flex items-end gap-1">
        {tabs.map((tab) => {
          const active = tab.id === activeSaleId;
          const { total } = computeTotals(tab);
          return (
            <div
              key={tab.id}
              className={cn(
                "group flex h-14 shrink-0 items-center gap-1.5 rounded-t-2xl px-4 text-sm font-semibold transition",
                active
                  ? "relative z-10 -mb-0.5 bg-base-200 text-base-content"
                  : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white",
              )}
            >
              <button type="button" onClick={() => switchTab(tab.id)} className="flex flex-col items-start leading-tight active:scale-[0.97]">
                <span>{tab.label}</span>
                <span className={cn("text-[11px] font-medium tabular-nums", active ? "text-base-content/55" : "text-white/70")}>
                  {total > 0 ? formatFcfa(total) : "—"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleCloseRequest(tab.id)}
                aria-label={`Fermer ${tab.label}`}
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-full transition active:scale-90",
                  active
                    ? "text-base-content/45 hover:bg-error/10 hover:text-destructive"
                    : "text-white/60 opacity-0 group-hover:opacity-100 hover:bg-white/10",
                )}
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>
          );
        })}
        <span aria-hidden className="mx-1 h-6 w-px shrink-0 self-center bg-white/15" />
        <button
          type="button"
          onClick={() => openNewTab()}
          aria-label="Nouvelle vente"
          className="flex size-11 shrink-0 items-center justify-center self-center rounded-full text-white/80 transition active:scale-90 hover:bg-white/10"
        >
          <Plus aria-hidden className="size-5" />
        </button>
      </div>

      <ConfirmDialog
        open={pendingCloseId !== null}
        title="Fermer cette vente ?"
        description="Le panier contient des articles — ils seront perdus si vous fermez cet onglet."
        confirmLabel="Fermer l'onglet"
        onCancel={() => setPendingCloseId(null)}
        onConfirm={() => {
          if (pendingCloseId) closeTab(pendingCloseId);
          setPendingCloseId(null);
        }}
      />
    </>
  );
}
