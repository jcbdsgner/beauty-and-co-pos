import { cn } from "@/lib/utils";

type HeroNumberProps = {
  label: string;
  value: string;
  hint?: string;
  align?: "left" | "center";
  size?: "md" | "lg";
  className?: string;
};

/** Big stat figure — the recurring "hero number" pattern (panier total, paiement à payer, stats profil client, revenus). */
export function HeroNumber({ label, value, hint, align = "left", size = "md", className }: HeroNumberProps) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      {label && <p className="text-xs font-semibold tracking-wide text-base-content/55 uppercase">{label}</p>}
      <p
        className={cn(
          "font-[family-name:var(--font-heading)] font-semibold leading-none text-base-content tabular-nums",
          size === "lg" ? "text-5xl" : "text-3xl",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-sm text-base-content/55">{hint}</p>}
    </div>
  );
}
