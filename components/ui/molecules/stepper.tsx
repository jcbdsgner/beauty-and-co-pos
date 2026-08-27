"use client";

import { RoundStepButton } from "@/components/ui/atoms/round-step-button";

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
        <RoundStepButton
          direction="decrement"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          ariaLabel={`Diminuer le nombre — ${label}`}
        />
        <span className="w-6 text-center text-[17px] font-bold text-[var(--color-gray-800)]">{value}</span>
        <RoundStepButton
          direction="increment"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          ariaLabel={`Augmenter le nombre — ${label}`}
        />
      </div>
    </div>
  );
}
