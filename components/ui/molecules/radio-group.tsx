"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

export type RadioOption = { value: string; label: string; hint?: string };

type RadioGroupProps = {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

/** Vertical single-choice list with a real radio affordance — for a choice that reads better as a list than as Pills (payment method, delivery option). */
export function RadioGroup({ options, value, onChange, className }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root value={value} onValueChange={onChange} className={cn("flex flex-col gap-2", className)}>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition",
            value === option.value
              ? "border-[var(--brand-taupe-muted)] bg-[var(--brand-rose-soft)]"
              : "border-[var(--color-gray-200)] bg-white",
          )}
        >
          <RadioGroupPrimitive.Item
            value={option.value}
            className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-gray-300)] data-[state=checked]:border-[var(--brand-taupe-muted)]"
          >
            <RadioGroupPrimitive.Indicator className="size-2.5 rounded-full bg-[var(--brand-taupe-muted)]" />
          </RadioGroupPrimitive.Item>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-[var(--color-gray-900)]">{option.label}</span>
            {option.hint && <span className="block text-xs text-[var(--color-gray-500)]">{option.hint}</span>}
          </span>
        </label>
      ))}
    </RadioGroupPrimitive.Root>
  );
}
