import { cn } from "@/lib/utils";

type Tone = "cream" | "rose-soft" | "white";

const TONE_CLASS: Record<Tone, string> = {
  cream: "border border-border bg-[var(--brand-cream)]",
  "rose-soft": "border border-transparent bg-accent",
  white: "border border-border bg-white",
};

type TextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
  tone?: Tone;
  className?: string;
};

/** Same focus-ring language as TextInput — a multi-line field is exactly the moment a person is
 *  most likely to look away mid-thought, so the "you're typing here" cue has to survive a glance
 *  back rather than a hover they never had. */
export function Textarea({ tone = "white", className, rows = 3, ...rest }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(
        "w-full resize-none rounded-xl px-4 py-3.5 text-[15px] text-[var(--color-gray-900)] transition placeholder:text-[var(--color-gray-400)]",
        "focus:border-ring focus:ring-4 focus:ring-ring/15 focus:outline-none",
        TONE_CLASS[tone],
        className,
      )}
      {...rest}
    />
  );
}
