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
  /** false → a single non-wrapping row that scrolls horizontally instead of stacking (keeps a
   *  long filter list from widening its container). Default true: the classic wrapping row. */
  wrap?: boolean;
};

/**
 * Filter chips — exclusive-choice over one list (catégories, rôles, statuts). Kept the literal
 * chip shape (it's the correct, non-arbitrary form for "many optional filters in a wrapping
 * row" — the fix here isn't the silhouette, it's that a selected pill now carries its own check
 * mark instead of only a color swap, so it reads unambiguously as "chosen" rather than looking
 * like SegmentedToggle's mode-switch or Tabs' navigation. py-3 = 44px tap height.
 */
export function Pills({ options, value, onChange, className, wrap = true }: PillsProps) {
  return (
    <div
      className={cn(
        "flex gap-2",
        wrap ? "flex-wrap" : "flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              "inline-flex h-14 shrink-0 items-center gap-1.5 rounded-full px-5 text-[15px] font-medium transition active:scale-[0.97] outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
              active
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-white text-[var(--color-gray-600)] hover:bg-[var(--color-gray-50)]",
            )}
          >
            {active ? <Check aria-hidden className="size-3.5 shrink-0" strokeWidth={3} /> : option.icon}
            {option.label}
            {typeof option.count === "number" && (
              <span className={cn("text-xs", active ? "text-primary-foreground/60" : "text-[var(--color-gray-400)]")}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
