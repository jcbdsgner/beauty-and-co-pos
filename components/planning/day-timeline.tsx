"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Eye, MoreHorizontal, UserX, Users } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { DropdownMenu } from "@/components/ui/molecules/dropdown-menu";
import { clientFullName } from "@/lib/data/clientele";
import { serviceById } from "@/lib/data/menu";
import { appointmentEndTime, formatHour, minutesToTime, timeToMinutes, type RendezVousRow } from "@/lib/data/planning";
import { praticienneAccent } from "@/lib/data/praticienne-colors";
import { scheduleFor } from "@/lib/data/praticiennes";
import { cn } from "@/lib/utils";
import type { Cliente, DayHours, Praticienne, RendezVous } from "@/lib/data/types";

/**
 * « Planning · Jour » (ADR 0020) — le calendrier par collaboratrice : une ligne par praticienne,
 * le temps défile horizontalement, les rendez-vous sont positionnés dedans (début + durée). Zone
 * grisée = hors de l'horaire hebdomadaire du jour affiché ; ligne entière grisée = jour de repos.
 * Remplace `DayGrid` (colonnes-praticiennes, temps vertical, langage « Le Tableau »).
 */
const SLOT_MIN = 30;
const SLOT_W = 56; // px per 30 min
const LABEL_W = 208;
const LANE_H = 56;

type Props = {
  date: Date;
  isToday: boolean;
  /** Colonnes — déjà filtrées par la sidebar de filtre du parent. */
  staff: Praticienne[];
  /** Rendez-vous du jour affiché, déjà filtrés (annulés) par le parent. */
  rows: RendezVousRow[];
  clients: Cliente[];
  onOpenReservation: (rv: RendezVous) => void;
  onIsolate: (id: string) => void;
  onMarkAbsent: (id: string) => void;
};

type Placed = { row: RendezVousRow; start: number; end: number; lane: number };

/** Greedy lane packing so two rendez-vous that overlap on one praticienne stack instead of hiding
 *  each other — now vertical sub-lanes within a row instead of side-by-side columns. */
function pack(items: RendezVousRow[]): { placed: Placed[]; lanes: number } {
  const sorted = [...items].sort((a, b) => timeToMinutes(a.rv.start) - timeToMinutes(b.rv.start));
  const laneEnds: number[] = [];
  const placed = sorted.map((row) => {
    const start = timeToMinutes(row.rv.start);
    const end = timeToMinutes(appointmentEndTime(row.rv));
    let lane = laneEnds.findIndex((e) => e <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }
    return { row, start, end, lane };
  });
  return { placed, lanes: Math.max(1, laneEnds.length) };
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function subscribeNever() {
  return () => {};
}

/** `false` au rendu serveur et à la première passe client (identiques, donc pas de mismatch
 *  d'hydratation), `true` juste après — le trait "maintenant" n'apparaît qu'à ce moment-là. */
function useMounted() {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}

/** L'horaire hebdomadaire nominal, ou — si absent (repos) mais que des rendez-vous existent quand
 *  même ce jour-là (donnée de démonstration désalignée avec l'horaire type) — une plage dérivée de
 *  ces rendez-vous, pour ne jamais griser une ligne qui a pourtant un rendez-vous dedans. */
function effectiveHours(nominal: DayHours | undefined, col: RendezVousRow[]): DayHours | undefined {
  if (nominal) return nominal;
  if (col.length === 0) return undefined;
  const starts = col.map((r) => timeToMinutes(r.rv.start));
  const ends = col.map((r) => timeToMinutes(appointmentEndTime(r.rv)));
  return { start: minutesToTime(Math.min(...starts)), end: minutesToTime(Math.max(...ends)) };
}

export function DayTimeline({ date, isToday, staff, rows, clients, onOpenReservation, onIsolate, onMarkAbsent }: Props) {
  const active = useMemo(() => rows.filter((r) => r.rv.status !== "annule"), [rows]);
  const withCancelled = rows.length !== active.length;

  const { gridStart, gridEnd } = useMemo(() => {
    const marks: number[] = [];
    for (const p of staff) {
      const h = scheduleFor(p, date);
      if (h) marks.push(timeToMinutes(h.start), timeToMinutes(h.end));
    }
    for (const r of rows) marks.push(timeToMinutes(r.rv.start), timeToMinutes(appointmentEndTime(r.rv)));
    const lo = marks.length ? Math.min(...marks) : 9 * 60;
    const hi = marks.length ? Math.max(...marks) : 19 * 60;
    const flooredLo = Math.floor(lo / 60) * 60;
    return { gridStart: flooredLo, gridEnd: Math.max(Math.ceil(hi / 60) * 60, flooredLo + 4 * 60) };
  }, [staff, rows, date]);

  const x = (min: number) => ((min - gridStart) / SLOT_MIN) * SLOT_W;
  const bodyW = x(gridEnd);
  const hourMarks: number[] = [];
  for (let m = gridStart; m <= gridEnd; m += 60) hourMarks.push(m);

  // Rendu client-only : `now` dépend de l'heure d'exécution, qui diverge entre le rendu serveur et
  // l'hydratation client (React hydration mismatch). On n'affiche le trait "maintenant" qu'après montage.
  const mounted = useMounted();
  const now = nowMinutes();
  const showNow = mounted && isToday && now > gridStart && now < gridEnd;

  if (staff.length === 0) {
    return <div className="px-6 py-14 text-center text-sm text-base-content/45">Aucune praticienne sélectionnée.</div>;
  }

  return (
    <div className="overflow-x-auto [scrollbar-width:thin]">
      <div className="relative" style={{ minWidth: LABEL_W + bodyW }}>
        {/* ── hour header ── */}
        <div className="flex border-b border-base-300 bg-base-200/40">
          <div className="sticky left-0 z-10 shrink-0 border-r border-base-300 bg-base-200/40" style={{ width: LABEL_W }} />
          <div className="relative shrink-0" style={{ width: bodyW, height: 32 }}>
            {hourMarks.map((m) => (
              <span
                key={m}
                className="absolute top-1/2 -translate-y-1/2 text-[0.68rem] font-semibold tabular-nums text-base-content/45"
                style={{ left: x(m) + 4 }}
              >
                {formatHour(`${Math.floor(m / 60)}:00`)}
              </span>
            ))}
          </div>
        </div>

        {/* ── rows ── */}
        {staff.map((p) => {
          const col = active.filter((r) => r.rv.staffId === p.id || r.rv.secondStaffId === p.id);
          const nominal = scheduleFor(p, date);
          const hours = effectiveHours(nominal, col);
          const { placed, lanes } = pack(col);
          const rowH = Math.max(LANE_H, lanes * (LANE_H - 8) + 16);
          const absent = isToday && p.unavailableToday;
          const accent = praticienneAccent(p.id);
          const beforeW = hours ? x(timeToMinutes(hours.start)) : bodyW;
          const afterStart = hours ? x(timeToMinutes(hours.end)) : 0;

          return (
            <div key={p.id} className="flex border-b border-base-300 last:border-b-0">
              {/* left label */}
              <div
                className={cn(
                  "sticky left-0 z-10 flex shrink-0 items-center gap-2 border-r border-l-[3px] border-base-300 bg-base-100 px-3",
                  absent && "bg-warning/5",
                )}
                style={{ width: LABEL_W, minHeight: rowH, borderLeftColor: absent ? undefined : accent.dot }}
              >
                <Avatar
                  initial={p.initial}
                  size={32}
                  className={cn("shrink-0 text-[0.72rem] font-semibold", absent && "bg-base-200 text-base-content/40")}
                  style={absent ? undefined : { backgroundColor: accent.dot, color: "#fff" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate font-[family-name:var(--font-heading)] text-[13px] font-semibold text-base-content">
                    <span aria-hidden className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: absent ? undefined : accent.dot }} />
                    {p.name}
                  </p>
                  <p className={cn("truncate text-[0.7rem] tabular-nums", absent ? "font-semibold text-warning" : "text-base-content/45")}>
                    {absent ? "Absente" : hours ? `${formatHour(hours.start)}–${formatHour(hours.end)}` : "Repos"}
                  </p>
                </div>
                <DropdownMenu
                  align="end"
                  trigger={
                    <IconButton
                      aria-label={`Actions pour ${p.name}`}
                      className="size-7 shrink-0 rounded-full text-base-content/40 hover:bg-base-200"
                    >
                      <MoreHorizontal className="size-4" />
                    </IconButton>
                  }
                  items={[
                    { label: "Isoler cette ligne", icon: <Eye className="size-4" />, onSelect: () => onIsolate(p.id) },
                    ...(isToday
                      ? [
                          {
                            label: "Marquer absente aujourd'hui",
                            icon: <UserX className="size-4" />,
                            tone: "danger" as const,
                            disabled: absent,
                            onSelect: () => onMarkAbsent(p.id),
                          },
                        ]
                      : []),
                  ]}
                />
              </div>

              {/* timeline */}
              <div className="relative shrink-0" style={{ width: bodyW, minHeight: rowH }}>
                {!hours && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 flex items-center justify-center bg-base-300/80"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(135deg, transparent, transparent 7px, rgba(0,0,0,0.035) 7px, rgba(0,0,0,0.035) 14px)",
                    }}
                  >
                    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-base-content/40">Repos</span>
                  </div>
                )}
                {hours && beforeW > 0 && (
                  <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 bg-base-300/60" style={{ width: beforeW }} />
                )}
                {hours && afterStart < bodyW && (
                  <div aria-hidden className="pointer-events-none absolute inset-y-0 bg-base-300/60" style={{ left: afterStart, right: 0 }} />
                )}
                {hourMarks.map((m) =>
                  m === gridStart ? null : (
                    <div key={m} aria-hidden className="pointer-events-none absolute inset-y-0 border-l border-base-300/60" style={{ left: x(m) }} />
                  ),
                )}
                {absent && <div aria-hidden className="pointer-events-none absolute inset-0 bg-warning/10" />}

                {placed.map(({ row, lane }) => {
                  const { rv, reservation } = row;
                  const left = x(timeToMinutes(rv.start));
                  const w = Math.max((rv.durationMin / SLOT_MIN) * SLOT_W, SLOT_W - 6);
                  const svc = serviceById(rv.serviceId);
                  const payer = clients.find((c) => c.id === reservation.payerClientId);
                  const isSecond = rv.secondStaffId === p.id && rv.staffId !== p.id;
                  const cancelled = rv.status === "annule";
                  const wide = w > SLOT_W * 3;
                  return (
                    <button
                      key={rv.id + p.id}
                      type="button"
                      onClick={() => onOpenReservation(rv)}
                      style={{
                        left,
                        top: 8 + lane * (LANE_H - 8),
                        width: w,
                        height: LANE_H - 14,
                        ...(cancelled
                          ? undefined
                          : { backgroundColor: accent.bg, borderColor: accent.border, borderLeftColor: accent.dot }),
                      }}
                      className={cn(
                        "absolute flex flex-col justify-center gap-0.5 overflow-hidden rounded-field border border-l-[3px] px-2.5 text-left shadow-sm transition hover:z-10 hover:shadow-md active:opacity-70",
                        cancelled
                          ? "border-dashed border-base-300 border-l-base-300 bg-base-100 opacity-55 shadow-none"
                          : "hover:brightness-[0.97]",
                        isSecond && !cancelled && "opacity-75",
                      )}
                    >
                      <span
                        className="flex items-center gap-1 text-[0.64rem] font-bold tabular-nums"
                        style={cancelled ? undefined : { color: accent.text }}
                      >
                        {rv.start}
                        {rv.secondStaffId && <Users aria-hidden className="size-3" />}
                      </span>
                      <span className={cn("truncate text-xs font-semibold text-base-content", cancelled && "line-through")}>
                        {payer ? clientFullName(payer) : "Cliente"}
                      </span>
                      {wide && svc && <span className="truncate text-[0.68rem] text-base-content/60">{svc.name}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* ── "maintenant" — one amber hairline across every row ── */}
        {showNow && (
          <div aria-hidden className="pointer-events-none absolute z-20 w-px bg-warning" style={{ left: LABEL_W + x(now), top: 32, bottom: 0 }}>
            <span className="absolute -left-[3px] -top-[3px] size-[7px] rounded-full bg-warning" />
          </div>
        )}
      </div>

      {withCancelled && (
        <p className="px-3 py-2 text-[0.68rem] text-base-content/35">Les rendez-vous annulés sont affichés en pointillés.</p>
      )}
    </div>
  );
}
