"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Pills, type PillOption } from "@/components/ui/pills";
import { WeekDaySelector } from "@/components/planning/week-day-selector";
import { TeamView } from "@/components/planning/team-view";
import { AppointmentsView } from "@/components/planning/appointments-view";
import { COMPANY_OPTIONS, SALON_OPTIONS, WEEK_DAYS } from "@/lib/data/planning";

type View = "equipe" | "rdv";

const VIEW_OPTIONS: PillOption[] = [
  { value: "equipe", label: "Équipe", icon: <span aria-hidden>👥</span> },
  { value: "rdv", label: "Rendez-vous", icon: <span aria-hidden>📅</span> },
];

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-[var(--color-gray-200)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-gray-700)] focus:border-[var(--brand-taupe-muted)] focus:outline-none"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/** Orchestrateur client du module Planning : sélecteurs, semaine, toggle équipe/RDV et vue filtrée. */
export function PlanningClient({ defaultView = "equipe" }: { defaultView?: View }) {
  const [company, setCompany] = useState(COMPANY_OPTIONS[0].value);
  const [salon, setSalon] = useState(SALON_OPTIONS[0].value);
  const [dayIndex, setDayIndex] = useState(0);
  const [view, setView] = useState<View>(defaultView);

  const activeDay = WEEK_DAYS[dayIndex];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Planning"
        subtitle="Tous les salons"
        action={
          <span className="font-[var(--font-heading)] text-[var(--pos-accent-dark)]">{activeDay.full}</span>
        }
      />

      <div className="flex flex-wrap gap-3">
        <SelectField value={company} onChange={setCompany} options={COMPANY_OPTIONS} />
        <SelectField value={salon} onChange={setSalon} options={SALON_OPTIONS} />
      </div>

      <WeekDaySelector days={WEEK_DAYS} selectedIndex={dayIndex} onSelect={setDayIndex} />

      <Pills options={VIEW_OPTIONS} value={view} onChange={(v) => setView(v as View)} />

      {view === "equipe" ? <TeamView /> : <AppointmentsView dateLabel={activeDay.full} />}
    </div>
  );
}
