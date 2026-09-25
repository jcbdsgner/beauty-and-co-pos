"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/atoms/avatar";
import { TIER_TONE } from "@/components/ui/atoms/badge";
import { TIER_LABEL } from "@/lib/data/tiers";
import { SearchInput } from "@/components/ui/atoms/search-input";
import { Button } from "@/components/ui/atoms/button";
import { Legend, ChipFilter } from "@/components/ui/board";
import { NewClientDialog } from "@/components/clientele/new-client-dialog";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName, clientInitial, searchClients } from "@/lib/data/clientele";
import { formatFcfa } from "@/lib/utils";
import type { Cliente } from "@/lib/data/types";


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
      className={`rounded-[6px] px-2 py-0.5 text-xs font-bold uppercase tracking-[0.06em] ${TIER_TONE[tier]}`}
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
        return base.filter((c) => c.tier === "vip" || c.tier === "platinum" || c.tier === "gold");
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
        <div className={recent.length > 0 && expectedToday.length > 0 ? "grid grid-cols-2 gap-6" : "space-y-3"}>
          {recent.length > 0 && (
            <div className="space-y-3">
              <Legend>Vues récemment</Legend>
              <div className={`grid grid-cols-2 gap-3 ${expectedToday.length > 0 ? "" : "md:grid-cols-3"}`}>
                {recent.map((c) => (
                  <ClientCard key={c.id} client={c} trailing={c.phone} />
                ))}
              </div>
            </div>
          )}
          {expectedToday.length > 0 && (
            <div className="space-y-3">
              <Legend>Attendues aujourd&apos;hui</Legend>
              <div className={`grid grid-cols-2 gap-3 ${recent.length > 0 ? "" : "md:grid-cols-3"}`}>
                {expectedToday.map(({ client, start }) => (
                  <ClientCard key={client.id} client={client} trailing={`Rendez-vous ${start}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Legend>{searching ? `Résultats · ${filtered.length}` : "Tout l'annuaire"}</Legend>
          {!searching && <ChipFilter options={FILTERS} value={filter} onChange={setFilter} />}
        </div>

        {filtered.length === 0 ? (
          searching ? (
            <EmptyBlock
              title={`Aucune cliente pour « ${query.trim()} »`}
              hint="Cette cliente n'est peut-être pas encore au répertoire."
              action={
                <Button variant="brand" onClick={() => openCreate(draftFromQuery(query))}>
                  Créer « {query.trim()} » comme nouvelle cliente
                </Button>
              }
            />
          ) : (
            <EmptyBlock
              title="Aucune cliente ne correspond à ce filtre"
              action={
                <Button variant="outline" onClick={() => setFilter("toutes")}>
                  Réinitialiser les filtres
                </Button>
              }
            />
          )
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((c) => (
              <ClientCard key={c.id} client={c} />
            ))}
          </div>
        )}
      </div>

      {dialogOpen && <NewClientDialog open initialValues={dialogPrefill} onClose={() => setDialogOpen(false)} />}
    </div>
  );
}

/* ── Bloc cliente (grille de l'annuaire) ────────────────────────────────── */

function ClientCard({ client: c, trailing }: { client: Cliente; trailing?: string }) {
  return (
    <Link
      href={`/clientele/${c.id}`}
      className="group flex flex-col gap-3 rounded-lg bg-white p-4 text-left shadow-[0px_30px_30px_0px_rgba(0,0,0,0.04),0px_7px_16px_0px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0px_30px_30px_0px_rgba(0,0,0,0.06),0px_7px_16px_0px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-start justify-between gap-2">
        <Avatar initial={clientInitial(c)} size={40} className="bg-accent text-sm font-semibold text-secondary" />
        <TierFlag tier={c.tier} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-base-content">{clientFullName(c)}</p>
        <p className="truncate text-xs text-base-content/55">
          {trailing ?? `${c.totalVisits} visite${c.totalVisits > 1 ? "s" : ""}${c.lastVisit ? ` · ${c.lastVisit}` : ""}`}
        </p>
      </div>
      {!trailing && (
        <div className="mt-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-base-content/35">Total dépensé</p>
          <p className="text-sm font-semibold tabular-nums text-primary">{formatFcfa(c.totalSpent)}</p>
        </div>
      )}
    </Link>
  );
}

function EmptyBlock({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-base-300 px-6 py-14 text-center">
      <p className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-[0.12em] text-base-content/40">
        {title}
      </p>
      {hint && <p className="max-w-sm text-sm text-base-content/50">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
