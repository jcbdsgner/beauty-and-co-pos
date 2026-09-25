"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Dialog } from "@/components/ui/molecules/dialog";
import { NumericKeypad } from "@/components/ui/molecules/numeric-keypad";
import { cn, formatFcfa } from "@/lib/utils";

const TIP_PRESETS = [2000, 4000, 5000, 10000, 12000, 15000, 20000, 25000, 30000] as const;

/** Preset label as the counter says it: « 2k », « 12k ». */
function presetLabel(amount: number) {
  return `${amount / 1000}k`;
}

/**
 * « Un pourboire ? » — opened by the panier's « Encaisser », before any payment method is chosen
 * (ADR 0034). Always optional: « Sans pourboire » goes on to the Règlement as is. A preset or a
 * free amount (« Autre », on the keypad); the Règlement then adds it to what is collected. The tip
 * rides on top of the sale: not in `payment.modes`, no points, not in the chiffre d'affaires.
 * « × » stays on the panier.
 */
export function TipDialog({
  open,
  amountDue,
  initialAmount,
  onCancel,
  onDone,
}: {
  open: boolean;
  amountDue: number;
  /** The tip already picked for this sale — back from the Règlement, it's shown selected. */
  initialAmount?: number;
  onCancel: () => void;
  onDone: (tip: number | null) => void;
}) {
  const isPreset = (TIP_PRESETS as readonly number[]).includes(initialAmount ?? 0);
  const [preset, setPreset] = useState<number | "autre" | null>(!initialAmount ? null : isPreset ? initialAmount : "autre");
  const [custom, setCustom] = useState(initialAmount && !isPreset ? String(initialAmount) : "");

  const amount = preset === "autre" ? Number(custom) || 0 : (preset ?? 0);

  function pick(value: number | "autre") {
    setPreset((current) => (current === value ? null : value));
  }

  return (
    <Dialog open={open} labelledBy="tip-title" className="relative flex max-h-[calc(100vh-2rem)] max-w-[760px] flex-col overflow-hidden p-0">
      <CloseButton onClick={onCancel} className="top-4 right-4" aria-label="Rester sur le panier" />

      <div className="min-h-0 flex-1 overflow-y-auto px-9 pt-8 pb-7">
        <h2 id="tip-title" className="font-[family-name:var(--font-heading)] text-[28px] font-bold leading-tight text-base-content">
          Un pourboire ?
        </h2>
        <p className="mt-1 text-[15px] text-base-content/55">
          Facultatif — en plus des {formatFcfa(amountDue)} de la vente.
        </p>

        <div className="mt-6 grid grid-cols-5 gap-3">
          {TIP_PRESETS.map((value) => (
            <TipTile key={value} selected={preset === value} onClick={() => pick(value)}>
              {presetLabel(value)}
            </TipTile>
          ))}
          <TipTile selected={preset === "autre"} onClick={() => pick("autre")}>
            Autre
          </TipTile>
        </div>

        {preset === "autre" && (
          <div className="mt-5 grid grid-cols-2 items-start gap-6 animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold tracking-[0.12em] text-base-content/55 uppercase">Montant libre</p>
              <p className="font-[family-name:var(--font-heading)] text-[2.5rem] leading-tight font-semibold text-base-content tabular-nums underline decoration-primary decoration-2 underline-offset-8">
                {custom === "" ? "— F" : formatFcfa(Number(custom))}
              </p>
              {amount > 0 && (
                <p className="mt-3 text-[15px] text-base-content/70 tabular-nums">
                  Total réglé <span className="font-semibold text-base-content">{formatFcfa(amountDue + amount)}</span>
                </p>
              )}
            </div>
            <NumericKeypad value={custom} onChange={setCustom} maxLength={7} />
          </div>
        )}

      </div>

      <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-base-300 px-9 py-5">
        <Button variant="outline" size="xl" onClick={() => onDone(null)}>
          Sans pourboire
        </Button>
        <Button
          variant="brand"
          size="xl"
          className="min-w-56"
          icon={amount > 0 ? <Check className="size-5" /> : undefined}
          disabled={amount <= 0}
          onClick={() => onDone(amount)}
        >
          {amount > 0 ? `Ajouter ${formatFcfa(amount)}` : "Choisissez un montant"}
        </Button>
      </footer>
    </Dialog>
  );
}

function TipTile({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "relative flex h-16 items-center justify-center rounded-2xl border-2 font-[family-name:var(--font-heading)] text-2xl font-semibold text-base-content tabular-nums transition active:scale-[0.97]",
        "outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
        selected ? "border-primary bg-accent" : "border-border bg-white hover:border-primary/40",
      )}
    >
      {selected && <span className="absolute top-2.5 right-2.5 size-3 rounded-full bg-primary" aria-hidden />}
      {children}
    </button>
  );
}
