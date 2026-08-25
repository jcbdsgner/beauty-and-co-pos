"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Pills, type PillOption } from "@/components/ui/pills";
import { SuiviSection } from "@/components/suivi/suivi-section";
import { HeartPulseIcon } from "@/components/ui/icons";
import { suiviSections } from "@/lib/data/suivi";

type Tab = "today" | "upcoming" | "history";

/** Les 3 onglets pilule de la tournée : liste complète du jour, échéances à venir, ou historique des tournées déjà envoyées. */
export function SuiviTabs() {
  // Compte affiché sur l'onglet "Aujourd'hui" : la somme des compteurs de section (issus de la
  // spec, ex. Fidélité · 25) plutôt que le nombre de cartes réellement rendues — certaines
  // sections n'exposent que quelques cartes exemple pour un total plus large.
  const totalToday = useMemo(() => suiviSections.reduce((sum, section) => sum + section.count, 0), []);

  const [tab, setTab] = useState<Tab>("today");

  const options: PillOption[] = [
    { value: "today", label: "Aujourd'hui", count: totalToday },
    { value: "upcoming", label: "À venir" },
    { value: "history", label: "Historique", icon: <span aria-hidden>🕐</span> },
  ];

  const upcomingSections = useMemo(
    () =>
      suiviSections
        .map((section) => ({ ...section, cards: section.cards.filter((card) => card.variant === "compact") }))
        .filter((section) => section.cards.length > 0),
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <Pills options={options} value={tab} onChange={(value) => setTab(value as Tab)} />

      {tab === "today" && (
        <div className="flex flex-col gap-8">
          {suiviSections.map((section) => (
            <SuiviSection key={section.id} section={section} />
          ))}
        </div>
      )}

      {tab === "upcoming" && (
        <div className="flex flex-col gap-8">
          {upcomingSections.length > 0 ? (
            upcomingSections.map((section) => <SuiviSection key={section.id} section={section} />)
          ) : (
            <EmptyState
              icon={<HeartPulseIcon />}
              title="Aucune échéance à venir"
              subtitle="Les prochains rendez-vous et rappels apparaîtront ici."
            />
          )}
        </div>
      )}

      {tab === "history" && (
        <EmptyState
          icon={<HeartPulseIcon />}
          title="Aucun historique pour l'instant"
          subtitle="Les tournées déjà validées et envoyées apparaîtront ici."
        />
      )}
    </div>
  );
}
