"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { SaleTabsBar } from "@/components/comptoir/sale-tabs-bar";
import { MenuPanel } from "@/components/comptoir/menu-panel";
import { SaleCartPanel } from "@/components/comptoir/sale-cart-panel";
import { SettlementStep } from "@/components/comptoir/settlement-step";
import { ReceiptStep, isReceiptLocked } from "@/components/comptoir/receipt-step";
import { IdentifyDialog } from "@/components/comptoir/identify-dialog";
import { BrandMark } from "@/components/ui/atoms/brand-mark";
import { Logo } from "@/components/ui/atoms/logo";
import { useAppData } from "@/components/providers/app-data-provider";

/**
 * The Comptoir, deployed — a `fixed inset-0` mode change (not a Dialog): a warm taupe desk with a
 * cream working sheet on it. Rendered once from the root layout, shown/hidden by
 * `comptoirDeployed` so collapsing never unmounts (or resets) the sale tabs underneath. Three
 * stations live on the sheet — panier, règlement, reçu (ADR 0031) — and all three keep the ticket
 * in the right column; only the left side changes (menu → payment → what happened).
 */
export function ComptoirPanel() {
  const { comptoirDeployed, collapseComptoir, sales, activeSaleId, openNewTab } = useAppData();
  const [scanOpen, setScanOpen] = useState(false);
  const router = useRouter();

  if (!comptoirDeployed) return null;

  const activeSale = sales.find((s) => s.id === activeSaleId);
  const step = activeSale?.step ?? "vente";
  const locked = isReceiptLocked(activeSale);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-primary">
      {/* Taupe desk strip */}
      <div className="flex shrink-0 items-end justify-between gap-4 px-5 pt-3">
        <div className="flex items-end gap-3">
          <button
            type="button"
            onClick={() => {
              collapseComptoir();
              router.push("/");
            }}
            disabled={locked}
            aria-label="Retour à l'accueil"
            title={locked ? "Complétez d'abord la fiche cliente" : "Retour à l'accueil"}
            className="mb-2 flex h-12 shrink-0 items-center rounded-full bg-white px-4 transition active:scale-[0.97] hover:bg-white/90 disabled:pointer-events-none disabled:opacity-40"
          >
            <Logo size="footer" className="relative h-5 w-[43px] shrink-0" />
          </button>
          <SaleTabsBar locked={locked} />
        </div>
        <button
          type="button"
          onClick={collapseComptoir}
          disabled={locked}
          title={locked ? "Complétez d'abord la fiche cliente" : undefined}
          className="mb-2 disabled:pointer-events-none disabled:opacity-40 flex h-12 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-primary transition active:scale-[0.97] hover:bg-white/90"
        >
          <ChevronDown aria-hidden className="size-4" />
          Replier
        </button>
      </div>

      {/* Cream working sheet */}
      <div className="min-h-0 flex-1 overflow-hidden rounded-t-2xl bg-base-200">
        {!activeSale ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <BrandMark className="size-12 text-border" />
            <p className="font-[family-name:var(--font-heading)] font-semibold text-xl text-base-content">Aucune vente ouverte</p>
            <p className="text-sm text-base-content/55">Ouvrez une vente pour commencer.</p>
            <Button variant="brand" size="default" icon={<Plus className="size-4" />} onClick={() => openNewTab()} className="mt-1">
              Nouvelle vente
            </Button>
          </div>
        ) : (
          <div key={step} className="h-full animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {step === "paiement" ? (
              <SettlementStep sale={activeSale} />
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
