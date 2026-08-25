"use client";

import { cn } from "@/lib/utils";

export type ChipOption = { value: string; label: string };

type ChipSelectProps = {
  options: ChipOption[];
  selected: string[];
  onToggle: (value: string) => void;
  className?: string;
};

/**
 * Multi-select chip grid — several chips can be active at once (targeted skin/hair types in the
 * "Nouveau conseil beauté" form, both optional and non-exclusive). Distinct from `Pills`, which
 * is an exclusive single-choice control (tabs/filters, and the form's single "famille de soin"
 * field): here toggling one chip never clears the others.
 */
export function ChipSelect({ options, selected, onToggle, className }: ChipSelectProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(option.value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
              active
                ? "bg-[var(--core-brand-color)] text-black"
                : "border border-[var(--color-gray-200)] bg-white text-[var(--color-gray-600)] hover:bg-[var(--color-gray-50)]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
