"use client";

import { Undo2, Users } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { Legend } from "@/components/ui/board";
import { clientFullName } from "@/lib/data/clientele";
import { serviceById } from "@/lib/data/menu";
import { appointmentEndTime, timeToMinutes, type RendezVousRow } from "@/lib/data/planning";
import { cn } from "@/lib/utils";
import type { Cliente, Praticienne, RendezVous } from "@/lib/data/types";

/**
 * « Planning · Semaine » — deux lectures selon le focus :
 *   — une praticienne isolée : sa semaine en grille (jours en colonnes × heures en rail) ;
 *   — toute l'équipe : une matrice de charge (praticiennes en lignes × 7 jours), chaque case = le
 *     nombre de rdv + une barre d'occupation (temps réservé / temps de présence).
 * Taper une case / un jour ouvre ce jour en vue « Jour ». Données de démonstration = aujourd'hui
 * seulement ; les autres jours restent vides, sans mentir.
 */
const SLOT_MIN = 30;
const SLOT_H = 30;
const RAIL_W = 50;

type Props = {
  weekDays: Date[];
  today: Date;
  /** Rendez-vous du jour courant (grain rendez-vous), déjà filtrés par le parent. */
  todayRows: RendezVousRow[];
  staff: Praticienne[];
  soloStaff: Praticienne | null;
  clients: Cliente[];
  onOpenReservation: (rv: RendezVous) => void;
  onPickDay: (d: Date, staffId?: string) => void;
  onClearSolo: () => void;
};

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function hm(t: string) {
  const [h, m] = t.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}
function dayHead(d: Date) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(d).replace(".", "").toUpperCase();
}

export function WeekGrid({ weekDays, today, todayRows, staff, soloStaff, clients, onOpenReservation, onPickDay, onClearSolo }: Props) {
  const rowsForDay = (d: Date, staffId?: string) => {
    if (!sameDay(d, today)) return [] as RendezVousRow[];
    return todayRows.filter(
      (r) => r.rv.status !== "annule" && (!staffId || r.rv.staffId === staffId || r.rv.secondStaffId === staffId),
    );
  };

  /* ── Solo : la semaine d'une praticienne, jours × heures ── */
  if (soloStaff) {
    const all = weekDays.flatMap((d) => rowsForDay(d, soloStaff.id));
    const marks = all.flatMap((r) => [timeToMinutes(r.rv.start), timeToMinutes(appointmentEndTime(r.rv))]);
    if (soloStaff.shiftStart && soloStaff.shiftEnd) marks.push(timeToMinutes(soloStaff.shiftStart), timeToMinutes(soloStaff.shiftEnd));
    const lo = marks.length ? Math.min(...marks) : 9 * 60;
    const hi = marks.length ? Math.max(...marks) : 18 * 60;
    const gridStart = Math.floor(lo / 60) * 60;
    const gridEnd = Math.max(Math.ceil(hi / 60) * 60, gridStart + 4 * 60);
    const y = (min: number) => ((min - gridStart) / SLOT_MIN) * SLOT_H;
    const bodyH = y(gridEnd);
    const hours: number[] = [];
    for (let m = gridStart; m <= gridEnd; m += 60) hours.push(m);

    return (
      <div className="overflow-x-auto [scrollbar-width:thin]">
        <div style={{ minWidth: RAIL_W + 7 * 120 }}>
          <div className="flex items-center gap-2 border-b border-[var(--board-groove)] bg-black/[0.015] px-3 py-2">
            <Avatar initial={soloStaff.initial} size={26} className="bg-accent text-[0.7rem] font-semibold text-secondary" />
            <Legend>La semaine de {soloStaff.name}</Legend>
            <IconButton
              aria-label="Voir toute l'équipe"
              onClick={onClearSolo}
              className="ml-auto size-7 rounded-full text-[var(--color-gray-400)] hover:bg-black/[0.05]"
            >
              <Undo2 className="size-3.5" />
            </IconButton>
          </div>

          <div className="flex border-b border-[var(--board-groove)] bg-black/[0.015]">
            <div className="shrink-0 border-r border-[var(--board-groove)]" style={{ width: RAIL_W }} />
            {weekDays.map((d) => {
              const n = rowsForDay(d, soloStaff.id).length;
              const isToday = sameDay(d, today);
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => onPickDay(d, soloStaff.id)}
                  className={cn(
                    "flex min-w-0 flex-1 flex-col items-center gap-0.5 border-r border-[var(--board-groove)] py-1.5 text-center transition last:border-r-0 hover:bg-black/[0.03]",
                    isToday && "bg-[var(--board-amber-soft)]/50",
                  )}
                  style={{ minWidth: 120 }}
                >
                  <span className={cn("text-[0.6rem] font-bold uppercase tracking-[0.1em]", isToday ? "text-[var(--board-amber)]" : "text-[var(--color-gray-400)]")}>
                    {dayHead(d)} {d.getDate()}
                  </span>
                  <span className="text-[0.68rem] tabular-nums text-[var(--color-gray-400)]">{n > 0 ? `${n} rdv` : "—"}</span>
                </button>
              );
            })}
          </div>

          <div className="relative flex" style={{ height: bodyH + 10, paddingTop: 10 }}>
            <div className="shrink-0 border-r border-[var(--board-groove)]" style={{ width: RAIL_W }}>
              {hours.map((m, i) => (
                <div key={m} className="relative" style={{ height: i === hours.length - 1 ? 0 : SLOT_H * 2 }}>
                  <span className={cn("absolute right-2 text-[0.66rem] font-semibold tabular-nums text-[var(--color-gray-400)]", i === 0 ? "top-0" : "-top-2")}>
                    {hm(`${m / 60}:00`)}
                  </span>
                </div>
              ))}
            </div>
            {weekDays.map((d) => {
              const items = rowsForDay(d, soloStaff.id);
              const isToday = sameDay(d, today);
              return (
                <div
                  key={d.toISOString()}
                  className={cn("relative min-w-0 flex-1 border-r border-[var(--board-groove)] last:border-r-0", isToday && "bg-[var(--board-amber-soft)]/30")}
                  style={{ minWidth: 120 }}
                >
                  {hours.map((m, i) =>
                    i === 0 ? null : (
                      <div key={m} aria-hidden className="absolute inset-x-0 border-t border-[var(--board-groove)]/60" style={{ top: i * SLOT_H * 2 }} />
                    ),
                  )}
                  {items.map((r) => {
                    const top = y(timeToMinutes(r.rv.start));
                    const h = Math.max((r.rv.durationMin / SLOT_MIN) * SLOT_H, SLOT_H - 6);
                    const svc = serviceById(r.rv.serviceId);
                    const payer = clients.find((c) => c.id === r.reservation.payerClientId);
                    const roseAccent = soloStaff.role === "coiffeuse";
                    return (
                      <button
                        key={r.rv.id}
                        type="button"
                        onClick={() => onOpenReservation(r.rv)}
                        style={{ top, height: h }}
                        className={cn(
                          "absolute inset-x-1 flex flex-col gap-0.5 overflow-hidden rounded-[9px] border border-l-[3px] bg-[var(--brand-rose-soft)] px-1.5 py-1 text-left transition hover:z-10 hover:shadow-[0_3px_10px_rgba(0,0,0,0.09)] active:opacity-70",
                          "border-[var(--board-groove)]",
                          roseAccent ? "border-l-[var(--core-brand-color)]" : "border-l-[var(--brand-taupe-muted)]/40",
                        )}
                      >
                        <span className="flex items-center gap-1 text-[0.64rem] font-semibold tabular-nums text-[var(--brand-taupe-muted)]">
                          {r.rv.start}
                          {r.rv.secondStaffId && <Users aria-hidden className="size-2.5" />}
                        </span>
                        <span className="truncate text-[0.7rem] font-semibold text-[var(--color-gray-900)]">
                          {payer ? clientFullName(payer) : "Cliente"}
                        </span>
                        {h > SLOT_H * 1.6 && svc && <span className="truncate text-[0.66rem] text-[var(--color-gray-500)]">{svc.name}</span>}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ── Équipe : matrice de charge, praticiennes × 7 jours ── */
  const NAME_W = 150;
  return (
    <div className="overflow-x-auto [scrollbar-width:thin]">
      <div style={{ minWidth: NAME_W + 7 * 96 }}>
        <div className="flex border-b border-[var(--board-groove)] bg-black/[0.015]">
          <div className="shrink-0 border-r border-[var(--board-groove)] px-3 py-2" style={{ width: NAME_W }}>
            <Legend>Praticienne</Legend>
          </div>
          {weekDays.map((d) => {
            const isToday = sameDay(d, today);
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => onPickDay(d)}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center border-r border-[var(--board-groove)] py-1.5 transition last:border-r-0 hover:bg-black/[0.03]",
                  isToday && "bg-[var(--board-amber-soft)]/50",
                )}
                style={{ minWidth: 96 }}
              >
                <span className={cn("text-[0.6rem] font-bold uppercase tracking-[0.1em]", isToday ? "text-[var(--board-amber)]" : "text-[var(--color-gray-400)]")}>
                  {dayHead(d)}
                </span>
                <span className={cn("text-sm font-semibold tabular-nums", isToday ? "text-[var(--board-amber)]" : "text-[var(--color-gray-600)]")}>
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {staff.map((p) => {
          const shiftMin =
            p.shiftStart && p.shiftEnd ? timeToMinutes(p.shiftEnd) - timeToMinutes(p.shiftStart) : 0;
          return (
            <div key={p.id} className="flex border-b border-[var(--board-groove)] last:border-b-0">
              <div
                className="flex shrink-0 items-center gap-2 border-r border-[var(--board-groove)] px-3 py-2"
                style={{ width: NAME_W }}
                title={p.name}
              >
                <Avatar initial={p.initial} size={22} className="shrink-0 bg-accent text-[0.62rem] font-semibold text-secondary" />
                <span className="truncate text-[12px] font-semibold text-[var(--color-gray-900)]">{p.name}</span>
              </div>
              {weekDays.map((d) => {
                const isToday = sameDay(d, today);
                const items = rowsForDay(d, p.id);
                const bookedMin = items.reduce((s, r) => s + r.rv.durationMin, 0);
                const load = shiftMin > 0 ? Math.min(1, bookedMin / shiftMin) : 0;
                const absent = isToday && p.unavailableToday;
                return (
                  <button
                    key={d.toISOString()}
                    type="button"
                    onClick={() => onPickDay(d, p.id)}
                    className={cn(
                      "flex min-w-0 flex-1 flex-col justify-center gap-1 border-r border-[var(--board-groove)] px-2 py-2 text-left transition last:border-r-0 hover:bg-black/[0.03]",
                      isToday && "bg-[var(--board-amber-soft)]/25",
                    )}
                    style={{ minWidth: 96 }}
                  >
                    {absent ? (
                      <span className="text-[0.68rem] font-semibold text-[var(--board-amber)]">Absente</span>
                    ) : items.length > 0 ? (
                      <>
                        <span className="text-[0.7rem] font-semibold tabular-nums text-[var(--color-gray-700)]">
                          {items.length} rdv
                        </span>
                        <span className="h-1 w-full overflow-hidden rounded-full bg-black/[0.06]">
                          <span className="block h-full rounded-full bg-[var(--brand-taupe-muted)]" style={{ width: `${Math.max(load * 100, 8)}%` }} />
                        </span>
                      </>
                    ) : null}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
