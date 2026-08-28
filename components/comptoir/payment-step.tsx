"use client";

import { useState } from "react";
import { Banknote, Check, CreditCard, Smartphone, Wallet } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { NumericKeypad } from "@/components/ui/molecules/numeric-keypad";
import { computeTotals, useAppData } from "@/components/providers/app-data-provider";
import { cn, formatFcfa } from "@/lib/utils";
import type { PaymentMode, Sale } from "@/lib/data/types";

const MODES: { value: PaymentMode; label: string; icon: typeof Wallet; hint: string }[] = [
  { value: "wave", label: "Wave", icon: Smartphone, hint: "La cliente valide sur son téléphone." },
  { value: "orange_money", label: "Orange Money", icon: Wallet, hint: "La cliente valide sur son téléphone." },
  { value: "especes", label: "Espèces", icon: Banknote, hint: "Saisissez le montant reçu." },
  { value: "carte", label: "Carte", icon: CreditCard, hint: "Insérez ou passez la carte." },
];

export function PaymentStep({ sale }: { sale: Sale }) {
  const { confirmPayment, updateSale } = useAppData();
  const totals = computeTotals(sale);
  const { total } = totals;
  const [primaryMode, setPrimaryMode] = useState<PaymentMode | null>(null);
  const [mixed, setMixed] = useState(false);
  const [secondaryMode, setSecondaryMode] = useState<PaymentMode | null>(null);
  const [primaryAmount, setPrimaryAmount] = useState("");
  const [secondaryAmount, setSecondaryAmount] = useState("");
  const [cashReceived, setCashReceived] = useState("");

  const involvesCash = primaryMode === "especes" || (mixed && secondaryMode === "especes");
  const remaining = mixed ? total - (Number(primaryAmount) || 0) - (Number(secondaryAmount) || 0) : 0;
  const balanced = mixed ? remaining === 0 : true;
  const cashEnough = !involvesCash || Number(cashReceived) >= (mixed ? Number(secondaryMode === "especes" ? secondaryAmount : primaryAmount) || 0 : total);
  const change = involvesCash && cashReceived ? Math.max(0, Number(cashReceived) - (mixed ? (Number(secondaryMode === "especes" ? secondaryAmount : primaryAmount) || 0) : total)) : 0;

  const canConfirm = (mixed ? primaryMode && secondaryMode && balanced : primaryMode !== null) && cashEnough;
  const selectedMeta = MODES.find((m) => m.value === primaryMode);

  function handleConfirm() {
    if (!primaryMode) return;
    const modes = mixed && secondaryMode
      ? [
          { mode: primaryMode, amount: Number(primaryAmount) },
          { mode: secondaryMode, amount: Number(secondaryAmount) },
        ]
      : [{ mode: primaryMode, amount: total }];
    confirmPayment(sale.id, modes);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mx-auto grid min-h-0 w-full max-w-5xl flex-1 grid-cols-2 gap-10 overflow-y-auto px-8 py-8">
        {/* Left — amount + mode */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">À payer</p>
            <p className="font-[family-name:var(--font-heading)] font-semibold text-[3.5rem] leading-none text-[var(--color-gray-900)] tabular-nums">
              {formatFcfa(total)}
            </p>
            {totals.totalDiscount > 0 && (
              <p className="mt-1.5 text-sm text-[var(--color-gray-500)]">
                <span className="tabular-nums line-through">{formatFcfa(totals.subtotal)}</span>{" "}
                <span className="font-medium text-[var(--color-success)]">
                  · remise −{formatFcfa(totals.totalDiscount)}
                </span>
              </p>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-[var(--color-gray-600)]">Comment règle la cliente ?</p>
            <div className="grid grid-cols-2 gap-3">
              {MODES.map((m) => {
                const Icon = m.icon;
                const active = primaryMode === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setPrimaryMode(m.value)}
                    className={cn(
                      "flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border text-center transition active:scale-[0.97]",
                      active ? "border-secondary bg-accent" : "border-border bg-white hover:border-secondary/50",
                    )}
                  >
                    <Icon aria-hidden className="size-6 text-secondary" />
                    <span className="text-sm font-semibold text-[var(--color-gray-900)]">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm font-medium text-[var(--color-gray-700)]">
            <input
              type="checkbox"
              checked={mixed}
              onChange={(e) => setMixed(e.target.checked)}
              className="size-5 rounded border-2 border-[var(--color-gray-300)] accent-[var(--brand-taupe-muted)]"
            />
            Régler en deux fois
          </label>

          {mixed && (
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-4">
              <div className="flex items-center gap-2">
                <span className="w-28 shrink-0 text-sm text-[var(--color-gray-600)]">{selectedMeta?.label ?? "1er mode"}</span>
                <input
                  inputMode="numeric"
                  value={primaryAmount}
                  onChange={(e) => setPrimaryAmount(e.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                  className="h-11 flex-1 rounded-lg border border-border px-3 text-right text-[15px] tabular-nums focus:border-ring focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MODES.filter((m) => m.value !== primaryMode).map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setSecondaryMode(m.value)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-[0.97]",
                      secondaryMode === m.value ? "border-secondary bg-accent text-secondary" : "border-border text-[var(--color-gray-600)]",
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-28 shrink-0 text-sm text-[var(--color-gray-600)]">{MODES.find((m) => m.value === secondaryMode)?.label ?? "2e mode"}</span>
                <input
                  inputMode="numeric"
                  value={secondaryAmount}
                  onChange={(e) => setSecondaryAmount(e.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                  className="h-11 flex-1 rounded-lg border border-border px-3 text-right text-[15px] tabular-nums focus:border-ring focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-gray-500)]">Reste à répartir</span>
                <span className={cn("font-semibold tabular-nums", balanced ? "text-[var(--color-success)]" : "text-destructive")}>
                  {balanced ? "Réparti" : formatFcfa(Math.abs(remaining))}
                </span>
              </div>
              {!balanced && (
                <button
                  type="button"
                  onClick={() => {
                    setPrimaryAmount("");
                    setSecondaryAmount("");
                  }}
                  className="self-start text-xs font-medium text-secondary underline underline-offset-2"
                >
                  Recommencer la répartition
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right — contextual */}
        <div className="flex flex-col justify-center">
          {!primaryMode ? (
            <p className="text-center text-sm text-[var(--color-gray-400)]">Choisissez un mode de paiement.</p>
          ) : involvesCash ? (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">Montant reçu</p>
                <p className="font-[family-name:var(--font-heading)] font-semibold text-3xl text-[var(--color-gray-900)] tabular-nums">
                  {cashReceived ? formatFcfa(Number(cashReceived)) : "—"}
                </p>
              </div>
              <NumericKeypad value={cashReceived} onChange={setCashReceived} />
              <div className="rounded-2xl bg-[var(--color-success-soft)] p-4 text-center">
                <p className="text-xs font-semibold tracking-wide text-[var(--color-success)] uppercase">Rendu de monnaie</p>
                <p className="font-[family-name:var(--font-heading)] font-semibold text-[2.5rem] leading-none text-[var(--color-success)] tabular-nums">
                  {formatFcfa(change)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-accent text-secondary">
                {selectedMeta && <selectedMeta.icon aria-hidden className="size-7" />}
              </span>
              <p className="font-[family-name:var(--font-heading)] font-semibold text-xl text-[var(--color-gray-900)] tabular-nums">
                {formatFcfa(total)} · {selectedMeta?.label}
              </p>
              <p className="text-sm text-[var(--color-gray-500)]">{selectedMeta?.hint}</p>
            </div>
          )}
        </div>
      </div>

      {/* Foot bar */}
      <div className="shrink-0 border-t border-border bg-white px-8 py-4">
        <div className="mx-auto flex max-w-5xl gap-3">
          <Button variant="outline" size="default" className="flex-1" onClick={() => updateSale(sale.id, { step: "vente" })}>
            Retour au panier
          </Button>
          <Button variant="brand" size="xl" className="flex-[2]" icon={<Check className="size-5" />} disabled={!canConfirm} onClick={handleConfirm}>
            Confirmer l&apos;encaissement
          </Button>
        </div>
      </div>
    </div>
  );
}
