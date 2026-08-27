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
  icon?: React.ReactNode;
  tone?: StatTileTone;
  className?: string;
};

/** Label now leads (small, uppercase) with an optional icon beside it, number sits below —
 *  matching how the eye actually reads a stat ("what is this, then what's the number") instead
 *  of a bare number on top forcing a re-read of the label underneath to make sense of it. */
export function StatTile({ value, label, icon, tone = "neutral", className }: StatTileProps) {
  return (
    <Card className={cn("p-4", className)}>
      <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
        {icon}
        {label}
      </p>
      <p className={cn("mt-1 font-[var(--font-heading)] text-2xl", TONE_CLASS[tone])}>{value}</p>
    </Card>
  );
}

type StatTileRowProps = {
  children: React.ReactNode;
  className?: string;
};

export function StatTileRow({ children, className }: StatTileRowProps) {
  return <div className={cn("grid grid-cols-3 gap-3", className)}>{children}</div>;
}
