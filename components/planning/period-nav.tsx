"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { ChipFilter } from "@/components/ui/board";
import type { PlanningPeriod } from "@/lib/data/planning";

/**
 * Barre de navigation du Planning (ADR 0024, Mois retiré par ADR 0025 — absent du Figma de
 * référence) — remplace l'ancien `DateStrip` (bandeau mois + flèches semaine, PUIS une rangée de
 * 7 jours cliquables). Une seule barre compacte façon référence utilisateur : ◀ ▶ navigue d'une
 * unité de la période affichée (jour / semaine), un libellé de période au centre, et la bascule
 * Jour/Semaine. Pas de sélecteur de jour indépendant : pour choisir un jour précis dans la
 * semaine, on passe par la vue Semaine et on clique une cellule (déjà porté par `WeekTimeline`).
 */
const WEEKDAY_STEP: Record<PlanningPeriod, number> = { jour: 1, semaine: 7 };

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfWeek(d: Date) {
  const day = (d.getDay() + 6) % 7;
  const s = new Date(d);
  s.setDate(d.getDate() - day);
  s.setHours(0, 0, 0, 0);
  return s;
}

/** Numéro de semaine ISO 8601. */
function isoWeek(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function periodContainsToday(period: PlanningPeriod, date: Date, today: Date) {
  if (period === "jour") return sameDay(date, today);
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return today >= start && today <= end;
}

function shift(date: Date, period: PlanningPeriod, dir: 1 | -1) {
  const d = new Date(date);
  d.setDate(d.getDate() + dir * WEEKDAY_STEP[period]);
  return d;
}

function label(period: PlanningPeriod, date: Date) {
  if (period === "jour") {
    const s = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  const month = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(date);
  const monthCap = month.charAt(0).toUpperCase() + month.slice(1);
  return `${monthCap} · Semaine ${isoWeek(date)}`;
}

type Props = {
  period: PlanningPeriod;
  onPeriodChange: (p: PlanningPeriod) => void;
  date: Date;
  onDateChange: (d: Date) => void;
  today: Date;
};

export function PeriodNav({ period, onPeriodChange, date, onDateChange, today }: Props) {
  const isCurrent = periodContainsToday(period, date, today);

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Période précédente"
            onClick={() => onDateChange(shift(date, period, -1))}
            className="flex size-9 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/55 transition active:scale-90 hover:bg-base-200"
          >
            <ChevronLeft aria-hidden className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Période suivante"
            onClick={() => onDateChange(shift(date, period, 1))}
            className="flex size-9 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/55 transition active:scale-90 hover:bg-base-200"
          >
            <ChevronRight aria-hidden className="size-4" />
          </button>
        </div>
        <p className="font-[family-name:var(--font-heading)] text-[15px] font-semibold text-base-content">{label(period, date)}</p>
        {!isCurrent && (
          <Button variant="outline" size="sm" onClick={() => onDateChange(new Date())}>
            Aujourd&apos;hui
          </Button>
        )}
      </div>
      <ChipFilter
        value={period}
        onChange={(v) => onPeriodChange(v as PlanningPeriod)}
        options={[
          { value: "jour", label: "Jour" },
          { value: "semaine", label: "Semaine" },
        ]}
      />
    </div>
  );
}
