"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { SaleTabsBar } from "@/components/comptoir/sale-tabs-bar";
import { MenuPanel } from "@/components/comptoir/menu-panel";
import { SaleCartPanel } from "@/components/comptoir/sale-cart-panel";
import { PaymentStep } from "@/components/comptoir/payment-step";
import { ReceiptStep } from "@/components/comptoir/receipt-step";
import { IdentifyDialog } from "@/components/comptoir/identify-dialog";
import { BrandMark } from "@/components/ui/atoms/brand-mark";
import { useAppData } from "@/components/providers/app-data-provider";

/**
 * The Comptoir, deployed — a `fixed inset-0` mode change (not a Dialog): a warm taupe desk with a
 * cream working sheet on it. Rendered once from the root layout, shown/hidden by
 * `comptoirDeployed` so collapsing never unmounts (or resets) the sale tabs underneath. Three
 * stations live on the sheet: the counter (menu + ticket), payment, and the receipt.
 */
export function ComptoirPanel() {
  const { comptoirDeployed, collapseComptoir, sales, activeSaleId, openNewTab } = useAppData();
  const [scanOpen, setScanOpen] = useState(false);

  if (!comptoirDeployed) return null;

  const activeSale = sales.find((s) => s.id === activeSaleId);
  const step = activeSale?.step ?? "vente";

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[var(--pos-accent-dark)]">
      {/* Taupe desk strip */}
      <div className="flex shrink-0 items-end justify-between gap-4 px-5 pt-3">
        <SaleTabsBar />
        <button
          type="button"
          onClick={collapseComptoir}
          className="mb-2 flex h-12 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[var(--brand-taupe-muted)] transition active:scale-[0.97] hover:bg-white/90"
        >
          <ChevronDown aria-hidden className="size-4" />
          Replier
        </button>
      </div>

      {/* Cream working sheet */}
      <div className="min-h-0 flex-1 overflow-hidden rounded-t-2xl bg-[var(--brand-cream)]">
        {!activeSale ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <BrandMark className="size-12 text-border" />
            <p className="font-[family-name:var(--font-heading)] font-semibold text-xl text-[var(--color-gray-900)]">Aucune vente ouverte</p>
            <p className="text-sm text-[var(--color-gray-500)]">Ouvrez une vente pour commencer à encaisser.</p>
            <Button variant="brand" size="default" icon={<Plus className="size-4" />} onClick={() => openNewTab()} className="mt-1">
              Nouvelle vente
            </Button>
          </div>
        ) : (
          <div key={step} className="h-full animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {step === "paiement" ? (
              <PaymentStep sale={activeSale} />
            ) : step === "recu" ? (
              <ReceiptStep sale={activeSale} />
            ) : (
              <div className="grid h-full grid-cols-[minmax(0,1fr)_440px] gap-5 p-5">
                <MenuPanel saleId={activeSale.id} />
                <SaleCartPanel sale={activeSale} onOpenScanner={() => setScanOpen(true)} />
              </div>
            )}
          </div>
        )}
      </div>

      {scanOpen && activeSale && (
        <IdentifyDialog open sale={activeSale} onClose={() => setScanOpen(false)} />
      )}
    </div>
  );
}
