import { Avatar } from "@/components/ui/atoms/avatar";
import { Badge, type BadgeVariant } from "@/components/ui/atoms/badge";
import { Button, type ButtonVariant } from "@/components/ui/atoms/button";
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
 * A follow-up card — cliente identity + why they're on the list, the outgoing message quoted, and
 * a row of equal-weight channel actions below. The quote block is the visual centre of gravity:
 * it's what the receptionist is about to send.
 */
export function RelanceCard({ initial, name, context, message, statusLabel, statusVariant = "warning", tierBadge, actions, className }: RelanceCardProps) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-2xl border border-border bg-white p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar initial={initial} size={44} className="bg-accent font-semibold text-secondary" />
          <div>
            <span className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-heading)] font-semibold text-[15px] text-base-content">{name}</span>
              {tierBadge && <Badge variant={tierBadge.variant}>{tierBadge.label}</Badge>}
            </span>
            <p className="text-sm text-base-content/55">{context}</p>
          </div>
        </div>
        {statusLabel && <Badge variant={statusVariant}>{statusLabel}</Badge>}
      </div>

      <blockquote className="rounded-2xl border-l-2 border-secondary/40 bg-base-200 px-4 py-3 text-sm text-base-content/80">
        {message}
      </blockquote>

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button key={action.label} type="button" size="sm" variant={action.variant ?? "outline"} icon={action.icon} onClick={action.onClick} className="flex-1">
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
