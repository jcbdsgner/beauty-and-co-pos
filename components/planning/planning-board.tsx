"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { Switch } from "@/components/ui/atoms/switch";
import { BoardHeader, ChipFilter } from "@/components/ui/board";
import { RosterFilter } from "@/components/planning/roster-filter";
import { DateStrip } from "@/components/planning/date-strip";
import { DayTimeline } from "@/components/planning/day-timeline";
import { WeekTimeline } from "@/components/planning/week-timeline";
import { AppointmentDetailSheet } from "@/components/planning/appointment-detail-sheet";
import { useEncaissement } from "@/components/journee/use-encaissement";
import { useAppData } from "@/components/providers/app-data-provider";
import { dateISO, flattenRendezVous, reservationDate } from "@/lib/data/planning";
import type { RendezVous, Role } from "@/lib/data/types";

/**
 * Planning (ADR 0020) — refonte totale : un seul écran, le programme de chaque praticienne. Plus
 * de bascule « Rendez-vous / Planning » : la liste de réservations à encaisser vit désormais
 * exclusivement sur l'Accueil. Axe renversé vs l'ancien `DayGrid` : une ligne par praticienne, le
 * temps défile horizontalement ; zone grisée = hors de son horaire hebdomadaire du jour affiché.
 * Vue Jour (défaut) et Semaine — pas de vue Mois (délibérément hors périmètre).
 */
type PlanningPeriod = "jour" | "semaine";

const ROLE_RANK: Partial<Record<Role, number>> = { coiffeuse: 0, estheticienne: 1, menage: 2 };

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function PlanningBoard() {
  return (
    <Suspense fallback={null}>
      <PlanningBoardInner />
    </Suspense>
  );
}

function PlanningBoardInner() {
  const { reservations, praticiennes, clients, markStaffUnavailable } = useAppData();
  const { requestEncaissement, encaissementDialog } = useEncaissement();
  const searchParams = useSearchParams();
  const staffParam = searchParams.get("staff");

  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [period, setPeriod] = useState<PlanningPeriod>("jour");
  const [showCancelled, setShowCancelled] = useState(false);
  const [visibleIds, setVisibleIds] = useState<Set<string> | null>(null);
  const [detail, setDetail] = useState<RendezVous | null>(null);

  const isToday = sameDay(selectedDate, today);

  // Coiffure + esthétique + ménage sont affichées au Planning (l'accueil, la fonction du
  // comptoir, n'y figure jamais — voir CONTEXT.md « Praticienne »).
  const schedulable = useMemo(
    () =>
      praticiennes
        .filter((p) => p.role === "coiffeuse" || p.role === "estheticienne" || p.role === "menage")
        .sort((a, b) => ROLE_RANK[a.role]! - ROLE_RANK[b.role]! || a.name.localeCompare(b.name, "fr")),
    [praticiennes],
  );

  const allIds = useMemo(() => new Set(schedulable.map((p) => p.id)), [schedulable]);
  const activeVisible =
    visibleIds ?? (staffParam && allIds.has(staffParam) ? new Set([staffParam]) : allIds);
  const staff = schedulable.filter((p) => activeVisible.has(p.id));
  const isolatedId = activeVisible.size === 1 ? [...activeVisible][0] : null;

  function toggleVisible(id: string) {
    const next = new Set(activeVisible);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setVisibleIds(next.size > 0 ? next : activeVisible);
  }
  function isolate(id: string) {
    setVisibleIds(new Set([id]));
  }
  function showAll() {
    setVisibleIds(allIds);
  }

  const weekDays = useMemo(() => {
    const wd = (selectedDate.getDay() + 6) % 7;
    const s = new Date(selectedDate);
    s.setDate(selectedDate.getDate() - wd);
    s.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  const rowsAll = useMemo(
    () => flattenRendezVous(reservations).filter((r) => showCancelled || r.rv.status !== "annule"),
    [reservations, showCancelled],
  );
  const selectedISO = dateISO(selectedDate);
  const dayRows = useMemo(
    () => rowsAll.filter((r) => reservationDate(r.reservation) === selectedISO),
    [rowsAll, selectedISO],
  );

  function pickDay(d: Date, staffId?: string) {
    setSelectedDate(d);
    setPeriod("jour");
    if (staffId) isolate(staffId);
  }

  const isWeek = period === "semaine";

  return (
    <div className="flex flex-col gap-6">
      <BoardHeader
        section="Planning"
        reset={
          !isToday &&
          !isWeek && (
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
              Aujourd&apos;hui
            </Button>
          )
        }
      />

      <DateStrip selected={selectedDate} onSelect={setSelectedDate} />

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <ChipFilter
          value={period}
          onChange={(v) => setPeriod(v as PlanningPeriod)}
          options={[
            { value: "jour", label: "Jour" },
            { value: "semaine", label: "Semaine" },
          ]}
        />
        <label className="flex items-center gap-2 text-sm text-base-content/60">
          Afficher les annulés
          <Switch checked={showCancelled} onChange={setShowCancelled} label="Afficher les rendez-vous annulés" />
        </label>
      </div>

      {isolatedId && (
        <button
          type="button"
          onClick={showAll}
          className="flex w-fit items-center gap-2 rounded-full bg-primary px-3.5 py-2 text-sm font-medium text-primary-content transition active:scale-[0.97]"
        >
          {schedulable.find((p) => p.id === isolatedId)?.name}
          <span className="opacity-70">· voir toute l&apos;équipe</span>
          <Undo2 aria-hidden className="size-3.5" />
        </button>
      )}

      <div className="flex items-start gap-4">
        <RosterFilter
          staff={schedulable}
          date={selectedDate}
          visibleIds={activeVisible}
          isolatedId={isolatedId}
          onToggle={toggleVisible}
          onIsolate={isolate}
          onShowAll={showAll}
          onMarkAbsent={markStaffUnavailable}
          isToday={isToday}
        />
        <div className="min-w-0 flex-1 overflow-hidden rounded-box border border-base-300 bg-base-100">
          {isWeek ? (
            <WeekTimeline
              weekDays={weekDays}
              today={today}
              staff={staff}
              allRows={rowsAll}
              onPickDay={pickDay}
              onIsolate={isolate}
              onMarkAbsent={markStaffUnavailable}
            />
          ) : (
            <DayTimeline
              date={selectedDate}
              isToday={isToday}
              staff={staff}
              rows={dayRows}
              clients={clients}
              onOpenReservation={setDetail}
              onIsolate={isolate}
              onMarkAbsent={markStaffUnavailable}
            />
          )}
        </div>
      </div>

      <AppointmentDetailSheet
        appointment={detail}
        onClose={() => setDetail(null)}
        onEncaisser={(id) => {
          setDetail(null);
          requestEncaissement(id);
        }}
      />
      {encaissementDialog}
    </div>
  );
}
