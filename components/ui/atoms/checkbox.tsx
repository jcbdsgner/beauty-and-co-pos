"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
};

/** Square check control — rose fill when checked, matching Switch's on-state color so the two read as one "toggle family". */
export function Checkbox({ checked, onChange, label, id, disabled, className }: CheckboxProps) {
  const box = (
    <CheckboxPrimitive.Root
      id={id}
      checked={checked}
      onCheckedChange={(value) => onChange(value === true)}
      disabled={disabled}
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-md border-2 border-[var(--color-gray-300)] bg-white transition",
        "data-[state=checked]:border-[var(--core-brand-color)] data-[state=checked]:bg-[var(--core-brand-color)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-taupe-muted)] focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
    >
      <CheckboxPrimitive.Indicator>
        <Check aria-hidden className="size-3.5 text-black" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  // Visual box stays 20px (a 44px checkbox would look wrong), but the tap target must not shrink
  // to it on a touch-only desktop: an invisible size-11 hit area (negative margin so it doesn't
  // push surrounding layout) carries the actual button, same trick used when there's no label.
  if (!label) return <span className="-m-3 inline-flex size-11 items-center justify-center">{box}</span>;

  return (
    <label
      htmlFor={id}
      className={cn("flex min-h-11 items-center gap-2.5 text-sm text-[var(--color-gray-700)]", disabled && "opacity-40")}
    >
      {box}
      {label}
    </label>
  );
}
