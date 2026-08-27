"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserX } from "lucide-react";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { Toolbar } from "@/components/ui/organisms/toolbar";
import { PersonCard } from "@/components/ui/molecules/person-card";
import { IconButton } from "@/components/ui/atoms/icon-button";
import type { BadgeVariant } from "@/components/ui/atoms/badge";
import { useAppData } from "@/components/providers/app-data-provider";
import type { Role } from "@/lib/data/types";

const ROLE_FILTERS = [
  { value: "all", label: "Tous" },
  { value: "coiffeuse", label: "Coiffeuse" },
  { value: "estheticienne", label: "Esthéticienne" },
  { value: "accueil", label: "Accueil" },
];

const ROLE_BADGE: Record<Role, { label: string; variant: BadgeVariant }> = {
  coiffeuse: { label: "Coiffeuse", variant: "brand" },
  estheticienne: { label: "Esthéticienne", variant: "info" },
  accueil: { label: "Accueil", variant: "neutral" },
};

export default function EquipePage() {
  const router = useRouter();
  const { praticiennes, markStaffUnavailable } = useAppData();
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = praticiennes.filter((p) => roleFilter === "all" || p.role === roleFilter);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Équipe" subtitle="Annuaire de l'équipe — qui travaille aujourd'hui." backHref="/" />

      <Toolbar filters={ROLE_FILTERS} filterValue={roleFilter} onFilterChange={setRoleFilter} />

      <div className="grid grid-cols-3 gap-4">
        {filtered.map((p) => {
          const schedulable = p.role !== "accueil";
          const roleLabel = ROLE_BADGE[p.role].label;
          const statusLabel = p.unavailableToday ? "Indisponible aujourd'hui" : schedulable ? "Ouvrir le planning" : undefined;
          return (
            <div key={p.id} className="relative">
              {/* Role stays out of PersonCard's `badge` slot on purpose — that slot is sized as a
                  small corner flag for short tier labels (VIP/Gold/Silver); "Esthéticienne" would
                  overflow it and collide with the avatar and name. Folded into meta instead. */}
              <PersonCard
                initial={p.initial}
                name={p.name}
                meta={statusLabel ? `${roleLabel} · ${statusLabel}` : roleLabel}
                online={p.workingToday && !p.unavailableToday}
                onClick={schedulable ? () => router.push(`/planning?staff=${p.id}`) : undefined}
                className={!schedulable ? "opacity-70" : undefined}
              />
              {schedulable && p.workingToday && !p.unavailableToday && (
                <IconButton
                  aria-label={`Marquer ${p.name} indisponible aujourd'hui`}
                  onClick={(e) => {
                    e.stopPropagation();
                    markStaffUnavailable(p.id);
                  }}
                  className="absolute top-3 right-3 size-9 rounded-full bg-white text-[var(--color-gray-400)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] transition active:scale-90 active:bg-[var(--color-error-soft)] active:text-[var(--color-error)] hover:bg-[var(--color-gray-50)]"
                >
                  <UserX aria-hidden className="size-4" />
                </IconButton>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
