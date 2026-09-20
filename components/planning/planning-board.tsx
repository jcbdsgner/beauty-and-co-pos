"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BoardHeader, ChipFilter } from "@/components/ui/board";
import { PeriodNav } from "@/components/planning/period-nav";
import { DayTimeline } from "@/components/planning/day-timeline";
import { WeekTimeline } from "@/components/planning/week-timeline";
import { AppointmentDetailSheet } from "@/components/planning/appointment-detail-sheet";
import { useEncaissement } from "@/components/journee/use-encaissement";
import { useAppData } from "@/components/providers/app-data-provider";
import { SALONS } from "@/lib/data/entreprises";
import { dateISO, flattenRendezVous, reservationDate, type PlanningPeriod } from "@/lib/data/planning";
import type { RendezVous, Role } from "@/lib/data/types";

/** Filtre de salon du Planning (ADR 0028) — "tous" affiche l'équipe complète, sans distinction. */
const TOUS_LES_SALONS = "tous";

/**
 * Planning — reconstruit à la lettre du Figma (node 270:2466, ADR 0025) : un seul écran, le
 * programme de chaque praticienne, une seule surface (pas de sidebar de filtre séparée — le
 * Figma n'en a pas). Plus de bascule « Rendez-vous / Planning » : la liste de réservations à
 * encaisser vit désormais exclusivement sur l'Accueil. Axe renversé vs l'ancien `DayGrid` : une
 * ligne par praticienne, le temps défile horizontalement ; zone grisée = hors de son horaire
 * hebdomadaire du jour affiché. Vue Jour (défaut) et Semaine — pas de vue Mois, absente du Figma.
 */
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
  const { reservations, praticiennes, markStaffUnavailable, movePraticienne } = useAppData();
  const { requestEncaissement, encaissementDialog } = useEncaissement();
  const searchParams = useSearchParams();
  const staffParam = searchParams.get("staff");

  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [period, setPeriod] = useState<PlanningPeriod>("jour");
  const [salonFilter, setSalonFilter] = useState<string>(TOUS_LES_SALONS);
  const [visibleIds, setVisibleIds] = useState<Set<string> | null>(null);
  const [detail, setDetail] = useState<RendezVous | null>(null);

  const isToday = sameDay(selectedDate, today);

  // Coiffure + esthétique + ménage sont affichées au Planning (l'accueil, la fonction du
  // comptoir, n'y figure jamais — voir CONTEXT.md « Praticienne »). Tri stable par rôle
  // seulement : l'ordre à l'intérieur d'un rôle suit l'ordre de `praticiennes` dans le store,
  // que `movePraticienne` (glisser-déposer) réordonne — plus de tri alphabétique figé.
  const schedulable = useMemo(
    () =>
      praticiennes
        .filter((p) => p.role === "coiffeuse" || p.role === "estheticienne" || p.role === "menage")
        .sort((a, b) => ROLE_RANK[a.role]! - ROLE_RANK[b.role]!),
    [praticiennes],
  );

  // Index stable par praticienne (position dans l'équipe planifiable au complet) — pilote la
  // couleur d'accent (lib/data/praticienne-colors.ts), indépendamment du filtre de salon ou
  // d'isolement : une praticienne garde sa teinte qu'on regarde un salon ou tous.
  const accentIndex = useMemo(() => new Map(schedulable.map((p, i) => [p.id, i] as const)), [schedulable]);

  // Une praticienne n'est jamais aux deux salons à la fois (ADR 0028) : le filtre de salon réduit
  // l'équipe planifiable en amont de l'isolement d'une ligne.
  const bySalon = useMemo(
    () => (salonFilter === TOUS_LES_SALONS ? schedulable : schedulable.filter((p) => p.salonId === salonFilter)),
    [schedulable, salonFilter],
  );

  const allIds = useMemo(() => new Set(bySalon.map((p) => p.id)), [bySalon]);
  const activeVisible =
    visibleIds ?? (staffParam && allIds.has(staffParam) ? new Set([staffParam]) : allIds);
  const staff = bySalon.filter((p) => activeVisible.has(p.id));
  const isolatedId = activeVisible.size === 1 ? [...activeVisible][0] : null;

  function isolate(id: string) {
    setVisibleIds(new Set([id]));
  }
  function showAll() {
    setVisibleIds(allIds);
  }
  function changeSalonFilter(id: string) {
    setSalonFilter(id);
    setVisibleIds(null); // une ligne isolée d'un salon peut ne plus exister dans l'autre
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
    () => flattenRendezVous(reservations).filter((r) => r.rv.status !== "annule"),
    [reservations],
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
        action={
          <ChipFilter
            value={salonFilter}
            onChange={changeSalonFilter}
            options={[
              { value: TOUS_LES_SALONS, label: "Tous les salons" },
              ...SALONS.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        }
      />

      <PeriodNav period={period} onPeriodChange={setPeriod} date={selectedDate} onDateChange={setSelectedDate} today={today} />

      <div className="min-w-0 overflow-hidden rounded-box border border-base-300 bg-base-100">
        {isWeek ? (
          <WeekTimeline
            weekDays={weekDays}
            today={today}
            staff={staff}
            accentIndex={accentIndex}
            allRows={rowsAll}
            isolatedId={isolatedId}
            onPickDay={pickDay}
            onIsolate={isolate}
            onShowAll={showAll}
            onMarkAbsent={markStaffUnavailable}
          />
        ) : (
          <DayTimeline
            date={selectedDate}
            isToday={isToday}
            staff={staff}
            accentIndex={accentIndex}
            rows={dayRows}
            isolatedId={isolatedId}
            onOpenReservation={setDetail}
            onIsolate={isolate}
            onShowAll={showAll}
            onMarkAbsent={markStaffUnavailable}
            onReorder={movePraticienne}
          />
        )}
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
