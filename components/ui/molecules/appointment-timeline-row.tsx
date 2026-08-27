import { Avatar } from "@/components/ui/atoms/avatar";
import { Badge, type BadgeVariant } from "@/components/ui/atoms/badge";
import { cn } from "@/lib/utils";

type AppointmentStatus = "confirme" | "en_attente" | "annule";

const STATUS: Record<AppointmentStatus, { label: string; variant: BadgeVariant }> = {
  confirme: { label: "Confirmé", variant: "success" },
  en_attente: { label: "En attente", variant: "warning" },
  annule: { label: "Annulé", variant: "error" },
};

type AppointmentTimelineRowProps = {
  start: string;
  end: string;
  clientName: string;
  clientInitial: string;
  service: string;
  staffName: string;
  status: AppointmentStatus;
  onClick?: () => void;
  className?: string;
};

/**
 * One row of a day's schedule (planning) — time range, client, service, praticien·ne and status
 * at a glance. Status lives entirely in the trailing Badge (no colored border-left accent) so
 * it reads the same status language as everywhere else in the app.
 */
export function AppointmentTimelineRow({ start, end, clientName, clientInitial, service, staffName, status, onClick, className }: AppointmentTimelineRowProps) {
  const { label, variant } = STATUS[status];
  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl border border-[var(--color-gray-200)] bg-white p-4 text-left transition",
        status === "annule" && "opacity-60",
        onClick && "active:scale-[0.98] hover:border-[var(--brand-taupe-muted)]",
        className,
      )}
    >
      <div className="w-16 shrink-0 text-center">
        <p className="text-sm font-bold text-[var(--color-gray-900)]">{start}</p>
        <p className="text-xs text-[var(--color-gray-400)]">{end}</p>
      </div>

      <Avatar initial={clientInitial} size={36} className="shrink-0 bg-[var(--brand-rose-soft)] text-sm font-semibold text-[var(--brand-taupe-muted)]" />

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[var(--color-gray-900)]">{clientName}</p>
        <p className="truncate text-sm text-[var(--color-gray-500)]">
          {service} · {staffName}
        </p>
      </div>

      <Badge variant={variant} className="shrink-0">
        {label}
      </Badge>
    </Comp>
  );
}
