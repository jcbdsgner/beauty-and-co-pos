import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
};

/**
 * Pill toggle with a sliding knob — the app's one switch control (was previously duplicated ad hoc).
 * The button itself is a 44px square hit target (touch minimum); the visible w-11×h-6 track is
 * centered inside it, so the on-screen pill looks identical while the tappable area no longer
 * shrinks to the track's 24px height.
 */
export function Switch({ checked, onChange, label, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative flex size-11 shrink-0 items-center justify-center transition active:scale-95", className)}
    >
      <span
        className={cn(
          "relative h-6 w-11 rounded-full transition",
          checked ? "bg-[var(--brand-taupe-muted)]" : "bg-[var(--color-gray-300)]",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition",
            checked && "translate-x-5",
          )}
        />
      </span>
    </button>
  );
}
