"use client";

import { ShoppingCart, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/molecules/empty-state";
import { RoundStepButton } from "@/components/ui/atoms/round-step-button";
import { Button } from "@/components/ui/atoms/button";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { ClientSearchField } from "@/components/shared/client-search-field";
import { DiscountSection } from "@/components/comptoir/discount-section";
import { useAppData, computeTotals } from "@/components/providers/app-data-provider";
import { formatFcfa } from "@/lib/utils";
import type { Sale } from "@/lib/data/types";

const LEGIBLE_DISABLED = "disabled:bg-[var(--color-gray-200)] disabled:text-[var(--color-gray-500)] disabled:opacity-100";

export function SaleCartPanel({ sale, onScanClient, onScanGiftCard }: { sale: Sale; onScanClient: () => void; onScanGiftCard: () => void }) {
  const { updateCartQty, removeCartLine, assignPractitioner, updateSale, praticiennes } = useAppData();
  const totals = computeTotals(sale);
  const isEmpty = sale.cart.length === 0;
  const canCheckout = !isEmpty && sale.clientId !== null;

  return (
    <div className="sticky top-0 flex max-h-[calc(100vh-220px)] flex-col overflow-hidden rounded-2xl border border-[var(--color-gray-200)] bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)]">
      <div className="flex shrink-0 flex-col gap-3 border-b border-[var(--color-gray-200)] p-5">
        <div className="flex items-center gap-2">
          <ShoppingCart className="text-[var(--brand-taupe-muted)]" />
          <h2 className="font-[var(--font-heading)] text-lg text-[var(--color-gray-900)]">Panier ({sale.cart.reduce((n, l) => n + l.qty, 0)})</h2>
        </div>
        <ClientSearchField
          selectedClientId={sale.clientId}
          onSelect={(clientId) => updateSale(sale.id, { clientId })}
          required
        />
        <button
          type="button"
          onClick={onScanClient}
          className="self-start text-xs font-medium text-[var(--brand-taupe-muted)] underline decoration-dotted underline-offset-2"
        >
          ou scanner une carte de fidélité
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {isEmpty ? (
          <EmptyState icon={<ShoppingCart className="size-12" />} title="Panier vide" subtitle="Ajoutez un service ou un produit pour commencer la vente." />
        ) : (
          <>
            {sale.originAppointmentId && (
              <p className="mb-3 rounded-xl bg-[var(--brand-rose-soft)] px-3 py-2 text-xs font-medium text-[var(--brand-taupe-muted)]">
                Prestations du rendez-vous ajoutées automatiquement.
              </p>
            )}
            <div className="flex flex-col gap-3">
              {sale.cart.map((line) => (
                <div key={line.id} className="border-b border-[var(--color-gray-200)] pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="block text-[15px] font-bold text-[var(--color-gray-800)]">{line.name}</span>
                      <span className="block text-sm text-[var(--color-gray-500)]">{formatFcfa(line.unitPrice)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCartLine(sale.id, line.id)}
                      aria-label={`Retirer ${line.name} du panier`}
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--color-error)] transition active:scale-90 hover:bg-[var(--color-error-soft)]"
                    >
                      <Trash2 aria-hidden className="size-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <RoundStepButton direction="decrement" onClick={() => updateCartQty(sale.id, line.id, Math.max(1, line.qty - 1))} disabled={line.qty <= 1} ariaLabel={`Diminuer la quantité — ${line.name}`} />
                      <span className="w-6 text-center text-[17px] font-bold text-[var(--color-gray-800)]">{line.qty}</span>
                      <RoundStepButton direction="increment" onClick={() => updateCartQty(sale.id, line.id, Math.min(20, line.qty + 1))} disabled={line.qty >= 20} ariaLabel={`Augmenter la quantité — ${line.name}`} />
                    </div>
                    <span className="text-base font-semibold text-[var(--color-gray-900)]">{formatFcfa(line.unitPrice * line.qty)}</span>
                  </div>

                  {line.kind === "service" && (
                    <select
                      value={line.staffId ?? ""}
                      onChange={(e) => assignPractitioner(sale.id, line.id, e.target.value || null)}
                      className="mt-2 w-full rounded-full border border-[var(--color-gray-200)] bg-white px-4 py-2.5 text-sm text-[var(--color-gray-700)] focus:border-[var(--brand-taupe-muted)] focus:outline-none"
                    >
                      <option value="">✂ Praticien·ne — non assigné</option>
                      {praticiennes.map((p) => (
                        <option key={p.id} value={p.id}>
                          ✂ {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>

            <DiscountSection sale={sale} onScanGiftCard={onScanGiftCard} />
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-[var(--color-gray-200)] p-5">
        <div className="mb-3 flex flex-col gap-1">
          <div className="flex items-center justify-between text-sm text-[var(--color-gray-600)]">
            <span>Sous-total</span>
            <span>{formatFcfa(totals.subtotal)}</span>
          </div>
          {(totals.giftCardDiscount > 0 || totals.managerDiscount > 0 || totals.loyaltyDiscount > 0) && (
            <div className="flex items-center justify-between text-sm text-[var(--color-success)]">
              <span>Remises</span>
              <span>-{formatFcfa(totals.giftCardDiscount + totals.managerDiscount + totals.loyaltyDiscount)}</span>
            </div>
          )}
          <div className="flex items-end justify-between pt-1">
            <span className="text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">Total</span>
            <span className="font-[var(--font-heading)] text-3xl leading-none text-[var(--color-gray-900)]">{formatFcfa(totals.total)}</span>
          </div>
        </div>

        <Button variant="brand" className={`w-full ${LEGIBLE_DISABLED}`} disabled={!canCheckout} onClick={() => updateSale(sale.id, { step: "paiement" })}>
          Encaisser
        </Button>
        {!canCheckout && (
          <FieldLabel variant="plain" className="mt-2 text-center normal-case">
            {isEmpty ? "Ajoutez un article pour continuer" : "Sélectionnez une cliente pour encaisser"}
          </FieldLabel>
        )}
      </div>
    </div>
  );
}
