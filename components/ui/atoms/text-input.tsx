import { cn } from "@/lib/utils";

type Tone = "cream" | "rose-soft" | "white";
type Size = "field" | "compact";

const TONE_CLASS: Record<Tone, string> = {
  cream: "border border-border bg-[var(--brand-cream)]",
  "rose-soft": "border border-transparent bg-accent",
  white: "border border-border bg-white",
};

const SIZE_CLASS: Record<Size, string> = {
  field: "h-14 rounded-xl px-4 text-[15px]",
  compact: "h-11 rounded-lg px-3 text-sm",
};

type TextInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "size"> & {
  tone?: Tone;
  /** `field` (default, 56px) for a standalone form control; `compact` (44px) for an inline
   *  control packed next to other elements (e.g. a discount-code row). */
  size?: Size;
  className?: string;
};

/**
 * A focus ring (not just a border-color swap) is deliberate: there's no cursor hovering a field
 * before a tap on a touch counter, so the moment of focus has to announce itself more than a 1px
 * color change can. Border shifts to taupe, ring is a soft taupe wash — never a bright glow.
 */
export function TextInput({ tone = "white", size = "field", className, ...rest }: TextInputProps) {
  return (
    <input
      className={cn(
        "w-full text-[var(--color-gray-900)] transition placeholder:text-[var(--color-gray-400)]",
        "focus:border-ring focus:ring-4 focus:ring-ring/15 focus:outline-none",
        TONE_CLASS[tone],
        SIZE_CLASS[size],
        className,
      )}
      {...rest}
    />
  );
}
