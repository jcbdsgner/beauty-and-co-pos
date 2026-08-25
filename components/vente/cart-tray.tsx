"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrashIcon, ChevronIcon } from "@/components/ui/icons";
import { CartGlyphIcon, GiftIcon, ScanLineIcon, KeyGlyphIcon, StarGlyphIcon } from "@/components/vente/icons";
import { computeTotals, formatFcfa, type CartItem, type Sale } from "@/lib/data/vente";

type CartTrayProps = {
  sale: Sale;
  practitioners: string[];
  onQtyChange: (itemId: string, qty: number) => void;
  onRemove: (itemId: string) => void;
  onAssignPractitioner: (itemId: string, practitioner: string | null) => void;
  onGiftCardCodeChange: (value: string) => void;
  onApplyGiftCard: () => void;
  onScanGiftCard: () => void;
  onLoyaltyChange: (value: number) => void;
  onManagerCodeChange: (value: string) => void;
  onApplyManagerCode: () => void;
  onCheckout: () => void;
};

/** Disabled state must stay legible (DESIGN.md's Disabled-Is-Not-Invisible Rule) — a muted solid
 *  fill instead of the shared Button component's default translucent wash over a light color. */
const LEGIBLE_DISABLED = "disabled:bg-[var(--color-gray-200)] disabled:text-[var(--color-gray-500)] disabled:opacity-100";

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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold text-[var(--color-gray-800)]">{item.name}</span>
          <span className="block text-sm text-[var(--color-gray-500)]">{formatFcfa(item.unitPrice)}</span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Retirer ${item.name} du panier`}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--color-error)] transition active:scale-[0.94] hover:bg-[var(--color-error)]/10"
        >
          <TrashIcon className="size-5" />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onQtyChange(Math.max(1, item.qty - 1))}
            disabled={item.qty <= 1}
            aria-label={`Diminuer la quantité — ${item.name}`}
            className="flex size-11 items-center justify-center rounded-full border-2 border-[var(--brand-taupe-muted)]/40 text-[var(--brand-taupe-muted)] transition active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:border-[var(--brand-taupe-muted)] enabled:hover:bg-[var(--brand-rose-soft)]"
          >
            <Minus aria-hidden className="size-5" />
          </button>
          <span className="w-6 text-center text-[17px] font-bold text-[var(--color-gray-800)]">{item.qty}</span>
          <button
            type="button"
            onClick={() => onQtyChange(Math.min(20, item.qty + 1))}
            disabled={item.qty >= 20}
            aria-label={`Augmenter la quantité — ${item.name}`}
            className="flex size-11 items-center justify-center rounded-full border-2 border-[var(--brand-taupe-muted)]/40 text-[var(--brand-taupe-muted)] transition active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:border-[var(--brand-taupe-muted)] enabled:hover:bg-[var(--brand-rose-soft)]"
          >
            <Plus aria-hidden className="size-5" />
          </button>
        </div>
        <span className="text-base font-semibold text-[var(--color-gray-900)]">{formatFcfa(item.unitPrice * item.qty)}</span>
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

/** The cart as a bottom-docked tray, not a side panel: it stays in reach the whole time a
 *  cashier browses the catalogue, collapsed to a slim total+Encaisser strip by default, and
 *  expands upward to review or edit lines without ever losing sight of the running total. */
export function CartTray({
  sale,
  practitioners,
  onQtyChange,
  onRemove,
  onAssignPractitioner,
  onGiftCardCodeChange,
  onApplyGiftCard,
  onScanGiftCard,
  onLoyaltyChange,
  onManagerCodeChange,
  onApplyManagerCode,
  onCheckout,
}: CartTrayProps) {
  const [expanded, setExpanded] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const totals = computeTotals(sale);
  const itemCount = sale.cart.reduce((sum, item) => sum + item.qty, 0);
  const isEmpty = sale.cart.length === 0;
  const canCheckout = !isEmpty && sale.client !== null;
  const hasDiscount = sale.giftCardApplied !== null || sale.managerDiscountApplied > 0 || sale.loyaltyPointsUsed > 0;
  const redeemableLoyaltyPoints = sale.client ? Math.floor(sale.client.points / 100) * 100 : 0;

  return (
    <div className="sticky bottom-6 z-10">
      <div className="overflow-hidden rounded-3xl border border-[var(--color-gray-200)] bg-white shadow-[0px_8px_24px_-4px_rgba(0,0,0,0.12)]">
        {expanded && !isEmpty && (
          <div className="max-h-[52vh] overflow-y-auto border-b border-[var(--color-gray-200)] p-5">
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

            <div className="mt-3 border-t border-[var(--color-gray-200)] pt-3">
              <button
                type="button"
                onClick={() => setDiscountOpen((open) => !open)}
                className="flex w-full items-center justify-between rounded-xl py-2 text-[15px] font-medium text-[var(--color-gray-700)] transition active:scale-[0.99] hover:bg-[var(--color-gray-50)]"
              >
                <span className="flex items-center gap-1.5">
                  <GiftIcon />
                  Remise / Code cadeau
                  {hasDiscount && <Badge variant="success">Actif</Badge>}
                </span>
                <ChevronIcon className={discountOpen ? "size-5 rotate-90" : "size-5"} />
              </button>

              {discountOpen && (
                <div className="mt-3 flex flex-col gap-4">
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-gray-500)] uppercase">
                      <GiftIcon /> Code cadeau
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={sale.giftCardCode}
                        onChange={(event) => onGiftCardCodeChange(event.target.value)}
                        placeholder="BACO-GIFT-25000"
                        className="w-full rounded-lg border border-[var(--color-gray-200)] px-3 py-2 text-sm focus:border-[var(--brand-taupe-muted)] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={onScanGiftCard}
                        aria-label="Scanner la carte cadeau"
                        title="Scanner la carte cadeau"
                        className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-gray-200)] text-[var(--brand-taupe-muted)] transition active:scale-[0.94] hover:border-[var(--brand-taupe-muted)] hover:bg-[var(--brand-rose-soft)]"
                      >
                        <ScanLineIcon className="size-4" />
                      </button>
                      <Button
                        variant="brand"
                        onClick={onApplyGiftCard}
                        disabled={!sale.giftCardCode.trim()}
                        className={`w-auto shrink-0 ${LEGIBLE_DISABLED}`}
                      >
                        OK
                      </Button>
                    </div>
                    {sale.giftCardApplied && (
                      <p className="mt-1 text-xs font-medium text-[var(--color-success)]">
                        Carte cadeau « {sale.giftCardApplied.code} » appliquée (-{formatFcfa(sale.giftCardApplied.amount)})
                      </p>
                    )}
                  </div>

                  {sale.client && (
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[var(--color-gray-500)] uppercase">
                        <span className="flex items-center gap-1.5">
                          <StarGlyphIcon className="size-3.5" filled />
                          Points fidélité ({sale.client.points} pts)
                        </span>
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
                        <p className="text-xs text-[var(--color-gray-500)]">Minimum 100 pts requis pour une réduction fidélité.</p>
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
                      <Button
                        variant="dark"
                        onClick={onApplyManagerCode}
                        disabled={!sale.managerCode.trim()}
                        className={`w-auto shrink-0 ${LEGIBLE_DISABLED}`}
                      >
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

            <div className="mt-3 flex flex-col gap-1 border-t border-[var(--color-gray-200)] pt-3">
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
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 p-3">
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            disabled={isEmpty}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition active:scale-[0.99] disabled:active:scale-100 enabled:hover:bg-[var(--color-gray-50)]"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand-rose-soft)] text-[var(--brand-taupe-muted)]">
              <CartGlyphIcon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">Panier ({itemCount})</span>
              <span className="block font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">{formatFcfa(totals.total)}</span>
            </span>
            {!isEmpty && (
              <ChevronIcon className={`ml-auto size-5 shrink-0 text-[var(--color-gray-400)] ${expanded ? "-rotate-90" : "rotate-90"}`} />
            )}
          </button>

          <Button variant="brand" disabled={!canCheckout} onClick={onCheckout} className={`w-auto shrink-0 ${LEGIBLE_DISABLED}`}>
            Encaisser
          </Button>
        </div>
        {!canCheckout && !isEmpty && (
          <p className="px-5 pb-3 text-center text-xs text-[var(--color-gray-500)]">Sélectionnez un client pour encaisser</p>
        )}
      </div>
    </div>
  );
}
