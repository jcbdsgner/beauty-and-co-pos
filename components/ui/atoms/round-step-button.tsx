"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type RoundStepButtonProps = {
  direction: "increment" | "decrement";
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
  /** `md` (56px, the counter tap target) for a standalone stepper; `sm` (44px) for a stepper
   *  packed inline next to other controls (e.g. loyalty-points row). */
  size?: "sm" | "md";
  className?: string;
};

const SIZE_CLASS = { sm: "size-11", md: "size-14" };
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
        "flex shrink-0 items-center justify-center rounded-full border-2 border-secondary/40 text-secondary transition active:scale-[0.94]",
        "outline-none focus-visible:ring-4 focus-visible:ring-ring/25",
        "disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:border-secondary enabled:hover:bg-accent",
        SIZE_CLASS[size],
        className,
      )}
    >
      <Icon aria-hidden className={ICON_SIZE[size]} />
    </button>
  );
}
