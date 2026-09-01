"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MoreHorizontal, UserX, Eye, X, Users } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Button } from "@/components/ui/atoms/button";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { Switch } from "@/components/ui/atoms/switch";
import { DropdownMenu } from "@/components/ui/molecules/dropdown-menu";
import { BoardHeader, Board, Lane, FlipChip, Legend, WeekStrip, BoardEmpty, ChipFilter, type ChipTone, type LaneSignal } from "@/components/ui/board";
import { AppointmentDetailSheet } from "@/components/planning/appointment-detail-sheet";
import { useEncaissement } from "@/components/journee/use-encaissement";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import { serviceById } from "@/lib/data/menu";
import { appointmentEndTime, flattenRendezVous } from "@/lib/data/planning";
import type { Praticienne, RendezVous, Reservation } from "@/lib/data/types";

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

type Row = { rv: RendezVous; reservation: Reservation };

type PlanningBoardProps = { initialGrouping?: "praticienne" | "equipe" };

export function PlanningBoard({ initialGrouping = "praticienne" }: PlanningBoardProps) {
  return (
    <Suspense fallback={null}>
      <PlanningBoardInner initialGrouping={initialGrouping} />
    </Suspense>
  );
}

function PlanningBoardInner({ initialGrouping }: Required<PlanningBoardProps>) {
  const { reservations, praticiennes, clients, markStaffUnavailable } = useAppData();
  const { requestEncaissement, encaissementDialog } = useEncaissement();
  const searchParams = useSearchParams();

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [grouping, setGrouping] = useState<"praticienne" | "equipe">(initialGrouping);
  const [showCancelled, setShowCancelled] = useState(false);
  const [staffFilter, setStaffFilter] = useState<string | null>(() => searchParams.get("staff"));

  const [detail, setDetail] = useState<RendezVous | null>(null);

  const today = new Date();
  const isToday = sameDay(selectedDate, today);

  // The mock only carries "today" — be honest rather than showing a silent empty board.
  const dayRows = useMemo<Row[]>(
    () => (isToday ? flattenRendezVous(reservations) : []).filter((r) => showCancelled || r.rv.status !== "annule"),
    [isToday, reservations, showCancelled],
  );

  // Coiffure + esthétique get a lane; ménage shows in the Équipe rail but never carries rendez-vous;
  // accueil is off the planning entirely.
  const schedulable = praticiennes.filter((p) => p.role !== "accueil" && p.role !== "menage");
  const menageStaff = praticiennes.filter((p) => p.role === "menage");
  const workingStaff = schedulable.filter((p) => p.workingToday);

  const onStaff = (r: Row, id: string) => r.rv.staffId === id || r.rv.secondStaffId === id;
  const visibleStaff = staffFilter ? schedulable.filter((p) => p.id === staffFilter) : schedulable;
  const filteredRows = staffFilter ? dayRows.filter((r) => onStaff(r, staffFilter)) : dayRows;

  function apptLane(row: Row, showStaff: boolean, laneStaffId?: string) {
    const { rv, reservation } = row;
    const payer = clients.find((c) => c.id === reservation.payerClientId);
    const service = serviceById(rv.serviceId);
    const staff = praticiennes.find((p) => p.id === rv.staffId);
    const second = rv.secondStaffId ? praticiennes.find((p) => p.id === rv.secondStaffId) : null;
    // When a two-practitioner rendez-vous is shown on the *second* practitioner's lane, the
    // encaissement belongs to the primary lane only — this lane is read-only so the receptionist
    // can't start (or think she double-started) the same sale twice.
    const isSecondLane = Boolean(laneStaffId && second && laneStaffId === rv.secondStaffId && laneStaffId !== rv.staffId);
    const partnerName = isSecondLane ? staff?.name : second?.name;
    const benef = rv.beneficiaryClientId
      ? clients.find((c) => c.id === rv.beneficiaryClientId)?.lastName
      : rv.beneficiaryName;
    const absent =
      (staff?.unavailableToday || (second && praticiennes.find((p) => p.id === second.id)?.unavailableToday)) &&
      rv.status !== "annule";
    const hasSale = Boolean(reservation.saleId);
    // A rendez-vous carries a chip only when there's something to say: cashed-in, or cancelled.
    const chip =
      rv.status === "annule"
        ? { value: "Annulé", tone: "void" as ChipTone }
        : hasSale
          ? { value: "En cours", tone: "signal" as ChipTone }
          : null;
    const signal: LaneSignal = absent ? "hold" : "none";
    const siblingCount = reservation.rendezVous.filter((x) => x.status !== "annule").length - 1;

    return (
      <Lane
        key={rv.id}
        leading={
          <span className="flex flex-col leading-tight">
            <span>{rv.start}</span>
            <span className="text-[0.7rem] font-normal text-[var(--color-gray-400)]">{appointmentEndTime(rv)}</span>
          </span>
        }
        title={payer ? clientFullName(payer) : "Cliente"}
        meta={
          <span>
            {service?.name ?? "Prestation"}
            {benef ? ` · pour ${benef}` : ""}
            {partnerName ? ` · à 2 avec ${partnerName}` : ""}
            {showStaff && staff ? ` · ${staff.name}` : ""}
            {siblingCount > 0 ? ` · +${siblingCount} sur la note` : ""}
            {absent ? " · praticienne absente" : ""}
          </span>
        }
        chip={
          (second || chip) && (
            <span className="flex items-center gap-1">
              {second && <Users aria-hidden className="size-3.5 text-[var(--brand-taupe-muted)]" />}
              {chip && <FlipChip value={chip.value} tone={chip.tone} />}
            </span>
          )
        }
        struck={rv.status === "annule"}
        signal={signal}
        onSelect={() => setDetail(rv)}
        actions={
          rv.status !== "annule" && (
            <Button size="sm" variant={hasSale ? "outline" : "dark"} onClick={() => requestEncaissement(reservation.id)}>
              {hasSale ? "Voir la vente" : "Encaisser"}
            </Button>
          )
        }
      />
    );
  }

  const rail = (
    <RosterRail
      staff={visibleStaff}
      menageStaff={staffFilter ? [] : menageStaff}
      rows={filteredRows}
      selectedDate={selectedDate}
      staffFilter={staffFilter}
      onFilter={setStaffFilter}
      onMarkAbsent={markStaffUnavailable}
      onStaff={onStaff}
    />
  );

  let bodyContent: React.ReactNode;
  if (!isToday) {
    bodyContent = (
      <BoardEmpty
        title="Aucun rendez-vous ce jour-là"
        hint="Les données de démonstration ne couvrent qu'aujourd'hui — revenez au jour réel pour voir la journée."
        action={<Button variant="outline" onClick={() => setSelectedDate(new Date())}>{"Revenir à aujourd'hui"}</Button>}
      />
    );
  } else if (workingStaff.length === 0) {
    bodyContent = <BoardEmpty title="Personne au planning ce jour-là" hint="Aucune praticienne ne travaille aujourd'hui." />;
  } else if (filteredRows.length === 0) {
    bodyContent = (
      <BoardEmpty
        title={staffFilter ? "Aucun rendez-vous pour cette praticienne" : "Journée libre"}
        hint="Les rendez-vous sont pris en ligne par les clientes — ils apparaissent ici une fois réservés."
      />
    );
  } else if (grouping === "praticienne" && !staffFilter) {
    bodyContent = visibleStaff
      .map((p) => {
        const items = filteredRows.filter((r) => onStaff(r, p.id)).sort((a, b) => a.rv.start.localeCompare(b.rv.start));
        if (items.length === 0) return null;
        return (
          <div key={p.id}>
            <div className="border-b border-[var(--board-groove)] bg-black/[0.02] px-4 py-2">
              <Legend>{p.name} · {items.length}</Legend>
            </div>
            {items.map((r) => apptLane(r, false))}
          </div>
        );
      })
      .filter(Boolean);
  } else {
    const byId = new Map(filteredRows.map((r) => [r.rv.id, r]));
    bodyContent = [...byId.values()]
      .sort((a, b) => a.rv.start.localeCompare(b.rv.start))
      .map((r) => apptLane(r, true));
  }

  return (
    <div className="flex flex-col gap-6">
      <BoardHeader
        section="Planning"
        reset={
          !isToday && (
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
              Aujourd&apos;hui
            </Button>
          )
        }
      />

      <WeekStrip selected={selectedDate} onSelect={setSelectedDate} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <ChipFilter
          value={grouping}
          onChange={(v) => setGrouping(v as "praticienne" | "equipe")}
          options={[
            { value: "praticienne", label: "Par praticienne" },
            { value: "equipe", label: "Toute l'équipe" },
          ]}
        />
        <label className="flex items-center gap-2 text-sm text-[var(--color-gray-600)]">
          Afficher les annulés
          <Switch checked={showCancelled} onChange={setShowCancelled} label="Afficher les rendez-vous annulés" />
        </label>
      </div>

      {staffFilter && (
        <button
          type="button"
          onClick={() => setStaffFilter(null)}
          className="flex w-fit items-center gap-2 rounded-full bg-[var(--brand-taupe-muted)] px-3.5 py-2 text-sm font-medium text-white transition active:scale-[0.97]"
        >
          {praticiennes.find((p) => p.id === staffFilter)?.name} · voir tout le monde
          <X aria-hidden className="size-3.5" />
        </button>
      )}

      <Board legend="Le jour" rail={rail} railWidth={280}>
        {bodyContent}
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

/* ── Roster rail (the ex-Équipe sub-page, folded into the board's legend) ── */

/** "09:00" → "9h", "18:30" → "18h30". */
function shiftLabel(p: Praticienne) {
  if (!p.shiftStart || !p.shiftEnd) return null;
  const fmt = (t: string) => {
    const [h, m] = t.split(":");
    return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
  };
  return `${fmt(p.shiftStart)}–${fmt(p.shiftEnd)}`;
}

function RosterRail({
  staff,
  menageStaff,
  rows,
  selectedDate,
  staffFilter,
  onFilter,
  onMarkAbsent,
  onStaff,
}: {
  staff: Praticienne[];
  menageStaff: Praticienne[];
  rows: Row[];
  selectedDate: Date;
  staffFilter: string | null;
  onFilter: (id: string | null) => void;
  onMarkAbsent: (id: string) => void;
  onStaff: (r: Row, id: string) => boolean;
}) {
  const isToday = sameDay(selectedDate, new Date());
  return (
    <div className="flex flex-col">
      <div className="border-b border-[var(--board-groove)] px-3 py-2">
        <Legend>Équipe</Legend>
      </div>
      {staff.map((p) => {
        const working = isToday && p.workingToday && !p.unavailableToday;
        const count = rows.filter((r) => onStaff(r, p.id) && r.rv.status !== "annule").length;
        const hours = shiftLabel(p);
        const sub = p.unavailableToday
          ? "Absente aujourd'hui"
          : !p.workingToday
            ? "Repos"
            : hours
              ? `${hours} · ${count} rdv`
              : `${count} rdv`;
        return (
          <div key={p.id} className={cnRail(staffFilter === p.id)}>
            <button type="button" onClick={() => onFilter(staffFilter === p.id ? null : p.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
              <Avatar initial={p.initial} size={28} className="bg-accent text-[0.7rem] font-semibold text-secondary" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[var(--color-gray-900)]">{p.name}</span>
                <span className="block text-[0.7rem] text-[var(--color-gray-400)] tabular-nums">{sub}</span>
              </span>
            </button>
            <div className="flex shrink-0 items-center gap-0.5">
              <DropdownMenu
                align="end"
                trigger={
                  <IconButton aria-label={`Actions pour ${p.name}`} className="size-8 rounded-full text-[var(--color-gray-400)] hover:bg-black/[0.04]">
                    <MoreHorizontal className="size-4" />
                  </IconButton>
                }
                items={[
                  {
                    label: staffFilter === p.id ? "Voir tout le monde" : "Voir seule",
                    icon: <Eye className="size-4" />,
                    onSelect: () => onFilter(staffFilter === p.id ? null : p.id),
                  },
                  {
                    label: "Marquer absente aujourd'hui",
                    icon: <UserX className="size-4" />,
                    tone: "danger",
                    disabled: !working,
                    onSelect: () => onMarkAbsent(p.id),
                  },
                ]}
              />
            </div>
          </div>
        );
      })}

      {menageStaff.length > 0 && (
        <>
          <div className="border-y border-[var(--board-groove)] bg-black/[0.02] px-3 py-1.5">
            <Legend>Ménage</Legend>
          </div>
          {menageStaff.map((p) => {
            const hours = shiftLabel(p);
            return (
              <div key={p.id} className="flex items-center gap-2 px-3 py-2.5 last:border-b-0">
                <Avatar initial={p.initial} size={28} className="bg-[var(--color-gray-100)] text-[0.7rem] font-semibold text-[var(--color-gray-500)]" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[var(--color-gray-900)]">{p.name}</span>
                  <span className="block text-[0.7rem] text-[var(--color-gray-400)] tabular-nums">
                    {p.unavailableToday ? "Absente aujourd'hui" : !p.workingToday ? "Repos" : (hours ?? "Présente")}
                  </span>
                </span>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function cnRail(active: boolean) {
  return [
    "flex items-center gap-1.5 border-b border-[var(--board-groove)] px-3 py-2.5 last:border-b-0 transition",
    active ? "bg-[var(--brand-rose-soft)]" : "hover:bg-black/[0.02]",
  ].join(" ");
}
