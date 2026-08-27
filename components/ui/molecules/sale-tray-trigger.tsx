"use client";

import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

type SaleTrayTriggerProps = {
  /** Number of currently open sales (Comptoir tabs) — not a cart item count. */
  itemCount: number;
  total: React.ReactNode;
  onClick: () => void;
  className?: string;
};

/**
 * Header pastille that opens the Comptoir (USERFLOW.md's "calque transversal") — reduced to
 * `"{n} ventes · {total}"` once at least one sale is open, or just "Comptoir" (never "0 vente")
 * while empty. Stays quiet (outline) while empty, switches to a solid taupe fill the moment
 * there's something to review, so its own state change is the cue that a sale now exists.
 */
export function SaleTrayTrigger({ itemCount, total, onClick, className }: SaleTrayTriggerProps) {
  const hasSales = itemCount > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full px-5 py-3 text-[15px] font-semibold shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] transition active:scale-[0.97]",
        hasSales
          ? "bg-[var(--pos-accent-dark)] text-white hover:opacity-90"
          : "border border-[var(--color-gray-200)] bg-white text-[var(--color-gray-500)]",
        className,
      )}
    >
      <ShoppingCart aria-hidden className="size-5" />
      {hasSales ? (
        <span>
          {itemCount} {itemCount > 1 ? "ventes" : "vente"} · {total}
        </span>
      ) : (
        "Comptoir"
      )}
    </button>
  );
}
