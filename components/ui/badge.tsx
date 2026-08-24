import { cn } from "@/lib/utils";

/**
 * Colored pill for statuses, tiers and roles. Semantic variants (success/warning/error/info)
 * keep their conventional meaning; "vip"/"gold"/"silver" are the loyalty-tier badges (mapped
 * onto brand tokens — lilac/taupe/gray, no literal gold); "brand"/"dark"/"neutral" are generic
 * accents for role badges (équipe, catégories…) that don't carry semantic meaning.
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

const variants: Record<BadgeVariant, string> = {
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  error: "bg-[#fdece9] text-[var(--color-error)]",
  info: "bg-[var(--color-info-soft)] text-[var(--color-info)]",
  vip: "bg-[var(--pos-tier-vip)] text-[var(--text-secondary)]",
  gold: "bg-[var(--pos-tier-gold)] text-white",
  silver: "bg-[var(--pos-tier-silver)] text-white",
  brand: "bg-[var(--core-brand-color)] text-black",
  dark: "bg-[var(--pos-accent-dark)] text-white",
  neutral: "bg-[var(--color-gray-100)] text-[var(--color-gray-600)]",
};

type BadgeProps = {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function Badge({ variant = "neutral", icon, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        variants[variant],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
