"use client";

import { useMemo, useState } from "react";
import { Cake } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Button } from "@/components/ui/atoms/button";
import { Board, BoardHeader, BoardEmpty, ChipFilter, FlipChip, Lane, Legend } from "@/components/ui/board";
import { ClientSearchField } from "@/components/shared/client-search-field";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import type { Relance, RelanceChannel, RelanceType } from "@/lib/data/types";

/**
 * Relances — une vue en lecture seule (ADR 0010). Les relances partent automatiquement depuis un
 * back-office de la direction ; la réceptionniste ne fait que consulter : ce qui est à venir
 * (anniversaires en tête, pour en tenir compte à l'arrivée de la cliente) et ce qui est déjà parti,
 * filtrable par cliente, type et canal.
 */

const TYPE_LABEL: Record<RelanceType, string> = {
  anniversaire: "Anniversaire",
  soins: "Soin & rendez-vous",
  fidelite: "Fidélité",
  reconquete: "Reconquête",
  recommandation: "Recommandation",
};

const CHANNEL_LABEL: Record<RelanceChannel, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
};

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "tous", label: "Tous les types" },
  ...(Object.keys(TYPE_LABEL) as RelanceType[]).map((t) => ({ value: t, label: TYPE_LABEL[t] })),
];

const CHANNEL_OPTIONS: { value: string; label: string }[] = [
  { value: "tous", label: "Tous les canaux" },
  ...(Object.keys(CHANNEL_LABEL) as RelanceChannel[]).map((c) => ({ value: c, label: CHANNEL_LABEL[c] })),
];

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export default function RelancesPage() {
  const { relances, clients } = useAppData();
  const [typeFilter, setTypeFilter] = useState("tous");
  const [channelFilter, setChannelFilter] = useState("tous");
  const [clientFilter, setClientFilter] = useState<string | null>(null);

  const clientFor = (id: string) => clients.find((c) => c.id === id);

  const filtered = useMemo(
    () =>
      relances.filter(
        (r) =>
          (typeFilter === "tous" || r.type === typeFilter) &&
          (channelFilter === "tous" || r.channel === channelFilter) &&
          (!clientFilter || r.clientId === clientFilter),
      ),
    [relances, typeFilter, channelFilter, clientFilter],
  );

  const aVenir = useMemo(() => {
    const list = filtered.filter((r) => r.status === "a_venir");
    // Anniversaires en tête, puis par date d'échéance croissante.
    return list.sort((a, b) => {
      if (a.type !== b.type) {
        if (a.type === "anniversaire") return -1;
        if (b.type === "anniversaire") return 1;
      }
      return a.date.localeCompare(b.date);
    });
  }, [filtered]);

  const envoyees = useMemo(
    () => filtered.filter((r) => r.status === "envoyee").sort((a, b) => b.date.localeCompare(a.date)),
    [filtered],
  );

  const anniversairesAVenir = aVenir.filter((r) => r.type === "anniversaire");
  const autresAVenir = aVenir.filter((r) => r.type !== "anniversaire");

  const total = relances.filter((r) => r.status === "a_venir").length;
  const context =
    total > 0
      ? `${total} relance${total > 1 ? "s" : ""} programmée${total > 1 ? "s" : ""}. Tout part automatiquement.`
      : "Aucune relance programmée. Tout part automatiquement.";

  function relanceLane(r: Relance) {
    const client = clientFor(r.clientId);
    if (!client) return null;
    const line = [TYPE_LABEL[r.type], DATE_FMT.format(new Date(r.date))].join(" · ");
    return (
      <Lane
        key={r.id}
        leading={<Avatar initial={clientInitial(client)} size={34} className="bg-accent text-xs font-semibold text-secondary" />}
        title={clientFullName(client)}
        meta={
          <span className="flex flex-col gap-0.5">
            <span className="text-[var(--brand-taupe-muted)]">
              <span className="capitalize">{line}</span>
              {r.discountLabel ? ` · ${r.discountLabel}` : ""}
              {r.lateDays ? ` · ${r.lateDays} j de retard` : ""}
            </span>
            <span className="line-clamp-1">{r.message}</span>
          </span>
        }
        chip={<FlipChip value={CHANNEL_LABEL[r.channel]} tone="neutral" />}
        className="items-start py-3"
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BoardHeader section="Relances" context={context} />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="w-full max-w-[240px]">
          <ClientSearchField
            selectedClientId={clientFilter}
            onSelect={setClientFilter}
            placeholder="Filtrer par cliente…"
          />
        </div>
        {clientFilter && (
          <Button variant="outline" size="sm" onClick={() => setClientFilter(null)}>
            Toutes les clientes
          </Button>
        )}
        <ChipFilter value={typeFilter} onChange={setTypeFilter} options={TYPE_OPTIONS} />
        <ChipFilter value={channelFilter} onChange={setChannelFilter} options={CHANNEL_OPTIONS} />
      </div>

      <Board legend="À venir" tone={aVenir.length > 0 ? "act" : "plain"}>
        {aVenir.length === 0 ? (
          <BoardEmpty title="Rien à venir" hint="Aucune relance programmée pour ce filtre." />
        ) : (
          <>
            {anniversairesAVenir.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 border-b border-[var(--board-groove)] bg-black/[0.02] px-4 py-2">
                  <Cake aria-hidden className="size-3.5 text-[var(--brand-taupe-muted)]" />
                  <Legend>Anniversaires · {anniversairesAVenir.length}</Legend>
                </div>
                {anniversairesAVenir.map(relanceLane)}
              </div>
            )}
            {autresAVenir.length > 0 && (
              <div>
                {anniversairesAVenir.length > 0 && (
                  <div className="border-b border-[var(--board-groove)] bg-black/[0.02] px-4 py-2">
                    <Legend>Autres relances · {autresAVenir.length}</Legend>
                  </div>
                )}
                {autresAVenir.map(relanceLane)}
              </div>
            )}
          </>
        )}
      </Board>

      <Board legend={`Déjà envoyées · ${envoyees.length}`}>
        {envoyees.length === 0 ? (
          <BoardEmpty title="Aucun envoi" hint="Les relances déjà parties apparaîtront ici." />
        ) : (
          envoyees.map(relanceLane)
        )}
      </Board>
    </div>
  );
}
