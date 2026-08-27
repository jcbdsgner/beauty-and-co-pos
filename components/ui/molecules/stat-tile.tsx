import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/atoms/card";

type StatTileTone = "neutral" | "success" | "warning" | "info" | "error";

const TONE_CLASS: Record<StatTileTone, string> = {
  neutral: "text-[var(--color-gray-900)]",
  success: "text-[var(--color-success)]",
  warning: "text-[var(--color-warning)]",
  info: "text-[var(--color-info)]",
  error: "text-[var(--color-error)]",
};

type StatTileProps = {
  value: React.ReactNode;
  label: string;
  tone?: StatTileTone;
  className?: string;
};

/** A single centered number+label tile, e.g. the 3-up summary row above a stock/history list. */
export function StatTile({ value, label, tone = "neutral", className }: StatTileProps) {
  return (
    <Card className={cn("p-4 text-center", className)}>
      <p className={cn("font-[var(--font-heading)] text-2xl", TONE_CLASS[tone])}>{value}</p>
      <p className="text-xs text-[var(--color-gray-500)]">{label}</p>
    </Card>
  );
}

type StatTileRowProps = {
  children: React.ReactNode;
  className?: string;
};

/** Equal-width grid wrapper for a row of StatTile — defaults to 3 columns, the common case. */
export function StatTileRow({ children, className }: StatTileRowProps) {
  return <div className={cn("grid grid-cols-3 gap-3", className)}>{children}</div>;
}
