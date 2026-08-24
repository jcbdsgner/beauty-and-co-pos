"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchInput } from "@/components/ui/search-input";
import { Pills, type PillOption } from "@/components/ui/pills";
import { PersonCard } from "@/components/ui/person-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PeopleIcon, PlusIcon } from "@/components/ui/icons";
import { CLIENTS, fullName, initials, tierBadge } from "@/lib/data/clients";

type FilterValue = "all" | "nouveaux" | "historique" | "vip";

const FILTERS: PillOption[] = [
  { value: "nouveaux", label: "Nouveaux", icon: <PlusIcon className="size-3.5" /> },
  { value: "historique", label: "Historique" },
  { value: "vip", label: "VIP" },
];

export function ClientDirectory() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return CLIENTS.filter((client) => {
      if (filter === "nouveaux" && !client.isNew) return false;
      if (filter === "historique" && !client.hasHistory) return false;
      if (filter === "vip" && client.tier !== "vip" && client.tier !== "gold") return false;

      if (!q) return true;
      const haystack = `${fullName(client)} ${client.phone ?? ""} ${client.email ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, filter]);

  return (
    <div className="flex flex-col gap-6">
      <SearchInput
        placeholder="Nom, telephone, ou email..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <Pills
        options={FILTERS}
        value={filter}
        onChange={(value) => setFilter((current) => (current === value ? "all" : (value as FilterValue)))}
      />

      <div className="flex items-center justify-between">
        <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">Clients recents</h2>
        <span className="text-sm text-[var(--color-gray-500)]">{filtered.length} client{filtered.length > 1 ? "s" : ""}</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<PeopleIcon />} title="Aucun client trouvé" subtitle="Essayez une autre recherche ou un autre filtre." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((client) => (
            <PersonCard
              key={client.id}
              initial={initials(client)}
              name={fullName(client)}
              meta={client.phone ?? "—"}
              badge={tierBadge(client.tier)}
              trailing={client.tenureLabel}
              onClick={() => router.push(`/clients/${client.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
