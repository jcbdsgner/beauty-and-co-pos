import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertTone = "success" | "warning" | "error" | "info";

const TONE: Record<AlertTone, { bg: string; fg: string; Icon: typeof Info }> = {
  success: { bg: "bg-[var(--color-success-soft)]", fg: "text-[var(--color-success)]", Icon: CheckCircle2 },
  warning: { bg: "bg-[var(--color-warning-soft)]", fg: "text-[var(--color-warning)]", Icon: AlertTriangle },
  error: { bg: "bg-[var(--color-error-soft)]", fg: "text-[var(--color-error)]", Icon: XCircle },
  info: { bg: "bg-[var(--color-info-soft)]", fg: "text-[var(--color-info)]", Icon: Info },
};

type AlertProps = {
  tone: AlertTone;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

/** Inline persistent banner (not a toast — stays until dismissed or the condition clears), e.g. "11 produits en stock bas". */
export function Alert({ tone, title, description, action, className }: AlertProps) {
  const { bg, fg, Icon } = TONE[tone];
  return (
    <div className={cn("flex items-start gap-3 rounded-2xl px-4 py-3", bg, className)}>
      <Icon aria-hidden className={cn("mt-0.5 size-5 shrink-0", fg)} />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-semibold", fg)}>{title}</p>
        {description && <p className="mt-0.5 text-sm text-[var(--color-gray-600)]">{description}</p>}
      </div>
      {action}
    </div>
  );
}
