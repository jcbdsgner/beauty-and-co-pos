"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Pills, type PillOption } from "@/components/ui/pills";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronIcon, PeopleIcon } from "@/components/ui/icons";
import { WeekDaySelector } from "@/components/planning/week-day-selector";
import { TeamView } from "@/components/planning/team-view";
import { AppointmentsView } from "@/components/planning/appointments-view";
import { cn } from "@/lib/utils";
import { COMPANY_OPTIONS, SALON_OPTIONS_BY_COMPANY, TODAY_INDEX, WEEK_DAYS } from "@/lib/data/planning";

type View = "equipe" | "rdv";

const VIEW_OPTIONS: PillOption[] = [
  { value: "equipe", label: "Équipe", icon: <PeopleIcon className="size-3.5" /> },
  { value: "rdv", label: "Rendez-vous", icon: <CalendarIcon className="size-3.5" /> },
];

function SelectField({
  value,
  onChange,
  options,
  defaultValue,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  defaultValue: string;
  ariaLabel: string;
}) {
  // Bordure dorée (accent) quand une sélection autre que la valeur par défaut est active —
  // reprend le "dropdown actif" documenté dans la spec Figma.
  const active = value !== defaultValue;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border bg-white px-4 py-2.5 transition focus-within:border-[var(--brand-taupe-muted)]",
        active ? "border-[var(--pos-accent-dark)]" : "border-[var(--color-gray-200)]",
      )}
    >
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent text-sm font-medium text-[var(--color-gray-700)] focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none">
        <ChevronIcon className="rotate-90 text-[var(--color-gray-400)]" />
      </span>
    </div>
  );
}

/** Orchestrateur client du module Planning : sélecteurs, semaine, toggle équipe/RDV et vue filtrée. */
export function PlanningClient({ defaultView = "equipe" }: { defaultView?: View }) {
  const [company, setCompany] = useState(COMPANY_OPTIONS[0].value);
  const [salon, setSalon] = useState("tous");
  const [dayIndex, setDayIndex] = useState(TODAY_INDEX);
  const [view, setView] = useState<View>(defaultView);

  const activeDay = WEEK_DAYS[dayIndex];
  const salonOptions = SALON_OPTIONS_BY_COMPANY[company];

  function handleCompanyChange(value: string) {
    setCompany(value);
    // Michele Ka n'a pas de salon Almadies — repartir de "Tous salons" évite de garder
    // sélectionnée une option qui n'existe pas pour la nouvelle entreprise.
    setSalon("tous");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Planning"
        subtitle="Tous les salons"
        action={
          <div className="flex flex-wrap items-center justify-end gap-3">
            {dayIndex !== TODAY_INDEX && (
              <Button
                variant="outline"
                icon={<CalendarIcon className="size-4" />}
                className="px-3 py-1.5 text-xs"
                onClick={() => setDayIndex(TODAY_INDEX)}
              >
                Aujourd&rsquo;hui
              </Button>
            )}
            <span className="font-[var(--font-heading)] text-[var(--pos-accent-dark)]">{activeDay.full}</span>
          </div>
        }
      />

      <div className="flex flex-wrap gap-3">
        <SelectField
          value={company}
          onChange={handleCompanyChange}
          options={COMPANY_OPTIONS}
          defaultValue={COMPANY_OPTIONS[0].value}
          ariaLabel="Filtrer par entreprise"
        />
        <SelectField
          value={salon}
          onChange={setSalon}
          options={salonOptions}
          defaultValue="tous"
          ariaLabel="Filtrer par salon"
        />
      </div>

      <WeekDaySelector days={WEEK_DAYS} selectedIndex={dayIndex} onSelect={setDayIndex} />

      <Pills options={VIEW_OPTIONS} value={view} onChange={(v) => setView(v as View)} />

      {view === "equipe" ? <TeamView /> : <AppointmentsView dayIndex={dayIndex} dateLabel={activeDay.full} />}
    </div>
  );
}
