import { cn } from "@/lib/utils";

type BrandMarkProps = {
  /** `line` = hairline outline (watermark use), `fill` = solid rose (accent/celebration use). */
  variant?: "line" | "fill";
  className?: string;
};

/**
 * The Beauty and Co diamond glyph (DESIGN.md's "one recurring signature motif") — a soft rounded
 * lozenge. Used once per screen at most: a faint oversized watermark behind the ticket header,
 * and solid rose as the receipt's completion mark.
 */
export function BrandMark({ variant = "line", className }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={cn("shrink-0", className)}>
      <path
        d="M50 4 C54 4 57 6 60 10 L90 40 C94 44 96 47 96 50 C96 53 94 56 90 60 L60 90 C57 94 54 96 50 96 C46 96 43 94 40 90 L10 60 C6 56 4 53 4 50 C4 47 6 44 10 40 L40 10 C43 6 46 4 50 4 Z"
        fill={variant === "fill" ? "var(--core-brand-color)" : "none"}
        stroke={variant === "line" ? "currentColor" : "none"}
        strokeWidth={variant === "line" ? 3 : 0}
      />
    </svg>
  );
}
