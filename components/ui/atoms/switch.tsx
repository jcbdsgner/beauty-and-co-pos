import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
};

/**
 * Rebuilt so the button IS a 44px square hit target, not the 24px-tall track pretending to be
 * one — the track (now h-7/w-12, a touch more confident than the old h-6/w-11) sits centered
 * inside it, so the on-screen pill looks the same size relationship as before while the tappable
 * area no longer shrinks to it.
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
          "relative h-7 w-12 rounded-full transition-colors",
          checked ? "bg-[var(--brand-taupe-muted)]" : "bg-[var(--color-gray-300)]",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5",
          )}
        />
      </span>
    </button>
  );
}
