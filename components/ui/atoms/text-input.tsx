import { cn } from "@/lib/utils";

type Tone = "cream" | "rose-soft" | "white";
type Size = "field" | "compact";

const TONE_CLASS: Record<Tone, string> = {
  cream: "border border-[var(--color-gray-200)] bg-[var(--brand-cream)]",
  "rose-soft": "border border-transparent bg-[var(--brand-rose-soft)]",
  white: "border border-[var(--color-gray-200)] bg-white",
};

const SIZE_CLASS: Record<Size, string> = {
  field: "rounded-xl px-4 py-3 text-[15px]",
  compact: "rounded-lg px-3 py-2.5 text-sm",
};

type TextInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "size"> & {
  tone?: Tone;
  /** `field` (default, 44px+) for a standalone form control; `compact` for an inline control next
   *  to other elements (e.g. a discount-code row) — still ≥40px, never the cramped 36px a mouse-
   *  first "compact" would use. */
  size?: Size;
  className?: string;
};

/**
 * A focus ring (not just a border-color swap) is the real change here: there's no cursor hovering
 * a field before tapping it on a touch counter, so the moment of focus needs to announce itself
 * more than a 1px color change can.
 */
export function TextInput({ tone = "white", size = "field", className, ...rest }: TextInputProps) {
  return (
    <input
      className={cn(
        "w-full text-[var(--color-gray-900)] transition placeholder:text-[var(--color-gray-400)]",
        "focus:border-[var(--brand-taupe-muted)] focus:ring-4 focus:ring-[var(--brand-taupe-muted)]/15 focus:outline-none",
        TONE_CLASS[tone],
        SIZE_CLASS[size],
        className,
      )}
      {...rest}
    />
  );
}
