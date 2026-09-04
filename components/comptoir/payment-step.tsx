"use client";

import { useState } from "react";
import Image from "next/image";
import { Banknote, Check, CreditCard, Smartphone, Wallet } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { NumericKeypad } from "@/components/ui/molecules/numeric-keypad";
import { computeTotals, useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import { cn, formatFcfa } from "@/lib/utils";
import type { PaymentMode, Sale } from "@/lib/data/types";

// Wave and Orange Money carry their own brand mark on the tile (their word-mark is baked into the
// logo, so no label under it); Carte / Espèces are plain word tiles. `icon` stays on every mode as
// the fallback glyph for the right-hand confirmation card.
const MODES: {
  value: PaymentMode;
  label: string;
  icon: typeof Wallet;
  logo?: { src: string; width: number; height: number };
  hint: string;
}[] = [
  { value: "wave", label: "Wave", icon: Smartphone, logo: { src: "/images/payment/wave.png", width: 512, height: 506 }, hint: "La cliente valide sur son téléphone." },
  { value: "orange_money", label: "Orange Money", icon: Wallet, logo: { src: "/images/payment/orange-money.png", width: 512, height: 343 }, hint: "La cliente valide sur son téléphone." },
  { value: "carte", label: "Carte", icon: CreditCard, hint: "Insérez ou passez la carte." },
  { value: "especes", label: "Espèces", icon: Banknote, hint: "Saisissez le montant reçu de la cliente." },
];

export function PaymentStep({ sale }: { sale: Sale }) {
  const { confirmPayment, updateSale, clients } = useAppData();
  const totals = computeTotals(sale);
  const { total } = totals;
  const client = sale.clientId ? clients.find((c) => c.id === sale.clientId) : undefined;
  const itemCount = sale.cart.reduce((n, l) => n + l.qty, 0);
  const [primaryMode, setPrimaryMode] = useState<PaymentMode | null>(null);
  const [mixed, setMixed] = useState(false);
  const [secondaryMode, setSecondaryMode] = useState<PaymentMode | null>(null);
  const [primaryAmount, setPrimaryAmount] = useState("");
  const [secondaryAmount, setSecondaryAmount] = useState("");
  const [cashReceived, setCashReceived] = useState("");

  const involvesCash = primaryMode === "especes" || (mixed && secondaryMode === "especes");
  const remaining = mixed ? total - (Number(primaryAmount) || 0) - (Number(secondaryAmount) || 0) : 0;
  const balanced = mixed ? remaining === 0 : true;
  const cashDue = mixed ? Number(secondaryMode === "especes" ? secondaryAmount : primaryAmount) || 0 : total;
  const cashEnough = !involvesCash || Number(cashReceived) >= cashDue;
  const change = involvesCash && cashReceived ? Math.max(0, Number(cashReceived) - cashDue) : 0;

  const canConfirm = (mixed ? primaryMode && secondaryMode && balanced : primaryMode !== null) && cashEnough;
  const selectedMeta = MODES.find((m) => m.value === primaryMode);

  const disabledReason = !primaryMode
    ? "Choisissez un mode de paiement."
    : mixed && !secondaryMode
      ? "Choisissez le second mode."
      : mixed && !balanced
        ? `Reste ${formatFcfa(Math.abs(remaining))} à répartir.`
        : involvesCash && !cashEnough
          ? "Montant reçu insuffisant."
          : null;

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

  const ticketRecap = (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white">
      <p className="border-b border-border px-4 py-2.5 text-xs font-semibold tracking-wide text-base-content/55 uppercase">
        {itemCount} {itemCount > 1 ? "articles" : "article"}
      </p>
      <ul className="flex max-h-[280px] flex-col divide-y divide-border overflow-y-auto">
        {sale.cart.map((line) => (
          <li key={line.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
            <span className="min-w-0">
              <span className="block text-sm font-medium text-base-content">
                {line.qty > 1 ? `${line.qty} × ` : ""}
                {line.name}
              </span>
              {line.beneficiary && (
                <span className="block text-xs text-primary">pour {line.beneficiary}</span>
              )}
            </span>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-base-content/80">
              {formatFcfa(line.unitPrice * line.qty)}
            </span>
          </li>
        ))}
      </ul>
      {totals.totalDiscount > 0 && (
        <p className="border-t border-border px-4 py-2 text-right text-sm text-success">
          remise −{formatFcfa(totals.totalDiscount)}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="mx-auto grid min-h-0 w-full max-w-5xl flex-1 grid-cols-2 gap-10 overflow-y-auto px-8 py-8">
        {/* Left — who + amount + mode */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold tracking-wide text-base-content/55 uppercase">
              À payer{client ? ` — ${clientFullName(client)}` : ""}
            </p>
            <p className="font-[family-name:var(--font-heading)] font-semibold text-[3.5rem] leading-none text-base-content tabular-nums">
              {formatFcfa(total)}
            </p>
            {totals.totalDiscount > 0 && (
              <p className="mt-1.5 text-sm text-base-content/55">
                <span className="tabular-nums line-through">{formatFcfa(totals.subtotal)}</span>{" "}
                <span className="font-medium text-success">
                  · remise −{formatFcfa(totals.totalDiscount)}
                </span>
              </p>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-base-content/70">Comment règle la cliente ?</p>
            <div className="grid max-w-md grid-cols-2 gap-4">
              {MODES.map((m) => {
                const active = primaryMode === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setPrimaryMode(m.value)}
                    aria-pressed={active}
                    className={cn(
                      "flex aspect-[5/4] flex-col items-center justify-center gap-2 rounded-2xl border p-5 text-center transition active:scale-[0.97]",
                      active ? "border-secondary bg-accent" : "border-border bg-white hover:border-secondary/50",
                    )}
                  >
                    {m.logo ? (
                      <span className="flex h-[72px] w-full items-center justify-center overflow-hidden rounded-xl">
                        <Image
                          src={m.logo.src}
                          alt={m.label}
                          width={m.logo.width}
                          height={m.logo.height}
                          className="max-h-[72px] w-auto max-w-full object-contain"
                        />
                      </span>
                    ) : (
                      <span className="font-[family-name:var(--font-heading)] text-2xl font-bold text-base-content">
                        {m.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-3 text-[15px] font-medium text-base-content/80">
            <input
              type="checkbox"
              checked={mixed}
              onChange={(e) => setMixed(e.target.checked)}
              className="size-6 rounded border-2 border-base-content/30 accent-primary"
            />
            Régler en deux fois
          </label>

          {mixed && (
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-4">
              <div className="flex items-center gap-2">
                <span className="w-28 shrink-0 text-sm text-base-content/70">{selectedMeta?.label ?? "1er mode"}</span>
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
                      secondaryMode === m.value ? "border-secondary bg-accent text-secondary" : "border-border text-base-content/70",
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-28 shrink-0 text-sm text-base-content/70">{MODES.find((m) => m.value === secondaryMode)?.label ?? "2e mode"}</span>
                <input
                  inputMode="numeric"
                  value={secondaryAmount}
                  onChange={(e) => setSecondaryAmount(e.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                  className="h-11 flex-1 rounded-lg border border-border px-3 text-right text-[15px] tabular-nums focus:border-ring focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-base-content/55">Reste à répartir</span>
                <span className={cn("font-semibold tabular-nums", balanced ? "text-success" : "text-destructive")}>
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

        {/* Right — the ticket, then the mode-specific step */}
        <div className={cn("flex flex-col gap-4", primaryMode && !involvesCash ? "justify-center" : "justify-start")}>
          {!primaryMode ? (
            ticketRecap
          ) : involvesCash ? (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-base-content/55 uppercase">Montant reçu</p>
                <p className="font-[family-name:var(--font-heading)] font-semibold text-3xl text-base-content tabular-nums">
                  {cashReceived ? formatFcfa(Number(cashReceived)) : "—"}
                </p>
                <p className="mt-0.5 text-sm text-base-content/55">{selectedMeta?.hint}</p>
              </div>
              <NumericKeypad value={cashReceived} onChange={setCashReceived} />
              <div
                className={cn(
                  "rounded-2xl p-4 text-center",
                  cashReceived ? "bg-success/10" : "bg-base-200",
                )}
              >
                <p
                  className={cn(
                    "text-xs font-semibold tracking-wide uppercase",
                    cashReceived ? "text-success" : "text-base-content/45",
                  )}
                >
                  Rendu de monnaie
                </p>
                <p
                  className={cn(
                    "font-[family-name:var(--font-heading)] font-semibold text-[2.5rem] leading-none tabular-nums",
                    cashReceived ? "text-success" : "text-base-content/45",
                  )}
                >
                  {cashReceived ? formatFcfa(change) : "—"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 text-center">
              {selectedMeta?.logo ? (
                <Image
                  src={selectedMeta.logo.src}
                  alt={selectedMeta.label}
                  width={selectedMeta.logo.width}
                  height={selectedMeta.logo.height}
                  className="h-14 w-auto object-contain"
                />
              ) : (
                <span className="flex size-14 items-center justify-center rounded-full bg-accent text-secondary">
                  {selectedMeta && <selectedMeta.icon aria-hidden className="size-7" />}
                </span>
              )}
              <p className="font-[family-name:var(--font-heading)] font-semibold text-xl text-base-content tabular-nums">
                {formatFcfa(total)} · {selectedMeta?.label}
              </p>
              <p className="text-sm text-base-content/55">{selectedMeta?.hint}</p>
            </div>
          )}
        </div>
      </div>

      {/* Foot bar */}
      <div className="shrink-0 border-t border-border bg-white px-8 py-4">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Button variant="outline" size="default" className="flex-1" onClick={() => updateSale(sale.id, { step: "vente" })}>
            Retour au panier
          </Button>
          <div className="flex flex-[2] flex-col items-stretch gap-1">
            <Button variant="dark" size="xl" icon={<Check className="size-5" />} disabled={!canConfirm} onClick={handleConfirm}>
              Encaisser
            </Button>
            {disabledReason && (
              <p className="text-center text-xs font-medium text-base-content/55">{disabledReason}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
