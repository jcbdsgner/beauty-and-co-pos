import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertTone = "success" | "warning" | "error" | "info";

const TONE: Record<AlertTone, { bg: string; fg: string; bar: string; Icon: typeof Info }> = {
  success: { bg: "bg-[var(--color-success-soft)]", fg: "text-[var(--color-success)]", bar: "bg-[var(--color-success)]", Icon: CheckCircle2 },
  warning: { bg: "bg-[var(--color-warning-soft)]", fg: "text-[var(--color-warning)]", bar: "bg-[var(--color-warning)]", Icon: AlertTriangle },
  error: { bg: "bg-[var(--color-error-soft)]", fg: "text-[var(--color-error)]", bar: "bg-[var(--color-error)]", Icon: XCircle },
  info: { bg: "bg-[var(--color-info-soft)]", fg: "text-[var(--color-info)]", bar: "bg-[var(--color-info)]", Icon: Info },
};

type AlertProps = {
  tone: AlertTone;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

/**
 * Rebuilt as a flag, not a card: a solid color spine on the left edge instead of a border all
 * around, so a persistent banner ("11 produits en stock bas") never gets mistaken for a passive
 * Card or a Dialog at a glance — the accent bar is the one visual cue this component owns alone.
 */
export function Alert({ tone, title, description, action, className }: AlertProps) {
  const { bg, fg, bar, Icon } = TONE[tone];
  return (
    <div className={cn("flex items-start gap-3 overflow-hidden rounded-xl", bg, className)}>
      <span className={cn("w-1 self-stretch shrink-0", bar)} />
      <Icon aria-hidden className={cn("mt-3 size-5 shrink-0", fg)} />
      <div className="min-w-0 flex-1 py-3">
        <p className={cn("text-sm font-semibold", fg)}>{title}</p>
        {description && <p className="mt-0.5 text-sm text-[var(--color-gray-600)]">{description}</p>}
      </div>
      {action && <div className="py-2 pr-3">{action}</div>}
    </div>
  );
}
