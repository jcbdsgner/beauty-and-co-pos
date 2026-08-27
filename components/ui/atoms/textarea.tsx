import { cn } from "@/lib/utils";

type Tone = "cream" | "rose-soft" | "white";

const TONE_CLASS: Record<Tone, string> = {
  cream: "border border-[var(--color-gray-200)] bg-[var(--brand-cream)]",
  "rose-soft": "border border-transparent bg-[var(--brand-rose-soft)]",
  white: "border border-[var(--color-gray-200)] bg-white",
};

type TextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
  tone?: Tone;
  className?: string;
};

/** Multi-line counterpart to TextInput — same tone recipes, fixed rounded-xl/field sizing (textareas don't need a compact size). */
export function Textarea({ tone = "white", className, rows = 3, ...rest }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(
        "w-full resize-none rounded-xl px-4 py-3 text-[15px] text-[var(--color-gray-900)] placeholder:text-[var(--color-gray-400)] focus:border-[var(--brand-taupe-muted)] focus:outline-none",
        TONE_CLASS[tone],
        className,
      )}
      {...rest}
    />
  );
}
