"use client";

import { useState } from "react";
import { ChevronDown, Gift, Percent, ScanLine, ShieldCheck, Star } from "lucide-react";
import { Badge } from "@/components/ui/atoms/badge";
import { Button } from "@/components/ui/atoms/button";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { TextInput } from "@/components/ui/atoms/text-input";
import { RoundStepButton } from "@/components/ui/atoms/round-step-button";
import { Checkbox } from "@/components/ui/atoms/checkbox";
import { InputOtp } from "@/components/ui/molecules/input-otp";
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
 *  · a gift card (prepaid — unused value stays on the card),
 *  · loyalty points,
 *  · a discretionary discount the receptionist grants with her own code, ≤ 20 % of the prestations.
 */
export function DiscountSection({ sale, onOpenScanner }: { sale: Sale; onOpenScanner: () => void }) {
  const { applyGiftCard, setGiftCardAdjustment, setLoyaltyPointsUsed, updateSale, clients } = useAppData();
  const [open, setOpen] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardMsg, setGiftCardMsg] = useState<string | null>(null);

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
          {/* Gift card */}
          <section>
            <SectionLabel icon={<Gift className="size-3.5" />}>Carte cadeau</SectionLabel>
            <div className="flex gap-2">
              <TextInput
                size="compact"
                value={giftCardCode}
                onChange={(e) => setGiftCardCode(e.target.value)}
                placeholder="BACO-GIFT-25000"
                autoCapitalize="characters"
                spellCheck={false}
              />
              <IconButton
                onClick={onOpenScanner}
                aria-label="Scanner ou saisir une carte"
                className="size-11 shrink-0 rounded-full border border-border text-secondary transition active:scale-90 hover:border-secondary hover:bg-accent"
              >
                <ScanLine aria-hidden className="size-4" />
              </IconButton>
              <Button
                variant="brand"
                size="sm"
                disabled={!giftCardCode.trim()}
                onClick={() => {
                  const res = applyGiftCard(sale.id, giftCardCode);
                  setGiftCardMsg(res.message);
                  if (res.ok) setGiftCardCode("");
                }}
                className="shrink-0"
              >
                Appliquer
              </Button>
            </div>
            {sale.giftCardApplied ? (
              <AppliedGiftCard sale={sale} totals={totals} onAdjust={(p) => setGiftCardAdjustment(sale.id, p)} onRemove={() => updateSale(sale.id, { giftCardApplied: null })} />
            ) : (
              giftCardMsg && <p className="mt-1 text-xs font-medium text-destructive">{giftCardMsg}</p>
            )}
          </section>

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
    <div className="mt-2 flex flex-col gap-2 rounded-lg bg-success/10 px-3 py-2.5 text-xs">
      <div className="flex items-center justify-between font-medium text-success">
        <span>
          Carte « {gc.code} » · {gc.kind === "prestations" ? "prestations" : `solde ${formatFcfa(gc.balance)}`}
        </span>
        <button type="button" onClick={onRemove} className="underline underline-offset-2">
          Retirer
        </button>
      </div>

      {gc.kind === "montant" ? (
        <label className="flex items-center justify-between gap-2 text-base-content/80">
          <span>Montant appliqué</span>
          <span className="flex items-center gap-1.5">
            <TextInput
              size="compact"
              inputMode="numeric"
              aria-label="Montant de la carte cadeau appliqué à cette vente"
              className="w-24 text-right tabular-nums"
              value={String(gc.appliedAmount ?? gc.balance)}
              onChange={(e) => onAdjust({ appliedAmount: Number(e.target.value.replace(/\D/g, "")) || 0 })}
            />
            <span className="text-base-content/55">F</span>
          </span>
        </label>
      ) : (
        <div className="flex flex-col">
          {(gc.serviceIds ?? []).map((id) => {
            const svc = serviceById(id);
            const inCart = sale.cart.some((l) => l.kind === "service" && l.refId === id);
            return (
              <Checkbox
                key={id}
                className="min-h-11 text-[13px]"
                checked={inCart && covered.includes(id)}
                disabled={!inCart}
                onChange={(c) =>
                  onAdjust({
                    coveredServiceIds: c ? [...covered, id] : covered.filter((x) => x !== id),
                  })
                }
                label={`${svc?.name ?? id} · ${formatFcfa(svc?.price ?? 0)}${inCart ? "" : " — pas au panier"}`}
              />
            );
          })}
        </div>
      )}

      <p className="text-success/85">
        Couvre −{formatFcfa(totals.giftCardDiscount)}
        {totals.giftCardRemaining > 0 && ` · reste ${formatFcfa(totals.giftCardRemaining)} sur la carte`}
      </p>
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

const PCT_PRESETS = [5, 10, 15, MAX_REMISE_PCT];

/**
 * The receptionist authenticates with her personal code, then sets the discount as a flat amount
 * or a percentage of the prestations. Her code alone covers up to 10 %; between 10 and 20 % she
 * must also enter a manager code (ADR 0008). Over 20 % is refused. The *reason* is not asked now:
 * it's captured right after the sale is cashed in.
 */
function GrantedDiscountBlock({ sale }: { sale: Sale }) {
  const { grantDiscount, updateSale } = useAppData();
  const totals = computeTotals(sale);
  const granted = sale.discountGranted;

  const [code, setCode] = useState("");
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
    code.trim().length >= 4 && value > 0 && totals.prestations > 0 && !overCeiling && (!needsManager || managerOk);

  function apply() {
    const res = grantDiscount(sale.id, code, mode, value, needsManager ? managerCode : undefined);
    setMsg(res.message);
    if (res.ok) {
      setCode("");
      setManagerCode("");
    }
  }

  if (granted) {
    return (
      <section>
        <SectionLabel icon={<ShieldCheck className="size-3.5" />}>Remise accordée</SectionLabel>
        <div className="rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success">
          <div className="flex items-center justify-between">
            <span>
              {granted.mode === "pourcentage" ? `${granted.value} % des prestations` : "Montant fixe"} · −
              {formatFcfa(totals.grantedDiscount)}
            </span>
            <button
              type="button"
              onClick={() => updateSale(sale.id, { discountGranted: null })}
              className="underline underline-offset-2"
            >
              Retirer
            </button>
          </div>
          <p className="mt-0.5 text-success/85">
            Code {granted.grantedByCode}
            {granted.managerCode ? " · validée par code manager" : ""} · motif demandé après l&apos;encaissement
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionLabel icon={<ShieldCheck className="size-3.5" />}>Remise accordée (réceptionniste)</SectionLabel>

      <div className="flex flex-col gap-3 rounded-xl border border-border p-3">
        <div>
          <p className="mb-1.5 text-xs text-base-content/55">Votre code personnel</p>
          <InputOtp
            value={code}
            onChange={setCode}
            length={4}
            pattern="^[A-Za-z0-9]*$"
            ariaLabel="Code réceptionniste"
          />
        </div>

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
          <div>
            <Pills
              value={String(pct)}
              onChange={(v) => setPct(Number(v))}
              options={PCT_PRESETS.map((p) => ({ value: String(p), label: `${p} %` }))}
            />
            <p className="mt-1 text-[11px] text-base-content/45">
              Jusqu&apos;à {RECEPTIONIST_MAX_PCT} % avec votre code · jusqu&apos;à {MAX_REMISE_PCT} % avec un code manager
            </p>
          </div>
        ) : (
          <div>
            <TextInput
              size="compact"
              inputMode="numeric"
              value={montant}
              onChange={(e) => setMontant(e.target.value.replace(/\D/g, ""))}
              placeholder="0"
              className="text-right tabular-nums"
            />
            <p className="mt-1 text-xs text-base-content/55">
              Jusqu&apos;à {formatFcfa(totals.receptionistMaxDiscount)} avec votre code · {formatFcfa(totals.maxGrantedDiscount)} ({MAX_REMISE_PCT} %) avec un code manager
            </p>
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
