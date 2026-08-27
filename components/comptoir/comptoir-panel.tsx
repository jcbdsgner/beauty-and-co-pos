"use client";

import { useState } from "react";
import { ArrowDownToLine, Plus } from "lucide-react";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { Button } from "@/components/ui/atoms/button";
import { EmptyState } from "@/components/ui/molecules/empty-state";
import { SaleTabsBar } from "@/components/comptoir/sale-tabs-bar";
import { CataloguePanel } from "@/components/comptoir/catalogue-panel";
import { SaleCartPanel } from "@/components/comptoir/sale-cart-panel";
import { PaymentStep } from "@/components/comptoir/payment-step";
import { ReceiptStep } from "@/components/comptoir/receipt-step";
import { ScannerDialog } from "@/components/comptoir/scanner-dialog";
import { useAppData } from "@/components/providers/app-data-provider";

/**
 * The Comptoir, deployed — a `fixed inset-0` mode change, not a `Dialog` interruption, per
 * USERFLOW.md: "doit occuper tout le viewport comme un changement de mode". Rendered once from
 * the root layout, shown/hidden by `comptoirDeployed` so collapsing never unmounts (and never
 * resets) the sale tabs underneath.
 */
export function ComptoirPanel() {
  const { comptoirDeployed, collapseComptoir, sales, activeSaleId, openNewTab, updateSale, clients } = useAppData();
  const [scanTarget, setScanTarget] = useState<"client" | "gift-card" | null>(null);

  if (!comptoirDeployed) return null;

  const activeSale = sales.find((s) => s.id === activeSaleId);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[var(--pos-accent-dark)]">
      <div className="flex shrink-0 items-center justify-between gap-3 px-6 pt-4">
        <SaleTabsBar />
        <IconButton
          aria-label="Replier le Comptoir"
          onClick={collapseComptoir}
          className="mb-1 flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition active:scale-90 hover:bg-white/20"
        >
          <ArrowDownToLine aria-hidden className="size-5" />
        </IconButton>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-t-3xl bg-[var(--brand-cream)] p-6">
        {!activeSale ? (
          <EmptyState
            icon={<Plus className="size-12" />}
            title="Aucune vente ouverte"
            subtitle="Ouvrez une nouvelle vente pour commencer à encaisser."
            action={
              <Button variant="brand" onClick={() => openNewTab()}>
                Nouvelle vente
              </Button>
            }
          />
        ) : activeSale.step === "paiement" ? (
          <PaymentStep sale={activeSale} />
        ) : activeSale.step === "recu" ? (
          <ReceiptStep sale={activeSale} />
        ) : (
          <div className="mx-auto grid max-w-6xl grid-cols-[1fr_380px] gap-6">
            <CataloguePanel saleId={activeSale.id} />
            <SaleCartPanel sale={activeSale} onScanClient={() => setScanTarget("client")} onScanGiftCard={() => setScanTarget("gift-card")} />
          </div>
        )}
      </div>

      <ScannerDialog
        open={scanTarget === "client"}
        title="Scanner une cliente"
        demoValue={clients[0]?.id ?? ""}
        onClose={() => setScanTarget(null)}
        onDetect={(clientId) => {
          if (activeSale && clients.some((c) => c.id === clientId)) updateSale(activeSale.id, { clientId });
          setScanTarget(null);
        }}
      />
      <ScannerDialog
        open={scanTarget === "gift-card"}
        title="Scanner une carte cadeau"
        demoValue="BACO-GIFT-25000"
        onClose={() => setScanTarget(null)}
        onDetect={(code) => {
          if (activeSale) updateSale(activeSale.id, { giftCardCode: code });
          setScanTarget(null);
        }}
      />
    </div>
  );
}
