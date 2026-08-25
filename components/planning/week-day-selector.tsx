"use client";

import { ChevronIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { MONTH_LABEL, type WeekDay } from "@/lib/data/planning";

type WeekDaySelectorProps = {
  days: WeekDay[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

/**
 * Bandeau mois (décoratif — pas de vraie navigation calendaire) + rangée des 7 jours de la
 * semaine. Jour actif = fond rose plein (état sélectionné en local state côté parent).
 */
export function WeekDaySelector({ days, selectedIndex, onSelect }: WeekDaySelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-center gap-3 text-sm font-medium text-[var(--color-gray-600)]">
        <span aria-hidden className="rotate-180 text-[var(--color-gray-400)]">
          <ChevronIcon />
        </span>
        <span>{MONTH_LABEL}</span>
        <span aria-hidden className="text-[var(--color-gray-400)]">
          <ChevronIcon />
        </span>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const active = index === selectedIndex;
          return (
            <button
              key={day.full}
              type="button"
              aria-pressed={active}
              aria-label={day.full}
              onClick={() => onSelect(index)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-sm transition",
                active
                  ? "bg-[var(--core-brand-color)] text-black"
                  : "border border-[var(--color-gray-200)] bg-white text-[var(--color-gray-600)] hover:bg-[var(--color-gray-50)]",
              )}
            >
              <span className="text-xs font-semibold tracking-wide">{day.short}</span>
              <span className="font-[var(--font-heading)] text-lg">{day.dayNumber}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
