"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { SegmentedToggle } from "@/components/ui/molecules/segmented-toggle";
import { DatePicker } from "@/components/ui/molecules/date-picker";
import type { PlanningPeriod } from "@/lib/data/planning";

/**
 * Barre de navigation du Planning (ADR 0024, Mois retiré par ADR 0025 — absent du Figma de
 * référence) — remplace l'ancien `DateStrip` (bandeau mois + flèches semaine, PUIS une rangée de
 * 7 jours cliquables). Une seule barre compacte façon référence utilisateur : ◀ ▶ navigue d'une
 * unité de la période affichée (jour / semaine), un libellé de période au centre, et la bascule
 * Jour/Semaine. Révision 2026-09-27 : les flèches ◀ ▶ sont retirées — le libellé de période est
 * lui-même un bouton qui ouvre un mini calendrier (`DatePicker`) pour sauter à n'importe quel
 * jour. En vue Semaine, le jour choisi amène sa semaine.
 */

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
        <DatePicker
          value={date}
          onChange={onDateChange}
          trigger={
            <button
              type="button"
              aria-label="Choisir une date"
              className="flex h-12 items-center gap-2.5 rounded-field border border-base-300 bg-base-100 pl-4 pr-3.5 text-base-content transition active:scale-[0.98] hover:bg-base-200 data-[state=open]:border-primary"
            >
              <CalendarDays aria-hidden className="size-4 shrink-0 text-base-content/55" />
              <span className="font-[family-name:var(--font-heading)] text-[15px] font-semibold">{label(period, date)}</span>
              <ChevronDown aria-hidden className="size-4 shrink-0 text-base-content/45" />
            </button>
          }
        />
        {!isCurrent && (
          <Button variant="outline" size="sm" onClick={() => onDateChange(new Date())}>
            Aujourd&apos;hui
          </Button>
        )}
      </div>
      <SegmentedToggle
        size="sm"
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
