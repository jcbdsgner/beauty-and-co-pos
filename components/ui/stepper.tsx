"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type StepperProps = {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

/** Shared +/- counter, e.g. adult/child count (AttendeesDialog) or cycles to prepay (AbonnementDetailsDialog). */
export function Stepper({ label, hint, value, min, max, onChange }: StepperProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="text-[17px] font-bold text-[var(--color-gray-800)]">{label}</p>
        {hint && <p className="text-[15px] text-[var(--color-gray-500)]">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Diminuer le nombre — ${label}`}
          className={cn(
            "flex size-11 items-center justify-center rounded-full border-2 border-[var(--brand-taupe-muted)]/40 text-[var(--brand-taupe-muted)] transition active:scale-[0.94]",
            "disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:border-[var(--brand-taupe-muted)] enabled:hover:bg-[var(--brand-rose-soft)]",
          )}
        >
          <Minus aria-hidden className="size-5" />
        </button>
        <span className="w-6 text-center text-[17px] font-bold text-[var(--color-gray-800)]">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Augmenter le nombre — ${label}`}
          className={cn(
            "flex size-11 items-center justify-center rounded-full border-2 border-[var(--brand-taupe-muted)]/40 text-[var(--brand-taupe-muted)] transition active:scale-[0.94]",
            "disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:border-[var(--brand-taupe-muted)] enabled:hover:bg-[var(--brand-rose-soft)]",
          )}
        >
          <Plus aria-hidden className="size-5" />
        </button>
      </div>
    </div>
  );
}
