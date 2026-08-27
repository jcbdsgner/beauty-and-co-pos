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
  compact: "rounded-lg px-3 py-2 text-sm",
};

type TextInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "size"> & {
  /** Surface it sits on — matches the recipe already used by that surface's other inputs. */
  tone?: Tone;
  /** `field` (default) for a standalone form control; `compact` for an inline control next to other elements (e.g. a discount-code row). */
  size?: Size;
  className?: string;
};

/** Shared text-input recipe — the one styling every text field in the app draws from. */
export function TextInput({ tone = "white", size = "field", className, ...rest }: TextInputProps) {
  return (
    <input
      className={cn(
        "w-full text-[var(--color-gray-900)] placeholder:text-[var(--color-gray-400)] focus:border-[var(--brand-taupe-muted)] focus:outline-none",
        TONE_CLASS[tone],
        SIZE_CLASS[size],
        className,
      )}
      {...rest}
    />
  );
}
