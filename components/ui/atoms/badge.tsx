import { cn } from "@/lib/utils";

/**
 * Rebuilt distinct from Pills/SegmentedToggle/Tabs: those are things you tap, a Badge is
 * something you read. Same rounded-full chip shape for both was reading as one interactive
 * family — a Badge is now a small rounded-md tag with a leading status dot (semantic tones) or
 * a solid mini-flag (loyalty tiers), never a pill, never tappable.
 */
export type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "vip"
  | "gold"
  | "silver"
  | "brand"
  | "dark"
  | "neutral";

const DOT_TONE: Record<string, string> = {
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  error: "bg-[var(--color-error)]",
  info: "bg-[var(--color-info)]",
};

const FLAG_TONE: Record<string, string> = {
  vip: "bg-[var(--pos-tier-vip)] text-[var(--text-secondary)]",
  gold: "bg-[var(--pos-tier-gold)] text-white",
  silver: "bg-[var(--pos-tier-silver)] text-white",
  brand: "bg-[var(--core-brand-color)] text-black",
  dark: "bg-[var(--pos-accent-dark)] text-white",
};

const SOFT_TONE: Record<string, string> = {
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  error: "bg-[var(--color-error-soft)] text-[var(--color-error)]",
  info: "bg-[var(--color-info-soft)] text-[var(--color-info)]",
  neutral: "bg-[var(--color-gray-100)] text-[var(--color-gray-600)]",
};

type BadgeProps = {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function Badge({ variant = "neutral", icon, className, children }: BadgeProps) {
  const isFlag = variant in FLAG_TONE;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold whitespace-nowrap",
        isFlag ? FLAG_TONE[variant] : (SOFT_TONE[variant] ?? SOFT_TONE.neutral),
        className,
      )}
    >
      {icon ?? (DOT_TONE[variant] && <span className={cn("size-1.5 shrink-0 rounded-full", DOT_TONE[variant])} />)}
      {children}
    </span>
  );
}
