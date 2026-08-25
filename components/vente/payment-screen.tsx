"use client";

import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HeroNumber } from "@/components/ui/hero-number";
import { CheckIcon } from "@/components/ui/icons";
import { Pills } from "@/components/ui/pills";
import { PersonSilhouetteIcon, WaveGlyphIcon, OrangeMoneyGlyphIcon, CashGlyphIcon, CardGlyphIcon } from "@/components/vente/icons";
import {
  PAYMENT_METHODS,
  computeTotals,
  formatFcfa,
  type PaymentMethodId,
  type Sale,
} from "@/lib/data/vente";

const METHOD_ICONS: Record<PaymentMethodId, (props: { className?: string }) => React.ReactElement> = {
  wave: WaveGlyphIcon,
  orange_money: OrangeMoneyGlyphIcon,
  especes: CashGlyphIcon,
  carte: CardGlyphIcon,
};

type PaymentScreenProps = {
  sale: Sale;
  onBack: () => void;
  onSelectMethod: (method: PaymentMethodId) => void;
  onToggleMixed: (checked: boolean) => void;
  onSelectMethod2: (method: PaymentMethodId) => void;
  onAmountChange: (which: 1 | 2, value: string) => void;
  onConfirm: () => void;
};

/** Full-width "Paiement" screen — mode selection (single or mixed 2-way split) with live validation. */
export function PaymentScreen({ sale, onBack, onSelectMethod, onToggleMixed, onSelectMethod2, onAmountChange, onConfirm }: PaymentScreenProps) {
  const totals = computeTotals(sale);
  const amount1 = Number(sale.mixedAmount1) || 0;
  const amount2 = Number(sale.mixedAmount2) || 0;
  const mixedSum = amount1 + amount2;
  const mixedValid =
    sale.mixedMethod2 !== null &&
    sale.mixedMethod2 !== sale.paymentMethod &&
    amount1 > 0 &&
    amount2 > 0 &&
    mixedSum === totals.total;
  const valid = sale.mixedPayment ? mixedValid : sale.paymentMethod !== null;
  const method1Label = sale.paymentMethod ? PAYMENT_METHODS.find((method) => method.id === sale.paymentMethod)?.label : null;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Retour"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--color-gray-500)] hover:bg-[var(--color-gray-100)]"
        >
          <ChevronLeft aria-hidden className="size-5" />
        </button>
        <h1 className="flex-1 text-center font-[var(--font-heading)] text-2xl text-[var(--color-gray-900)]">Paiement</h1>
        <span className="size-8" />
      </div>

      <div className="rounded-2xl border border-[var(--color-gray-200)] bg-white p-6">
        <HeroNumber label="Total à payer" value={formatFcfa(totals.total)} align="center" size="lg" />
      </div>

      {sale.client && (
        <div className="flex items-center gap-2 text-sm text-[var(--color-gray-700)]">
          <PersonSilhouetteIcon className="text-[var(--brand-taupe-muted)]" />
          {sale.client.name}
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-[var(--color-gray-700)]">Mode de paiement</h2>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_METHODS.map((method) => {
            const Icon = METHOD_ICONS[method.id];
            const active = sale.paymentMethod === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => onSelectMethod(method.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border-2 bg-white p-5 transition",
                  active
                    ? "border-[var(--brand-taupe-muted)] text-[var(--brand-taupe-muted)]"
                    : "border-[var(--color-gray-200)] text-[var(--color-gray-700)] hover:border-[var(--color-gray-300)]",
                )}
              >
                <Icon className="size-7" />
                <span className="text-sm font-semibold">{method.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-[var(--color-gray-700)]">
          <input
            type="checkbox"
            checked={sale.mixedPayment}
            disabled={sale.paymentMethod === null}
            onChange={(event) => onToggleMixed(event.target.checked)}
            className="size-4 accent-[var(--brand-taupe-muted)]"
          />
          Paiement mixte (2 méthodes)
        </label>
        {sale.paymentMethod === null && (
          <p className="mt-1 text-xs text-[var(--color-gray-500)]">
            Choisissez d&apos;abord un mode de paiement ci-dessus pour activer le partage.
          </p>
        )}
      </div>

      {sale.mixedPayment && (
        <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-gray-200)] bg-white p-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--color-gray-500)] uppercase">{method1Label}</label>
            <input
              type="number"
              placeholder="Montant"
              value={sale.mixedAmount1}
              onChange={(event) => onAmountChange(1, event.target.value)}
              className="w-full rounded-lg border border-[var(--color-gray-200)] px-3 py-2 text-sm focus:border-[var(--brand-taupe-muted)] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--color-gray-500)] uppercase">2e mode de paiement</label>
            <Pills
              options={PAYMENT_METHODS.filter((method) => method.id !== sale.paymentMethod).map((method) => ({
                value: method.id,
                label: method.label,
              }))}
              value={sale.mixedMethod2 ?? ""}
              onChange={(value) => onSelectMethod2(value as PaymentMethodId)}
            />
            <input
              type="number"
              placeholder="Montant"
              value={sale.mixedAmount2}
              onChange={(event) => onAmountChange(2, event.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--color-gray-200)] px-3 py-2 text-sm focus:border-[var(--brand-taupe-muted)] focus:outline-none"
            />
          </div>

          <p
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              mixedValid ? "text-[var(--color-success)]" : "text-[var(--color-gray-500)]",
            )}
          >
            Total : {formatFcfa(mixedSum)} / {formatFcfa(totals.total)}
            {mixedValid && <CheckIcon className="size-4" />}
          </p>
        </div>
      )}

      <Button variant="brand" className="w-full" disabled={!valid} onClick={onConfirm}>
        Confirmer {formatFcfa(totals.total)}
      </Button>
    </div>
  );
}
