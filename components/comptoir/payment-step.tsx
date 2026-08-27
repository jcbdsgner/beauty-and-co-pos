"use client";

import { useState } from "react";
import { Banknote, CreditCard, Smartphone, Wallet } from "lucide-react";
import { Card } from "@/components/ui/atoms/card";
import { HeroNumber } from "@/components/ui/atoms/hero-number";
import { Checkbox } from "@/components/ui/atoms/checkbox";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Pills } from "@/components/ui/molecules/pills";
import { Button } from "@/components/ui/atoms/button";
import { Badge } from "@/components/ui/atoms/badge";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { computeTotals, useAppData } from "@/components/providers/app-data-provider";
import { formatFcfa, cn } from "@/lib/utils";
import type { PaymentMode, Sale } from "@/lib/data/types";

const MODES: { value: PaymentMode; label: string; icon: typeof Wallet }[] = [
  { value: "wave", label: "Wave", icon: Smartphone },
  { value: "orange_money", label: "Orange Money", icon: Wallet },
  { value: "especes", label: "Espèces", icon: Banknote },
  { value: "carte", label: "Carte", icon: CreditCard },
];

export function PaymentStep({ sale }: { sale: Sale }) {
  const { confirmPayment, updateSale } = useAppData();
  const { total } = computeTotals(sale);
  const [primaryMode, setPrimaryMode] = useState<PaymentMode | null>(null);
  const [mixed, setMixed] = useState(false);
  const [secondaryMode, setSecondaryMode] = useState<PaymentMode | null>(null);
  const [primaryAmount, setPrimaryAmount] = useState("");
  const [secondaryAmount, setSecondaryAmount] = useState("");
  const [cashReceived, setCashReceived] = useState("");

  const involvesCash = primaryMode === "especes" || secondaryMode === "especes";
  const remaining = mixed ? total - (Number(primaryAmount) || 0) - (Number(secondaryAmount) || 0) : 0;
  const balanced = mixed ? remaining === 0 : true;
  const change = involvesCash && cashReceived ? Math.max(0, Number(cashReceived) - total) : 0;

  const canConfirm = mixed ? primaryMode && secondaryMode && balanced : primaryMode !== null;

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
    <div className="mx-auto flex max-w-md flex-col gap-6 py-8">
      <HeroNumber label="Total à payer" value={formatFcfa(total)} align="center" size="lg" />

      <div>
        <FieldLabel className="mb-2">Mode de paiement</FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = primaryMode === m.value;
            return (
              <Card
                key={m.value}
                role="button"
                tabIndex={0}
                onClick={() => setPrimaryMode(m.value)}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-2 p-5 text-center transition active:scale-[0.97]",
                  active ? "border-[var(--brand-taupe-muted)] bg-[var(--brand-rose-soft)]" : "hover:border-[var(--brand-taupe-muted)]",
                )}
              >
                <Icon aria-hidden className="size-6 text-[var(--brand-taupe-muted)]" />
                <span className="text-sm font-semibold text-[var(--color-gray-900)]">{m.label}</span>
              </Card>
            );
          })}
        </div>
      </div>

      <Checkbox checked={mixed} onChange={setMixed} label="Paiement mixte (2 modes)" />

      {mixed && (
        <div className="flex flex-col gap-3 rounded-2xl bg-[var(--color-gray-50)] p-4">
          <div className="flex items-center gap-2">
            <TextInput type="number" size="compact" placeholder={`Montant ${primaryMode ?? "1er mode"}`} value={primaryAmount} onChange={(e) => setPrimaryAmount(e.target.value)} />
          </div>
          <Pills
            options={MODES.filter((m) => m.value !== primaryMode).map((m) => ({ value: m.value, label: m.label }))}
            value={secondaryMode ?? ""}
            onChange={(v) => setSecondaryMode(v as PaymentMode)}
          />
          <TextInput type="number" size="compact" placeholder="Montant 2e mode" value={secondaryAmount} onChange={(e) => setSecondaryAmount(e.target.value)} />
          <div className="flex items-center justify-between">
            <FieldLabel variant="plain">Écart restant</FieldLabel>
            <Badge variant={balanced ? "success" : "error"}>{balanced ? "Réparti" : `Reste ${formatFcfa(Math.abs(remaining))}`}</Badge>
          </div>
          {!balanced && (
            <Button
              variant="outline"
              onClick={() => {
                setPrimaryAmount("");
                setSecondaryAmount("");
              }}
            >
              Recommencer la répartition
            </Button>
          )}
        </div>
      )}

      {involvesCash && (
        <div>
          <FieldLabel className="mb-1.5" variant="plain">
            Montant reçu en espèces
          </FieldLabel>
          <TextInput type="number" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} placeholder="0" />
          {change > 0 && <p className="mt-1.5 text-sm font-semibold text-[var(--color-success)]">Rendu de monnaie : {formatFcfa(change)}</p>}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => updateSale(sale.id, { step: "vente" })}>
          Retour panier
        </Button>
        <Button variant="brand" className="flex-1" disabled={!canConfirm} onClick={handleConfirm}>
          Confirmer
        </Button>
      </div>
    </div>
  );
}
