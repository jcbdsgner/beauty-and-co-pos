"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { useAppData } from "@/components/providers/app-data-provider";
import { cn } from "@/lib/utils";

/**
 * Browser-tab shaped row of open sales — deliberately not `Pills` (a filter chip has no close
 * affordance and no "+" to open a new one; this is closer to a document tab strip), per
 * USERFLOW.md's explicit call to keep this shape distinct.
 */
export function SaleTabsBar() {
  const { sales, openTabIds, activeSaleId, switchTab, closeTab, openNewTab } = useAppData();
  const [pendingCloseId, setPendingCloseId] = useState<string | null>(null);

  const tabs = openTabIds.map((id) => sales.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => !!s);

  function handleCloseRequest(id: string) {
    const sale = sales.find((s) => s.id === id);
    if (sale && sale.cart.length > 0) {
      setPendingCloseId(id);
    } else {
      closeTab(id);
    }
  }

  return (
    <>
      <div className="flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const active = tab.id === activeSaleId;
          return (
            <div
              key={tab.id}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-t-2xl border border-b-0 px-4 py-3 text-sm font-semibold transition",
                active
                  ? "border-[var(--color-gray-200)] bg-white text-[var(--color-gray-900)]"
                  : "border-transparent bg-transparent text-white/70 hover:text-white",
              )}
            >
              <button type="button" onClick={() => switchTab(tab.id)} className="active:scale-[0.97]">
                {tab.label}
              </button>
              <button
                type="button"
                onClick={() => handleCloseRequest(tab.id)}
                aria-label={`Fermer ${tab.label}`}
                className={cn(
                  "-m-2 flex size-8 items-center justify-center rounded-full transition active:scale-90",
                  active ? "text-[var(--color-gray-400)] hover:bg-[var(--color-error-soft)] hover:text-[var(--color-error)]" : "text-white/60 hover:bg-white/10",
                )}
              >
                <X aria-hidden className="size-3.5" />
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => openNewTab()}
          aria-label="Nouvelle vente"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-white/80 transition active:scale-90 hover:bg-white/10"
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
