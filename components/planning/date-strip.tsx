"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Le sélecteur de date du Planning — une semaine de boutons jour, navigable. Réécrit en daisyUI
 * pur pour la refonte du module (ADR 0020) : remplace `WeekStrip` de `components/ui/board.tsx`
 * (langage « Le Tableau », ADR 0005), que le Planning était le dernier écran à porter encore.
 */
const WEEKDAY = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

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

type Props = { selected: Date; onSelect: (d: Date) => void; className?: string };

export function DateStrip({ selected, onSelect, className }: Props) {
  const weekStart = startOfWeek(selected);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const today = new Date();
  const month = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(selected);

  function shift(n: number) {
    const d = new Date(selected);
    d.setDate(selected.getDate() + n);
    onSelect(d);
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between px-1">
        <p className="font-[family-name:var(--font-heading)] text-[0.68rem] font-bold uppercase tracking-[0.13em] text-base-content/45">
          {month}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Semaine précédente"
            onClick={() => shift(-7)}
            className="flex size-10 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/55 transition active:scale-90 hover:bg-base-200"
          >
            <ChevronLeft aria-hidden className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Semaine suivante"
            onClick={() => shift(7)}
            className="flex size-10 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/55 transition active:scale-90 hover:bg-base-200"
          >
            <ChevronRight aria-hidden className="size-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d, i) => {
          const active = sameDay(d, selected);
          const isToday = sameDay(d, today);
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onSelect(d)}
              className={cn(
                "flex min-h-[58px] flex-col items-center justify-center gap-0.5 rounded-field border py-2 transition active:scale-[0.97]",
                active
                  ? "border-transparent bg-primary text-primary-content"
                  : "border-base-300 bg-base-100 text-base-content/60 hover:bg-base-200",
                !active && isToday && "ring-1 ring-inset ring-primary/50",
              )}
            >
              <span className="text-[0.62rem] font-bold uppercase tracking-[0.1em]">{WEEKDAY[i]}</span>
              <span className="text-lg font-semibold tabular-nums">{d.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
