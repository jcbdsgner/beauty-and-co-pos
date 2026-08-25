"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stepper } from "@/components/ui/stepper";
import { HeroNumber } from "@/components/ui/hero-number";
import { EmptyState } from "@/components/ui/empty-state";
import { TrashIcon, ChevronIcon } from "@/components/ui/icons";
import { CartGlyphIcon, ReceiptTagIcon, KeyGlyphIcon } from "@/components/vente/icons";
import { computeTotals, formatFcfa, type CartItem, type Sale } from "@/lib/data/vente";

type CartPanelProps = {
  sale: Sale;
  practitioners: string[];
  onQtyChange: (itemId: string, qty: number) => void;
  onRemove: (itemId: string) => void;
  onAssignPractitioner: (itemId: string, practitioner: string | null) => void;
  onDiscountCodeChange: (value: string) => void;
  onApplyPromo: () => void;
  onLoyaltyChange: (value: number) => void;
  onManagerCodeChange: (value: string) => void;
  onApplyManagerCode: () => void;
  onCheckout: () => void;
};

function CartLine({
  item,
  practitioners,
  onQtyChange,
  onRemove,
  onAssignPractitioner,
}: {
  item: CartItem;
  practitioners: string[];
  onQtyChange: (qty: number) => void;
  onRemove: () => void;
  onAssignPractitioner: (practitioner: string | null) => void;
}) {
  return (
    <div className="border-b border-[var(--color-gray-200)] pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <Stepper label={item.name} hint={formatFcfa(item.unitPrice)} value={item.qty} min={1} max={20} onChange={onQtyChange} />
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3 pt-1">
          <span className="text-sm font-semibold text-[var(--color-gray-900)]">{formatFcfa(item.unitPrice * item.qty)}</span>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Retirer ${item.name} du panier`}
            className="flex size-10 items-center justify-center rounded-full text-[var(--color-error)] transition active:scale-[0.94] hover:bg-[var(--color-error)]/10"
          >
            <TrashIcon className="size-5" />
          </button>
        </div>
      </div>
      <select
        value={item.practitioner ?? ""}
        onChange={(event) => onAssignPractitioner(event.target.value || null)}
        className="mt-2 w-full rounded-full border border-[var(--color-gray-200)] bg-white px-4 py-2.5 text-sm text-[var(--color-gray-700)] focus:border-[var(--brand-taupe-muted)] focus:outline-none"
      >
        <option value="">✂ Praticien — non assigné</option>
        {practitioners.map((name) => (
          <option key={name} value={name}>
            ✂ {name}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Persistent right-column cart — visible through the whole categories/catalogue tunnel: line
 * items, discount/loyalty/manager-code mechanisms, totals and the "Encaisser" CTA. */
export function CartPanel({
  sale,
  practitioners,
  onQtyChange,
  onRemove,
  onAssignPractitioner,
  onDiscountCodeChange,
  onApplyPromo,
  onLoyaltyChange,
  onManagerCodeChange,
  onApplyManagerCode,
  onCheckout,
}: CartPanelProps) {
  const [discountOpen, setDiscountOpen] = useState(false);
  const totals = computeTotals(sale);
  const itemCount = sale.cart.reduce((sum, item) => sum + item.qty, 0);
  const canCheckout = sale.cart.length > 0 && sale.client !== null;
  const hasDiscount = sale.promoApplied !== null || sale.managerDiscountApplied > 0 || sale.loyaltyPointsUsed > 0;
  const redeemableLoyaltyPoints = sale.client ? Math.floor(sale.client.points / 100) * 100 : 0;

  return (
    <Card className="sticky top-6 flex max-h-[calc(100vh-3rem)] flex-col gap-4 self-start overflow-y-auto p-5">
      <div className="flex items-center gap-2">
        <CartGlyphIcon className="text-[var(--brand-taupe-muted)]" />
        <h2 className="font-[var(--font-heading)] text-lg text-[var(--color-gray-900)]">Panier ({itemCount})</h2>
      </div>

      {sale.cart.length === 0 ? (
        <EmptyState
          icon={<CartGlyphIcon className="size-12" />}
          title="Panier vide"
          subtitle="Ajoutez un service ou un produit pour commencer la vente."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {sale.cart.map((item) => (
              <CartLine
                key={item.id}
                item={item}
                practitioners={practitioners}
                onQtyChange={(qty) => onQtyChange(item.id, qty)}
                onRemove={() => onRemove(item.id)}
                onAssignPractitioner={(practitioner) => onAssignPractitioner(item.id, practitioner)}
              />
            ))}
          </div>

          <div className="border-t border-[var(--color-gray-200)] pt-3">
            <button
              type="button"
              onClick={() => setDiscountOpen((open) => !open)}
              className="flex w-full items-center justify-between rounded-xl py-2 text-[15px] font-medium text-[var(--color-gray-700)] transition active:scale-[0.99] hover:bg-[var(--color-gray-50)]"
            >
              <span className="flex items-center gap-1.5">
                <ReceiptTagIcon />
                Remise / Code promo
                {hasDiscount && <Badge variant="success">Actif</Badge>}
              </span>
              <ChevronIcon className={discountOpen ? "size-5 rotate-90" : "size-5"} />
            </button>

            {discountOpen && (
              <div className="mt-3 flex flex-col gap-4">
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-gray-500)] uppercase">
                    <ReceiptTagIcon /> Code promo
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={sale.discountCode}
                      onChange={(event) => onDiscountCodeChange(event.target.value)}
                      placeholder="PROMO20"
                      className="w-full rounded-lg border border-[var(--color-gray-200)] px-3 py-2 text-sm focus:border-[var(--brand-taupe-muted)] focus:outline-none"
                    />
                    <Button variant="brand" onClick={onApplyPromo} disabled={!sale.discountCode.trim()} className="w-auto shrink-0">
                      OK
                    </Button>
                  </div>
                  {sale.promoApplied && (
                    <p className="mt-1 text-xs font-medium text-[var(--color-success)]">
                      Code « {sale.promoApplied.code} » appliqué (-{Math.round(sale.promoApplied.percent * 100)}%)
                    </p>
                  )}
                </div>

                {sale.client && (
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[var(--color-gray-500)] uppercase">
                      <span>★ Points fidélité ({sale.client.points} pts)</span>
                      {redeemableLoyaltyPoints > 0 && (
                        <span className="text-[var(--color-gray-700)] normal-case">{sale.loyaltyPointsUsed} pts</span>
                      )}
                    </div>
                    {redeemableLoyaltyPoints > 0 ? (
                      <>
                        <input
                          type="range"
                          min={0}
                          max={redeemableLoyaltyPoints}
                          step={100}
                          value={sale.loyaltyPointsUsed}
                          onChange={(event) => onLoyaltyChange(Number(event.target.value))}
                          className="w-full accent-[var(--brand-taupe-muted)]"
                        />
                        <p className="mt-1 text-xs text-[var(--color-gray-500)]">
                          100 pts = 1 000 FCFA
                          {sale.loyaltyPointsUsed > 0 && (
                            <>
                              {" · "}
                              <span className="font-medium text-[var(--color-success)]">
                                -{formatFcfa(Math.floor(sale.loyaltyPointsUsed / 100) * 1000)}
                              </span>
                            </>
                          )}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-[var(--color-gray-500)]">
                        Minimum 100 pts requis pour une réduction fidélité.
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-gray-500)] uppercase">
                    <KeyGlyphIcon /> Code remise manager
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={sale.managerCode}
                      onChange={(event) => onManagerCodeChange(event.target.value)}
                      placeholder="DISC-1234"
                      className="w-full rounded-lg border border-[var(--color-gray-200)] px-3 py-2 text-sm focus:border-[var(--brand-taupe-muted)] focus:outline-none"
                    />
                    <Button variant="dark" onClick={onApplyManagerCode} disabled={!sale.managerCode.trim()} className="w-auto shrink-0">
                      OK
                    </Button>
                  </div>
                  {sale.managerDiscountApplied > 0 && (
                    <p className="mt-1 text-xs font-medium text-[var(--color-success)]">
                      Remise manager appliquée (-{formatFcfa(sale.managerDiscountApplied)})
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 border-t border-[var(--color-gray-200)] pt-3">
            <div className="flex items-center justify-between text-sm text-[var(--color-gray-600)]">
              <span>Sous-total</span>
              <span>{formatFcfa(totals.subtotal)}</span>
            </div>
            {(totals.promoDiscount > 0 || totals.managerDiscount > 0 || totals.loyaltyDiscount > 0) && (
              <div className="flex items-center justify-between text-sm text-[var(--color-success)]">
                <span>Remises</span>
                <span>-{formatFcfa(totals.promoDiscount + totals.managerDiscount + totals.loyaltyDiscount)}</span>
              </div>
            )}
            <div className="flex items-end justify-between pt-1">
              <HeroNumber label="Total" value={formatFcfa(totals.total)} />
            </div>
          </div>

          <Button variant="brand" className="w-full" disabled={!canCheckout} onClick={onCheckout}>
            Encaisser {formatFcfa(totals.total)}
          </Button>
          {!canCheckout && sale.client === null && (
            <p className="-mt-2 text-center text-xs text-[var(--color-gray-500)]">Sélectionnez un client pour encaisser</p>
          )}
        </>
      )}
    </Card>
  );
}
