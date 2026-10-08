"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Dialog } from "@/components/ui/molecules/dialog";
import { PAYMENT_MODES, PaymentModeGlyph } from "@/components/comptoir/payment-modes";
import { useAppData } from "@/components/providers/app-data-provider";
import { cn, formatFcfa } from "@/lib/utils";
import type { Facture, PaymentMode } from "@/lib/data/types";

/**
 * La cliente règle sa facture au salon (ADR 0042) — un seul moyen, toute la somme : les mêmes
 * tuiles que le Règlement du Comptoir, sans parts ni pourboire.
 */
export function RecordPaymentDialog({ facture, onClose }: { facture: Facture; onClose: () => void }) {
  const { recordFacturePayment } = useAppData();
  const [mode, setMode] = useState<PaymentMode | null>(null);
  return (
    <Dialog open labelledBy="pay-title" className="relative flex max-w-[560px] flex-col gap-5 p-7">
      <CloseButton onClick={onClose} className="top-4 right-4" />
      <div>
        <h2 id="pay-title" className="text-[22px] font-semibold">Enregistrer le paiement</h2>
        <p className="mt-1 text-base-content/60">
          {facture.number} · <span className="font-semibold tabular-nums text-base-content">{formatFcfa(facture.total)}</span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {PAYMENT_MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            aria-pressed={mode === m.value}
            aria-label={m.label}
            onClick={() => setMode(m.value)}
            className={cn(
              "flex h-24 flex-col items-center justify-center gap-2 rounded-box border-2 bg-white transition active:scale-[0.98]",
              mode === m.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/40",
            )}
          >
            <PaymentModeGlyph mode={m.value} className="h-8" />
            {!m.logo && <span className="font-semibold">{m.label}</span>}
          </button>
        ))}
      </div>
      {mode && <p className="text-sm text-base-content/60">{PAYMENT_MODES.find((m) => m.value === mode)!.hint}</p>}
      <Button
        size="xl"
        disabled={!mode}
        onClick={() => {
          recordFacturePayment(facture.id, mode!, "salon");
          onClose();
        }}
      >
        Facture payée
      </Button>
    </Dialog>
  );
}

/**
 * Annuler une facture à payer — elle ne se supprime jamais : un avoir l'annule, avec le code
 * manager et un motif (ADR 0042).
 */
export function CancelFactureDialog({ facture, onClose }: { facture: Facture; onClose: () => void }) {
  const { cancelFacture } = useAppData();
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  const ok = reason.trim().length > 0 && /^\d{4,6}$/.test(code);
  return (
    <Dialog open labelledBy="avoir-title" className="relative flex max-w-[520px] flex-col gap-5 p-7">
      <CloseButton onClick={onClose} className="top-4 right-4" />
      <div>
        <h2 id="avoir-title" className="text-[22px] font-semibold">Annuler la facture</h2>
        <p className="mt-1 text-base-content/60">
          {facture.number} sera annulée par un avoir. Elle reste visible, barrée.
        </p>
      </div>
      <TextInput placeholder="Motif" aria-label="Motif de l'annulation" value={reason} onChange={(e) => setReason(e.target.value)} />
      <div className="flex items-center gap-3 rounded-field bg-accent p-2.5 pl-3">
        <ShieldCheck aria-hidden className="size-4 shrink-0 text-secondary" />
        <span className="flex-1 text-sm font-medium text-secondary">Code manager</span>
        <TextInput
          size="compact"
          inputMode="numeric"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="4 à 6 chiffres"
          aria-label="Code manager"
          className="w-40 tabular-nums tracking-[0.25em]"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={onClose}>Garder la facture</Button>
        <Button
          variant="danger"
          disabled={!ok}
          onClick={() => {
            cancelFacture(facture.id, reason.trim(), code);
            onClose();
          }}
        >
          Émettre l&apos;avoir
        </Button>
      </div>
    </Dialog>
  );
}
