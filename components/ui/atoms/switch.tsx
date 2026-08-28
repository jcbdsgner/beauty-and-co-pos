"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Radix Switch under the hood, but the pressable area is a 56px square (the counter tap target),
 * with the visual track (h-7/w-12) centered inside it — the pill looks the same size relationship
 * as a mouse-first switch while the tappable area never shrinks to it. Taupe = on (emphasis hue).
 */
export function Switch({ checked, onChange, label, disabled, className }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "group relative flex size-14 shrink-0 items-center justify-center transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 outline-none",
        className,
      )}
    >
      <span
        className={cn(
          "relative h-7 w-12 rounded-full transition-colors",
          "bg-[var(--color-gray-300)] group-data-[state=checked]:bg-secondary",
          "group-focus-visible:ring-4 group-focus-visible:ring-ring/25",
        )}
      >
        <SwitchPrimitive.Thumb className="absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-5" />
      </span>
    </SwitchPrimitive.Root>
  );
}
