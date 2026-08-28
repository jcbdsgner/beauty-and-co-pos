"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  "aria-label"?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * The whole row is the control (min-h-14, padded, presses with active:bg) whether or not a
 * visible label is passed — no bare 20px square to miss on a touchscreen. An unlabeled checkbox
 * still requires a real aria-label.
 */
export function Checkbox({ checked, onChange, label, "aria-label": ariaLabel, id, disabled, className }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-h-14 items-center gap-3 rounded-xl px-1 text-[15px] text-[var(--color-gray-700)] transition",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer active:bg-[var(--color-gray-50)]",
        className,
      )}
    >
      <CheckboxPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        disabled={disabled}
        aria-label={label ? undefined : ariaLabel}
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--color-gray-300)] bg-white transition",
          "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25",
        )}
      >
        <CheckboxPrimitive.Indicator>
          <Check aria-hidden className="size-4 text-primary-foreground" strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label}
    </label>
  );
}
