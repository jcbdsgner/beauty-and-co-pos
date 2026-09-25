"use client";

import { Lock, Minus, Plus, ScanLine, Search, Trash2 } from "lucide-react";
import { Tooltip } from "@/components/ui/atoms/tooltip";
import { Button } from "@/components/ui/atoms/button";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { ClientSearchField } from "@/components/shared/client-search-field";
import { TicketClientCard, TicketFrame, TicketHead, TicketLineBody, TicketTotals } from "@/components/comptoir/ticket-parts";
import { useAppData, computeTotals, saleNeedsClient } from "@/components/providers/app-data-provider";
import { cn } from "@/lib/utils";
import type { Sale } from "@/lib/data/types";

/**
 * The ticket. A sales slip, not a form: cliente at the head, a scannable list of lines, and the
 * total seated at the foot as the one oversized figure the eye keeps returning to. No remise here
 * (ADR 0031): every adjustment of what is owed — remise, points, carte cadeau, prestations déjà
 * payées — happens at the règlement, on this same ticket block.
 */
export function SaleCartPanel({ sale, onOpenScanner }: { sale: Sale; onOpenScanner: () => void }) {
  const { updateCartQty, removeCartLine, updateSale, clients, produits } = useAppData();
  const totals = computeTotals(sale);
  const isEmpty = sale.cart.length === 0;
  const client = sale.clientId ? clients.find((c) => c.id === sale.clientId) : undefined;
  // A prestation in the basket means someone was served — the note must name her (ADR 0013). A
  // products-only walk-in checks out anonymously; the cliente stays optional (fidélité / carte
  // cadeau). Amber = "needs a decision" (DESIGN.md One-Signal rule) — only when it truly blocks.
  const needsClient = !isEmpty && sale.clientId === null && saleNeedsClient(sale);
  const clientOptional = !isEmpty && sale.clientId === null && !saleNeedsClient(sale);
  const canCheckout = !isEmpty && !needsClient;

  return (
    <TicketFrame>
      <TicketHead sale={sale}>
          {client ? (
            <TicketClientCard client={client} onRemove={() => updateSale(sale.id, { clientId: null })} />
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
      </TicketHead>

      {/* Lines */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
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
                <TicketLineBody line={line} covered={coveredHere} discount={totals.lineDiscount[line.id] ?? 0} hideQty />

                <div className="mt-2 flex items-center gap-2">
                  {/* single-pill quantity stepper — the most-used control on the ticket, so 56px */}
                  <div className="flex items-center rounded-full border border-border">
                    <Tooltip content="Retirer une unité">
                      <button
                        type="button"
                        onClick={() => updateCartQty(sale.id, line.id, Math.max(1, line.qty - 1))}
                        disabled={line.qty <= 1}
                        aria-label={`Moins — ${line.name}`}
                        className="flex size-14 items-center justify-center rounded-full text-base-content/70 transition active:scale-90 disabled:opacity-30"
                      >
                        <Minus aria-hidden className="size-5" />
                      </button>
                    </Tooltip>
                    <span className="w-7 text-center text-[15px] font-bold text-base-content tabular-nums">{line.qty}</span>
                    <Tooltip content="Ajouter une unité">
                      <button
                        type="button"
                        onClick={() => updateCartQty(sale.id, line.id, Math.min(maxQty, line.qty + 1))}
                        disabled={line.qty >= maxQty}
                        aria-label={`Plus — ${line.name}`}
                        className="flex size-14 items-center justify-center rounded-full text-base-content/70 transition active:scale-90 disabled:opacity-30"
                      >
                        <Plus aria-hidden className="size-5" />
                      </button>
                    </Tooltip>
                  </div>

                  <span className="min-w-0 flex-1" />

                  <Tooltip content="Retirer du panier">
                    <IconButton
                      onClick={() => removeCartLine(sale.id, line.id)}
                      aria-label={`Retirer ${line.name}`}
                      className="size-14 shrink-0 rounded-full border border-border text-base-content/55 transition active:scale-90 active:bg-error/10 active:text-destructive hover:bg-error/10 hover:text-destructive"
                    >
                      <Trash2 aria-hidden className="size-5" />
                    </IconButton>
                  </Tooltip>
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
        <TicketTotals sale={sale} className="mb-3" />

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
    </TicketFrame>
  );
}
