"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/atoms/badge";
import { SegmentedToggle } from "@/components/ui/molecules/segmented-toggle";
import { VenteDetailSheet } from "@/components/journee/vente-detail-sheet";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName, clientMatchesQuery } from "@/lib/data/clientele";
import { todayISO } from "@/lib/data/planning";
import {
  PAYMENT_MODE_LABEL,
  caisseEntries,
  cashInByMode,
  entryDay,
  saleCashIn,
  saleKinds,
  saleSummary,
  salonLabel,
  sumCashIn,
  sumTips,
  type CaisseEntry,
  type VenteKind,
} from "@/lib/data/ventes";
import { POSTE_SALON_ID } from "@/lib/session";
import { formatFcfa } from "@/lib/utils";
import type { Cliente } from "@/lib/data/types";

type KindFilter = "tout" | VenteKind;

const KIND_OPTIONS: { value: KindFilter; label: string }[] = [
  { value: "tout", label: "Tout" },
  { value: "service", label: "Prestations" },
  { value: "produit", label: "Produits" },
  { value: "boisson", label: "Boissons" },
];

const ALL_SALONS = "tous";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDay(iso: string) {
  if (iso === todayISO()) return "Aujourd'hui";
  const [y, m, d] = iso.split("-").map(Number);
  const label = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date(y, m - 1, d));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function entryAmount(e: CaisseEntry) {
  return e.type === "acompte" ? e.amount : saleCashIn(e.sale);
}

function entryClient(e: CaisseEntry, clients: Cliente[]): Cliente | undefined {
  const id = e.type === "acompte" ? e.reservation.payerClientId : e.sale.clientId;
  return id ? clients.find((c) => c.id === id) : undefined;
}

function entryModes(e: CaisseEntry) {
  return e.type === "acompte" ? e.modeLabel : (e.sale.payment?.modes.map((m) => PAYMENT_MODE_LABEL[m.mode]).join(" + ") ?? "—");
}

function entryContent(e: CaisseEntry) {
  return e.type === "acompte" ? `Réservation ${e.reservation.id.slice(e.reservation.id.lastIndexOf("-") + 1)}` : saleSummary(e.sale);
}

/** Correspondance exacte d'un numéro (vente ou réservation, complet ou suffixe), comme sur Rendez-vous. */
function numberMatches(id: string, q: string) {
  const wanted = q.replace(/^#/, "").trim().toLowerCase();
  const lower = id.toLowerCase();
  return wanted !== "" && (lower === wanted || lower.slice(lower.lastIndexOf("-") + 1) === wanted);
}

/**
 * Vue « Ventes » de l'Accueil (ADR 0043) — ce qui est entré en caisse sur la période Du/Au, avec la
 * recherche et le filtre de salon de l'Accueil. Liste groupée par jour (total du jour en tête) et,
 * à droite, la colonne de caisse : encaissé, par moyen de paiement, ventes, panier moyen,
 * pourboires. Une ligne s'ouvre en panneau de détail (`VenteDetailSheet`).
 */
export function AccueilVentes({
  rangeStart,
  rangeEnd,
  query,
  salonFilter,
}: {
  rangeStart: string;
  rangeEnd: string;
  query: string;
  salonFilter: string;
}) {
  const { sales, reservations, clients } = useAppData();
  const [kind, setKind] = useState<KindFilter>("tout");
  const [selected, setSelected] = useState<CaisseEntry | null>(null);

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return caisseEntries(sales, reservations, POSTE_SALON_ID).filter((e) => {
      const day = entryDay(e);
      if (day < rangeStart || day > rangeEnd) return false;
      if (salonFilter !== ALL_SALONS && e.salonId !== salonFilter) return false;
      // Un acompte est une avance sur des prestations.
      if (kind !== "tout" && !(e.type === "acompte" ? kind === "service" : saleKinds(e.sale).has(kind))) return false;
      if (!q) return true;
      if (e.type === "vente" && (numberMatches(e.sale.id, q) || (e.sale.originReservationId && numberMatches(e.sale.originReservationId, q))))
        return true;
      if (e.type === "acompte" && numberMatches(e.reservation.id, q)) return true;
      const client = entryClient(e, clients);
      return client ? clientMatchesQuery(client, q) : false;
    });
  }, [sales, reservations, clients, rangeStart, rangeEnd, salonFilter, kind, query]);

  const ventes = entries.filter((e) => e.type === "vente");
  const encaisse = sumCashIn(entries);
  const panierMoyen = ventes.length ? Math.round(sumCashIn(ventes) / ventes.length) : 0;
  const tips = sumTips(entries);
  const byMode = cashInByMode(entries);
  const showSalon = salonFilter === ALL_SALONS;

  const byDay = useMemo(() => {
    const groups = new Map<string, CaisseEntry[]>();
    for (const e of entries) groups.set(entryDay(e), [...(groups.get(entryDay(e)) ?? []), e]);
    return [...groups.entries()];
  }, [entries]);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-5">
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <SegmentedToggle size="sm" value={kind} onChange={(v) => setKind(v as KindFilter)} options={KIND_OPTIONS} />
        </div>
        {entries.length === 0 ? (
          <div className="rounded-field border border-dashed border-base-300 px-4 py-12 text-center">
            <p className="font-[family-name:var(--font-heading)] text-[15px] font-semibold text-base-content/60">Aucune vente</p>
            <p className="mt-1 text-sm text-base-content/65">
              {query ? `Aucune vente pour « ${query} » sur cette période.` : "Rien n'est entré en caisse sur cette période."}
            </p>
          </div>
        ) : (
          byDay.map(([day, list]) => (
            <div key={day} className="overflow-hidden rounded-box border border-base-300 bg-base-100">
              <div className="flex items-baseline justify-between border-b border-base-300 bg-base-200/50 py-2.5 pr-11 pl-4">
                <span className="text-sm font-semibold text-base-content">{formatDay(day)}</span>
                <span className="text-sm font-semibold tabular-nums text-base-content">{formatFcfa(sumCashIn(list))}</span>
              </div>
              <ul>
                {list.map((e) => (
                  <EntryRow key={e.id} entry={e} client={entryClient(e, clients)} showSalon={showSalon} onOpen={setSelected} />
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      <aside className="sticky top-4 flex flex-col gap-4 rounded-box border border-base-300 bg-base-100 p-5">
        <div>
          <p className="text-xs font-semibold tracking-wide text-base-content/65 uppercase">Encaissé</p>
          <p className="mt-1 font-[family-name:var(--font-heading)] text-3xl font-semibold tabular-nums text-base-content">{formatFcfa(encaisse)}</p>
        </div>
        <ul className="flex flex-col gap-2 border-t border-base-300 pt-4 text-sm">
          {byMode.length === 0 && <li className="text-base-content/65">Aucun encaissement.</li>}
          {byMode.map((m) => (
            <li key={m.label} className="flex justify-between">
              <span className="text-base-content/70">{m.label}</span>
              <span className="font-semibold tabular-nums">{formatFcfa(m.amount)}</span>
            </li>
          ))}
        </ul>
        <ul className="flex flex-col gap-2 border-t border-base-300 pt-4 text-sm">
          <li className="flex justify-between">
            <span className="text-base-content/70">Ventes</span>
            <span className="font-semibold tabular-nums">{ventes.length}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-base-content/70">Panier moyen</span>
            <span className="font-semibold tabular-nums">{formatFcfa(panierMoyen)}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-base-content/70">Pourboires</span>
            <span className="font-semibold tabular-nums">{formatFcfa(tips)}</span>
          </li>
        </ul>
      </aside>

      <VenteDetailSheet entry={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function EntryRow({
  entry: e,
  client,
  showSalon,
  onOpen,
}: {
  entry: CaisseEntry;
  client: Cliente | undefined;
  showSalon: boolean;
  onOpen: (e: CaisseEntry) => void;
}) {
  return (
    <li className="border-b border-base-300 last:border-b-0">
      <button
        type="button"
        onClick={() => onOpen(e)}
        className="grid min-h-14 w-full grid-cols-[52px_minmax(0,1.3fr)_minmax(0,2fr)_minmax(0,1fr)_96px_16px] items-center gap-3 px-4 py-2 text-left text-sm hover:bg-accent/40 active:bg-accent/70"
      >
        <span className="tabular-nums text-base-content/65">{formatTime(e.at)}</span>
        <span className="min-w-0">
          <span className="block truncate font-semibold text-base-content">{client ? clientFullName(client) : "Sans cliente"}</span>
          {showSalon && <span className="block text-xs text-base-content/65">{salonLabel(e.salonId)}</span>}
        </span>
        <span className="flex min-w-0 items-center gap-2">
          {e.type === "acompte" && <Badge variant="neutral">Acompte</Badge>}
          <span className="truncate text-base-content/70">{entryContent(e)}</span>
        </span>
        <span className="truncate text-base-content/65">{entryModes(e)}</span>
        <span className="text-right font-semibold tabular-nums text-base-content">{formatFcfa(entryAmount(e))}</span>
        <ChevronRight aria-hidden className="size-4 text-base-content/35" />
      </button>
    </li>
  );
}
