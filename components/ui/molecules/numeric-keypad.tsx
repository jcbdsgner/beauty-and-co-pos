"use client";

import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

type NumericKeypadProps = {
  value: string;
  onChange: (value: string) => void;
  /** Cap digits (default 9 → up to hundreds of millions of FCFA, plenty). */
  maxLength?: number;
  className?: string;
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "back"] as const;

/**
 * On-screen number pad for the cash-received field at checkout — a receptionist keys an amount
 * with a thumb, not a hardware keyboard. Digits only, no decimals (FCFA has no subunit in
 * practice). 64px keys, flat, taupe press feedback.
 */
export function NumericKeypad({ value, onChange, maxLength = 9, className }: NumericKeypadProps) {
  function press(key: (typeof KEYS)[number]) {
    if (key === "C") return onChange("");
    if (key === "back") return onChange(value.slice(0, -1));
    if (value.length >= maxLength) return;
    if (value === "0") return onChange(key); // no leading zeros
    onChange(value + key);
  }

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => press(key)}
          aria-label={key === "back" ? "Effacer un chiffre" : key === "C" ? "Tout effacer" : key}
          className={cn(
            "flex h-16 items-center justify-center rounded-xl border border-border bg-white text-2xl font-semibold text-[var(--color-gray-900)] tabular-nums transition",
            "active:scale-[0.96] active:bg-accent hover:border-secondary/40",
            "outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
            key === "C" && "text-[15px] font-bold text-[var(--color-gray-500)]",
          )}
        >
          {key === "back" ? <Delete aria-hidden className="size-6" /> : key}
        </button>
      ))}
    </div>
  );
}
