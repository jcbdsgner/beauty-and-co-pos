"use client";

import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

type SaleTrayTriggerProps = {
  itemCount: number;
  total: React.ReactNode;
  onClick: () => void;
  className?: string;
};

/**
 * Pinned pill button that opens a collapsed sale tray/cart (ComptoirPanel) — for a layout where
 * the cart isn't permanently docked on screen (e.g. a full-width catalogue view). Stays quiet
 * (outline) while empty, switches to a solid taupe fill the moment there's something to review,
 * so its own state change is the cue that a cart now exists.
 */
export function SaleTrayTrigger({ itemCount, total, onClick, className }: SaleTrayTriggerProps) {
  const hasItems = itemCount > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-3 rounded-full px-5 py-3 text-[15px] font-semibold shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] transition active:scale-[0.97]",
        hasItems
          ? "bg-[var(--pos-accent-dark)] text-white hover:opacity-90"
          : "border border-[var(--color-gray-200)] bg-white text-[var(--color-gray-500)]",
        className,
      )}
    >
      <span className="relative">
        <ShoppingCart aria-hidden className="size-5" />
        {hasItems && (
          <span className="absolute -top-2 -right-2 flex size-4.5 items-center justify-center rounded-full bg-[var(--core-brand-color)] text-[10px] font-bold text-black">
            {itemCount}
          </span>
        )}
      </span>
      {hasItems ? total : "Panier vide"}
    </button>
  );
}
