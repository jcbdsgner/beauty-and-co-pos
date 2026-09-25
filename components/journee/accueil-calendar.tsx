"use client";

import { useMemo } from "react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Tooltip } from "@/components/ui/atoms/tooltip";
import { clientFullName } from "@/lib/data/clientele";
import { reservationComposition, timeToMinutes, type ReservationDayRow } from "@/lib/data/planning";
import { cn } from "@/lib/utils";
import type { Cliente, Praticienne, RendezVous } from "@/lib/data/types";

/** Vue calendrier de l'Accueil (ADR 0019, palette ADR 0022) — rail heures + une colonne, un bloc
 *  = une réservation entière (grain réservation, pas rendez-vous), positionné sur son passage
 *  `start → end`. Réservations simultanées (peu importe la praticienne) posées côte à côte par
 *  lane-packing glouton. Chaque bloc porte une couleur de famille (rotation déterministe sur
 *  l'ordre chronologique du jour) — seule exception à la doctrine « un seul signal », voir
 *  ADR 0022. */
const SLOT_MIN = 30;
const SLOT_H = 64; // px per 30 min — assez pour que le contenu d'un bloc ne soit jamais rogné
const MIN_CARD_H = 118; // hauteur plancher : temps + nom + composition + avatars, jamais coupés
const RAIL_W = 56;
const LANE_MIN_W = 232;
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

const PALETTE = [
  { bg: "var(--cal-amber-bg)", fg: "var(--cal-amber-fg)" },
  { bg: "var(--cal-lilac-bg)", fg: "var(--cal-lilac-fg)" },
  { bg: "var(--cal-rose-bg)", fg: "var(--cal-rose-fg)" },
  { bg: "var(--cal-mint-bg)", fg: "var(--cal-mint-fg)" },
  { bg: "var(--cal-sky-bg)", fg: "var(--cal-sky-fg)" },
] as const;

type Placed = { row: ReservationDayRow; top: number; lane: number; hue: number };

/** Lane packing glouton — deux réservations qui se chevauchent dans le temps (n'importe quelle
 *  praticienne) sont posées côte à côte plutôt que superposées. La couleur suit l'ordre
 *  chronologique du jour, pas la lane, pour éviter que deux voisines dans le temps se ressemblent. */
function pack(rows: ReservationDayRow[]): { placed: Placed[]; lanes: number } {
  const sorted = [...rows].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  const laneEnds: number[] = [];
  const placed = sorted.map((row, i) => {
    const start = timeToMinutes(row.start);
    const end = timeToMinutes(row.end);
    let lane = laneEnds.findIndex((e) => e <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }
    return { row, top: start, lane, hue: i % PALETTE.length };
  });
  return { placed, lanes: Math.max(1, laneEnds.length) };
}

export function AccueilCalendar({ rows, clients, praticiennes, onOpenReservation }: Props) {
  const now = currentMinute();

  const { gridStart, gridEnd } = useMemo(() => {
    const marks = rows.flatMap((r) => [timeToMinutes(r.start), timeToMinutes(r.end)]);
    const lo = marks.length ? Math.min(...marks) : 10 * 60;
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

  const staffOf = (id: string) => praticiennes.find((p) => p.id === id);

  return (
    <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100 p-4 [scrollbar-width:thin]">
      <div className="relative flex" style={{ height: bodyH + 12, paddingTop: 12, minWidth: RAIL_W + lanes * LANE_MIN_W }}>
        <div className="shrink-0 border-r border-base-300" style={{ width: RAIL_W }}>
          {hourMarks.map((m, i) => (
            <div key={m} className="relative" style={{ height: i === hourMarks.length - 1 ? 0 : SLOT_H * 2 }}>
              <span
                className={cn(
                  "absolute right-3 text-xs font-semibold tabular-nums text-base-content/40",
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

          {placed.map(({ row, lane, hue }) => {
            const { reservation } = row;
            const payer = clients.find((c) => c.id === reservation.payerClientId);
            const startMin = timeToMinutes(row.start);
            const endMin = timeToMinutes(row.end);
            const top = y(startMin);
            const h = Math.max(y(endMin) - top, MIN_CARD_H);
            const composition = reservationComposition(reservation);
            const hasSale = Boolean(reservation.saleId);
            const phase = endMin <= now ? "past" : startMin <= now ? "current" : "upcoming";
            const awaitingCheckout = phase === "past" && !hasSale;
            const staffList = row.staffIds.map(staffOf).filter((p): p is Praticienne => Boolean(p));
            const visibleAvatars = staffList.slice(0, MAX_AVATARS);
            const hiddenAvatars = staffList.length - visibleAvatars.length;
            const target = row.rendezVous[0];
            const payerName = payer ? clientFullName(payer) : "Cliente";
            const { bg, fg } = PALETTE[hue];

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
                  </div>
                }
              >
                <button
                  type="button"
                  onClick={() => target && onOpenReservation(target)}
                  style={{
                    top,
                    height: h,
                    left: `calc(${(lane / lanes) * 100}% + 5px)`,
                    width: `calc(${100 / lanes}% - 10px)`,
                    backgroundColor: bg,
                    borderTop: `3px solid ${fg}`,
                  }}
                  className={cn(
                    "absolute flex flex-col gap-1.5 overflow-hidden rounded-2xl px-3.5 py-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:z-10 hover:shadow-[0_6px_16px_rgba(0,0,0,0.14)] active:opacity-80",
                    phase === "past" && !awaitingCheckout && "opacity-60",
                  )}
                >
                  <span className="flex items-center justify-between gap-1">
                    <span className="truncate text-xs font-bold tabular-nums" style={{ color: fg }}>
                      {row.start}
                    </span>
                    {awaitingCheckout && (
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-warning ring-2 ring-base-100">
                        <span className="size-1.5 rounded-full bg-base-100" />
                      </span>
                    )}
                  </span>
                  <span className="truncate text-[0.95rem] font-semibold text-base-content">{payerName}</span>
                  {/* line-clamp plutôt que truncate (audit UX du 19/09) : une composition comme
                      « 2 enfants » ne doit jamais être coupée à mi-mot sur une lane étroite. */}
                  <span className="line-clamp-2 text-xs leading-snug text-base-content/60">{composition}</span>
                  {visibleAvatars.length > 0 && (
                    <span className="mt-auto flex items-center pt-1">
                      {visibleAvatars.map((p, i) => (
                        <Avatar
                          key={p.id}
                          photoUrl={p.photoUrl}
                          initial={p.initial}
                          size={26}
                          className={cn("bg-base-100 text-xs font-bold text-base-content ring-2 ring-base-100", i > 0 && "-ml-2.5")}
                        />
                      ))}
                      {hiddenAvatars > 0 && (
                        <span
                          className="-ml-2.5 flex size-[26px] shrink-0 items-center justify-center rounded-full text-xs font-bold text-base-100 ring-2 ring-base-100"
                          style={{ backgroundColor: fg }}
                        >
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
