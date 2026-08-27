"use client";

import { useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  className?: string;
};

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

// Monday-first offset (French week convention) — JS getDay() is Sunday-first (0-6).
function leadingBlanks(d: Date) {
  return (startOfMonth(d).getDay() + 6) % 7;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Popover-anchored month calendar — for a rendez-vous date, a client birthday, a report range boundary. No external date library: plain Date math, fr-FR month labels. */
export function DatePicker({ value, onChange, placeholder = "Choisir une date", className }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(value ?? new Date()));

  const label = value
    ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(value)
    : placeholder;

  const monthLabel = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(visibleMonth);
  const totalDays = daysInMonth(visibleMonth);
  const blanks = leadingBlanks(visibleMonth);
  const today = new Date();

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2 rounded-xl border border-[var(--color-gray-200)] bg-white px-4 py-3 text-left text-[15px] focus:border-[var(--brand-taupe-muted)] focus:outline-none",
            value ? "text-[var(--color-gray-900)]" : "text-[var(--color-gray-400)]",
            className,
          )}
        >
          <CalendarIcon aria-hidden className="size-4 shrink-0 text-[var(--color-gray-400)]" />
          {label}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={8}
          // Widened from w-72: the day grid below needed 44px cells (touch minimum), which a
          // 288px-wide popover couldn't fit 7 of without shrinking them back under the minimum.
          className="z-50 w-[23rem] rounded-2xl border border-[var(--color-gray-200)] bg-white p-4 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)] focus:outline-none"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Mois précédent"
              onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
              className="flex size-11 items-center justify-center rounded-full text-[var(--color-gray-500)] transition active:scale-90 active:bg-[var(--color-gray-100)] hover:bg-[var(--color-gray-100)]"
            >
              <ChevronLeft aria-hidden className="size-4" />
            </button>
            <p className="text-sm font-semibold text-[var(--color-gray-900)] capitalize">{monthLabel}</p>
            <button
              type="button"
              aria-label="Mois suivant"
              onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
              className="flex size-11 items-center justify-center rounded-full text-[var(--color-gray-500)] transition active:scale-90 active:bg-[var(--color-gray-100)] hover:bg-[var(--color-gray-100)]"
            >
              <ChevronRight aria-hidden className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[var(--color-gray-400)]">
            {WEEKDAYS.map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: blanks }).map((_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
              const selected = value && isSameDay(date, value);
              const isToday = isSameDay(date, today);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    onChange(date);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex size-11 items-center justify-center rounded-full text-sm transition active:scale-90",
                    selected
                      ? "bg-[var(--core-brand-color)] font-semibold text-black"
                      : isToday
                        ? "font-semibold text-[var(--brand-taupe-muted)]"
                        : "text-[var(--color-gray-700)] active:bg-[var(--brand-rose-soft)] hover:bg-[var(--brand-rose-soft)]",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
