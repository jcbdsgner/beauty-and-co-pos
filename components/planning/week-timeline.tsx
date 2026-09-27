"use client";

import { ArrowLeftRight, Eye, MoreHorizontal, Undo2, UserX } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { DropdownMenu } from "@/components/ui/molecules/dropdown-menu";
import { dateISO, formatHour, reservationDate, type RendezVousRow } from "@/lib/data/planning";
import { salonById } from "@/lib/data/entreprises";
import { praticienneAccent } from "@/lib/data/praticienne-colors";
import { atSalonLabel, isSalonClosed, salonsOf, shiftsFor } from "@/lib/data/praticiennes";
import { cn } from "@/lib/utils";
import type { Praticienne } from "@/lib/data/types";

/**
 * « Planning · Semaine » (ADR 0020) — même grammaire que la vue Jour (une ligne par praticienne),
 * mais chaque ligne tient ses 7 jours en cellules compactes plutôt qu'une frise horaire : horaire
 * du jour + nombre de rendez-vous, ou « Repos ». Remplace `WeekGrid`.
 *
 * ADR 0036 : une praticienne peut changer de salon d'un jour à l'autre. Salon regardé : un jour
 * passé dans l'autre salon est hachuré et nommé (« Aux Almadies »), un jour de fermeture du salon
 * (Almadies le lundi) est grisé « Fermé » sur toute la colonne. « Tous les salons » : sous l'horaire,
 * le salon du jour — seulement pour celles qui tournent, pour ne pas charger les autres lignes.
 */
/** Hachures de « dans l'autre salon » — les mêmes que la vue Jour. */
const HATCH = "repeating-linear-gradient(135deg, transparent 0 7px, color-mix(in oklab, var(--color-base-content) 7%, transparent) 7px 8px)";
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
  /** Salon regardé — `null` = « Tous les salons ». */
  salonId: string | null;
  today: Date;
  staff: Praticienne[];
  /** Index stable de chaque praticienne dans l'équipe planifiable — pilote la couleur d'accent. */
  accentIndex: Map<string, number>;
  /** Tous les rendez-vous actifs, toutes dates confondues — regroupés ici par jour + praticienne. */
  allRows: RendezVousRow[];
  isolatedId: string | null;
  onPickDay: (d: Date, staffId?: string) => void;
  onIsolate: (id: string) => void;
  onShowAll: () => void;
  onMarkAbsent: (id: string) => void;
};

export function WeekTimeline({ weekDays, salonId, today, staff, accentIndex, allRows, isolatedId, onPickDay, onIsolate, onShowAll, onMarkAbsent }: Props) {
  const rowsFor = (d: Date, staffId: string) => {
    const iso = dateISO(d);
    return allRows.filter(
      (r) =>
        reservationDate(r.reservation) === iso &&
        (r.rv.staffId === staffId || r.rv.secondStaffId === staffId) &&
        (!salonId || r.rv.salonId === salonId),
    );
  };
  const closedOn = (d: Date) => Boolean(salonId && isSalonClosed(salonId, d));
  const salonName = (id: string) => salonById(id)?.name ?? "Autre salon";

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
            const closed = closedOn(d);
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => onPickDay(d)}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-0.5 border-r border-base-300 py-1.5 transition last:border-r-0 hover:bg-base-200",
                  isToday && "bg-primary/5",
                  closed && "bg-base-300/60",
                )}
                style={{ minWidth: DAY_W }}
              >
                <span className={cn("text-xs font-bold uppercase tracking-[0.1em]", isToday ? "text-primary" : "text-base-content/45")}>
                  {dayHead(d)}
                </span>
                <span className={cn("text-sm font-semibold tabular-nums", isToday ? "text-primary" : "text-base-content/70")}>{d.getDate()}</span>
              </button>
            );
          })}
        </div>

        {/* ── rows ── */}
        {staff.map((p) => {
          const accent = praticienneAccent(accentIndex.get(p.id) ?? 0);
          const rotates = salonsOf(p).length > 1;
          return (
          <div key={p.id} className="flex border-b border-l-[3px] border-base-300 last:border-b-0" style={{ borderLeftColor: accent.dot }}>
            <div className="flex shrink-0 items-center gap-2 border-r border-base-300 px-3 py-2" style={{ width: LABEL_W }}>
              <Avatar photoUrl={p.photoUrl} initial={p.initial} size={28} className="shrink-0 text-xs font-semibold" style={{ backgroundColor: accent.dot, color: "#fff" }} />
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
                  ...(isolatedId
                    ? [{ label: "Afficher toute l'équipe", icon: <Undo2 className="size-4" />, onSelect: onShowAll }]
                    : []),
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
              const closed = closedOn(d);
              const shifts = shiftsFor(p, d);
              const here = salonId ? shifts.filter((s) => s.salonId === salonId) : shifts;
              const away = [...new Set(shifts.filter((s) => !here.includes(s)).map((s) => s.salonId))];
              const items = rowsFor(d, p.id);
              const absent = isToday && p.unavailableToday && here.length > 0;
              const onlyAway = !closed && here.length === 0 && away.length > 0;
              // « Tous les salons » : le salon du jour, pour celles qui tournent entre les deux.
              const daySalons = !salonId && rotates ? [...new Set(shifts.map((s) => s.salonId))] : [];
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => onPickDay(d, p.id)}
                  className={cn(
                    "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 border-r border-base-300 px-2 py-2 text-center transition last:border-r-0 hover:bg-base-200",
                    isToday && "bg-primary/5",
                    (closed || (here.length === 0 && !absent)) && "bg-base-300/50",
                  )}
                  style={{ minWidth: DAY_W, backgroundImage: onlyAway ? HATCH : undefined }}
                >
                  {closed ? (
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-base-content/35">Fermé</span>
                  ) : absent ? (
                    <span className="text-xs font-semibold text-warning">Absente</span>
                  ) : onlyAway ? (
                    <span className="rounded-full bg-base-100/85 px-2 py-0.5 text-xs font-semibold text-base-content/55">
                      {atSalonLabel(away[0])}
                    </span>
                  ) : here.length > 0 ? (
                    <>
                      <span className="text-xs font-semibold tabular-nums text-base-content/70">
                        {here.map((s) => `${formatHour(s.start)}–${formatHour(s.end)}`).join(" · ")}
                      </span>
                      {daySalons.length > 0 && (
                        <span className="text-[0.68rem] text-base-content/50">{daySalons.map(salonName).join(" → ")}</span>
                      )}
                      {away.length > 0 && (
                        <span
                          title={shifts.map((s) => `${salonName(s.salonId)} ${formatHour(s.start)}–${formatHour(s.end)}`).join(", ")}
                          className="flex items-center gap-1 text-[0.68rem] text-base-content/50"
                        >
                          <ArrowLeftRight aria-hidden className="size-3" />
                          {away.map(salonName).join(" · ")}
                        </span>
                      )}
                      {items.length > 0 && (
                        <span
                          className="rounded-sm px-1.5 py-px text-xs font-bold tabular-nums"
                          style={{ backgroundColor: accent.bg, color: accent.text }}
                        >
                          {items.length} rdv
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-base-content/30">Repos</span>
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
