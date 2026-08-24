"use client";

import { useMemo, useState } from "react";
import { PersonCard } from "@/components/ui/person-card";
import { Pills } from "@/components/ui/pills";
import {
  ROLE_BADGE_VARIANT,
  ROLE_FILTERS,
  ROLE_LABELS,
  TEAM_MEMBERS,
} from "@/lib/data/planning";

/** Barre de filtres par rôle + grille 3 colonnes de cartes équipe (vue "Équipe" du Planning). */
export function TeamView() {
  const [roleFilter, setRoleFilter] = useState<(typeof ROLE_FILTERS)[number]["value"]>("tous");

  const filtered = useMemo(
    () => (roleFilter === "tous" ? TEAM_MEMBERS : TEAM_MEMBERS.filter((m) => m.role === roleFilter)),
    [roleFilter],
  );

  return (
    <div className="flex flex-col gap-5">
      <Pills options={ROLE_FILTERS} value={roleFilter} onChange={(v) => setRoleFilter(v as typeof roleFilter)} />

      <div className="flex items-center justify-between">
        <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">Équipe</h2>
        <span className="text-sm text-[var(--color-gray-500)]">{filtered.length} personnes</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((member) => (
          <PersonCard
            key={member.id}
            initial={member.initial}
            name={member.name}
            badge={{ label: ROLE_LABELS[member.role], variant: ROLE_BADGE_VARIANT[member.role] }}
            online
            trailing="Actif"
            className="[&>span:last-child]:text-[var(--color-success)]"
          />
        ))}
      </div>
    </div>
  );
}
