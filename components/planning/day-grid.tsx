"use client";

import { Users } from "lucide-react";
import { Legend } from "@/components/ui/board";
import { clientFullName } from "@/lib/data/clientele";
import { serviceById } from "@/lib/data/menu";
import { appointmentEndTime, timeToMinutes, type RendezVousRow } from "@/lib/data/planning";
import { cn } from "@/lib/utils";
import type { Cliente, Praticienne, RendezVous } from "@/lib/data/types";

/**
 * Vue « Grille calendrier » du Planning (ADR 0014) — heures en rail, praticiennes en colonnes,
 * blocs positionnés par début + durée. Sert à repérer les trous et les chevauchements, pas à
 * encaisser vite (c'est le rôle de la liste chronologique). Langage « Le Tableau » : plaque rose
 * pour un bloc, groove pour les filets, signal ambre pour une praticienne absente. Taper un bloc
 * ouvre la fiche réservation.
 */
const SLOT_MIN = 30;
const SLOT_H = 30; // px per 30 min

type Props = {
  rows: RendezVousRow[];
  staff: Praticienne[];
  clients: Cliente[];
  onOpenReservation: (rv: RendezVous) => void;
};

export function DayGrid({ rows, staff, clients, onOpenReservation }: Props) {
  const active = rows.filter((r) => r.rv.status !== "annule");
  if (active.length === 0 || staff.length === 0) {
    return (
      <div className="px-6 py-14 text-center">
        <Legend>Rien à afficher dans la grille</Legend>
      </div>
    );
  }

  const earliest = Math.min(...active.map((r) => timeToMinutes(r.rv.start)));
  const latest = Math.max(...active.map((r) => timeToMinutes(appointmentEndTime(r.rv))));
  const gridStart = Math.min(Math.floor(earliest / 60) * 60, 9 * 60);
  const gridEnd = Math.max(Math.ceil(latest / 60) * 60, gridStart + 4 * 60);
  const slots = (gridEnd - gridStart) / SLOT_MIN;
  const bodyH = slots * SLOT_H;
  const hourMarks: number[] = [];
  for (let m = gridStart; m < gridEnd; m += 60) hourMarks.push(m);

  return (
    <div className="overflow-x-auto">
      {/* practitioner header row */}
      <div className="flex border-b border-[var(--board-groove)]">
        <div className="w-14 shrink-0 border-r border-[var(--board-groove)]" />
        {staff.map((p) => (
          <div
            key={p.id}
            className="min-w-[9rem] flex-1 border-r border-[var(--board-groove)] px-2 py-1.5 last:border-r-0"
          >
            <Legend>
              {p.name}
              {p.unavailableToday ? " · absente" : ""}
            </Legend>
          </div>
        ))}
      </div>

      {/* grid body */}
      <div className="flex" style={{ height: bodyH }}>
        <div className="w-14 shrink-0 border-r border-[var(--board-groove)]">
          {hourMarks.map((m, i) => (
            <div key={m} className="relative" style={{ height: SLOT_H * 2 }}>
              <span
                className={cn(
                  "absolute right-2 text-[0.7rem] font-semibold tabular-nums text-[var(--color-gray-400)]",
                  i === 0 ? "top-0" : "-top-2",
                )}
              >
                {String(m / 60).padStart(2, "0")}h
              </span>
            </div>
          ))}
        </div>

        {staff.map((p) => {
          const col = active.filter((r) => r.rv.staffId === p.id || r.rv.secondStaffId === p.id);
          return (
            <div
              key={p.id}
              className="relative min-w-[9rem] flex-1 border-r border-[var(--board-groove)] last:border-r-0"
            >
              {hourMarks.map((m, i) =>
                i === 0 ? null : (
                  <div
                    key={m}
                    aria-hidden
                    className="absolute inset-x-0 border-t border-[var(--board-groove)]/50"
                    style={{ top: i * SLOT_H * 2 }}
                  />
                ),
              )}
              {col.map((r) => {
                const top = ((timeToMinutes(r.rv.start) - gridStart) / SLOT_MIN) * SLOT_H;
                const h = Math.max((r.rv.durationMin / SLOT_MIN) * SLOT_H, SLOT_H);
                const svc = serviceById(r.rv.serviceId);
                const payer = clients.find((c) => c.id === r.reservation.payerClientId);
                const isSecond = r.rv.secondStaffId === p.id && r.rv.staffId !== p.id;
                const absent = p.unavailableToday;
                return (
                  <button
                    key={r.rv.id + p.id}
                    type="button"
                    onClick={() => onOpenReservation(r.rv)}
                    style={{ top, height: h }}
                    className={cn(
                      "absolute inset-x-1 flex flex-col gap-0.5 overflow-hidden rounded-[8px] border px-2 py-1 text-left transition active:opacity-70",
                      "border-[var(--board-groove)] bg-[var(--brand-rose-soft)] hover:bg-[var(--brand-rose-soft)]/70",
                      isSecond && "opacity-70",
                      absent && "border-l-[3px] border-l-[var(--board-amber)]",
                    )}
                  >
                    <span className="flex items-center gap-1 text-[0.7rem] font-semibold tabular-nums text-[var(--brand-taupe-muted)]">
                      {r.rv.start}
                      {r.rv.secondStaffId && <Users aria-hidden className="size-3" />}
                    </span>
                    <span className="truncate text-xs font-semibold text-[var(--color-gray-900)]">
                      {payer ? clientFullName(payer) : "Cliente"}
                    </span>
                    {h > SLOT_H * 1.5 && (
                      <span className="truncate text-[0.7rem] text-[var(--color-gray-500)]">{svc?.name}</span>
                    )}
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
