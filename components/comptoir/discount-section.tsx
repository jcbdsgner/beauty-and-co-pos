"use client";

import { useState } from "react";
import { ChevronDown, Gift, Percent, ShieldCheck, Star } from "lucide-react";
import { Badge } from "@/components/ui/atoms/badge";
import { Button } from "@/components/ui/atoms/button";
import { TextInput } from "@/components/ui/atoms/text-input";
import { RoundStepButton } from "@/components/ui/atoms/round-step-button";
import { Checkbox } from "@/components/ui/atoms/checkbox";
import { Pills } from "@/components/ui/molecules/pills";
import { SegmentedToggle } from "@/components/ui/molecules/segmented-toggle";
import { useAppData, computeTotals } from "@/components/providers/app-data-provider";
import { MAX_REMISE_PCT, RECEPTIONIST_MAX_PCT } from "@/lib/store/app-store";
import { serviceById } from "@/lib/data/menu";
import { cn, formatFcfa } from "@/lib/utils";
import type { RemiseMode, Sale } from "@/lib/data/types";

/**
 * Discounts unfold inline at the foot of the ticket, right above the total — a caissier reaches
 * for them mid-transaction with the cliente in front of her, so a popup that hides the rest of
 * the panier is more friction than it's worth. Collapsed, it's a one-line trigger with a summary
 * badge; open, it stacks the three mechanisms in place.
 *
 * Three mechanisms, all stackable, all able to bring the total to 0 F:
 *  · a gift card — auto-linked from the cliente's fiche (ADR 0013), only its portion is adjusted here,
 *  · loyalty points,
 *  · a discretionary discount the receptionist grants on her own up to 10 % of the prestations,
 *    or up to 20 % with a manager code.
 */
export function DiscountSection({ sale }: { sale: Sale }) {
  const { setGiftCardAdjustment, setLoyaltyPointsUsed, updateSale, clients } = useAppData();
  const [open, setOpen] = useState(false);

  const client = sale.clientId ? clients.find((c) => c.id === sale.clientId) : undefined;
  const redeemable = client ? Math.floor(client.points / 100) * 100 : 0;
  const totals = computeTotals(sale);
  const hasDiscount = totals.totalDiscount > 0;

  return (
    <div className="mb-3 rounded-[10px] border border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-14 w-full items-center justify-between gap-2 px-4 text-[15px] font-medium text-base-content/70 transition active:scale-[0.99] outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
      >
        <span className="flex items-center gap-2">
          <Percent aria-hidden className="size-4 text-secondary" />
          {hasDiscount ? "Modifier la remise" : "Ajouter une remise"}
        </span>
        <span className="flex items-center gap-2">
          {hasDiscount ? (
            <Badge variant="success">−{formatFcfa(totals.totalDiscount)}</Badge>
          ) : (
            <span className="text-xs text-base-content/55">Carte cadeau · points · remise</span>
          )}
          <ChevronDown
            aria-hidden
            className={cn("size-4 shrink-0 text-base-content/45 transition-transform", open && "rotate-180")}
          />
        </span>
      </button>

      {open && (
        <div className="flex max-h-[55vh] flex-col gap-6 overflow-y-auto border-t border-border px-4 pt-4 pb-4">
          {/* Gift card — auto-linked from the cliente's fiche; only its portion is adjusted here */}
          {sale.giftCardApplied && (
            <section>
              <SectionLabel icon={<Gift className="size-3.5" />}>
                {sale.giftCardApplied.kind === "montant"
                  ? `Carte cadeau · ${formatFcfa(sale.giftCardApplied.balance)}`
                  : "Carte cadeau"}
              </SectionLabel>
              <AppliedGiftCard
                sale={sale}
                totals={totals}
                onAdjust={(p) => setGiftCardAdjustment(sale.id, p)}
                onRemove={() => updateSale(sale.id, { giftCardApplied: null })}
              />
            </section>
          )}

          {/* Loyalty points */}
          {client && redeemable > 0 && (
            <section>
              <SectionLabel icon={<Star className="size-3.5" />}>
                Points fidélité — {client.points} pts disponibles
              </SectionLabel>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-accent px-4 py-3">
                <RoundStepButton
                  size="sm"
                  direction="decrement"
                  onClick={() => setLoyaltyPointsUsed(sale.id, Math.max(0, sale.loyaltyPointsUsed - 100))}
                  disabled={sale.loyaltyPointsUsed <= 0}
                  ariaLabel="Utiliser 100 points de moins"
                />
                <span className="text-center">
                  <span className="block text-base font-bold text-base-content tabular-nums">
                    {sale.loyaltyPointsUsed} pts
                  </span>
                  {sale.loyaltyPointsUsed > 0 && (
                    <span className="block text-xs font-medium text-success">
                      −{formatFcfa(totals.loyaltyDiscount)}
                    </span>
                  )}
                </span>
                <RoundStepButton
                  size="sm"
                  direction="increment"
                  onClick={() => setLoyaltyPointsUsed(sale.id, Math.min(redeemable, sale.loyaltyPointsUsed + 100))}
                  disabled={sale.loyaltyPointsUsed >= redeemable}
                  ariaLabel="Utiliser 100 points de plus"
                />
              </div>
              <p className="mt-1 text-xs text-base-content/55">100 points = 1 000 F</p>
            </section>
          )}

          {/* Receptionist-granted discount */}
          <GrantedDiscountBlock sale={sale} />
        </div>
      )}
    </div>
  );
}

/**
 * An applied gift card, with the counter-side adjustment (ADR 0013 §4):
 *  · a `montant` card → how much of the balance to spend on this ticket;
 *  · a `prestations` card → which of its prestations to honour here (only those in the cart).
 * The rest of the balance stays on the card either way.
 */
function AppliedGiftCard({
  sale,
  totals,
  onAdjust,
  onRemove,
}: {
  sale: Sale;
  totals: ReturnType<typeof computeTotals>;
  onAdjust: (patch: { appliedAmount?: number; coveredServiceIds?: string[] }) => void;
  onRemove: () => void;
}) {
  const gc = sale.giftCardApplied!;
  const covered = gc.coveredServiceIds ?? gc.serviceIds ?? [];

  return (
    <div className="mt-2 flex flex-col gap-2.5 rounded-lg bg-success/10 px-3 py-3 text-sm">
      <div className="flex items-center justify-between gap-2 font-medium text-success">
        <span>{gc.kind === "prestations" ? "Prestations couvertes" : "Montant utilisé"}</span>
        <RemoveButton tone="success" onClick={onRemove} />
      </div>

      {gc.kind === "montant" ? (
        <span className="flex items-center gap-1.5">
          <TextInput
            inputMode="numeric"
            aria-label="Montant de la carte cadeau utilisé sur cette vente"
            className="flex-1 text-right tabular-nums"
            value={String(gc.appliedAmount ?? gc.balance)}
            onChange={(e) => onAdjust({ appliedAmount: Number(e.target.value.replace(/\D/g, "")) || 0 })}
          />
          <span className="text-base-content/55">F</span>
        </span>
      ) : (
        <div className="flex flex-col">
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
                  onAdjust({
                    coveredServiceIds: c ? [...covered, id] : covered.filter((x) => x !== id),
                  })
                }
                label={`${svc?.name ?? id}${inCart ? "" : " — pas au panier"}`}
              />
            );
          })}
        </div>
      )}

      {gc.kind === "montant" && totals.giftCardRemaining > 0 && totals.giftCardDiscount > 0 && (
        <p className="text-xs text-success/85">Il restera {formatFcfa(totals.giftCardRemaining)} sur la carte.</p>
      )}
    </div>
  );
}

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-base-content/55 uppercase">
      {icon} {children}
    </p>
  );
}

/** The quiet "Retirer" pill that peels a mechanism back off the ticket — a real 44px tap target,
 *  not a bare text link. `success` sits on the green applied-state cards, `neutral` on the head. */
function RemoveButton({ onClick, tone = "success" }: { onClick: () => void; tone?: "success" | "neutral" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-mr-1 inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-xs font-semibold transition active:scale-95",
        tone === "success"
          ? "bg-success/15 text-success hover:bg-success/25"
          : "bg-white/70 text-secondary hover:bg-white",
      )}
    >
      Retirer
    </button>
  );
}

const PCT_PRESETS = [5, 10, 15, MAX_REMISE_PCT];

/**
 * The receptionist sets the discount as a flat amount or a percentage of the prestations, with no
 * code of her own — up to 10 %. Between 10 and 20 % she must enter a manager code (ADR 0008). Over
 * 20 % is refused. The *reason* is not asked now: it's captured right after the sale is cashed in.
 */
function GrantedDiscountBlock({ sale }: { sale: Sale }) {
  const { grantDiscount, updateSale } = useAppData();
  const totals = computeTotals(sale);
  const granted = sale.discountGranted;

  const [mode, setMode] = useState<RemiseMode>("pourcentage");
  const [pct, setPct] = useState(10);
  const [montant, setMontant] = useState("");
  const [managerCode, setManagerCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const value = mode === "pourcentage" ? pct : Number(montant) || 0;
  const requestedPct =
    mode === "pourcentage" ? pct : totals.prestations > 0 ? ((Number(montant) || 0) / totals.prestations) * 100 : 0;
  const needsManager = requestedPct > RECEPTIONIST_MAX_PCT;
  const overCeiling = requestedPct > MAX_REMISE_PCT;
  const managerOk = /^\d{4,6}$/.test(managerCode.trim());
  const preview =
    mode === "pourcentage"
      ? Math.round((totals.prestations * Math.min(pct, MAX_REMISE_PCT)) / 100)
      : Math.min(Number(montant) || 0, totals.maxGrantedDiscount);
  const canApply =
    value > 0 && totals.prestations > 0 && !overCeiling && (!needsManager || managerOk);

  function apply() {
    const res = grantDiscount(sale.id, mode, value, needsManager ? managerCode : undefined);
    setMsg(res.message);
    if (res.ok) setManagerCode("");
  }

  if (granted) {
    return (
      <section>
        <SectionLabel icon={<ShieldCheck className="size-3.5" />}>Remise accordée</SectionLabel>
        <div className="rounded-lg bg-success/10 px-3 py-2.5 text-xs font-medium text-success">
          <div className="flex items-center justify-between gap-2">
            <span>
              {granted.mode === "pourcentage" ? `${granted.value} % des prestations` : "Montant fixe"} · −
              {formatFcfa(totals.grantedDiscount)}
            </span>
            <RemoveButton tone="success" onClick={() => updateSale(sale.id, { discountGranted: null })} />
          </div>
          <p className="mt-1 text-success/85">
            {granted.managerCode ? "Code manager · motif après paiement" : "Motif demandé après le paiement"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionLabel icon={<ShieldCheck className="size-3.5" />}>Remise accordée</SectionLabel>

      <div className="flex flex-col gap-3 rounded-xl border border-border p-3">
        <div>
          <p className="mb-1.5 text-xs text-base-content/55">Type de remise</p>
          <SegmentedToggle
            className="w-full"
            value={mode}
            onChange={(v) => setMode(v as RemiseMode)}
            options={[
              { value: "pourcentage", label: "Pourcentage" },
              { value: "montant", label: "Montant" },
            ]}
          />
        </div>

        {mode === "pourcentage" ? (
          <Pills
            value={String(pct)}
            onChange={(v) => setPct(Number(v))}
            options={PCT_PRESETS.map((p) => ({ value: String(p), label: `${p} %` }))}
          />
        ) : (
          <div>
            <TextInput
              inputMode="numeric"
              value={montant}
              onChange={(e) => setMontant(e.target.value.replace(/\D/g, ""))}
              placeholder="0"
              className="text-right tabular-nums"
            />
            <p className="mt-1 text-xs text-base-content/55">Maximum {formatFcfa(totals.maxGrantedDiscount)}</p>
          </div>
        )}

        {needsManager && !overCeiling && (
          <div className="rounded-lg bg-accent p-2.5">
            <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-primary">
              <ShieldCheck aria-hidden className="size-3.5" /> Au-delà de {RECEPTIONIST_MAX_PCT} % — code manager requis
            </p>
            <TextInput
              size="compact"
              inputMode="numeric"
              value={managerCode}
              onChange={(e) => setManagerCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Code à 4–6 chiffres"
              aria-label="Code manager"
              className="tabular-nums tracking-[0.3em]"
            />
          </div>
        )}
        {overCeiling && (
          <p className="text-xs font-medium text-destructive">
            {MAX_REMISE_PCT} % est le plafond absolu — impossible d&apos;accorder plus ici.
          </p>
        )}

        <div className="flex items-center justify-between border-t border-border pt-2.5">
          <span className="text-sm text-base-content/55">Remise</span>
          <span className="font-semibold text-base-content tabular-nums">
            {preview > 0 ? `−${formatFcfa(preview)}` : "—"}
          </span>
        </div>

        <Button variant="dark" size="default" className="w-full" disabled={!canApply} onClick={apply}>
          Accorder la remise
        </Button>
        {msg && <p className="text-xs font-medium text-destructive">{msg}</p>}
      </div>
    </section>
  );
}
