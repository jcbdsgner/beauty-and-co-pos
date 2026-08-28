"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

type Tone = "brand" | "success" | "warning" | "error";

const TONE_CLASS: Record<Tone, string> = {
  brand: "bg-primary",
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  error: "bg-destructive",
};

type ProgressBarProps = {
  value: number;
  max?: number;
  tone?: Tone;
  className?: string;
  label?: string;
};

/** Flat-fill determinate progress track — same shape family as StockProgressBar, generalized for reuse (order status, upload, etc). */
export function ProgressBar({ value, max = 100, tone = "brand", className, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <ProgressPrimitive.Root
      value={value}
      max={max}
      aria-label={label}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full rounded-full transition-[width] duration-300 ease-out", TONE_CLASS[tone])}
        style={{ width: `${pct}%` }}
      />
    </ProgressPrimitive.Root>
  );
}
