"use client";

import { Legend } from "@/components/ui/board";
import { DayList } from "@/components/planning/day-list";
import { groupDayByReservation, type ReservationDayRow } from "@/lib/data/planning";
import { cn } from "@/lib/utils";
import type { Cliente, Praticienne, RendezVous, Reservation } from "@/lib/data/types";

/**
 * « Rendez-vous · Semaine » — les sept jours empilés dans une seule plaque, chacun replié sur sa
 * légende (jour + compte). Le jour courant reprend la `DayList` complète (filet « maintenant »,
 * dépliage, Encaisser) ; les autres jours tiennent une ligne. Les données de démonstration ne
 * couvrent qu'aujourd'hui — les jours vides disent « Journée libre », honnêtement.
 */
type Props = {
  weekDays: Date[];
  today: Date;
  /** Réservations du jour courant, déjà filtrées (annulés) par le parent. */
  todayReservations: Reservation[];
  includeCancelled: boolean;
  clients: Cliente[];
  praticiennes: Praticienne[];
  onOpenReservation: (rv: RendezVous) => void;
  onEncaisser: (reservationId: string) => void;
  onPickDay: (d: Date) => void;
};

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dayLabel(d: Date) {
  const wd = new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(d).replace(".", "");
  const mo = new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(d).replace(".", "");
  return `${wd} ${d.getDate()} ${mo}`;
}

export function WeekList({
  weekDays,
  today,
  todayReservations,
  includeCancelled,
  clients,
  praticiennes,
  onOpenReservation,
  onEncaisser,
  onPickDay,
}: Props) {
  const todayRows: ReservationDayRow[] = groupDayByReservation(todayReservations, { includeCancelled });

  return (
    <div className="flex flex-col">
      {weekDays.map((d) => {
        const isToday = sameDay(d, today);
        const isPast = !isToday && d < today;
        const rows = isToday ? todayRows : [];
        const filled = rows.length > 0;
        return (
          <div key={d.toISOString()} className={cn(isPast && !filled && "opacity-45")}>
            <button
              type="button"
              onClick={() => onPickDay(d)}
              className={cn(
                "flex w-full items-center justify-between border-b border-[var(--board-groove)] px-4 text-left transition hover:bg-black/[0.03]",
                filled ? "py-2" : "py-3",
                isToday ? "bg-[var(--board-amber-soft)]/50" : "bg-black/[0.015]",
              )}
            >
              <Legend className={cn(isToday && "text-[var(--board-amber)]")}>
                {dayLabel(d)}
                {isToday ? " · aujourd'hui" : ""}
              </Legend>
              <span className="text-xs tabular-nums text-[var(--color-gray-400)]">
                {filled ? `${rows.length} ${rows.length > 1 ? "réservations" : "réservation"}` : "journée libre"}
              </span>
            </button>
            {filled && (
              <DayList
                rows={rows}
                clients={clients}
                praticiennes={praticiennes}
                onOpenReservation={onOpenReservation}
                onEncaisser={onEncaisser}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
