"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { Button } from "@/components/ui/atoms/button";
import { Select } from "@/components/ui/atoms/select";
import { Switch } from "@/components/ui/atoms/switch";
import { SegmentedToggle } from "@/components/ui/molecules/segmented-toggle";
import { PersonCard } from "@/components/ui/molecules/person-card";
import { WeekDaySelector } from "@/components/journee/week-day-selector";
import { ScheduleGrid } from "@/components/journee/schedule-grid";
import { AppointmentDetailDialog } from "@/components/journee/appointment-detail-dialog";
import { AppointmentFormDialog } from "@/components/journee/appointment-form-dialog";
import { useAccueil } from "@/components/journee/use-accueil";
import { useAppData } from "@/components/providers/app-data-provider";
import { COMPANIES, SALONS } from "@/lib/data/entreprises";
import type { RendezVous } from "@/lib/data/types";

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function PlanningPage() {
  return (
    <Suspense fallback={null}>
      <PlanningPageContent />
    </Suspense>
  );
}

/** Split out of the default export because it reads useSearchParams() (the "?staff=" deep link
 *  from Équipe's "carte praticien·ne → Planning complet filtré sur cette personne") — Next.js
 *  requires that hook's caller to sit under a Suspense boundary. */
function PlanningPageContent() {
  const { appointments, praticiennes } = useAppData();
  const { requestAccueil, accueilDialog } = useAccueil();
  const searchParams = useSearchParams();

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<"grille" | "equipe">("grille");
  const [showCancelled, setShowCancelled] = useState(false);
  const [companyId, setCompanyId] = useState(COMPANIES[0]?.id ?? "");
  const [salonId, setSalonId] = useState(SALONS[0]?.id ?? "");
  const [staffFilter, setStaffFilter] = useState<string | null>(() => searchParams.get("staff"));

  const [detailAppointment, setDetailAppointment] = useState<RendezVous | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formAppointment, setFormAppointment] = useState<RendezVous | null>(null);
  const [formPrefill, setFormPrefill] = useState<{ staffId?: string; start?: string } | undefined>(undefined);

  const today = new Date();
  const isToday = isSameDay(selectedDate, today);
  // The mock data model has no per-day dimension on RendezVous (every entry is implicitly
  // "today") — see final report. Navigating to another day correctly shows an empty grid rather
  // than fabricating data.
  const dayAppointments = isToday ? appointments : [];

  const workingStaff = praticiennes
    .filter((p) => p.workingToday && p.role !== "accueil")
    .filter((p) => !staffFilter || p.id === staffFilter);

  function openCreateForm(prefill?: { staffId?: string; start?: string }) {
    setFormAppointment(null);
    setFormPrefill(prefill);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Planning complet"
        backHref="/"
        action={
          <div className="flex gap-2">
            {!isToday && (
              <Button variant="outline" onClick={() => setSelectedDate(new Date())} className="px-4 py-2 text-sm">
                Aujourd&apos;hui
              </Button>
            )}
            <Button variant="dark" onClick={() => openCreateForm()} className="px-4 py-2 text-sm">
              Nouveau rendez-vous
            </Button>
          </div>
        }
      />

      <WeekDaySelector selectedDate={selectedDate} onSelect={setSelectedDate} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <SegmentedToggle
          options={[
            { value: "grille", label: "Grille horaire" },
            { value: "equipe", label: "Équipe" },
          ]}
          value={viewMode}
          onChange={(v) => setViewMode(v as "grille" | "equipe")}
        />

        <div className="flex items-center gap-3">
          {COMPANIES.length > 1 && (
            <Select value={companyId} onChange={setCompanyId} options={COMPANIES.map((c) => ({ value: c.id, label: c.name }))} size="compact" className="w-40" />
          )}
          {SALONS.length > 1 && (
            <Select value={salonId} onChange={setSalonId} options={SALONS.map((s) => ({ value: s.id, label: s.name }))} size="compact" className="w-40" />
          )}
          <label className="flex items-center gap-2 text-sm text-[var(--color-gray-600)]">
            Afficher les annulés
            <Switch checked={showCancelled} onChange={setShowCancelled} label="Afficher les annulés" />
          </label>
        </div>
      </div>

      {staffFilter && (
        <div className="flex items-center gap-2 text-sm text-[var(--color-gray-600)]">
          Filtré sur {praticiennes.find((p) => p.id === staffFilter)?.name}
          <button type="button" onClick={() => setStaffFilter(null)} className="font-semibold text-[var(--brand-taupe-muted)] underline underline-offset-2">
            Retirer
          </button>
        </div>
      )}

      {viewMode === "grille" ? (
        <ScheduleGrid
          staff={workingStaff}
          appointments={dayAppointments}
          showCancelled={showCancelled}
          onSlotClick={(staffId, start) => openCreateForm({ staffId, start })}
          onAppointmentClick={(appt) => setDetailAppointment(appt)}
        />
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {praticiennes
            .filter((p) => p.role !== "accueil")
            .map((p) => (
              <PersonCard
                key={p.id}
                initial={p.initial}
                name={p.name}
                meta={p.role === "coiffeuse" ? "Coiffeuse" : "Esthéticienne"}
                online={p.workingToday && !p.unavailableToday}
                trailing={`${dayAppointments.filter((a) => a.staffId === p.id).length} rendez-vous`}
                onClick={() => {
                  setStaffFilter(p.id);
                  setViewMode("grille");
                }}
              />
            ))}
        </div>
      )}

      <AppointmentDetailDialog
        open={detailAppointment !== null}
        appointment={detailAppointment}
        onClose={() => setDetailAppointment(null)}
        onEdit={(appt) => {
          setDetailAppointment(null);
          setFormAppointment(appt);
          setFormPrefill(undefined);
          setFormOpen(true);
        }}
        onAccueil={(id) => {
          setDetailAppointment(null);
          requestAccueil(id);
        }}
      />

      <AppointmentFormDialog
        open={formOpen}
        appointment={formAppointment}
        prefill={formPrefill}
        onClose={() => {
          setFormOpen(false);
          setFormAppointment(null);
          setFormPrefill(undefined);
        }}
      />

      {accueilDialog}
    </div>
  );
}
