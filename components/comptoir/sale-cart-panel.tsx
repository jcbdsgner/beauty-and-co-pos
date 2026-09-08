"use client";

import { Lock, Minus, Plus, ScanLine, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { Badge } from "@/components/ui/atoms/badge";
import { BrandMark } from "@/components/ui/atoms/brand-mark";
import { ClientSearchField } from "@/components/shared/client-search-field";
import { DiscountSection } from "@/components/comptoir/discount-section";
import { DiscountBreakdown } from "@/components/comptoir/discount-breakdown";
import { CoverageSection } from "@/components/comptoir/coverage-section";
import { DepositLine } from "@/components/comptoir/deposit-line";
import { useAppData, computeTotals, saleNeedsClient } from "@/components/providers/app-data-provider";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import { cn, formatFcfa } from "@/lib/utils";
import type { Sale } from "@/lib/data/types";

const TIER_BADGE = {
  vip: { label: "VIP", variant: "vip" as const },
  gold: { label: "Gold", variant: "gold" as const },
  silver: { label: "Silver", variant: "silver" as const },
};

/**
 * The ticket. A sales slip, not a form: cliente at the head, a scannable list of lines, and the
 * total seated at the foot as the one oversized figure the eye keeps returning to. Discounts and
 * the checkout button are the only other things allowed here.
 */
export function SaleCartPanel({ sale, onOpenScanner }: { sale: Sale; onOpenScanner: () => void }) {
  const { updateCartQty, removeCartLine, updateSale, clients, produits } = useAppData();
  const totals = computeTotals(sale);
  const isEmpty = sale.cart.length === 0;
  const itemCount = sale.cart.reduce((n, l) => n + l.qty, 0);
  const client = sale.clientId ? clients.find((c) => c.id === sale.clientId) : undefined;
  // A prestation in the basket means someone was served — the note must name her (ADR 0013). A
  // products-only walk-in checks out anonymously; the cliente stays optional (fidélité / carte
  // cadeau). Amber = "needs a decision" (DESIGN.md One-Signal rule) — only when it truly blocks.
  const needsClient = !isEmpty && sale.clientId === null && saleNeedsClient(sale);
  const clientOptional = !isEmpty && sale.clientId === null && !saleNeedsClient(sale);
  const canCheckout = !isEmpty && !needsClient;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[14px] border border-border bg-white">
      {/* Head */}
      <div className="relative shrink-0 overflow-hidden border-b border-border px-5 pt-5 pb-4">
        <BrandMark className="pointer-events-none absolute -top-8 -right-6 size-32 text-accent" />
        <div className="relative flex items-baseline gap-2">
          <p className="font-[family-name:var(--font-heading)] font-bold text-lg text-base-content">Ticket</p>
          {itemCount > 0 && (
            <span className="text-xs font-semibold tracking-[0.08em] text-base-content/45 uppercase tabular-nums">
              {itemCount} {itemCount > 1 ? "articles" : "article"}
            </span>
          )}
        </div>

        {/* Cliente */}
        <div className="relative mt-3">
          {client ? (
            <div className="flex items-center gap-3 rounded-2xl bg-accent px-3 py-2.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white font-semibold text-secondary">
                {clientInitial(client)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate font-[family-name:var(--font-heading)] font-semibold text-[15px] text-base-content">
                    {clientFullName(client)}
                  </span>
                  {client.tier && <Badge {...TIER_BADGE[client.tier]}>{TIER_BADGE[client.tier].label}</Badge>}
                </span>
                <span className="block truncate text-xs text-base-content/55">{client.phone}</span>
              </span>
              <button
                type="button"
                onClick={() => updateSale(sale.id, { clientId: null })}
                className="-mr-1 inline-flex min-h-11 shrink-0 items-center rounded-full bg-white/70 px-3 text-xs font-semibold text-secondary transition active:scale-95 hover:bg-white"
              >
                Retirer
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="default"
                  className={cn("flex-1", needsClient && "border-warning text-warning")}
                  icon={<ScanLine className="size-4" />}
                  onClick={onOpenScanner}
                >
                  Scanner
                </Button>
                <ClientSearchField
                  selectedClientId={null}
                  onSelect={(id) => updateSale(sale.id, { clientId: id })}
                  trigger={
                    <button
                      type="button"
                      aria-label="Chercher une cliente"
                      className={cn(
                        "flex size-14 shrink-0 items-center justify-center rounded-full border bg-white transition active:scale-[0.97]",
                        needsClient
                          ? "border-warning text-warning"
                          : "border-base-300 text-primary hover:bg-base-200",
                      )}
                    >
                      <Search aria-hidden className="size-5" />
                    </button>
                  }
                />
              </div>
              {needsClient && (
                <p className="text-xs font-medium text-warning">
                  Cliente requise : le panier contient une prestation.
                </p>
              )}
              {clientOptional && (
                <p className="text-xs text-base-content/55">
                  Cliente facultative — à ajouter pour la fidélité ou une carte cadeau.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lines */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
            <BrandMark className="size-10 text-border" />
            <p className="text-sm font-medium text-base-content/55">Aucune prestation</p>
            <p className="text-xs text-base-content/55">Touchez une prestation dans le menu.</p>
          </div>
        ) : (
          <>
          <ul className="flex flex-col divide-y divide-border">
            {sale.cart.map((line) => {
              const maxQty =
                line.kind === "produit" ? (produits.find((p) => p.id === line.refId)?.stock ?? 20) : 20;
              const coveredHere = totals.coveredAmountByService[line.refId] ?? 0;
              return (
              <li key={line.id} className="animate-line-in py-3.5">
                {line.kind === "produit" && line.qty >= maxQty && (
                  <p className="mb-1 text-xs font-medium text-warning">Stock atteint — {maxQty} en rayon.</p>
                )}
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-base-content">{line.name}</span>
                    {line.beneficiary && (
                      <span className="block text-xs font-medium text-primary">pour {line.beneficiary}</span>
                    )}
                    {coveredHere > 0 && (
                      <span className="block text-xs font-medium text-success">Déjà payé</span>
                    )}
                  </span>
                  {coveredHere > 0 ? (
                    <span className="shrink-0 text-right tabular-nums">
                      <span className="block text-xs text-base-content/45 line-through">
                        {formatFcfa(line.unitPrice * line.qty)}
                      </span>
                      <span className="block text-[15px] font-semibold text-success">
                        {formatFcfa(Math.max(0, line.unitPrice * line.qty - coveredHere))}
                      </span>
                    </span>
                  ) : (
                    <span className="shrink-0 text-[15px] font-semibold text-primary tabular-nums">
                      {formatFcfa(line.unitPrice * line.qty)}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  {/* single-pill quantity stepper — the most-used control on the ticket, so 56px */}
                  <div className="flex items-center rounded-full border border-border">
                    <button
                      type="button"
                      onClick={() => updateCartQty(sale.id, line.id, Math.max(1, line.qty - 1))}
                      disabled={line.qty <= 1}
                      aria-label={`Moins — ${line.name}`}
                      className="flex size-14 items-center justify-center rounded-full text-base-content/70 transition active:scale-90 disabled:opacity-30"
                    >
                      <Minus aria-hidden className="size-5" />
                    </button>
                    <span className="w-7 text-center text-[15px] font-bold text-base-content tabular-nums">{line.qty}</span>
                    <button
                      type="button"
                      onClick={() => updateCartQty(sale.id, line.id, Math.min(maxQty, line.qty + 1))}
                      disabled={line.qty >= maxQty}
                      aria-label={`Plus — ${line.name}`}
                      className="flex size-14 items-center justify-center rounded-full text-base-content/70 transition active:scale-90 disabled:opacity-30"
                    >
                      <Plus aria-hidden className="size-5" />
                    </button>
                  </div>

                  <span className="min-w-0 flex-1" />

                  <IconButton
                    onClick={() => removeCartLine(sale.id, line.id)}
                    aria-label={`Retirer ${line.name}`}
                    className="size-14 shrink-0 rounded-full border border-border text-base-content/55 transition active:scale-90 active:bg-error/10 active:text-destructive hover:bg-error/10 hover:text-destructive"
                  >
                    <Trash2 aria-hidden className="size-5" />
                  </IconButton>
                </div>
              </li>
              );
            })}
          </ul>
          </>
        )}
      </div>

      {/* Foot */}
      <div className="shrink-0 border-t border-border bg-white px-5 pt-3 pb-5">
        {!isEmpty && <CoverageSection sale={sale} />}
        {!isEmpty && <DiscountSection sale={sale} />}

        {(totals.totalDiscount > 0 || totals.coverageDiscount > 0 || totals.depositPaid > 0) && (
          <div className="mb-2 flex flex-col gap-0.5 text-sm">
            {(totals.totalDiscount > 0 || totals.coverageDiscount > 0) && (
              <div className="flex justify-between text-base-content/55">
                <span>Sous-total</span>
                <span className="tabular-nums">{formatFcfa(totals.subtotal)}</span>
              </div>
            )}
            <DiscountBreakdown sale={sale} />
            {totals.depositPaid > 0 && (
              <>
                <div className="flex justify-between text-base-content/55">
                  <span>Total</span>
                  <span className="tabular-nums">{formatFcfa(totals.total)}</span>
                </div>
                <DepositLine sale={sale} />
              </>
            )}
          </div>
        )}

        <div className="mb-3 flex items-end justify-between">
          <span className="pb-1.5 text-xs font-semibold tracking-[0.12em] text-base-content/55 uppercase">
            {totals.depositPaid > 0 ? "Reste à encaisser" : "Total"}
          </span>
          <span
            key={totals.amountDue}
            className="animate-total-pulse origin-right font-[family-name:var(--font-heading)] font-semibold text-[2.75rem] leading-none text-base-content tabular-nums tracking-[0.01em]"
          >
            {formatFcfa(totals.amountDue)}
          </span>
        </div>

        <Button
          variant="brand"
          size="xl"
          className={cn(
            "w-full",
            !canCheckout &&
              "disabled:bg-accent disabled:text-primary disabled:opacity-100",
          )}
          disabled={!canCheckout}
          icon={canCheckout ? undefined : <Lock className="size-4" />}
          onClick={() => updateSale(sale.id, { step: "paiement" })}
        >
          {canCheckout ? "Encaisser" : isEmpty ? "Panier vide" : "Choisir une cliente"}
        </Button>
      </div>
    </div>
  );
}
