import { cn } from "@/lib/utils";

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
};

const SIZE_CLASS = { sm: "size-4 border-2", md: "size-6 border-2", lg: "size-9 border-[3px]" };

/** Indeterminate loading indicator — a taupe arc on a soft track, no brand gradient. */
export function Spinner({ size = "md", className, label = "Chargement…" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block animate-spin rounded-full border-[var(--color-gray-200)] border-t-[var(--brand-taupe-muted)]",
        SIZE_CLASS[size],
        className,
      )}
    />
  );
}
