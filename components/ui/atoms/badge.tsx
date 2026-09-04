import { cn } from "@/lib/utils";

/**
 * daisyUI `badge` — something you read, not something you tap. Semantic tones render soft
 * (`badge-soft`) with a leading status dot; loyalty tiers render as a solid mini-flag.
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
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
};

const FLAG_TONE: Record<string, string> = {
  vip: "bg-[var(--brand-lilac)] text-base-content/70 border-transparent",
  gold: "bg-primary text-primary-content border-transparent",
  silver: "bg-[var(--pos-tier-silver)] text-white border-transparent",
  brand: "bg-primary text-primary-content border-transparent",
  dark: "bg-neutral text-neutral-content border-transparent",
};

const SOFT_TONE: Record<string, string> = {
  success: "badge-success badge-soft",
  warning: "badge-warning badge-soft",
  error: "badge-error badge-soft",
  info: "badge-info badge-soft",
  neutral: "badge-ghost",
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
        "badge gap-1.5 font-semibold whitespace-nowrap",
        isFlag ? FLAG_TONE[variant] : (SOFT_TONE[variant] ?? SOFT_TONE.neutral),
        className,
      )}
    >
      {icon ?? (DOT_TONE[variant] && <span className={cn("size-1.5 shrink-0 rounded-full", DOT_TONE[variant])} />)}
      {children}
    </span>
  );
}
