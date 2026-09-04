"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarRange, ListChecks, X } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { Switch } from "@/components/ui/atoms/switch";
import { SegmentedToggle } from "@/components/ui/molecules/segmented-toggle";
import { BoardHeader, Board, WeekStrip, BoardEmpty, ChipFilter } from "@/components/ui/board";
import { AppointmentDetailSheet } from "@/components/planning/appointment-detail-sheet";
import { DayList } from "@/components/planning/day-list";
import { DayGrid } from "@/components/planning/day-grid";
import { WeekList } from "@/components/planning/week-list";
import { WeekGrid } from "@/components/planning/week-grid";
import { useEncaissement } from "@/components/journee/use-encaissement";
import { useAppData } from "@/components/providers/app-data-provider";
import { dateISO, flattenRendezVous, groupDayByReservation, reservationDate, type RendezVousRow } from "@/lib/data/planning";
import type { RendezVous, Role } from "@/lib/data/types";

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfWeek(d: Date) {
  const wd = (d.getDay() + 6) % 7;
  const s = new Date(d);
  s.setDate(d.getDate() - wd);
  s.setHours(0, 0, 0, 0);
  return s;
}

/**
 * Le Planning est deux écrans derrière une bascule (demande utilisateur), × deux échelles de temps :
 *  — vue « Rendez-vous » : la journée classée par le temps, une ligne = une réservation (payeuse),
 *    l'écran de la réceptionniste qui encaisse (partage `DayList` avec l'Accueil, ADR 0014) ;
 *  — vue « Planning » : la journée de chaque praticienne, grille heures × colonnes (`DayGrid`) ;
 *  — période « Jour » (défaut) ou « Semaine » : les 7 jours empilés (`WeekList`) / une semaine en
 *    grille pour une praticienne isolée + une matrice de charge pour l'équipe (`WeekGrid`).
 * L'ex-sous-page Équipe = ce Planning ouvert sur la vue « Planning ». Langage « Le Tableau » (ADR 0005).
 */
export type PlanningView = "rendez-vous" | "planning";
type PlanningPeriod = "jour" | "semaine";

type PlanningBoardProps = { initialView?: PlanningView };

const ROLE_RANK: Partial<Record<Role, number>> = { coiffeuse: 0, estheticienne: 1 };

export function PlanningBoard({ initialView = "rendez-vous" }: PlanningBoardProps) {
  return (
    <Suspense fallback={null}>
      <PlanningBoardInner initialView={initialView} />
    </Suspense>
  );
}

function PlanningBoardInner({ initialView }: Required<PlanningBoardProps>) {
  const { reservations, praticiennes, clients, markStaffUnavailable } = useAppData();
  const { requestEncaissement, encaissementDialog } = useEncaissement();
  const searchParams = useSearchParams();
  const staffParam = searchParams.get("staff");

  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [view, setView] = useState<PlanningView>(staffParam ? "planning" : initialView);
  const [period, setPeriod] = useState<PlanningPeriod>("jour");
  const [showCancelled, setShowCancelled] = useState(false);
  const [soloStaffId, setSoloStaffId] = useState<string | null>(() => staffParam);
  const [detail, setDetail] = useState<RendezVous | null>(null);

  const isToday = sameDay(selectedDate, today);
  const weekDays = useMemo(() => {
    const s = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  const selectedISO = dateISO(selectedDate);
  const dayReservations = useMemo(
    () => reservations.filter((r) => reservationDate(r) === selectedISO),
    [reservations, selectedISO],
  );

  // Coiffure + esthétique are schedulable; accueil + ménage never carry rendez-vous.
  const schedulable = useMemo(
    () =>
      praticiennes
        .filter((p) => p.role === "coiffeuse" || p.role === "estheticienne")
        .sort((a, b) => ROLE_RANK[a.role]! - ROLE_RANK[b.role]! || a.name.localeCompare(b.name, "fr")),
    [praticiennes],
  );
  const workingStaff = schedulable.filter((p) => p.workingToday);
  const gridStaff = soloStaffId ? workingStaff.filter((p) => p.id === soloStaffId) : workingStaff;
  const soloStaff = soloStaffId ? praticiennes.find((p) => p.id === soloStaffId) ?? null : null;

  const onStaff = (r: RendezVousRow, id: string) => r.rv.staffId === id || r.rv.secondStaffId === id;
  const touchesStaff = (rvs: RendezVous[], id: string) => rvs.some((rv) => rv.staffId === id || rv.secondStaffId === id);

  const rvRows = useMemo<RendezVousRow[]>(
    () =>
      flattenRendezVous(dayReservations).filter(
        (r) => (showCancelled || r.rv.status !== "annule") && (!soloStaffId || onStaff(r, soloStaffId)),
      ),
    [dayReservations, showCancelled, soloStaffId],
  );

  const reservationRows = useMemo(() => {
    const scoped = soloStaffId
      ? dayReservations.filter((res) => touchesStaff(res.rendezVous, soloStaffId))
      : dayReservations;
    return groupDayByReservation(scoped, { includeCancelled: showCancelled });
  }, [dayReservations, soloStaffId, showCancelled]);

  // Week feeds — WeekList / WeekGrid slice per calendar day themselves (via reservationDate).
  const weekReservations = useMemo(
    () => (soloStaffId ? reservations.filter((res) => touchesStaff(res.rendezVous, soloStaffId)) : reservations),
    [reservations, soloStaffId],
  );
  const weekRvRows = useMemo(
    () => flattenRendezVous(reservations).filter((r) => r.rv.status !== "annule"),
    [reservations],
  );

  const rvCount = rvRows.filter((r) => r.rv.status !== "annule").length;
  const isWeek = period === "semaine";

  function pickDay(d: Date, staffId?: string) {
    setSelectedDate(d);
    setPeriod("jour");
    if (staffId) setSoloStaffId(staffId);
  }

  let body: React.ReactNode;
  if (isWeek && view === "rendez-vous") {
    body = (
      <WeekList
        weekDays={weekDays}
        today={today}
        todayReservations={weekReservations}
        includeCancelled={showCancelled}
        clients={clients}
        praticiennes={praticiennes}
        onOpenReservation={setDetail}
        onEncaisser={requestEncaissement}
        onPickDay={(d) => pickDay(d)}
      />
    );
  } else if (isWeek) {
    body = (
      <WeekGrid
        weekDays={weekDays}
        today={today}
        todayRows={weekRvRows}
        staff={workingStaff}
        soloStaff={soloStaff}
        clients={clients}
        onOpenReservation={setDetail}
        onPickDay={pickDay}
        onClearSolo={() => setSoloStaffId(null)}
      />
    );
  } else if (!isToday) {
    body = (
      <BoardEmpty
        title="Aucun rendez-vous ce jour-là"
        hint="Les données de démonstration ne couvrent qu'aujourd'hui — revenez au jour réel, ou passez en vue Semaine."
        action={<Button variant="outline" onClick={() => setSelectedDate(new Date())}>{"Revenir à aujourd'hui"}</Button>}
      />
    );
  } else if (workingStaff.length === 0) {
    body = <BoardEmpty title="Personne au planning ce jour-là" hint="Aucune praticienne ne travaille aujourd'hui." />;
  } else if ((view === "rendez-vous" ? reservationRows.length : rvCount) === 0) {
    body = (
      <BoardEmpty
        title={soloStaff ? `Journée libre pour ${soloStaff.name}` : "Journée libre"}
        hint="Les rendez-vous sont pris en ligne par les clientes — ils apparaissent ici une fois réservés."
      />
    );
  } else if (view === "rendez-vous") {
    body = (
      <DayList
        rows={reservationRows}
        clients={clients}
        praticiennes={praticiennes}
        onOpenReservation={setDetail}
        onEncaisser={requestEncaissement}
      />
    );
  } else {
    body = (
      <DayGrid
        rows={rvRows}
        staff={gridStaff}
        clients={clients}
        soloStaffId={soloStaffId}
        onOpenReservation={setDetail}
        onSolo={setSoloStaffId}
        onMarkAbsent={markStaffUnavailable}
      />
    );
  }

  const boardLegend = isWeek
    ? view === "rendez-vous"
      ? "La semaine"
      : soloStaff
        ? undefined // WeekGrid solo carries its own "La semaine de {name}" header
        : "Charge de l'équipe"
    : view === "rendez-vous"
      ? "Le jour"
      : "L'équipe";

  const shortMonth = (d: Date) => new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(d).replace(".", "");
  const legendRight = isWeek ? (
    <span className="text-xs tabular-nums text-[var(--color-gray-400)]">
      semaine du {weekDays[0].getDate()} {shortMonth(weekDays[0])} au {weekDays[6].getDate()} {shortMonth(weekDays[6])}
    </span>
  ) : isToday && workingStaff.length > 0 ? (
    <span className="text-xs tabular-nums text-[var(--color-gray-400)]">
      {view === "rendez-vous"
        ? `${reservationRows.length} ${reservationRows.length > 1 ? "réservations" : "réservation"} · ${workingStaff.length} en poste`
        : `${gridStaff.length} ${gridStaff.length > 1 ? "praticiennes" : "praticienne"} · ${rvCount} rdv`}
    </span>
  ) : undefined;

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

      <WeekStrip selected={selectedDate} onSelect={setSelectedDate} />

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedToggle
            value={view}
            onChange={(v) => setView(v as PlanningView)}
            options={[
              { value: "rendez-vous", label: "Rendez-vous", icon: <ListChecks className="size-4" /> },
              { value: "planning", label: "Planning", icon: <CalendarRange className="size-4" /> },
            ]}
          />
          <ChipFilter
            value={period}
            onChange={(v) => setPeriod(v as PlanningPeriod)}
            options={[
              { value: "jour", label: "Jour" },
              { value: "semaine", label: "Semaine" },
            ]}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--color-gray-600)]">
          Afficher les annulés
          <Switch checked={showCancelled} onChange={setShowCancelled} label="Afficher les rendez-vous annulés" />
        </label>
      </div>

      {soloStaff && (
        <button
          type="button"
          onClick={() => setSoloStaffId(null)}
          className="flex w-fit items-center gap-2 rounded-full bg-[var(--brand-taupe-muted)] px-3.5 py-2 text-sm font-medium text-white transition active:scale-[0.97]"
        >
          {soloStaff.name}
          <span className="opacity-70">· voir toute l&apos;équipe</span>
          <X aria-hidden className="size-3.5" />
        </button>
      )}

      <Board legend={boardLegend} legendRight={legendRight}>
        {body}
      </Board>

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
