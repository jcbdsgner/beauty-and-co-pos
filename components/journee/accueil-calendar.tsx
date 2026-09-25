"use client";

import { useMemo } from "react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Tooltip } from "@/components/ui/atoms/tooltip";
import { clientFullName } from "@/lib/data/clientele";
import { serviceById } from "@/lib/data/menu";
import { reservationComposition, timeToMinutes, type ReservationDayRow } from "@/lib/data/planning";
import { cn } from "@/lib/utils";
import type { Cliente, Praticienne, RendezVous } from "@/lib/data/types";

/** Vue calendrier de l'Accueil (ADR 0019, rendu ADR 0033) — rail heures + une colonne, un bloc
 *  = une réservation entière (grain réservation, pas rendez-vous), positionné à son heure de
 *  début. Tous les blocs partagent un même fond rosé sans contour ; chacun liste ses prestations
 *  et les praticiennes en avatars. Un bloc n'est jamais rogné : il grandit au-delà de sa durée si
 *  son contenu l'exige, et le lane-packing se fait donc sur l'emprise en pixels, pas sur les
 *  seules heures — deux blocs ne se chevauchent jamais à l'écran. */
const SLOT_MIN = 30;
const SLOT_H = 90; // px per 30 min — une réservation d'1h à 2 prestations tient dans sa durée
const RAIL_W = 56;
const LANE_MIN_W = 248;
const MAX_AVATARS = 4;
const MAX_SERVICES = 4;
const AVATAR = 34;

/* Hauteurs de ligne du bloc — gardées en phase avec les classes `leading-*` du rendu, pour
 * calculer la hauteur plancher d'un bloc avant de le poser. */
const PAD_Y = 12; // py-3
const ROW_GAP = 4; // gap-1
const TIME_H = 16;
const NAME_H = 22;
const COMPO_H = 16;
const SERVICES_TOP = 6;
const SERVICE_H = 18;
const AVATARS_TOP = 10;
const CARD_GAP = 6; // espace vertical sous chaque bloc

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

/** Minute du jour → ordonnée en px dans la colonne. */
function yOf(min: number, gridStart: number): number {
  return ((min - gridStart) / SLOT_MIN) * SLOT_H;
}

type ServiceLine = { id: string; name: string; count: number };

/** Prestations actives d'une réservation, regroupées : deux fois la même prestation → « ×2 ». */
function serviceLines(rendezVous: RendezVous[]): ServiceLine[] {
  const lines = new Map<string, ServiceLine>();
  for (const rv of rendezVous) {
    if (rv.status === "annule") continue;
    const line = lines.get(rv.serviceId);
    if (line) line.count += 1;
    else lines.set(rv.serviceId, { id: rv.serviceId, name: serviceById(rv.serviceId)?.name ?? "Prestation", count: 1 });
  }
  return [...lines.values()];
}

function contentHeight(services: number, hasAvatars: boolean): number {
  const shown = Math.min(services, MAX_SERVICES) + (services > MAX_SERVICES ? 1 : 0);
  return (
    PAD_Y * 2 +
    TIME_H +
    ROW_GAP +
    NAME_H +
    ROW_GAP +
    COMPO_H +
    (shown > 0 ? SERVICES_TOP + shown * SERVICE_H : 0) +
    (hasAvatars ? AVATARS_TOP + AVATAR : 0)
  );
}

type Placed = { row: ReservationDayRow; services: ServiceLine[]; top: number; height: number; lane: number };

/** Lane packing glouton sur l'emprise en pixels — un bloc plus haut que sa durée repousse ses
 *  voisins dans une autre lane au lieu de les recouvrir. */
function pack(rows: ReservationDayRow[], gridStart: number): { placed: Placed[]; lanes: number; bottom: number } {
  const sorted = [...rows].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  const y = (min: number) => yOf(min, gridStart);
  const laneEnds: number[] = [];
  let bottom = 0;
  const placed = sorted.map((row) => {
    const services = serviceLines(row.rendezVous);
    const top = y(timeToMinutes(row.start));
    const span = y(timeToMinutes(row.end)) - top;
    const height = Math.max(span, contentHeight(services.length, row.staffIds.length > 0) + CARD_GAP);
    let lane = laneEnds.findIndex((e) => e <= top);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(top + height);
    } else {
      laneEnds[lane] = top + height;
    }
    bottom = Math.max(bottom, top + height);
    return { row, services, top, height, lane };
  });
  return { placed, lanes: Math.max(1, laneEnds.length), bottom };
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

  const y = (min: number) => yOf(min, gridStart);
  const { placed, lanes, bottom } = useMemo(() => pack(rows, gridStart), [rows, gridStart]);
  const bodyH = Math.max(y(gridEnd), bottom);
  const hourMarks: number[] = [];
  for (let m = gridStart; y(m) <= bodyH; m += 60) hourMarks.push(m);
  const showNow = now > gridStart && now < gridEnd;

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

          {placed.map(({ row, services, top, height, lane }) => {
            const { reservation } = row;
            const payer = clients.find((c) => c.id === reservation.payerClientId);
            const startMin = timeToMinutes(row.start);
            const endMin = timeToMinutes(row.end);
            const composition = reservationComposition(reservation);
            const hasSale = Boolean(reservation.saleId);
            const phase = endMin <= now ? "past" : startMin <= now ? "current" : "upcoming";
            const awaitingCheckout = phase === "past" && !hasSale;
            const staffList = row.staffIds.map(staffOf).filter((p): p is Praticienne => Boolean(p));
            const visibleAvatars = staffList.slice(0, MAX_AVATARS);
            const hiddenAvatars = staffList.length - visibleAvatars.length;
            const visibleServices = services.slice(0, MAX_SERVICES);
            const hiddenServices = services.length - visibleServices.length;
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
                    {services.map((s) => (
                      <span key={s.id} className="opacity-80">
                        {s.name}
                        {s.count > 1 && ` ×${s.count}`}
                      </span>
                    ))}
                    {staffList.length > 0 && <span className="opacity-80">{staffList.map((p) => p.name).join(", ")}</span>}
                  </div>
                }
              >
                <button
                  type="button"
                  onClick={() => target && onOpenReservation(target)}
                  style={{
                    top,
                    height: height - CARD_GAP,
                    left: `calc(${(lane / lanes) * 100}% + 5px)`,
                    width: `calc(${100 / lanes}% - 10px)`,
                  }}
                  className={cn(
                    "absolute flex flex-col gap-1 overflow-hidden rounded-2xl bg-[var(--cal-card)] px-4 py-3 text-left [&>*]:shrink-0 transition hover:z-10 hover:brightness-[0.97] active:opacity-80",
                    phase === "past" && !awaitingCheckout && "opacity-60",
                  )}
                >
                  <span className="flex items-center justify-between gap-1 leading-4">
                    <span className="truncate text-xs font-bold tabular-nums text-primary">
                      {row.start} – {row.end}
                    </span>
                    {awaitingCheckout && (
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-warning ring-2 ring-[var(--cal-card)]">
                        <span className="size-1.5 rounded-full bg-base-100" />
                      </span>
                    )}
                  </span>
                  <span className="truncate text-[0.95rem] font-semibold leading-[22px] text-base-content">{payerName}</span>
                  <span className="truncate text-xs leading-4 text-base-content/60">{composition}</span>
                  {visibleServices.length > 0 && (
                    <ul className="flex flex-col pt-1.5">
                      {visibleServices.map((s) => (
                        <li key={s.id} className="flex items-center gap-2 text-xs leading-[18px] text-base-content/80">
                          <span aria-hidden className="size-1 shrink-0 rounded-full bg-primary/60" />
                          <span className="truncate">{s.name}</span>
                          {s.count > 1 && <span className="shrink-0 font-semibold tabular-nums text-base-content/60">×{s.count}</span>}
                        </li>
                      ))}
                      {hiddenServices > 0 && (
                        <li className="pl-3 text-xs leading-[18px] text-base-content/50">
                          +{hiddenServices} autre{hiddenServices > 1 ? "s" : ""}
                        </li>
                      )}
                    </ul>
                  )}
                  {visibleAvatars.length > 0 && (
                    <span className="mt-auto flex items-center pt-2.5">
                      {visibleAvatars.map((p, i) => (
                        <Avatar
                          key={p.id}
                          photoUrl={p.photoUrl}
                          initial={p.initial}
                          size={AVATAR}
                          className={cn(
                            "bg-base-100 text-sm font-bold text-base-content ring-2 ring-[var(--cal-card)]",
                            i > 0 && "-ml-3",
                          )}
                        />
                      ))}
                      {hiddenAvatars > 0 && (
                        <span
                          className="-ml-3 flex shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-content ring-2 ring-[var(--cal-card)]"
                          style={{ width: AVATAR, height: AVATAR }}
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
