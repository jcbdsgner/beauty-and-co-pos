"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Eye, GripVertical, MoreHorizontal, Undo2, UserX, Users } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { DropdownMenu } from "@/components/ui/molecules/dropdown-menu";
import { clientFullName } from "@/lib/data/clientele";
import { serviceById } from "@/lib/data/menu";
import { appointmentEndTime, formatHour, minutesToTime, timeToMinutes, type RendezVousRow } from "@/lib/data/planning";
import { praticienneAccent } from "@/lib/data/praticienne-colors";
import { scheduleFor } from "@/lib/data/praticiennes";
import { useAppStore } from "@/lib/store/app-store";
import { cn } from "@/lib/utils";
import type { Cliente, DayHours, Praticienne, RendezVous } from "@/lib/data/types";

/**
 * « Planning · Jour » — reconstruit à la lettre du Figma (node 270:2466, ADR 0025), puis basculé
 * en vertical (même principe, axe renversé) : une colonne par praticienne, le temps défile verticalement, les
 * rendez-vous sont positionnés dedans (début + durée), côte à côte en sous-colonnes quand deux se
 * chevauchent (`pack`) — une praticienne ne peut jamais paraître faire deux prestations à la fois.
 * Un bloc affiche l'heure et la cliente assise dans le fauteuil (bénéficiaire, sinon la payeuse) ;
 * la prestation suit en gris, en information secondaire, seulement si le bloc a la hauteur. Zone grisée = hors de l'horaire hebdomadaire du
 * jour affiché ; colonne entière grisée = jour de repos. C'est la seule surface du Planning — pas
 * de sidebar de filtre séparée (le Figma n'en a pas) : la poignée de glisser-déposer, l'isolement
 * et l'absence vivent directement sur l'en-tête de colonne, comme avant sur l'étiquette de ligne.
 * Le trait "maintenant" est dans la couleur de marque (`bg-primary`), pas ambre : il repère l'heure
 * courante, ce n'est pas un signal « à traiter » (doctrine du seul signal ambre).
 */
const SLOT_MIN = 30;
const SLOT_H = 56; // px per 30 min
const TIME_COL_W = 52;
const HEADER_H = 72;
/** Hauteur à partir de laquelle un bloc a la place d'afficher la prestation sous la cliente. */
const SHOW_SERVICE_MIN_H = 60;
const LANE_W = 192; // wide enough that a header keeps most praticienne names unabridged (parity with the old 208px row label)

type Props = {
  date: Date;
  isToday: boolean;
  staff: Praticienne[];
  /** Index stable de chaque praticienne dans l'équipe planifiable — pilote la couleur d'accent. */
  accentIndex: Map<string, number>;
  rows: RendezVousRow[];
  isolatedId: string | null;
  onOpenReservation: (rv: RendezVous) => void;
  onIsolate: (id: string) => void;
  onShowAll: () => void;
  onMarkAbsent: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
};

/** Qui est dans le fauteuil : la bénéficiaire (fiche ou nom libre), sinon la payeuse. */
function chairClientName(row: RendezVousRow, clients: Cliente[]): string {
  const { rv, reservation } = row;
  const id = rv.beneficiaryClientId ?? (rv.beneficiaryName ? undefined : reservation.payerClientId);
  if (id) {
    const c = clients.find((x) => x.id === id);
    if (c) return clientFullName(c);
  }
  return rv.beneficiaryName ?? "Cliente";
}

type Placed = { row: RendezVousRow; start: number; end: number; lane: number };

/** Greedy lane packing so two rendez-vous that overlap on one praticienne stack instead of hiding
 *  each other — side-by-side sub-lanes within a column. */
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
 *  ces rendez-vous, pour ne jamais griser une colonne qui a pourtant un rendez-vous dedans. */
function effectiveHours(nominal: DayHours | undefined, col: RendezVousRow[]): DayHours | undefined {
  if (nominal) return nominal;
  if (col.length === 0) return undefined;
  const starts = col.map((r) => timeToMinutes(r.rv.start));
  const ends = col.map((r) => timeToMinutes(appointmentEndTime(r.rv)));
  return { start: minutesToTime(Math.min(...starts)), end: minutesToTime(Math.max(...ends)) };
}

export function DayTimeline({
  date,
  isToday,
  staff,
  accentIndex,
  rows,
  isolatedId,
  onOpenReservation,
  onIsolate,
  onShowAll,
  onMarkAbsent,
  onReorder,
}: Props) {
  const clients = useAppStore((s) => s.clients);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const { gridStart, gridEnd } = useMemo(() => {
    const marks: number[] = [];
    for (const p of staff) {
      const h = scheduleFor(p, date);
      if (h) marks.push(timeToMinutes(h.start), timeToMinutes(h.end));
    }
    for (const r of rows) marks.push(timeToMinutes(r.rv.start), timeToMinutes(appointmentEndTime(r.rv)));
    const lo = marks.length ? Math.min(...marks) : 10 * 60;
    const hi = marks.length ? Math.max(...marks) : 19 * 60;
    const flooredLo = Math.floor(lo / 60) * 60;
    return { gridStart: flooredLo, gridEnd: Math.max(Math.ceil(hi / 60) * 60, flooredLo + 4 * 60) };
  }, [staff, rows, date]);

  const y = (min: number) => ((min - gridStart) / SLOT_MIN) * SLOT_H;
  const bodyH = y(gridEnd);
  const hourMarks: number[] = [];
  for (let m = gridStart; m <= gridEnd; m += 60) hourMarks.push(m);

  // Rendu client-only : `now` dépend de l'heure d'exécution, qui diverge entre le rendu serveur et
  // l'hydratation client (React hydration mismatch). On n'affiche le trait "maintenant" qu'après montage.
  const mounted = useMounted();
  const now = nowMinutes();
  const showNow = mounted && isToday && now > gridStart && now < gridEnd;

  const columns = useMemo(
    () =>
      staff.map((p) => {
        const col = rows.filter((r) => r.rv.staffId === p.id || r.rv.secondStaffId === p.id);
        const nominal = scheduleFor(p, date);
        const hours = effectiveHours(nominal, col);
        const { placed, lanes } = pack(col);
        const colW = Math.max(LANE_W, lanes * (LANE_W - 8) + 16);
        const absent = isToday && p.unavailableToday;
        const accent = praticienneAccent(accentIndex.get(p.id) ?? 0);
        const beforeH = hours ? y(timeToMinutes(hours.start)) : bodyH;
        const afterStart = hours ? y(timeToMinutes(hours.end)) : 0;
        return { p, hours, placed, colW, absent, accent, beforeH, afterStart };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [staff, rows, date, isToday, accentIndex, gridStart, gridEnd],
  );

  if (staff.length === 0) {
    return <div className="px-6 py-14 text-center text-sm text-base-content/45">Aucune praticienne sélectionnée.</div>;
  }

  const totalContentW = TIME_COL_W + columns.reduce((sum, c) => sum + c.colW, 0);

  return (
    <div className="max-h-[65vh] overflow-auto [scrollbar-width:thin]">
      <div className="relative" style={{ minWidth: totalContentW }}>
        <div className="flex">
          {/* ── time ruler ── */}
          <div className="sticky left-0 z-20 shrink-0" style={{ width: TIME_COL_W }}>
            <div className="sticky top-0 z-30 border-b border-r border-base-300 bg-base-200/40" style={{ height: HEADER_H }} />
            <div className="relative border-r border-base-300 bg-base-200/40" style={{ height: bodyH }}>
              {hourMarks.map((m) => (
                <span
                  key={m}
                  className="absolute right-1.5 -translate-y-1/2 text-[0.68rem] font-semibold tabular-nums text-base-content/45"
                  style={{ top: y(m) }}
                >
                  {formatHour(`${Math.floor(m / 60)}:00`)}
                </span>
              ))}
            </div>
          </div>

          {/* ── columns ── */}
          {columns.map(({ p, hours, placed, colW, absent, accent, beforeH, afterStart }) => (
            <div key={p.id} className="flex shrink-0 flex-col border-r border-base-300 last:border-r-0" style={{ width: colW }}>
              {/* column header */}
              <div
                draggable
                onDragStart={(e) => {
                  setDraggedId(p.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => {
                  setDraggedId(null);
                  setOverId(null);
                }}
                onDragOver={(e) => {
                  if (!draggedId || draggedId === p.id) return;
                  e.preventDefault();
                  setOverId(p.id);
                }}
                onDragLeave={() => setOverId((id) => (id === p.id ? null : id))}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedId && draggedId !== p.id) onReorder(draggedId, p.id);
                  setDraggedId(null);
                  setOverId(null);
                }}
                className={cn(
                  "sticky top-0 z-10 flex items-center gap-2 border-b border-t-[3px] border-base-300 bg-base-100 px-2.5",
                  absent && "bg-warning/5",
                  draggedId === p.id && "opacity-40",
                  overId === p.id && draggedId && draggedId !== p.id && "ring-2 ring-inset ring-primary/60",
                )}
                style={{ height: HEADER_H, borderTopColor: absent ? undefined : accent.border }}
              >
                <GripVertical aria-hidden className="size-3.5 shrink-0 cursor-grab text-base-content/25 active:cursor-grabbing" />
                <Avatar
                  photoUrl={p.photoUrl}
                  initial={p.initial}
                  size={32}
                  className={cn("shrink-0 text-[0.72rem] font-semibold", absent && "bg-base-200 text-base-content/40")}
                  style={absent ? undefined : { backgroundColor: accent.border, color: "#fff" }}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className="flex items-center gap-1.5 truncate font-[family-name:var(--font-heading)] text-[13px] font-semibold"
                    style={{ color: absent ? undefined : accent.text }}
                  >
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
                    { label: "Isoler cette colonne", icon: <Eye className="size-4" />, onSelect: () => onIsolate(p.id) },
                    ...(isolatedId
                      ? [{ label: "Afficher toute l'équipe", icon: <Undo2 className="size-4" />, onSelect: onShowAll }]
                      : []),
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

              {/* column body */}
              <div className="relative" style={{ height: bodyH }}>
                {!hours && (
                  <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center bg-base-300/60">
                    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-base-content/40">Repos</span>
                  </div>
                )}
                {hours && beforeH > 0 && (
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 bg-base-300/60" style={{ height: beforeH }} />
                )}
                {hours && afterStart < bodyH && (
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 bg-base-300/60" style={{ top: afterStart, bottom: 0 }} />
                )}
                {hourMarks.map((m) =>
                  m === gridStart ? null : (
                    <div key={m} aria-hidden className="pointer-events-none absolute inset-x-0 border-t border-base-300/60" style={{ top: y(m) }} />
                  ),
                )}
                {absent && <div aria-hidden className="pointer-events-none absolute inset-0 bg-warning/10" />}

                {placed.map(({ row, lane }) => {
                  const { rv } = row;
                  const top = y(timeToMinutes(rv.start));
                  const h = Math.max((rv.durationMin / SLOT_MIN) * SLOT_H, SLOT_H - 6);
                  const svc = serviceById(rv.serviceId);
                  const isSecond = rv.secondStaffId === p.id && rv.staffId !== p.id;
                  const who = chairClientName(row, clients);
                  return (
                    <button
                      key={rv.id + p.id}
                      type="button"
                      onClick={() => onOpenReservation(rv)}
                      title={`${rv.start} · ${who} · ${svc?.name ?? "Prestation"}`}
                      style={{
                        top,
                        left: 8 + lane * (LANE_W - 8),
                        width: LANE_W - 14,
                        height: h,
                        backgroundColor: accent.bg,
                        borderColor: accent.border,
                        borderLeftColor: accent.border,
                      }}
                      className={cn(
                        "absolute flex flex-col justify-start gap-0.5 overflow-hidden rounded-field border border-l-[3px] px-2.5 py-1.5 text-left shadow-sm transition hover:z-10 hover:shadow-md hover:brightness-[0.97] active:opacity-70",
                        isSecond && "opacity-75",
                      )}
                    >
                      <span className="flex items-center gap-1 text-[0.64rem] font-bold tabular-nums" style={{ color: accent.text }}>
                        {rv.start}
                        {rv.secondStaffId && <Users aria-hidden className="size-3" />}
                      </span>
                      <span className="truncate text-xs font-semibold text-base-content">{who}</span>
                      {h >= SHOW_SERVICE_MIN_H && (
                        <span className="line-clamp-2 text-[0.68rem] leading-snug text-base-content/50">{svc?.name ?? "Prestation"}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── "maintenant" — couleur de marque, pas ambre : repère l'heure, pas un signal ── */}
        {showNow && (
          <div
            aria-hidden
            className="pointer-events-none absolute z-20 h-px bg-primary"
            style={{ top: HEADER_H + y(now), left: TIME_COL_W, width: totalContentW - TIME_COL_W }}
          >
            <span className="absolute -left-[3px] -top-[3px] size-[7px] rounded-full bg-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
