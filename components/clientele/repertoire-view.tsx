"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { SearchInput } from "@/components/ui/atoms/search-input";
import { Button } from "@/components/ui/atoms/button";
import { Board, Lane, BoardEmpty, ChipFilter } from "@/components/ui/board";
import { NewClientDialog } from "@/components/clientele/new-client-dialog";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName, clientInitial, searchClients } from "@/lib/data/clientele";
import { formatFcfa } from "@/lib/utils";
import type { Cliente } from "@/lib/data/types";

const TIER_LABEL: Record<string, string> = { vip: "VIP", gold: "Gold", silver: "Silver" };

const FILTERS = [
  { value: "toutes", label: "Toutes" },
  { value: "nouvelles", label: "Nouvelles" },
  { value: "historique", label: "Historique" },
  { value: "vip", label: "VIP" },
];

const NEW_WINDOW_DAYS = 30;
const HISTORIQUE_MIN_VISITS = 5;
const CONTEXTUAL_MAX = 5;

function isNouvelle(c: Cliente) {
  const t = new Date(c.createdAt).getTime();
  return !Number.isNaN(t) && Date.now() - t <= NEW_WINDOW_DAYS * 86_400_000;
}

function draftFromQuery(q: string) {
  const t = q.trim();
  if (!t) return {};
  if (/\d/.test(t) && /^[+\d\s().-]+$/.test(t)) return { phone: t };
  const [first, ...rest] = t.split(/\s+/);
  return { firstName: first, lastName: rest.join(" ") || undefined };
}

function TierFlag({ tier }: { tier: Cliente["tier"] }) {
  if (!tier) return null;
  return (
    <span
      className={
        tier === "vip"
          ? "rounded-[6px] bg-[var(--brand-lilac)] px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-base-content/70"
          : "rounded-[6px] bg-primary px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-white"
      }
    >
      {TIER_LABEL[tier]}
    </span>
  );
}

/**
 * Le Répertoire — recherche d'abord. La ligne de recherche en tête ; recherche vide → deux petits
 * tableaux (Vues récemment · Attendues aujourd'hui) ; l'annuaire complet filtrable en dessous, sur
 * la même route.
 */
export function RepertoireView() {
  const { clients, reservations, recentClientIds } = useAppData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("toutes");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogPrefill, setDialogPrefill] = useState<{ firstName?: string; lastName?: string; phone?: string }>({});

  const searching = query.trim() !== "";

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

  const recent = useMemo(
    () => recentClientIds.map((id) => clients.find((c) => c.id === id)).filter((c): c is Cliente => Boolean(c)).slice(0, CONTEXTUAL_MAX),
    [recentClientIds, clients],
  );

  const expectedToday = useMemo(() => {
    const seen = new Set<string>();
    const rows: { client: Cliente; start: string }[] = [];
    // The payeuse of every réservation whose earliest live rendez-vous is coming up today.
    const byPayer = reservations
      .map((r) => {
        const starts = r.rendezVous.filter((rv) => rv.status !== "annule").map((rv) => rv.start).sort();
        return starts.length ? { payerClientId: r.payerClientId, start: starts[0] } : null;
      })
      .filter((x): x is { payerClientId: string; start: string } => x !== null)
      .sort((a, b) => a.start.localeCompare(b.start));
    for (const { payerClientId, start } of byPayer) {
      if (seen.has(payerClientId)) continue;
      const client = clients.find((c) => c.id === payerClientId);
      if (!client) continue;
      seen.add(payerClientId);
      rows.push({ client, start });
    }
    return rows.slice(0, CONTEXTUAL_MAX);
  }, [reservations, clients]);

  function openCreate(prefill: { firstName?: string; lastName?: string; phone?: string } = {}) {
    setDialogPrefill(prefill);
    setDialogOpen(true);
  }

  function clientLane(c: Cliente, opts?: { trailing?: string }) {
    return (
      <Lane
        key={c.id}
        leading={<Avatar initial={clientInitial(c)} size={34} className="bg-accent text-xs font-semibold text-secondary" />}
        title={
          <span className="flex items-center gap-2">
            {clientFullName(c)}
            <TierFlag tier={c.tier} />
          </span>
        }
        meta={
          opts?.trailing
            ? opts.trailing
            : `${c.totalVisits} visite${c.totalVisits > 1 ? "s" : ""}${c.lastVisit ? ` · ${c.lastVisit}` : ""}`
        }
        actions={
          !opts?.trailing && (
            <span className="text-sm font-semibold tabular-nums text-base-content">{formatFcfa(c.totalSpent)}</span>
          )
        }
        href={`/clientele/${c.id}`}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <SearchInput
          placeholder="Chercher une cliente — nom ou téléphone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button variant="brand" onClick={() => openCreate()}>
          + Nouvelle cliente
        </Button>
      </div>

      {!searching && (recent.length > 0 || expectedToday.length > 0) && (
        <div className="grid grid-cols-2 gap-6">
          <Board legend="Vues récemment">
            {recent.length === 0 ? (
              <BoardEmpty title="Aucune fiche ouverte" hint="Les fiches ouvertes sur ce poste apparaîtront ici." />
            ) : (
              recent.map((c) => clientLane(c, { trailing: c.phone }))
            )}
          </Board>
          <Board legend="Attendues aujourd'hui">
            {expectedToday.length === 0 ? (
              <BoardEmpty title="Personne attendue" hint="Aucune cliente n'a de rendez-vous aujourd'hui." />
            ) : (
              expectedToday.map(({ client, start }) => clientLane(client, { trailing: `Rendez-vous ${start}` }))
            )}
          </Board>
        </div>
      )}

      <Board
        legend={searching ? `Résultats · ${filtered.length}` : "Tout l'annuaire"}
        legendRight={!searching && <ChipFilter options={FILTERS} value={filter} onChange={setFilter} />}
      >
        {filtered.length === 0 ? (
          searching ? (
            <BoardEmpty
              title={`Aucune cliente pour « ${query.trim()} »`}
              hint="Cette cliente n'est peut-être pas encore au répertoire."
              action={
                <Button variant="brand" onClick={() => openCreate(draftFromQuery(query))}>
                  Créer « {query.trim()} » comme nouvelle cliente
                </Button>
              }
            />
          ) : (
            <BoardEmpty
              title="Aucune cliente ne correspond à ce filtre"
              action={
                <Button variant="outline" onClick={() => setFilter("toutes")}>
                  Réinitialiser les filtres
                </Button>
              }
            />
          )
        ) : (
          filtered.map((c) => clientLane(c))
        )}
      </Board>

      {dialogOpen && <NewClientDialog open initialValues={dialogPrefill} onClose={() => setDialogOpen(false)} />}
    </div>
  );
}
