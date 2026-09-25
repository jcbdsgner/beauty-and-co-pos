"use client";

import { useState } from "react";
import { ChevronDown, Gift, Star } from "lucide-react";
import { TextInput } from "@/components/ui/atoms/text-input";
import { RoundStepButton } from "@/components/ui/atoms/round-step-button";
import { Checkbox } from "@/components/ui/atoms/checkbox";
import { CoverageSection } from "@/components/comptoir/coverage-section";
import { useAppData, computeTotals } from "@/components/providers/app-data-provider";
import { serviceById } from "@/lib/data/menu";
import { cn, formatFcfa } from "@/lib/utils";
import type { Sale } from "@/lib/data/types";

/**
 * What the cliente already holds and can spend on this ticket (ADR 0031) — read at the règlement,
 * under the lines, never on the panier: prestations déjà payées (Pack / Abonnement, ADR 0017), her
 * carte cadeau (auto-linked, ADR 0013) and her loyalty points. Nothing to type: everything the
 * cliente holds is already applied (points excepted — they're her call); the receptionist only
 * adjusts. Renders nothing for an anonymous sale or a cliente with nothing to spend.
 */
export function AdvantagesSection({ sale }: { sale: Sale }) {
  const { setLoyaltyPointsUsed, clients } = useAppData();
  const client = sale.clientId ? clients.find((c) => c.id === sale.clientId) : undefined;
  const redeemable = client ? Math.floor(client.points / 100) * 100 : 0;
  const totals = computeTotals(sale);
  const hasPoints = !!client && redeemable > 0;

  if (sale.coverage.length === 0 && !sale.giftCardApplied && !hasPoints) return null;

  return (
    <section aria-labelledby="advantages-title" className="flex flex-col gap-2 border-t border-border pt-4 pb-5">
      <h3 id="advantages-title" className="text-xs font-semibold tracking-[0.12em] text-base-content/55 uppercase">
        Avantages de la cliente
      </h3>

      <CoverageSection sale={sale} />

      {sale.giftCardApplied && <GiftCardRow sale={sale} />}

      {hasPoints && client && (
        <div className="flex items-center gap-3 rounded-[10px] border border-border py-2 pr-2 pl-4">
          <Star aria-hidden className="size-4 shrink-0 text-secondary" />
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-medium text-base-content">Points fidélité</span>
            <span className="block text-xs text-base-content/55 tabular-nums">
              {client.points} pts · 100 pts = 1 000 F
            </span>
          </span>
          <RoundStepButton
            size="sm"
            direction="decrement"
            onClick={() => setLoyaltyPointsUsed(sale.id, Math.max(0, sale.loyaltyPointsUsed - 100))}
            disabled={sale.loyaltyPointsUsed <= 0}
            ariaLabel="Utiliser 100 points de moins"
          />
          <span className="w-16 text-center">
            <span className="block text-sm font-bold text-base-content tabular-nums">{sale.loyaltyPointsUsed}</span>
            <span className={cn("block text-xs font-medium tabular-nums", totals.loyaltyDiscount > 0 ? "text-success" : "text-base-content/45")}>
              {totals.loyaltyDiscount > 0 ? `−${formatFcfa(totals.loyaltyDiscount)}` : "pts"}
            </span>
          </span>
          <RoundStepButton
            size="sm"
            direction="increment"
            onClick={() => setLoyaltyPointsUsed(sale.id, Math.min(redeemable, sale.loyaltyPointsUsed + 100))}
            disabled={sale.loyaltyPointsUsed >= redeemable}
            ariaLabel="Utiliser 100 points de plus"
          />
        </div>
      )}
    </section>
  );
}

/**
 * The linked gift card as one row — what it takes off this ticket — that unfolds in place to the
 * counter-side adjustment (ADR 0013 §4): a `montant` card → how much of the balance to spend; a
 * `prestations` card → which of its prestations to honour here. The rest stays on the card.
 */
function GiftCardRow({ sale }: { sale: Sale }) {
  const { setGiftCardAdjustment, updateSale } = useAppData();
  const [open, setOpen] = useState(false);
  const totals = computeTotals(sale);
  const gc = sale.giftCardApplied!;
  const covered = gc.coveredServiceIds ?? gc.serviceIds ?? [];

  return (
    <div className="overflow-hidden rounded-[10px] border border-success/40 bg-success/[0.06]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-14 w-full items-center gap-3 px-4 text-left outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
      >
        <Gift aria-hidden className="size-4 shrink-0 text-success" />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-medium text-success">Carte cadeau</span>
          <span className="block text-xs text-success/80 tabular-nums">
            {gc.kind === "montant"
              ? totals.giftCardRemaining > 0
                ? `Solde ${formatFcfa(gc.balance)} · il restera ${formatFcfa(totals.giftCardRemaining)}`
                : `Solde ${formatFcfa(gc.balance)}`
              : `${covered.length} prestation${covered.length > 1 ? "s" : ""} couverte${covered.length > 1 ? "s" : ""}`}
          </span>
        </span>
        <span className="font-semibold text-success tabular-nums">
          {totals.giftCardDiscount > 0 ? `−${formatFcfa(totals.giftCardDiscount)}` : "—"}
        </span>
        <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-success transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="flex flex-col gap-2.5 border-t border-success/25 px-4 pt-3 pb-4 text-sm">
          {gc.kind === "montant" ? (
            <label className="flex items-center gap-2">
              <span className="text-success">Utiliser</span>
              <TextInput
                inputMode="numeric"
                aria-label="Montant de la carte cadeau utilisé sur cette vente"
                className="flex-1 text-right tabular-nums"
                value={String(gc.appliedAmount ?? gc.balance)}
                onChange={(e) => setGiftCardAdjustment(sale.id, { appliedAmount: Number(e.target.value.replace(/\D/g, "")) || 0 })}
              />
              <span className="text-base-content/55">F</span>
            </label>
          ) : (
            <div className="flex flex-col rounded-lg bg-white/70">
              {(gc.serviceIds ?? []).map((id) => {
                const svc = serviceById(id);
                const inCart = sale.cart.some((l) => l.kind === "service" && l.refId === id);
                return (
                  <Checkbox
                    key={id}
                    className="min-h-12 text-[13px]"
                    checked={inCart && covered.includes(id)}
                    disabled={!inCart}
                    onChange={(c) =>
                      setGiftCardAdjustment(sale.id, {
                        coveredServiceIds: c ? [...covered, id] : covered.filter((x) => x !== id),
                      })
                    }
                    label={`${svc?.name ?? id}${inCart ? "" : " — pas au panier"}`}
                  />
                );
              })}
            </div>
          )}
          <button
            type="button"
            onClick={() => updateSale(sale.id, { giftCardApplied: null })}
            className="inline-flex min-h-11 items-center self-start rounded-full bg-success/15 px-3 text-xs font-semibold text-success transition active:scale-95 hover:bg-success/25"
          >
            Ne pas utiliser la carte
          </button>
        </div>
      )}
    </div>
  );
}
