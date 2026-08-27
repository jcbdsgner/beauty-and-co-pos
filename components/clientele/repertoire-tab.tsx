"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { Toolbar } from "@/components/ui/organisms/toolbar";
import { PersonCard } from "@/components/ui/molecules/person-card";
import { EmptyState } from "@/components/ui/molecules/empty-state";
import { Button } from "@/components/ui/atoms/button";
import type { BadgeVariant } from "@/components/ui/atoms/badge";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName, clientInitial, searchClients } from "@/lib/data/clientele";
import { formatFcfa } from "@/lib/utils";
import { NewClientDialog } from "@/components/clientele/new-client-dialog";
import type { Cliente } from "@/lib/data/types";

const TIER_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  vip: { label: "VIP", variant: "vip" },
  gold: { label: "Gold", variant: "gold" },
  silver: { label: "Silver", variant: "silver" },
};

const FILTERS = [
  { value: "toutes", label: "Toutes" },
  { value: "nouvelles", label: "Nouvelles" },
  { value: "historique", label: "Historique" },
  { value: "vip", label: "VIP" },
];

// "Nouvelles" = fiche créée dans les 30 derniers jours. "Historique" = clientes avec un vrai
// historique de visites établi (5 visites ou plus). "VIP" regroupe les paliers payants vip+gold
// (silver reste visible dans "Toutes", visible via son badge propre dans la grille).
const NEW_CLIENT_WINDOW_DAYS = 30;
const HISTORIQUE_MIN_VISITS = 5;

function isNouvelle(c: Cliente) {
  const created = new Date(c.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created <= NEW_CLIENT_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

export function RepertoireTab() {
  const { clients } = useAppData();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("toutes");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    const base = searchClients(clients, query);
    switch (filter) {
      case "nouvelles":
        return base.filter(isNouvelle);
      case "historique":
        return base.filter((c) => c.totalVisits >= HISTORIQUE_MIN_VISITS);
      case "vip":
        return base.filter((c) => c.tier === "vip" || c.tier === "gold");
      default:
        return base;
    }
  }, [clients, query, filter]);

  function resetFilters() {
    setQuery("");
    setFilter("toutes");
  }

  return (
    <div className="flex flex-col gap-6">
      <Toolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Chercher une cliente…"
        filters={FILTERS}
        filterValue={filter}
        onFilterChange={setFilter}
        action={
          <Button variant="brand" onClick={() => setDialogOpen(true)}>
            + Nouvelle cliente
          </Button>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title="Aucune cliente ne correspond"
          subtitle="Essayez une autre recherche ou réinitialisez les filtres."
          action={
            <Button variant="outline" onClick={resetFilters}>
              Réinitialiser les filtres
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((c) => (
            <PersonCard
              key={c.id}
              initial={clientInitial(c)}
              name={clientFullName(c)}
              meta={`${c.totalVisits} visite${c.totalVisits > 1 ? "s" : ""} · ${formatFcfa(c.totalSpent)}`}
              badge={c.tier ? TIER_BADGE[c.tier] : undefined}
              onClick={() => router.push(`/clientele/${c.id}`)}
            />
          ))}
        </div>
      )}

      <NewClientDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
