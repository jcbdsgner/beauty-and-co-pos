import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type PillOption = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
};

type PillsProps = {
  options: PillOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

/**
 * Filter chips — exclusive-choice over one list (catégories, rôles, statuts). Kept the literal
 * chip shape (it's the correct, non-arbitrary form for "many optional filters in a wrapping
 * row" — the fix here isn't the silhouette, it's that a selected pill now carries its own check
 * mark instead of only a color swap, so it reads unambiguously as "chosen" rather than looking
 * like SegmentedToggle's mode-switch or Tabs' navigation. py-3 = 44px tap height.
 */
export function Pills({ options, value, onChange, className }: PillsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-medium transition active:scale-[0.97]",
              active
                ? "bg-[var(--core-brand-color)] text-black"
                : "border border-[var(--color-gray-200)] bg-white text-[var(--color-gray-600)] hover:bg-[var(--color-gray-50)]",
            )}
          >
            {active ? <Check aria-hidden className="size-3.5 shrink-0" strokeWidth={3} /> : option.icon}
            {option.label}
            {typeof option.count === "number" && (
              <span className={cn("text-xs", active ? "text-black/60" : "text-[var(--color-gray-400)]")}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
