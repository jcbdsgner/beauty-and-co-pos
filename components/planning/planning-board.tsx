"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Store } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Button } from "@/components/ui/atoms/button";
import { BoardHeader } from "@/components/ui/board";
import { SegmentedToggle } from "@/components/ui/molecules/segmented-toggle";
import { PeriodNav } from "@/components/planning/period-nav";
import { DayTimeline } from "@/components/planning/day-timeline";
import { WeekTimeline } from "@/components/planning/week-timeline";
import { AppointmentDetailSheet } from "@/components/planning/appointment-detail-sheet";
import { PriseRdvModal } from "@/components/prise-rdv/prise-rdv-modal";
import { useEncaissement } from "@/components/journee/use-encaissement";
import { useAppData } from "@/components/providers/app-data-provider";
import { SALONS, salonById } from "@/lib/data/entreprises";
import { isSalonClosed, isWorkingOn, salonsOf, shiftsFor } from "@/lib/data/praticiennes";
import { POSTE_SALON_ID } from "@/lib/session";
import { dateISO, flattenRendezVous, reservationDate, type PlanningPeriod } from "@/lib/data/planning";
import type { Praticienne, RendezVous, Role } from "@/lib/data/types";

/** Filtre de salon du Planning (ADR 0028) — "tous" affiche l'équipe complète, sans distinction. */
const TOUS_LES_SALONS = "tous";

/** Filtre de métier du Planning — "tous" garde toute l'équipe planifiable (ménage compris). */
type MetierFilter = "tous" | "coiffeuse" | "estheticienne";
const METIER_OPTIONS: { value: MetierFilter; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "coiffeuse", label: "Coiffeurs" },
  { value: "estheticienne", label: "Esthéticiens" },
];

/**
 * Planning — reconstruit à la lettre du Figma (node 270:2466, ADR 0025) : un seul écran, le
 * programme de chaque praticienne, une seule surface (pas de sidebar de filtre séparée — le
 * Figma n'en a pas). Plus de bascule « Rendez-vous / Planning » : la liste de réservations à
 * encaisser vit désormais exclusivement sur l'Accueil. Vue Jour basculée en vertical (même principe
 * que la reconstruction Figma d'ADR 0025, axe renversé) : une colonne par praticienne, le temps
 * défile verticalement ; zone grisée = hors de son horaire hebdomadaire du jour affiché. Vue Jour
 * (défaut) et Semaine — pas de vue Mois, absente du Figma.
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
  const [salonFilter, setSalonFilter] = useState<string>(POSTE_SALON_ID);
  const [metierFilter, setMetierFilter] = useState<MetierFilter>("tous");
  const [visibleIds, setVisibleIds] = useState<Set<string> | null>(null);
  const [detail, setDetail] = useState<RendezVous | null>(null);
  // Créneau cliqué dans la vue Jour → « Créer un rendez-vous » pré-réglé dessus.
  const [pickedSlot, setPickedSlot] = useState<{ date: Date; time: string; staffId: string; salonId: string } | null>(null);

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

  const salonId = salonFilter === TOUS_LES_SALONS ? null : salonFilter;
  const isWeek = period === "semaine";

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
  // Le salon est porté par chaque rendez-vous (ADR 0036) : un salon regardé ne montre que les siens.
  const dayRows = useMemo(
    () => rowsAll.filter((r) => reservationDate(r.reservation) === selectedISO && (!salonId || r.rv.salonId === salonId)),
    [rowsAll, selectedISO, salonId],
  );

  // Une praticienne n'a plus de salon fixe (ADR 0036) : le filtre de salon retient, pour le jour
  // affiché, celles qui y ont une plage ou un rendez-vous — plus, en repos ce jour-là, celles qui y
  // travaillent d'habitude (colonne « Repos », comme avant). Une praticienne toute la journée dans
  // l'autre salon n'y figure pas. En semaine : celles qui y travaillent au fil de la semaine. Le
  // filtre de métier s'applique par-dessus, en amont de l'isolement d'une ligne.
  const bySalon = useMemo(() => {
    const byMetier = schedulable.filter((p) => metierFilter === "tous" || p.role === metierFilter);
    if (!salonId) return byMetier;
    const hasRowsHere = (p: Praticienne, rows: typeof rowsAll) =>
      rows.some((r) => r.rv.salonId === salonId && (r.rv.staffId === p.id || r.rv.secondStaffId === p.id));
    if (isWeek) {
      const weekISO = new Set(weekDays.map(dateISO));
      const weekRows = rowsAll.filter((r) => weekISO.has(reservationDate(r.reservation)));
      return byMetier.filter((p) => salonsOf(p).includes(salonId) || hasRowsHere(p, weekRows));
    }
    return byMetier.filter(
      (p) =>
        isWorkingOn(p, selectedDate, salonId) ||
        hasRowsHere(p, dayRows) ||
        (!isWorkingOn(p, selectedDate) && salonsOf(p).includes(salonId)),
    );
  }, [schedulable, metierFilter, salonId, isWeek, weekDays, rowsAll, dayRows, selectedDate]);

  // Salon regardé fermé ce jour-là (Almadies le lundi) : la vue Jour le dit au lieu d'une grille
  // vide, et nomme celles de son équipe qui travaillent dans l'autre salon.
  const closedSalon = !isWeek && salonId && isSalonClosed(salonId, selectedDate) ? salonById(salonId) : undefined;
  const otherSalon = SALONS.find((s) => s.id !== salonId);
  const elsewhereToday = closedSalon
    ? schedulable.filter((p) => salonsOf(p).includes(closedSalon.id) && shiftsFor(p, selectedDate).length > 0)
    : [];

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
  function changeMetierFilter(value: string) {
    setMetierFilter(value as MetierFilter);
    setVisibleIds(null);
  }

  function pickDay(d: Date, staffId?: string) {
    setSelectedDate(d);
    setPeriod("jour");
    if (staffId) isolate(staffId);
  }

  return (
    <div className="flex flex-col gap-6">
      <BoardHeader
        section="Planning"
        action={
          <div className="flex items-center gap-3">
            <SegmentedToggle size="sm" value={metierFilter} onChange={changeMetierFilter} options={METIER_OPTIONS} />
            <SegmentedToggle
              size="sm"
              value={salonFilter}
              onChange={changeSalonFilter}
              options={[
                { value: TOUS_LES_SALONS, label: "Tous les salons" },
                ...SALONS.map((s) => ({ value: s.id, label: s.name })),
              ]}
            />
          </div>
        }
      />

      <PeriodNav period={period} onPeriodChange={setPeriod} date={selectedDate} onDateChange={setSelectedDate} today={today} />

      <div className="min-w-0 overflow-hidden rounded-box border border-base-300 bg-base-100">
        {isWeek ? (
          <WeekTimeline
            weekDays={weekDays}
            salonId={salonId}
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
        ) : closedSalon ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-base-200 text-base-content/45">
              <Store aria-hidden className="size-6" />
            </span>
            <div>
              <p className="font-[family-name:var(--font-heading)] text-[15px] font-semibold text-base-content">
                {closedSalon.name} est fermé le {new Intl.DateTimeFormat("fr-FR", { weekday: "long" }).format(selectedDate)}
              </p>
              <p className="mt-1 text-sm text-base-content/50">Aucun rendez-vous ne s&apos;y tient ce jour-là.</p>
            </div>
            {elsewhereToday.length > 0 && otherSalon && (
              <div className="flex items-center gap-2 rounded-full bg-base-200/70 py-1 pl-1 pr-3 text-sm text-base-content/65">
                <span className="flex -space-x-2">
                  {elsewhereToday.map((p) => (
                    <Avatar key={p.id} photoUrl={p.photoUrl} initial={p.initial} size={26} className="ring-2 ring-base-100" />
                  ))}
                </span>
                {elsewhereToday.map((p) => p.name).join(", ")} {elsewhereToday.length > 1 ? "travaillent" : "travaille"} à {otherSalon.name}
              </div>
            )}
            {otherSalon && (
              <Button variant="outline" size="sm" onClick={() => changeSalonFilter(otherSalon.id)}>
                Voir {otherSalon.name}
              </Button>
            )}
          </div>
        ) : (
          <DayTimeline
            date={selectedDate}
            salonId={salonId}
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
            onPickSlot={(staffId, time, slotSalonId) =>
              setPickedSlot({ date: selectedDate, time, staffId, salonId: slotSalonId })
            }
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
      <PriseRdvModal
        open={pickedSlot !== null}
        defaultSalonId={pickedSlot?.salonId}
        pickedSlot={pickedSlot ?? undefined}
        onClose={() => setPickedSlot(null)}
      />
      {encaissementDialog}
    </div>
  );
}
