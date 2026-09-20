import { cn } from "@/lib/utils";

type FieldLabelVariant = "eyebrow" | "plain";

const VARIANT_CLASS: Record<FieldLabelVariant, string> = {
  // Uppercase tracked eyebrow — a form-section heading (e.g. "Identité", "Points fidélité").
  eyebrow: "text-xs font-semibold tracking-wide text-base-content/55 uppercase",
  // Plain sentence-case label sitting directly above its control (e.g. "Client *", "Service *").
  plain: "block text-sm font-medium text-base-content/70",
};

type FieldLabelProps = {
  children: React.ReactNode;
  variant?: FieldLabelVariant;
  className?: string;
  /** `plain` only — links the label to its control's `id` so focus is announced to screen readers. */
  htmlFor?: string;
};

/** Shared label text — `eyebrow` for a section heading (renders as `<p>`), `plain` for a single field's label line (renders as `<label>`). */
export function FieldLabel({ children, variant = "eyebrow", className, htmlFor }: FieldLabelProps) {
  const classes = cn(VARIANT_CLASS[variant], className);
  return variant === "plain" ? (
    <label htmlFor={htmlFor} className={classes}>
      {children}
    </label>
  ) : (
    <p className={classes}>{children}</p>
  );
}
