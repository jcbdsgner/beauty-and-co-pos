"use client";

import { useMemo } from "react";
import { Eye, MoreHorizontal, Undo2, UserX, Users } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { DropdownMenu } from "@/components/ui/molecules/dropdown-menu";
import { Legend } from "@/components/ui/board";
import { clientFullName } from "@/lib/data/clientele";
import { serviceById } from "@/lib/data/menu";
import { appointmentEndTime, timeToMinutes, type RendezVousRow } from "@/lib/data/planning";
import { cn } from "@/lib/utils";
import type { Cliente, Praticienne, RendezVous } from "@/lib/data/types";

/**
 * « Planning » — le second écran du Planning (bascule de l'en-tête). La journée de chaque
 * praticienne, heures en rail × praticiennes en colonnes, blocs positionnés par début + durée.
 * Sert à lire une charge, repérer un trou, voir qui est libre — pas à encaisser vite (c'est
 * l'écran « Rendez-vous »). Langage « Le Tableau » : plaque rose pour un bloc, groove pour les
 * filets, filet ambre « maintenant » en travers, voile ambre sur une colonne absente. Chaque
 * colonne porte le roster (photo, horaire de présence, nombre de rdv) + un menu (voir seule,
 * marquer absente). Taper un bloc ouvre la fiche réservation.
 */
const SLOT_MIN = 30;
const SLOT_H = 34; // px per 30 min
const RAIL_W = 52;

type Props = {
  /** Déjà filtré (annulés / praticienne isolée) par le parent. */
  rows: RendezVousRow[];
  /** Colonnes — déjà triées (coiffure puis esthétique) et réduites à la praticienne isolée. */
  staff: Praticienne[];
  clients: Cliente[];
  /** Praticienne isolée : une seule colonne, plus large, plus détaillée. */
  soloStaffId: string | null;
  onOpenReservation: (rv: RendezVous) => void;
  onSolo: (id: string | null) => void;
  onMarkAbsent: (id: string) => void;
};

/** "09:00" → "9h", "18:30" → "18h30". */
function hm(t: string) {
  const [h, m] = t.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

type Placed = { row: RendezVousRow; start: number; end: number; lane: number };

/** Greedy lane packing so two rendez-vous that overlap on one praticienne sit side by side. */
function pack(items: RendezVousRow[]): { placed: Placed[]; lanes: number } {
  const sorted = [...items].sort(
    (a, b) => timeToMinutes(a.rv.start) - timeToMinutes(b.rv.start),
  );
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

export function DayGrid({ rows, staff, clients, soloStaffId, onOpenReservation, onSolo, onMarkAbsent }: Props) {
  const active = useMemo(() => rows.filter((r) => r.rv.status !== "annule"), [rows]);

  const { gridStart, gridEnd } = useMemo(() => {
    const marks: number[] = [];
    for (const p of staff) {
      if (p.shiftStart && p.shiftEnd) marks.push(timeToMinutes(p.shiftStart), timeToMinutes(p.shiftEnd));
    }
    for (const r of active) marks.push(timeToMinutes(r.rv.start), timeToMinutes(appointmentEndTime(r.rv)));
    const lo = marks.length ? Math.min(...marks) : 9 * 60;
    const hi = marks.length ? Math.max(...marks) : 19 * 60;
    return { gridStart: Math.floor(lo / 60) * 60, gridEnd: Math.max(Math.ceil(hi / 60) * 60, Math.floor(lo / 60) * 60 + 4 * 60) };
  }, [staff, active]);

  const y = (min: number) => ((min - gridStart) / SLOT_MIN) * SLOT_H;
  const bodyH = y(gridEnd);
  const hourMarks: number[] = [];
  for (let m = gridStart; m <= gridEnd; m += 60) hourMarks.push(m);

  const now = nowMinutes();
  const showNow = now > gridStart && now < gridEnd;

  const solo = Boolean(soloStaffId);
  const colMin = solo ? 320 : 150;

  const beneficiary = (rv: RendezVous) =>
    rv.beneficiaryClientId ? clients.find((c) => c.id === rv.beneficiaryClientId)?.lastName : rv.beneficiaryName;

  return (
    <div className="overflow-x-auto [scrollbar-width:thin]">
      <div style={{ minWidth: RAIL_W + staff.length * colMin }}>
        {/* ── Roster header — one column per praticienne ── */}
        <div className="flex border-b border-[var(--board-groove)] bg-black/[0.015]">
          <div className="shrink-0 border-r border-[var(--board-groove)]" style={{ width: RAIL_W }} />
          {staff.map((p) => {
            const count = active.filter((r) => r.rv.staffId === p.id || r.rv.secondStaffId === p.id).length;
            const shift = p.shiftStart && p.shiftEnd ? `${hm(p.shiftStart)}–${hm(p.shiftEnd)}` : null;
            const absent = Boolean(p.unavailableToday);
            const roseAccent = p.role === "coiffeuse";
            return (
              <div
                key={p.id}
                className={cn(
                  "flex min-w-0 flex-1 items-start gap-2 border-r border-t-2 px-2.5 py-2 last:border-r-0",
                  roseAccent ? "border-t-[var(--core-brand-color)]" : "border-t-[var(--brand-taupe-muted)]/40",
                  "border-r-[var(--board-groove)]",
                  absent && "bg-[var(--board-amber-soft)]/60",
                )}
                style={{ minWidth: colMin }}
                title={p.name}
              >
                <Avatar
                  initial={p.initial}
                  size={30}
                  className={cn(
                    "shrink-0 text-[0.72rem] font-semibold",
                    absent ? "bg-[var(--color-gray-100)] text-[var(--color-gray-400)]" : "bg-accent text-secondary",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-[family-name:var(--font-heading)] text-[13px] font-semibold text-[var(--color-gray-900)]">
                    {p.name}
                  </p>
                  <p
                    className={cn(
                      "truncate text-[0.7rem] tabular-nums",
                      absent ? "font-semibold text-[var(--board-amber)]" : "text-[var(--color-gray-400)]",
                    )}
                  >
                    {absent ? "Absente" : shift ? `${shift} · ${count} rdv` : `${count} rdv`}
                  </p>
                </div>
                {solo ? (
                  <IconButton
                    aria-label="Voir toute l'équipe"
                    onClick={() => onSolo(null)}
                    className="size-7 shrink-0 rounded-full text-[var(--color-gray-400)] hover:bg-black/[0.05]"
                  >
                    <Undo2 className="size-3.5" />
                  </IconButton>
                ) : (
                  <DropdownMenu
                    align="end"
                    trigger={
                      <IconButton
                        aria-label={`Actions pour ${p.name}`}
                        className="size-7 shrink-0 rounded-full text-[var(--color-gray-400)] hover:bg-black/[0.05]"
                      >
                        <MoreHorizontal className="size-4" />
                      </IconButton>
                    }
                    items={[
                      { label: "Voir seule", icon: <Eye className="size-4" />, onSelect: () => onSolo(p.id) },
                      {
                        label: "Marquer absente aujourd'hui",
                        icon: <UserX className="size-4" />,
                        tone: "danger",
                        disabled: absent,
                        onSelect: () => onMarkAbsent(p.id),
                      },
                    ]}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Grid body ── */}
        <div className="relative flex" style={{ height: bodyH + 10, paddingTop: 10 }}>
          {/* hour rail */}
          <div className="shrink-0 border-r border-[var(--board-groove)]" style={{ width: RAIL_W }}>
            {hourMarks.map((m, i) => (
              <div key={m} className="relative" style={{ height: i === hourMarks.length - 1 ? 0 : SLOT_H * 2 }}>
                <span
                  className={cn(
                    "absolute right-2 text-[0.68rem] font-semibold tabular-nums text-[var(--color-gray-400)]",
                    i === 0 ? "top-0" : "-top-2",
                  )}
                >
                  {hm(`${m / 60}:00`)}
                </span>
              </div>
            ))}
          </div>

          {/* columns */}
          {staff.map((p) => {
            const col = active.filter((r) => r.rv.staffId === p.id || r.rv.secondStaffId === p.id);
            const { placed, lanes } = pack(col);
            const absent = Boolean(p.unavailableToday);
            const roseAccent = p.role === "coiffeuse";
            const shiftTop = p.shiftStart ? y(timeToMinutes(p.shiftStart)) : null;
            const shiftBottom = p.shiftEnd ? y(timeToMinutes(p.shiftEnd)) : null;
            return (
              <div
                key={p.id}
                className="relative min-w-0 flex-1 border-r border-[var(--board-groove)] last:border-r-0"
                style={{ minWidth: colMin }}
              >
                {/* out-of-shift shading */}
                {shiftTop !== null && shiftTop > 0 && (
                  <div aria-hidden className="absolute inset-x-0 top-0 bg-black/[0.025]" style={{ height: shiftTop }} />
                )}
                {shiftBottom !== null && shiftBottom < bodyH && (
                  <div aria-hidden className="absolute inset-x-0 bg-black/[0.025]" style={{ top: shiftBottom, height: bodyH - shiftBottom }} />
                )}
                {/* hour rules */}
                {hourMarks.map((m, i) =>
                  i === 0 ? null : (
                    <div
                      key={m}
                      aria-hidden
                      className="absolute inset-x-0 border-t border-[var(--board-groove)]/60"
                      style={{ top: i * SLOT_H * 2 }}
                    />
                  ),
                )}
                {/* absent veil */}
                {absent && <div aria-hidden className="pointer-events-none absolute inset-0 bg-[var(--board-amber-soft)]/45" />}

                {/* blocks */}
                {placed.map(({ row, lane }) => {
                  const { rv, reservation } = row;
                  const top = y(timeToMinutes(rv.start));
                  const h = Math.max((rv.durationMin / SLOT_MIN) * SLOT_H, SLOT_H - 6);
                  const svc = serviceById(rv.serviceId);
                  const payer = clients.find((c) => c.id === reservation.payerClientId);
                  const isSecond = rv.secondStaffId === p.id && rv.staffId !== p.id;
                  const benef = beneficiary(rv);
                  const cancelled = rv.status === "annule";
                  const tall = h > SLOT_H * 1.6;
                  const veryTall = h > SLOT_H * 2.6;
                  const partnerId = isSecond ? rv.staffId : rv.secondStaffId;
                  const partner = partnerId ? staff.find((s) => s.id === partnerId) : undefined;
                  return (
                    <button
                      key={rv.id + p.id}
                      type="button"
                      onClick={() => onOpenReservation(rv)}
                      style={{
                        top,
                        height: h,
                        left: `calc(${(lane / lanes) * 100}% + 3px)`,
                        width: `calc(${100 / lanes}% - 6px)`,
                      }}
                      className={cn(
                        "absolute flex flex-col gap-0.5 overflow-hidden rounded-[10px] border border-l-[3px] px-2.5 py-1.5 text-left transition hover:z-10 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:opacity-70",
                        cancelled
                          ? "border-dashed border-[var(--board-groove)] border-l-[var(--board-groove)] bg-[var(--color-gray-50)] opacity-60"
                          : cn(
                              "border-[var(--board-groove)] bg-[var(--brand-rose-soft)] hover:bg-[var(--brand-rose-soft)]/70",
                              roseAccent ? "border-l-[var(--core-brand-color)]" : "border-l-[var(--brand-taupe-muted)]/40",
                            ),
                        isSecond && !cancelled && "bg-[var(--brand-rose-soft)]/50 opacity-80",
                      )}
                    >
                      <span className="flex items-center gap-1 text-[0.68rem] font-semibold tabular-nums text-[var(--brand-taupe-muted)]">
                        {rv.start}
                        {rv.secondStaffId && <Users aria-hidden className="size-3" />}
                        {isSecond && !veryTall && <span className="font-normal text-[var(--color-gray-400)]">· en renfort</span>}
                      </span>
                      <span className={cn("truncate text-xs font-semibold text-[var(--color-gray-900)]", cancelled && "line-through")}>
                        {payer ? clientFullName(payer) : "Cliente"}
                      </span>
                      {tall && svc && (
                        <span className="truncate text-[0.7rem] text-[var(--color-gray-500)]">{svc.name}</span>
                      )}
                      {tall && benef && (
                        <span className="truncate text-[0.7rem] text-[var(--brand-taupe-muted)]">pour {benef}</span>
                      )}
                      {veryTall && partner && (
                        <span className="mt-auto flex items-center gap-1 pt-0.5">
                          <Avatar
                            initial={partner.initial}
                            size={16}
                            className="bg-white text-[0.55rem] font-semibold text-[var(--brand-taupe-muted)] ring-1 ring-[var(--board-groove)]"
                          />
                          <span className="truncate text-[0.66rem] text-[var(--color-gray-400)]">avec {partner.name}</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* ── "maintenant" — one amber hairline across every column ── */}
          {showNow && (
            <div aria-hidden className="pointer-events-none absolute inset-x-0 z-20" style={{ top: y(now) }}>
              <div className="flex items-center" style={{ marginLeft: RAIL_W - 6 }}>
                <span className="size-1.5 shrink-0 rounded-full bg-[var(--board-amber)]" />
                <span className="h-px flex-1 bg-[var(--board-amber)]/60" />
              </div>
            </div>
          )}
        </div>
      </div>

      {staff.length === 0 && (
        <div className="px-6 py-14 text-center">
          <Legend>Personne en poste sur cette vue</Legend>
        </div>
      )}
    </div>
  );
}
