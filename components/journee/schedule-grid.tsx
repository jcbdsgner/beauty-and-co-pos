"use client";

import { Avatar } from "@/components/ui/atoms/avatar";
import { Badge } from "@/components/ui/atoms/badge";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import { serviceById } from "@/lib/data/catalogue";
import { SLOT_START_TIMES, timeToMinutes } from "@/lib/data/planning";
import { cn } from "@/lib/utils";
import type { Praticienne, RendezVous } from "@/lib/data/types";

const ROW_HEIGHT = 22; // px per 15-min slot
const START_MIN = timeToMinutes(SLOT_START_TIMES[0]);

type ScheduleGridProps = {
  staff: Praticienne[];
  appointments: RendezVous[];
  showCancelled: boolean;
  onSlotClick: (staffId: string, start: string) => void;
  onAppointmentClick: (appointment: RendezVous) => void;
};

/** Grille horaire par praticien·ne (grid CSS, per-column positioned blocks) — a specialised
 *  component, not DataTable/Card, since appointments are positioned by time slot rather than
 *  listed. Per USERFLOW.md § Planning complet. */
export function ScheduleGrid({ staff, appointments, showCancelled, onSlotClick, onAppointmentClick }: ScheduleGridProps) {
  const { clients, praticiennes } = useAppData();
  const totalHeight = SLOT_START_TIMES.length * ROW_HEIGHT;

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--color-gray-200)] bg-white">
      <div className="flex" style={{ minWidth: 120 + staff.length * 200 }}>
        {/* time gutter */}
        <div className="w-[120px] shrink-0 border-r border-[var(--color-gray-200)]">
          <div className="flex h-14 items-center border-b border-[var(--color-gray-200)] px-3 text-xs font-semibold text-[var(--color-gray-400)]">
            Heure
          </div>
          <div className="relative" style={{ height: totalHeight }}>
            {SLOT_START_TIMES.map((t, i) =>
              t.endsWith(":00") ? (
                <p
                  key={t}
                  className="absolute left-3 -translate-y-1/2 text-xs font-medium text-[var(--color-gray-500)]"
                  style={{ top: i * ROW_HEIGHT }}
                >
                  {t}
                </p>
              ) : null,
            )}
          </div>
        </div>

        {staff.map((person) => {
          const staffAppointments = appointments.filter(
            (a) => a.staffId === person.id && (showCancelled || a.status !== "annule"),
          );

          return (
            <div key={person.id} className="w-[200px] shrink-0 border-r border-[var(--color-gray-200)] last:border-r-0">
              <div className="flex h-14 items-center gap-2 border-b border-[var(--color-gray-200)] px-3">
                <Avatar initial={person.initial} size={28} className="bg-[var(--brand-rose-soft)] text-xs font-semibold text-[var(--brand-taupe-muted)]" />
                <span className="truncate text-sm font-semibold text-[var(--color-gray-900)]">{person.name}</span>
                {person.unavailableToday && (
                  <Badge variant="warning" className="shrink-0">
                    Absente
                  </Badge>
                )}
              </div>

              <div className="relative" style={{ height: totalHeight }}>
                {/* click-to-create layer */}
                {SLOT_START_TIMES.map((t, i) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onSlotClick(person.id, t)}
                    aria-label={`Nouveau rendez-vous à ${t} avec ${person.name}`}
                    className="absolute inset-x-0 border-b border-[var(--color-gray-100)] transition hover:bg-[var(--brand-rose-soft)]/40 active:bg-[var(--brand-rose-soft)]/70"
                    style={{ top: i * ROW_HEIGHT, height: ROW_HEIGHT }}
                  />
                ))}

                {staffAppointments.map((appt) => {
                  const startOffset = timeToMinutes(appt.start) - START_MIN;
                  const top = (startOffset / 15) * ROW_HEIGHT;
                  const height = Math.max((appt.durationMin / 15) * ROW_HEIGHT, ROW_HEIGHT);
                  const client = clients.find((c) => c.id === appt.clientId);
                  const service = serviceById(appt.serviceId);
                  const cancelled = appt.status === "annule";
                  const staffAbsent = praticiennes.find((p) => p.id === appt.staffId)?.unavailableToday;

                  return (
                    <button
                      key={appt.id}
                      type="button"
                      onClick={cancelled ? undefined : () => onAppointmentClick(appt)}
                      style={{ top, height }}
                      className={cn(
                        "absolute inset-x-1 overflow-hidden rounded-lg border px-2 py-1 text-left text-xs leading-tight transition",
                        cancelled
                          ? "pointer-events-none z-0 border-dashed border-[var(--color-gray-300)] bg-[var(--color-gray-100)] text-[var(--color-gray-400)] opacity-70"
                          : "z-10 border-transparent bg-[var(--core-brand-color)] text-black active:scale-[0.98]",
                        !cancelled && staffAbsent && "bg-[var(--color-warning-soft)]",
                      )}
                    >
                      <p className="truncate font-semibold">{client ? clientFullName(client) : "Cliente"}</p>
                      <p className="truncate">{service?.name}</p>
                      {cancelled && <p className="truncate font-semibold">Annulé</p>}
                      {!cancelled && staffAbsent && <p className="truncate font-semibold">Praticien·ne absente</p>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {staff.length === 0 && (
          <div className="flex flex-1 items-center justify-center p-10 text-sm text-[var(--color-gray-400)]">
            Personne ne travaille ce jour-là.
          </div>
        )}
      </div>
    </div>
  );
}
