import { Avatar } from "@/components/ui/atoms/avatar";
import { Badge } from "@/components/ui/atoms/badge";
import { cn } from "@/lib/utils";

type AppointmentTimelineRowProps = {
  start: string;
  end: string;
  clientName: string;
  clientInitial: string;
  service: string;
  staffName: string;
  /** A rendez-vous is only ever live or cancelled — there is no "pending / confirmed" step. */
  cancelled?: boolean;
  /** Swaps the trailing "Annulé" badge for an independently-tappable control (Encaisser / En cours). */
  trailing?: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

/**
 * One appointment on the day's timeline — a time-anchored row: the hour reads first, bold, then
 * the cliente, then the service and praticienne. The row sits against a shared left rule so a
 * column of them reads as a single running timeline, not a stack of cards.
 */
export function AppointmentTimelineRow({ start, end, clientName, clientInitial, service, staffName, cancelled, trailing, onClick, className }: AppointmentTimelineRowProps) {
  const body = (
    <>
      <div className="w-16 shrink-0 text-right">
        <p className="font-[family-name:var(--font-heading)] font-semibold text-lg leading-none text-[var(--color-gray-900)] tabular-nums">{start}</p>
        <p className="mt-1 text-xs text-[var(--color-gray-400)] tabular-nums">{end}</p>
      </div>
      <span className="relative flex w-3 shrink-0 justify-center self-stretch">
        <span className="w-px bg-border" />
        <span className={cn("absolute top-1.5 size-2.5 rounded-full ring-4 ring-[var(--brand-cream)]", cancelled ? "bg-[var(--color-gray-300)]" : "bg-secondary")} />
      </span>
      <Avatar initial={clientInitial} size={40} className="mt-0.5 shrink-0 bg-accent text-sm font-semibold text-secondary" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-[family-name:var(--font-heading)] font-semibold text-[15px] text-[var(--color-gray-900)]">{clientName}</p>
        <p className="truncate text-sm text-[var(--color-gray-500)]">{service} · {staffName}</p>
      </div>
    </>
  );

  const rowClass = cn(
    "flex items-start gap-3 rounded-2xl px-3 py-3 transition",
    cancelled && "opacity-55",
    className,
  );

  if (trailing) {
    return (
      <div className={rowClass}>
        {onClick ? (
          <button type="button" onClick={onClick} className="flex min-w-0 flex-1 items-start gap-3 rounded-xl text-left transition active:scale-[0.99] hover:bg-accent/40">
            {body}
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 items-start gap-3">{body}</div>
        )}
        <div className="mt-0.5 shrink-0">{trailing}</div>
      </div>
    );
  }

  const Comp = onClick ? "button" : "div";
  return (
    <Comp type={onClick ? "button" : undefined} onClick={onClick} className={cn(rowClass, onClick && "text-left active:scale-[0.99] hover:bg-accent/40")}>
      {body}
      {cancelled && (
        <Badge variant="error" className="mt-1 shrink-0">
          Annulé
        </Badge>
      )}
    </Comp>
  );
}
