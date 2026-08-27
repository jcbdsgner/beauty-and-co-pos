import { Avatar } from "@/components/ui/atoms/avatar";
import { Badge, type BadgeVariant } from "@/components/ui/atoms/badge";
import { Button, type ButtonVariant } from "@/components/ui/atoms/button";
import { Card } from "@/components/ui/atoms/card";
import { cn } from "@/lib/utils";

export type RelanceAction = {
  label: string;
  icon?: React.ReactNode;
  variant?: ButtonVariant;
  onClick: () => void;
};

type RelanceCardProps = {
  initial: string;
  name: string;
  context: string;
  message: string;
  statusLabel?: string;
  statusVariant?: BadgeVariant;
  tierBadge?: { label: string; variant: BadgeVariant };
  actions: RelanceAction[];
  className?: string;
};

/**
 * Client follow-up/reminder card (anniversaire, relance fidélité, rappel rendez-vous) — identity
 * + context on top, the actual outgoing message as a quoted block, a row of equal-weight
 * channel actions (WhatsApp/Email/RDV…) below. `actions` stays open-ended rather than hardcoding
 * channels, since which ones apply varies per reminder type.
 */
export function RelanceCard({ initial, name, context, message, statusLabel, statusVariant = "warning", tierBadge, actions, className }: RelanceCardProps) {
  return (
    <Card className={cn("flex flex-col gap-4 p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar initial={initial} size={44} className="bg-[var(--brand-rose-soft)] font-semibold text-[var(--brand-taupe-muted)]" />
          <div>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-[var(--color-gray-900)]">{name}</span>
              {tierBadge && <Badge variant={tierBadge.variant}>{tierBadge.label}</Badge>}
            </span>
            <p className="text-sm text-[var(--color-gray-500)]">{context}</p>
          </div>
        </div>
        {statusLabel && <Badge variant={statusVariant}>{statusLabel}</Badge>}
      </div>

      <p className="rounded-2xl bg-[var(--color-gray-50)] p-3 text-sm text-[var(--color-gray-700)]">{message}</p>

      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button key={action.label} type="button" variant={action.variant ?? "outline"} icon={action.icon} onClick={action.onClick} className="flex-1">
            {action.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}
