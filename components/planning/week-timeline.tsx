"use client";

import { Eye, MoreHorizontal, UserX } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { DropdownMenu } from "@/components/ui/molecules/dropdown-menu";
import { dateISO, formatHour, reservationDate, type RendezVousRow } from "@/lib/data/planning";
import { praticienneAccent } from "@/lib/data/praticienne-colors";
import { scheduleFor } from "@/lib/data/praticiennes";
import { cn } from "@/lib/utils";
import type { Praticienne } from "@/lib/data/types";

/**
 * « Planning · Semaine » (ADR 0020) — même grammaire que la vue Jour (une ligne par praticienne),
 * mais chaque ligne tient ses 7 jours en cellules compactes plutôt qu'une frise horaire : horaire
 * du jour + nombre de rendez-vous, ou « Repos ». Remplace `WeekGrid`.
 */
const LABEL_W = 208;
const DAY_W = 132;

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function dayHead(d: Date) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(d).replace(".", "").toUpperCase();
}

type Props = {
  weekDays: Date[];
  today: Date;
  /** Colonnes — déjà filtrées par la sidebar de filtre du parent. */
  staff: Praticienne[];
  /** Tous les rendez-vous actifs, toutes dates confondues — regroupés ici par jour + praticienne. */
  allRows: RendezVousRow[];
  onPickDay: (d: Date, staffId?: string) => void;
  onIsolate: (id: string) => void;
  onMarkAbsent: (id: string) => void;
};

export function WeekTimeline({ weekDays, today, staff, allRows, onPickDay, onIsolate, onMarkAbsent }: Props) {
  const rowsFor = (d: Date, staffId: string) => {
    const iso = dateISO(d);
    return allRows.filter((r) => reservationDate(r.reservation) === iso && (r.rv.staffId === staffId || r.rv.secondStaffId === staffId));
  };

  if (staff.length === 0) {
    return <div className="px-6 py-14 text-center text-sm text-base-content/45">Aucune praticienne sélectionnée.</div>;
  }

  return (
    <div className="overflow-x-auto [scrollbar-width:thin]">
      <div style={{ minWidth: LABEL_W + weekDays.length * DAY_W }}>
        {/* ── day header ── */}
        <div className="flex border-b border-base-300 bg-base-200/40">
          <div className="shrink-0 border-r border-base-300" style={{ width: LABEL_W }} />
          {weekDays.map((d) => {
            const isToday = sameDay(d, today);
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => onPickDay(d)}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-0.5 border-r border-base-300 py-1.5 transition last:border-r-0 hover:bg-base-200",
                  isToday && "bg-primary/5",
                )}
                style={{ minWidth: DAY_W }}
              >
                <span className={cn("text-[0.6rem] font-bold uppercase tracking-[0.1em]", isToday ? "text-primary" : "text-base-content/45")}>
                  {dayHead(d)}
                </span>
                <span className={cn("text-sm font-semibold tabular-nums", isToday ? "text-primary" : "text-base-content/70")}>{d.getDate()}</span>
              </button>
            );
          })}
        </div>

        {/* ── rows ── */}
        {staff.map((p) => {
          const accent = praticienneAccent(p.id);
          return (
          <div key={p.id} className="flex border-b border-l-[3px] border-base-300 last:border-b-0" style={{ borderLeftColor: accent.dot }}>
            <div className="flex shrink-0 items-center gap-2 border-r border-base-300 px-3 py-2" style={{ width: LABEL_W }}>
              <Avatar initial={p.initial} size={28} className="shrink-0 text-[0.68rem] font-semibold" style={{ backgroundColor: accent.dot, color: "#fff" }} />
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-base-content">{p.name}</span>
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
                  {
                    label: "Marquer absente aujourd'hui",
                    icon: <UserX className="size-4" />,
                    tone: "danger" as const,
                    disabled: Boolean(p.unavailableToday),
                    onSelect: () => onMarkAbsent(p.id),
                  },
                ]}
              />
            </div>
            {weekDays.map((d) => {
              const isToday = sameDay(d, today);
              const hours = scheduleFor(p, d);
              const items = rowsFor(d, p.id);
              const absent = isToday && p.unavailableToday;
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => onPickDay(d, p.id)}
                  className={cn(
                    "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 border-r border-base-300 px-2 py-2 text-center transition last:border-r-0 hover:bg-base-200",
                    isToday && "bg-primary/5",
                    !hours && !absent && "bg-base-300/50",
                  )}
                  style={{ minWidth: DAY_W }}
                >
                  {absent ? (
                    <span className="text-[0.68rem] font-semibold text-warning">Absente</span>
                  ) : hours ? (
                    <>
                      <span className="text-[0.7rem] font-semibold tabular-nums text-base-content/70">
                        {formatHour(hours.start)}–{formatHour(hours.end)}
                      </span>
                      {items.length > 0 && (
                        <span
                          className="rounded-full px-1.5 py-px text-[0.62rem] font-bold tabular-nums"
                          style={{ backgroundColor: accent.bg, color: accent.text }}
                        >
                          {items.length} rdv
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[0.7rem] text-base-content/30">Repos</span>
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
