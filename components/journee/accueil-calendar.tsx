"use client";

import { useMemo } from "react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Tooltip } from "@/components/ui/atoms/tooltip";
import { clientFullName } from "@/lib/data/clientele";
import { reservationComposition, timeToMinutes, type ReservationDayRow } from "@/lib/data/planning";
import { cn } from "@/lib/utils";
import type { Cliente, Praticienne, RendezVous } from "@/lib/data/types";

/** Vue calendrier de l'Accueil (ADR 0019) — rail heures + une colonne, un bloc = une
 *  réservation entière (grain réservation, pas rendez-vous), positionné sur son passage
 *  `start → end`. Réservations simultanées (peu importe la praticienne) posées côte à côte
 *  par lane-packing glouton. */
const SLOT_MIN = 30;
const SLOT_H = 34; // px per 30 min — même échelle que DayGrid
const RAIL_W = 52;
const LANE_MIN_W = 150;
const MAX_AVATARS = 3;

type Props = {
  rows: ReservationDayRow[];
  clients: Cliente[];
  praticiennes: Praticienne[];
  onOpenReservation: (rv: RendezVous) => void;
};

function currentMinute(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

/** "9:00" → "9h", "18:30" → "18h30". */
function hm(t: string) {
  const [h, m] = t.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

type Placed = { row: ReservationDayRow; top: number; lane: number };

/** Lane packing glouton — deux réservations qui se chevauchent dans le temps (n'importe quelle
 *  praticienne) sont posées côte à côte plutôt que superposées. */
function pack(rows: ReservationDayRow[]): { placed: Placed[]; lanes: number } {
  const sorted = [...rows].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  const laneEnds: number[] = [];
  const placed = sorted.map((row) => {
    const start = timeToMinutes(row.start);
    const end = timeToMinutes(row.end);
    let lane = laneEnds.findIndex((e) => e <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }
    return { row, top: start, lane };
  });
  return { placed, lanes: Math.max(1, laneEnds.length) };
}

export function AccueilCalendar({ rows, clients, praticiennes, onOpenReservation }: Props) {
  const now = currentMinute();

  const { gridStart, gridEnd } = useMemo(() => {
    const marks = rows.flatMap((r) => [timeToMinutes(r.start), timeToMinutes(r.end)]);
    const lo = marks.length ? Math.min(...marks) : 9 * 60;
    const hi = marks.length ? Math.max(...marks) : 19 * 60;
    const start = Math.floor(lo / 60) * 60;
    return { gridStart: start, gridEnd: Math.max(Math.ceil(hi / 60) * 60, start + 4 * 60) };
  }, [rows]);

  const y = (min: number) => ((min - gridStart) / SLOT_MIN) * SLOT_H;
  const bodyH = y(gridEnd);
  const hourMarks: number[] = [];
  for (let m = gridStart; m <= gridEnd; m += 60) hourMarks.push(m);
  const showNow = now > gridStart && now < gridEnd;

  const { placed, lanes } = useMemo(() => pack(rows), [rows]);
  const narrow = lanes > 2;

  const staffOf = (id: string) => praticiennes.find((p) => p.id === id);

  return (
    <div className="overflow-x-auto [scrollbar-width:thin]">
      <div className="relative flex" style={{ height: bodyH + 10, paddingTop: 10, minWidth: RAIL_W + lanes * LANE_MIN_W }}>
        <div className="shrink-0 border-r border-base-300" style={{ width: RAIL_W }}>
          {hourMarks.map((m, i) => (
            <div key={m} className="relative" style={{ height: i === hourMarks.length - 1 ? 0 : SLOT_H * 2 }}>
              <span
                className={cn(
                  "absolute right-2 text-[0.68rem] font-semibold tabular-nums text-base-content/40",
                  i === 0 ? "top-0" : "-top-2",
                )}
              >
                {hm(`${m / 60}:00`)}
              </span>
            </div>
          ))}
        </div>

        <div className="relative flex-1">
          {hourMarks.map((m, i) =>
            i === 0 ? null : (
              <div key={m} aria-hidden className="absolute inset-x-0 border-t border-base-300/70" style={{ top: i * SLOT_H * 2 }} />
            ),
          )}

          {placed.map(({ row, lane }) => {
            const { reservation } = row;
            const payer = clients.find((c) => c.id === reservation.payerClientId);
            const startMin = timeToMinutes(row.start);
            const endMin = timeToMinutes(row.end);
            const top = y(startMin);
            const h = Math.max(y(endMin) - top, SLOT_H - 6);
            const composition = reservationComposition(reservation);
            const hasSale = Boolean(reservation.saleId);
            const phase = endMin <= now ? "past" : startMin <= now ? "current" : "upcoming";
            const awaitingCheckout = phase === "past" && !hasSale;
            const staffList = row.staffIds.map(staffOf).filter((p): p is Praticienne => Boolean(p));
            const visibleAvatars = staffList.slice(0, MAX_AVATARS);
            const hiddenAvatars = staffList.length - visibleAvatars.length;
            const target = row.rendezVous[0];
            const payerName = payer ? clientFullName(payer) : "Cliente";

            return (
              <Tooltip
                key={reservation.id}
                side="right"
                content={
                  <div className="flex flex-col gap-1 py-0.5">
                    <span className="font-semibold">{payerName}</span>
                    <span className="tabular-nums opacity-80">
                      {row.start} → {row.end}
                    </span>
                    <span className="opacity-80">{composition}</span>
                    {staffList.length > 0 && <span className="opacity-80">{staffList.map((p) => p.name).join(", ")}</span>}
                    {awaitingCheckout && <span className="font-semibold text-warning">à encaisser</span>}
                  </div>
                }
              >
                <button
                  type="button"
                  onClick={() => target && onOpenReservation(target)}
                  style={{
                    top,
                    height: h,
                    left: `calc(${(lane / lanes) * 100}% + 3px)`,
                    width: `calc(${100 / lanes}% - 6px)`,
                  }}
                  className={cn(
                    "absolute flex flex-col gap-1 overflow-hidden rounded-field border border-l-[3px] border-base-300 border-l-accent bg-base-100 px-2.5 py-1.5 text-left transition hover:z-10 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] active:opacity-70",
                    phase === "past" && !awaitingCheckout && "opacity-70",
                  )}
                >
                  <span className="flex items-center justify-between gap-1">
                    <span className="truncate text-xs font-semibold tabular-nums text-base-content/55">{row.start}</span>
                    {awaitingCheckout && <span className="size-1.5 shrink-0 rounded-full bg-warning" />}
                  </span>
                  <span className="truncate text-sm font-medium text-base-content">{payerName}</span>
                  {!narrow && <span className="truncate text-xs text-base-content/55">{composition}</span>}
                  {visibleAvatars.length > 0 && (
                    <span className="mt-auto flex items-center">
                      {visibleAvatars.map((p, i) => (
                        <Avatar
                          key={p.id}
                          initial={p.initial}
                          size={20}
                          className={cn(
                            "bg-accent text-[0.6rem] font-semibold text-base-content ring-2 ring-base-100",
                            i > 0 && "-ml-2",
                          )}
                        />
                      ))}
                      {hiddenAvatars > 0 && (
                        <span className="-ml-2 flex size-5 shrink-0 items-center justify-center rounded-full bg-base-300 text-[0.6rem] font-semibold text-base-content/70 ring-2 ring-base-100">
                          +{hiddenAvatars}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              </Tooltip>
            );
          })}

          {showNow && (
            <div aria-hidden className="pointer-events-none absolute inset-x-0 z-20 flex items-center" style={{ top: y(now) }}>
              <span className="size-1.5 shrink-0 rounded-full bg-warning" />
              <span className="h-px flex-1 bg-warning/60" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
