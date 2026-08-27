"use client";

import { cn } from "@/lib/utils";

export type SegmentOption = {
  value: string;
  label: string;
  icon?: React.ReactNode;
};

type SegmentedToggleProps = {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

/**
 * A true mode switch — two entirely different catalogues (Services vs Produits), not a filter
 * over one list. Deliberately a different shape language from the Pills filter-chip row (used
 * for subcategory filters) and the vente screen's other exclusive-choice controls (sale tabs,
 * category chips): one enclosed track with a solid active segment, not loose pills floating on
 * the page background, so "switch catalogue" never reads as "filter this list."
 */
export function SegmentedToggle({ options, value, onChange, className }: SegmentedToggleProps) {
  return (
    <div className={cn("inline-flex gap-1 rounded-full bg-[var(--color-gray-100)] p-1", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-5 py-3 text-sm font-semibold transition active:scale-[0.97]",
              active
                ? "bg-white text-[var(--color-gray-900)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]"
                : "text-[var(--color-gray-500)] hover:text-[var(--color-gray-700)]",
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
