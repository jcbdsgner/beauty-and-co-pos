"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ArrowLeftRight, Eye, GripVertical, MoreHorizontal, Plus, Undo2, UserX, Users } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { DropdownMenu } from "@/components/ui/molecules/dropdown-menu";
import { clientFullName } from "@/lib/data/clientele";
import { serviceById } from "@/lib/data/menu";
import { salonById } from "@/lib/data/entreprises";
import {
  GRID_END,
  SALON_CLOSING,
  SALON_OPENING,
  appointmentEndTime,
  formatHour,
  minutesToTime,
  timeToMinutes,
  type RendezVousRow,
} from "@/lib/data/planning";
import { praticienneAccent } from "@/lib/data/praticienne-colors";
import { atSalonLabel, shiftsFor } from "@/lib/data/praticiennes";
import { useAppStore } from "@/lib/store/app-store";
import { cn } from "@/lib/utils";
import type { Cliente, Praticienne, RendezVous, Shift } from "@/lib/data/types";

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
 *
 * ADR 0036 : la grille court de 10h à 22h, la tranche 20h–22h grisée « Fermé » (le mot écrit une
 * fois, dans le rail). Une praticienne peut changer de salon dans la journée : sa plage dans
 * l'autre salon est hachurée et nommée (« Aux Almadies »), le battement entre deux salons est son
 * « Trajet ». En « Tous les salons », l'en-tête dit où elle est.
 *
 * Un clic sur une demi-heure libre de sa plage (ni passée, ni prise, ni hors horaire) ouvre
 * « Créer un rendez-vous » pré-réglé sur ce jour, cette heure, ce salon et cette praticienne.
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
  /** Salon regardé — `null` = « Tous les salons ». */
  salonId: string | null;
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
  /** Clic sur une demi-heure libre : praticienne, heure (« 10:30 ») et salon de sa plage. */
  onPickSlot?: (staffId: string, start: string, salonId: string) => void;
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

/** Les plages nominales du jour, ou — si aucune (repos) mais que des rendez-vous existent quand
 *  même ce jour-là (donnée de démonstration désalignée avec l'horaire type) — une plage dérivée de
 *  ces rendez-vous, pour ne jamais griser une colonne qui a pourtant un rendez-vous dedans. */
function effectiveShifts(nominal: Shift[], col: RendezVousRow[]): Shift[] {
  if (nominal.length > 0) return nominal;
  if (col.length === 0) return [];
  const starts = col.map((r) => timeToMinutes(r.rv.start));
  const ends = col.map((r) => timeToMinutes(appointmentEndTime(r.rv)));
  return [{ start: minutesToTime(Math.min(...starts)), end: minutesToTime(Math.max(...ends)), salonId: col[0].rv.salonId }];
}

/** Une zone grisée d'une colonne : hors horaire, dans l'autre salon (hachurée), ou trajet. */
type Zone = { from: number; to: number; kind: "off" | "elsewhere" | "transit"; label?: string; sub?: string };

/** Découpe la journée [ouverture, fermeture] d'une colonne en zones grisées autour de ses plages
 *  « ici » (le salon regardé, ou toutes en « Tous les salons »). */
function zonesFor(shifts: Shift[], salonId: string | null, from: number, to: number): Zone[] {
  const zones: Zone[] = [];
  let cursor = from;
  shifts.forEach((s, i) => {
    const start = timeToMinutes(s.start);
    const end = timeToMinutes(s.end);
    const prev = shifts[i - 1];
    if (start > cursor) {
      const transit = prev && prev.salonId !== s.salonId;
      zones.push(
        transit
          ? { from: cursor, to: start, kind: "transit", label: "Trajet", sub: salonId ? undefined : `vers ${salonById(s.salonId)?.name ?? "l'autre salon"}` }
          : { from: cursor, to: start, kind: "off" },
      );
    }
    if (salonId && s.salonId !== salonId) zones.push({ from: start, to: end, kind: "elsewhere", label: atSalonLabel(s.salonId) });
    cursor = Math.max(cursor, end);
  });
  if (cursor < to) zones.push({ from: cursor, to, kind: "off" });
  return zones;
}

/** Hachures discrètes de la zone « dans l'autre salon » — posées sur le même gris que le hors horaire. */
const HATCH = "repeating-linear-gradient(135deg, transparent 0 7px, color-mix(in oklab, var(--color-base-content) 7%, transparent) 7px 8px)";

/** Sous-titre d'en-tête de colonne : ses heures ici, et — en « Tous les salons » — où elle est
 *  (« Sea Plaza », ou « ⇆ Almadies » — celui où elle finit — quand elle change de salon). */
function shiftCaption(shifts: Shift[], salonId: string | null): { hours: string; salons?: string; moves: boolean; title: string } {
  const name = (id: string) => salonById(id)?.name ?? "Autre salon";
  const hours = (s: Shift) => `${formatHour(s.start)}–${formatHour(s.end)}`;
  const title = shifts.map((s) => `${name(s.salonId)} ${hours(s)}`).join(", ");
  const salons = [...new Set(shifts.map((s) => s.salonId))];
  // Salon regardé : ses heures ici seulement — la colonne dit déjà, en zone hachurée, où elle est
  // le reste du temps.
  // Tous les salons, journée coupée entre deux salons : l'amplitude — la zone « Trajet » montre le battement.
  const here = salonId ? shifts.filter((s) => s.salonId === salonId) : shifts;
  const span = !salonId && salons.length > 1;
  return {
    hours: span ? `${formatHour(shifts[0].start)}–${formatHour(shifts[shifts.length - 1].end)}` : here.map(hours).join(" · "),
    // Journée coupée : le salon où elle finit, précédé de ⇆ — « Sea Plaza → Almadies » ne tient pas
    // dans la colonne ; l'heure du changement se lit au bas de la zone « Trajet ».
    salons: salonId ? undefined : span ? name(shifts[shifts.length - 1].salonId) : name(salons[0]),
    moves: salons.length > 1,
    title,
  };
}

export function DayTimeline({
  date,
  salonId,
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
  onPickSlot,
}: Props) {
  const clients = useAppStore((s) => s.clients);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hoverSlot, setHoverSlot] = useState<{ staffId: string; min: number } | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Toujours 10h → 22h (ADR 0036) ; ne s'élargit que si une donnée tombe en dehors.
  const { gridStart, gridEnd } = useMemo(() => {
    const marks = rows.flatMap((r) => [timeToMinutes(r.rv.start), timeToMinutes(appointmentEndTime(r.rv))]);
    const lo = Math.min(timeToMinutes(SALON_OPENING), ...marks);
    const hi = Math.max(timeToMinutes(GRID_END), ...marks);
    return { gridStart: Math.floor(lo / 60) * 60, gridEnd: Math.ceil(hi / 60) * 60 };
  }, [rows]);

  const y = (min: number) => ((min - gridStart) / SLOT_MIN) * SLOT_H;
  const bodyH = y(gridEnd);
  const closing = timeToMinutes(SALON_CLOSING);
  const closedTop = y(closing);
  const hourMarks: number[] = [];
  for (let m = gridStart; m <= gridEnd; m += 60) hourMarks.push(m);

  // Rendu client-only : `now` dépend de l'heure d'exécution, qui diverge entre le rendu serveur et
  // l'hydratation client (React hydration mismatch). On n'affiche le trait "maintenant" qu'après montage.
  const mounted = useMounted();
  const now = nowMinutes();
  const showNow = mounted && isToday && now > gridStart && now < gridEnd;

  /** Le salon de la demi-heure `min` si elle est réservable pour cette colonne, sinon `null`. */
  function slotSalon(shifts: Shift[], placed: Placed[], absent: boolean | undefined, min: number): string | null {
    if (absent || min + SLOT_MIN > closing || (isToday && min <= now)) return null;
    const shift = shifts.find(
      (s) => (!salonId || s.salonId === salonId) && timeToMinutes(s.start) <= min && min + SLOT_MIN <= timeToMinutes(s.end),
    );
    if (!shift) return null;
    if (placed.some((pl) => min < pl.end && pl.start < min + SLOT_MIN)) return null;
    return shift.salonId;
  }

  const columns = useMemo(
    () =>
      staff.map((p) => {
        const col = rows.filter((r) => r.rv.staffId === p.id || r.rv.secondStaffId === p.id);
        const shifts = effectiveShifts(shiftsFor(p, date), col);
        const { placed, lanes } = pack(col);
        const colW = Math.max(LANE_W, lanes * (LANE_W - 8) + 16);
        const absent = isToday && p.unavailableToday;
        const accent = praticienneAccent(accentIndex.get(p.id) ?? 0);
        const zones = shifts.length ? zonesFor(shifts, salonId, gridStart, closing) : [];
        const caption = shifts.length ? shiftCaption(shifts, salonId) : null;
        return { p, shifts, placed, colW, absent, accent, zones, caption };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [staff, rows, date, salonId, isToday, accentIndex, gridStart, gridEnd],
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
              {/* 20h → 22h : le salon est fermé — le mot une seule fois, ici. */}
              <div aria-hidden className="absolute inset-x-0 bottom-0 border-t border-base-content/15 bg-base-300/80" style={{ top: closedTop }}>
                <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-base-content/45">
                  Fermé
                </span>
              </div>
              {hourMarks
                .filter((m) => m <= closing)
                .map((m) => (
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
          {columns.map(({ p, shifts, placed, colW, absent, accent, zones, caption }) => (
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
                  className={cn("shrink-0 text-[0.72rem] font-semibold", absent && "bg-base-200 text-base-content/60")}
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
                  <p
                    title={!absent && caption ? caption.title : undefined}
                    className={cn(
                      "flex items-center gap-1 truncate text-[0.7rem] tabular-nums",
                      absent ? "font-semibold text-warning" : "text-base-content/45",
                    )}
                  >
                    {!absent && caption?.moves && !caption.salons && (
                      <ArrowLeftRight aria-hidden className="size-3 shrink-0 text-base-content/55" />
                    )}
                    <span className="truncate">{absent ? "Absente" : caption ? caption.hours : "Repos"}</span>
                  </p>
                  {!absent && caption?.salons && (
                    <p className="flex items-center gap-1 truncate text-[0.66rem] text-base-content/50">
                      {caption.moves && <ArrowLeftRight aria-hidden className="size-3 shrink-0" />}
                      <span className="truncate">{caption.salons}</span>
                    </p>
                  )}
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
              <div
                className={cn("relative", onPickSlot && hoverSlot?.staffId === p.id && "cursor-pointer")}
                style={{ height: bodyH }}
                onMouseMove={(e) => {
                  if (!onPickSlot) return;
                  if (e.target !== e.currentTarget) return setHoverSlot(null);
                  const offset = e.clientY - e.currentTarget.getBoundingClientRect().top;
                  const min = gridStart + Math.floor(offset / SLOT_H) * SLOT_MIN;
                  const ok = slotSalon(shifts, placed, absent, min) !== null;
                  setHoverSlot((h) => (!ok ? null : h?.staffId === p.id && h.min === min ? h : { staffId: p.id, min }));
                }}
                onMouseLeave={() => setHoverSlot(null)}
                onClick={(e) => {
                  if (!onPickSlot || e.target !== e.currentTarget) return;
                  const offset = e.clientY - e.currentTarget.getBoundingClientRect().top;
                  const min = gridStart + Math.floor(offset / SLOT_H) * SLOT_MIN;
                  const salon = slotSalon(shifts, placed, absent, min);
                  if (salon) onPickSlot(p.id, minutesToTime(min), salon);
                }}
              >
                {shifts.length === 0 && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center bg-base-300/60"
                    style={{ height: closedTop }}
                  >
                    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-base-content/60">Repos</span>
                  </div>
                )}
                {zones.map((z) => {
                  const h = y(z.to) - y(z.from);
                  return (
                    <div
                      key={`${z.kind}-${z.from}`}
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 flex flex-col items-center justify-center gap-0.5 bg-base-300/60 px-2 text-center"
                      style={{ top: y(z.from), height: h, backgroundImage: z.kind === "elsewhere" ? HATCH : undefined }}
                    >
                      {z.label && h >= 36 && (
                        <span className="rounded-full bg-base-100/85 px-2 py-0.5 text-[0.66rem] font-semibold text-base-content/55">
                          {z.label}
                        </span>
                      )}
                      {z.sub && h >= 56 && <span className="text-[0.64rem] text-base-content/45">{z.sub}</span>}
                    </div>
                  );
                })}
                {/* 20h → 22h : fermé, un cran plus soutenu que le hors horaire. */}
                <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-base-content/15 bg-base-300/80" style={{ top: closedTop }} />
                {hourMarks.map((m) =>
                  m === gridStart ? null : (
                    <div key={m} aria-hidden className="pointer-events-none absolute inset-x-0 border-t border-base-300/60" style={{ top: y(m) }} />
                  ),
                )}
                {absent && <div aria-hidden className="pointer-events-none absolute inset-0 bg-warning/10" />}
                {hoverSlot?.staffId === p.id && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute flex items-center gap-1 rounded-field border border-dashed border-primary/60 bg-primary/5 px-2.5 text-[0.68rem] font-semibold tabular-nums text-primary"
                    style={{ top: y(hoverSlot.min) + 3, left: 8, width: LANE_W - 14, height: SLOT_H - 6 }}
                  >
                    <Plus className="size-3.5" />
                    {minutesToTime(hoverSlot.min)}
                  </div>
                )}

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
