"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type RoundStepButtonProps = {
  direction: "increment" | "decrement";
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
  /** `md` (44px, the default tap target) for a standalone counter; `sm` (36px) for a counter that sits inline next to other controls. */
  size?: "sm" | "md";
  className?: string;
};

const SIZE_CLASS = { sm: "size-9", md: "size-11" };
const ICON_SIZE = { sm: "size-4", md: "size-5" };

/** The circular +/- button shared by every counter in the app (Stepper, cart line qty, loyalty points). */
export function RoundStepButton({ direction, onClick, disabled, ariaLabel, size = "md", className }: RoundStepButtonProps) {
  const Icon = direction === "increment" ? Plus : Minus;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border-2 border-[var(--brand-taupe-muted)]/40 text-[var(--brand-taupe-muted)] transition active:scale-[0.94]",
        "disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:border-[var(--brand-taupe-muted)] enabled:hover:bg-[var(--brand-rose-soft)]",
        SIZE_CLASS[size],
        className,
      )}
    >
      <Icon aria-hidden className={ICON_SIZE[size]} />
    </button>
  );
}
