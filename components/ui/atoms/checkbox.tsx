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
 * Rebuilt so the tap target is real by construction, not a hit-area patch on top of a 20px box:
 * the whole row is always the control (min-h-11, padded, presses with active:bg) whether or not
 * a visible label is passed — an unlabeled checkbox still needs a real aria-label, not a bare
 * 20px square with nothing said about what it checks.
 */
export function Checkbox({ checked, onChange, label, "aria-label": ariaLabel, id, disabled, className }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-xl px-1 text-sm text-[var(--color-gray-700)] transition",
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
          "flex size-6 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--color-gray-300)] bg-white transition",
          "data-[state=checked]:border-[var(--core-brand-color)] data-[state=checked]:bg-[var(--core-brand-color)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-taupe-muted)] focus-visible:ring-offset-2",
        )}
      >
        <CheckboxPrimitive.Indicator>
          <Check aria-hidden className="size-4 text-black" strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label}
    </label>
  );
}
