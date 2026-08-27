"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { cn } from "@/lib/utils";

const WEEKDAY_ABBREV = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Monday-first week start (French convention, matches DatePicker).
function startOfWeek(d: Date) {
  const day = (d.getDay() + 6) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  return start;
}

type WeekDaySelectorProps = {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  className?: string;
};

/**
 * Week navigator (◀/▶ + 7 clickable days, day+number on two lines) — deliberately its own
 * component rather than Pills: a day here carries two stacked lines (weekday + day number), a
 * shape PillOption doesn't natively support. Per USERFLOW.md § Planning complet.
 */
export function WeekDaySelector({ selectedDate, onSelect, className }: WeekDaySelectorProps) {
  const weekStart = startOfWeek(selectedDate);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const monthLabel = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(selectedDate);
  const today = new Date();

  function shiftWeek(days: number) {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + days);
    onSelect(next);
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-center gap-4">
        <IconButton
          aria-label="Semaine précédente"
          onClick={() => shiftWeek(-7)}
          className="size-11 rounded-full text-[var(--color-gray-500)] active:scale-90 active:bg-[var(--color-gray-100)] hover:bg-[var(--color-gray-100)]"
        >
          <ChevronLeft aria-hidden className="size-4" />
        </IconButton>
        <p className="min-w-[10rem] text-center text-sm font-semibold text-[var(--color-gray-900)] capitalize">{monthLabel}</p>
        <IconButton
          aria-label="Semaine suivante"
          onClick={() => shiftWeek(7)}
          className="size-11 rounded-full text-[var(--color-gray-500)] active:scale-90 active:bg-[var(--color-gray-100)] hover:bg-[var(--color-gray-100)]"
        >
          <ChevronRight aria-hidden className="size-4" />
        </IconButton>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const active = isSameDay(d, selectedDate);
          const isToday = isSameDay(d, today);
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onSelect(d)}
              className={cn(
                "flex min-h-[64px] flex-col items-center justify-center gap-0.5 rounded-2xl border py-2 text-sm font-medium transition active:scale-[0.97]",
                active
                  ? "border-transparent bg-[var(--core-brand-color)] text-black"
                  : "border-[var(--color-gray-200)] bg-white text-[var(--color-gray-600)] hover:bg-[var(--color-gray-50)]",
              )}
            >
              <span className="text-xs uppercase">{WEEKDAY_ABBREV[i]}</span>
              <span className={cn("text-lg font-semibold", !active && isToday && "text-[var(--brand-taupe-muted)]")}>{d.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
