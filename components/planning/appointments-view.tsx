import { CalendarIcon } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import {
  APPOINTMENTS_BY_DAY,
  DAY_START_HOUR,
  SLOT_COUNT,
  SLOT_MINUTES,
  TEAM_MEMBERS,
  durationToSlotSpan,
  timeToSlotIndex,
  type Appointment,
  type Role,
} from "@/lib/data/planning";

type AppointmentsViewProps = {
  dayIndex: number;
  dateLabel: string;
};

// Même mapping rôle → couleur que team-view.tsx (ROLE_BADGE_VARIANT dark/error/info/success),
// mais en trait + fond adouci pour les blocs du calendrier plutôt qu'en badge plein.
const ROLE_BLOCK_STYLE: Record<Role, string> = {
  coiffeuse: "border-l-[var(--pos-accent-dark)] bg-[var(--pos-accent-dark-soft)]",
  estheticienne: "border-l-[var(--color-error)] bg-[#fdece9]",
  accueil: "border-l-[var(--color-info)] bg-[var(--color-info-soft)]",
  stock: "border-l-[var(--color-success)] bg-[var(--color-success-soft)]",
};

const ROW_HEIGHT_PX = 40;
const TIME_COL_WIDTH_PX = 52;
const STAFF_COL_WIDTH_PX = 152;

function slotLabel(index: number): string | null {
  const totalMinutes = DAY_START_HOUR * 60 + index * SLOT_MINUTES;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  // N'affiche le libellé qu'aux heures pleines pour ne pas surcharger la colonne.
  if (minute !== 0) return null;
  return `${hour}h`;
}

/** Vue "Rendez-vous" du Planning — grille horaire par praticien·ne (colonnes = qui a au moins un
 *  Rendez-vous ce jour-là, cf. CONTEXT.md). Accueil/Stock ne prennent pas de rendez-vous et
 *  n'apparaissent donc jamais en colonne. */
export function AppointmentsView({ dayIndex, dateLabel }: AppointmentsViewProps) {
  const appointments = APPOINTMENTS_BY_DAY[dayIndex] ?? [];

  const staffIds = TEAM_MEMBERS.filter((member) => appointments.some((a) => a.staffId === member.id)).map(
    (m) => m.id,
  );
  const staff = staffIds.map((id) => TEAM_MEMBERS.find((m) => m.id === id)!);

  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => i);
  const gridTemplateColumns = `${TIME_COL_WIDTH_PX}px repeat(${staff.length}, ${STAFF_COL_WIDTH_PX}px)`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">Rendez-vous</h2>
        <span className="text-sm text-[var(--color-gray-500)]">
          {appointments.length} RDV{appointments.length > 1 ? "s" : ""}
        </span>
      </div>

      {staff.length === 0 ? (
        <EmptyState icon={<CalendarIcon className="size-12" />} title="Aucun rendez-vous pour ce jour" subtitle={dateLabel} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-gray-200)] bg-white">
          <div className="min-w-max">
            {/* En-tête : une colonne par praticien·ne ayant au moins un RDV ce jour */}
            <div className="grid border-b border-[var(--color-gray-200)]" style={{ gridTemplateColumns }}>
              <div />
              {staff.map((member) => (
                <div key={member.id} className="flex flex-col items-center gap-1 border-l border-[var(--color-gray-100)] px-2 py-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-[var(--brand-rose-soft)] text-xs font-semibold text-[var(--brand-taupe-muted)]">
                    {member.initial}
                  </span>
                  <span className="truncate text-xs font-semibold text-[var(--color-gray-900)]">{member.name}</span>
                </div>
              ))}
            </div>

            {/* Grille horaire : lignes = créneaux de 30 min, cellules de fond + RDV positionnés par ligne/colonne */}
            <div className="relative grid" style={{ gridTemplateColumns, gridTemplateRows: `repeat(${SLOT_COUNT}, ${ROW_HEIGHT_PX}px)` }}>
              {slots.map((slotIndex) => (
                <div
                  key={`time-${slotIndex}`}
                  className="flex items-start justify-end pr-2 text-[11px] text-[var(--color-gray-400)]"
                  style={{ gridColumn: 1, gridRow: slotIndex + 1 }}
                >
                  {slotLabel(slotIndex)}
                </div>
              ))}

              {staff.map((member, colIndex) =>
                slots.map((slotIndex) => (
                  <div
                    key={`cell-${member.id}-${slotIndex}`}
                    className="border-t border-l border-[var(--color-gray-100)]"
                    style={{ gridColumn: colIndex + 2, gridRow: slotIndex + 1 }}
                  />
                )),
              )}

              {staff.map((member, colIndex) => {
                const forStaff = appointments.filter((a) => a.staffId === member.id);
                return forStaff.map((appt) => (
                  <AppointmentBlock key={appt.id} appointment={appt} role={member.role} column={colIndex + 2} />
                ));
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentBlock({ appointment, role, column }: { appointment: Appointment; role: Role; column: number }) {
  const rowStart = timeToSlotIndex(appointment.start) + 1;
  const rowSpan = durationToSlotSpan(appointment.durationMin);
  const endHour = (() => {
    const startMinutes = DAY_START_HOUR * 60 + timeToSlotIndex(appointment.start) * SLOT_MINUTES;
    const end = startMinutes + appointment.durationMin;
    return `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
  })();

  return (
    <div
      className={cn(
        "m-0.5 overflow-hidden rounded-lg border-l-4 px-2 py-1",
        ROLE_BLOCK_STYLE[role],
        appointment.status === "en_attente" && "border-dashed opacity-80",
      )}
      style={{ gridColumn: column, gridRow: `${rowStart} / span ${rowSpan}` }}
      title={`${appointment.clientName} — ${appointment.service} — ${appointment.start}–${endHour}${appointment.status === "en_attente" ? " (en attente)" : ""}`}
    >
      <p className="truncate text-xs font-semibold text-[var(--color-gray-900)]">{appointment.clientName}</p>
      <p className="truncate text-[11px] text-[var(--color-gray-600)]">{appointment.service}</p>
    </div>
  );
}
