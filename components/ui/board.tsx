"use client";

/**
 * « Le Tableau » — board-world primitives (DESIGN.md, docs/adr/0005).
 *
 * A section is a self-ranking day board, not a scroll of cards. Every content region is a
 * *plaque* framed by a routed groove with a tracked-uppercase legend cut into its top edge;
 * rows are *lanes* on hairline rules; status is a *flip-chip* that half-flips on change; the one
 * signal colour is amber — a changed lane pulses once then holds a 3px amber inset until it is
 * acted on. Used by Planning, Clientèle, Relances, Catalogue.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Legend ──────────────────────────────────────────────────────────────── */

/** The board grammar's label — tracked uppercase, never a heading. */
export function Legend({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "font-[family-name:var(--font-heading)] text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[var(--brand-taupe-muted)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ── Board header (the section heading — a plain title on the cream wall) ──── */

/**
 * The section heading. Retired the slate plaque (ADR 0007): a POS section is named, not framed —
 * a heavy standing banner on every screen only added chrome the receptionist reads past. Now a
 * plain bold title on the cream ground, with the same props so every call site is unchanged.
 */
type BoardHeaderProps = {
  section: string;
  /**
   * @deprecated A POS section is named, not narrated — no greetings, counts or standing guidance
   * (DESIGN.md). Kept only until the last call site drops it; do not add new ones.
   */
  context?: React.ReactNode;
  action?: React.ReactNode;
  /** shown only when relevant (e.g. an "Aujourd'hui" reset) */
  reset?: React.ReactNode;
  backHref?: string;
  /** the back pill's label — names the destination ("Clientèle", "Accueil"), never a bare "Retour" */
  backLabel?: string;
  className?: string;
};

export function BoardHeader({ section, action, reset, backHref, backLabel = "Retour", className }: BoardHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-3 pl-1", className)}>
      {backHref && (
        <Link
          href={backHref}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-[var(--board-groove)] bg-white px-3.5 text-sm font-medium text-[var(--color-gray-500)] transition active:scale-[0.97] hover:bg-[var(--color-gray-50)]"
        >
          <ChevronLeft aria-hidden className="size-4" />
          {backLabel}
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="font-[family-name:var(--font-heading)] text-[1.9rem] font-bold leading-none tracking-[-0.02em] text-[var(--color-gray-900)]">
          {section}
        </h1>
      </div>
      {reset}
      {action}
    </div>
  );
}

/* ── Board (a plaque region with a routed groove + legend) ──────────────── */

type BoardTone = "plain" | "act" | "now";

const BOARD_TONE: Record<BoardTone, string> = {
  plain: "bg-white",
  act: "bg-[var(--board-rose-plaque)]",
  now: "bg-[var(--board-taupe-plaque)]",
};

type BoardProps = {
  legend?: React.ReactNode;
  /** right-aligned on the legend line — filter pills, a view toggle, a small action */
  legendRight?: React.ReactNode;
  /** the legend rail — hours, a letter index, names; null for a railless board */
  rail?: React.ReactNode;
  railWidth?: number;
  tone?: BoardTone;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function Board({ legend, legendRight, rail, railWidth = 88, tone = "plain", children, className, bodyClassName }: BoardProps) {
  return (
    <section className={cn("relative", className)}>
      {(legend || legendRight) && (
        <div className="mb-2 flex items-center justify-between gap-3 pl-1">
          {legend ? <Legend>{legend}</Legend> : <span />}
          {legendRight}
        </div>
      )}
      <div
        className={cn(
          "overflow-hidden rounded-[14px] border border-[var(--board-groove)] shadow-[0_0_0_1px_var(--board-groove)]",
          BOARD_TONE[tone],
        )}
      >
        <div className={cn("flex", bodyClassName)}>
          {rail !== undefined && rail !== null && (
            <div
              className="shrink-0 border-r border-[var(--board-groove)] bg-black/[0.015]"
              style={{ width: railWidth }}
            >
              {rail}
            </div>
          )}
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </section>
  );
}

/* ── Lane (one row on the board) ───────────────────────────────────────── */

export type LaneSignal = "none" | "pulse" | "hold";

type LaneProps = {
  leading?: React.ReactNode;
  title: React.ReactNode;
  meta?: React.ReactNode;
  chip?: React.ReactNode;
  actions?: React.ReactNode;
  signal?: LaneSignal;
  struck?: boolean;
  onSelect?: () => void;
  href?: string;
  className?: string;
};

export function Lane({ leading, title, meta, chip, actions, signal = "none", struck, onSelect, href, className }: LaneProps) {
  const interactive = Boolean(onSelect || href);

  const body = (
    <>
      {leading !== undefined && (
        <span className="flex w-16 shrink-0 items-center justify-center text-center text-sm font-semibold tabular-nums text-[var(--color-gray-500)]">
          {leading}
        </span>
      )}
      <span className={cn("min-w-0 flex-1 py-2", struck && "line-through opacity-55")}>
        <span className="block truncate font-[family-name:var(--font-heading)] text-[15px] font-semibold text-[var(--color-gray-900)]">
          {title}
        </span>
        {meta && <span className="mt-0.5 block truncate text-sm text-[var(--color-gray-500)]">{meta}</span>}
      </span>
    </>
  );

  const bodyClass = cn(
    "flex min-w-0 flex-1 items-center gap-3 text-left",
    interactive && "transition active:opacity-70",
  );

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 border-b border-[var(--board-groove)] px-4 last:border-b-0",
        "min-h-[var(--board-lane-h)]",
        signal === "pulse" && "animate-lane-pulse",
        interactive && "hover:bg-black/[0.02]",
        className,
      )}
    >
      {/* reserved amber signal slot — keeps every lane aligned whether or not it holds */}
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-[3px]", signal === "hold" ? "bg-[var(--board-amber)]" : "bg-transparent")}
      />
      {href ? (
        <Link href={href} className={bodyClass}>
          {body}
        </Link>
      ) : onSelect ? (
        <button type="button" onClick={onSelect} className={cn(bodyClass, "cursor-pointer")}>
          {body}
        </button>
      ) : (
        <div className={bodyClass}>{body}</div>
      )}
      {chip && <span className="shrink-0">{chip}</span>}
      {actions && <span className="flex shrink-0 items-center gap-1.5">{actions}</span>}
    </div>
  );
}

/* ── Flip-chip (the status tile) ──────────────────────────────────────── */

export type ChipTone = "neutral" | "act" | "now" | "done" | "void" | "signal";

const CHIP_TONE: Record<ChipTone, string> = {
  neutral: "bg-[var(--color-gray-100)] text-[var(--color-gray-600)]",
  act: "bg-[var(--core-brand-color)] text-black",
  now: "bg-[var(--brand-taupe-muted)] text-white",
  done: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  void: "bg-transparent text-[var(--color-gray-400)] ring-1 ring-inset ring-[var(--board-groove)]",
  signal: "bg-[var(--board-amber-soft)] text-[var(--board-amber)] ring-1 ring-inset ring-[var(--board-amber)]/30",
};

export function FlipChip({ value, tone = "neutral", className }: { value: string; tone?: ChipTone; className?: string }) {
  const [flip, setFlip] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setFlip(true);
      const id = setTimeout(() => setFlip(false), 240);
      return () => clearTimeout(id);
    }
  }, [value]);

  return (
    <span
      className={cn(
        "inline-flex min-w-[4.5rem] items-center justify-center rounded-[6px] px-2 py-1 text-center font-[family-name:var(--font-heading)] text-[0.62rem] font-bold uppercase tracking-[0.1em] tabular-nums",
        CHIP_TONE[tone],
        flip && "animate-chip-flip",
        className,
      )}
    >
      {value}
    </span>
  );
}

/* ── Week strip ──────────────────────────────────────────────────────── */

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

export function WeekStrip({ selected, onSelect, className }: { selected: Date; onSelect: (d: Date) => void; className?: string }) {
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
        <Legend>{month}</Legend>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Semaine précédente"
            onClick={() => shift(-7)}
            className="flex size-10 items-center justify-center rounded-full border border-[var(--board-groove)] bg-white text-[var(--color-gray-500)] transition active:scale-90 hover:bg-[var(--color-gray-50)]"
          >
            <ChevronLeft aria-hidden className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Semaine suivante"
            onClick={() => shift(7)}
            className="flex size-10 items-center justify-center rounded-full border border-[var(--board-groove)] bg-white text-[var(--color-gray-500)] transition active:scale-90 hover:bg-[var(--color-gray-50)]"
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
                "flex min-h-[60px] flex-col items-center justify-center gap-0.5 rounded-[10px] border py-2 transition active:scale-[0.97]",
                active
                  ? "border-transparent bg-[var(--core-brand-color)] text-black"
                  : "border-[var(--board-groove)] bg-white text-[var(--color-gray-500)] hover:bg-[var(--color-gray-50)]",
                !active && isToday && "ring-1 ring-inset ring-[var(--brand-taupe-muted)]",
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

/* ── Chip filter (compact, sits on a board's legend line) ─────────────── */

export function ChipFilter({
  value,
  onChange,
  options,
  className,
  wrap = true,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; count?: number }[];
  className?: string;
  /** false → one non-wrapping row that scrolls horizontally (for long category lists). */
  wrap?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5",
        wrap ? "flex-wrap" : "min-w-0 flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[0.8rem] font-semibold transition active:scale-[0.97]",
              active
                ? "bg-[var(--brand-taupe-muted)] text-white"
                : "border border-[var(--board-groove)] bg-white text-[var(--color-gray-500)] hover:bg-[var(--color-gray-50)]",
            )}
          >
            {o.label}
            {typeof o.count === "number" && (
              <span className={cn("tabular-nums", active ? "text-white/60" : "text-[var(--color-gray-400)]")}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Volet switch (exclusive sub-sections of one section) ─────────────── */

export function VoletSwitch({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; badge?: React.ReactNode }[];
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1 border-b border-[var(--board-groove)]", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "relative flex min-h-12 items-center gap-2 px-4 pb-2.5 pt-1 font-[family-name:var(--font-heading)] text-[0.72rem] font-bold uppercase tracking-[0.11em] transition",
              "after:absolute after:inset-x-3 after:-bottom-px after:h-[2px] after:rounded-full after:transition-colors",
              active
                ? "text-[var(--color-gray-900)] after:bg-[var(--brand-taupe-muted)]"
                : "text-[var(--color-gray-400)] after:bg-transparent hover:text-[var(--color-gray-600)]",
            )}
          >
            {o.label}
            {o.badge}
          </button>
        );
      })}
    </div>
  );
}

/* ── Board empty line (board-world, not the dashed-circle EmptyState) ──── */

export function BoardEmpty({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <Legend>{title}</Legend>
      {hint && <p className="max-w-sm text-sm text-[var(--color-gray-500)]">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
