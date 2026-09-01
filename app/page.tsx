"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Users } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Button } from "@/components/ui/atoms/button";
import {
  BoardHeader,
  Board,
  Lane,
  FlipChip,
  Legend,
  BoardEmpty,
} from "@/components/ui/board";
import { AppointmentDetailSheet } from "@/components/planning/appointment-detail-sheet";
import { useEncaissement } from "@/components/journee/use-encaissement";
import { computeTotals, useAppData } from "@/components/providers/app-data-provider";
import { useSession } from "@/lib/session";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import { serviceById } from "@/lib/data/menu";
import { appointmentEndTime, flattenRendezVous } from "@/lib/data/planning";
import type { RelanceType, RendezVous } from "@/lib/data/types";

const DAY_FMT = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Bonsoir" : h < 18 ? "Bonjour" : "Bonsoir";
}

const RELANCE_TYPE_SINGULAR: Record<RelanceType, string> = {
  anniversaire: "anniversaire",
  soins: "soin",
  fidelite: "fidélité",
  reconquete: "reconquête",
  recommandation: "reco",
};

/**
 * Accueil — l'écran d'atterrissage, refait dans le langage « Le Tableau » (docs/adr/0005) pour
 * ne plus être le seul écran de l'app à parler l'ancien langage. Un point du jour calme (pas de
 * hero-metrics), la tournée du matin branchée sur le vrai state du store, et le jour en tableau
 * de lignes — mêmes lignes, mêmes jetons que le Planning.
 */
export default function AccueilPage() {
  const { reservations, praticiennes, clients, sales, relances } = useAppData();
  const dayRows = useMemo(
    () => flattenRendezVous(reservations).filter((r) => r.rv.status !== "annule"),
    [reservations],
  );
  const { requestEncaissement, encaissementDialog } = useEncaissement();
  const { currentUser } = useSession();

  const [detail, setDetail] = useState<RendezVous | null>(null);

  const encaisseAujourdhui = sales
    .filter((s) => s.status === "encaissee")
    .reduce((sum, s) => sum + computeTotals(s).total, 0);

  const today = new Date().toISOString().slice(0, 10);
  const roundReady = useMemo(
    () => relances.filter((r) => r.status === "a_venir" && r.date.slice(0, 10) === today),
    [relances, today],
  );
  const roundBreakdown = useMemo(() => {
    const counts: Partial<Record<RelanceType, number>> = {};
    for (const r of roundReady) counts[r.type] = (counts[r.type] ?? 0) + 1;
    return Object.entries(counts)
      .map(([t, n]) => `${n} ${RELANCE_TYPE_SINGULAR[t as RelanceType]}${n > 1 && t !== "fidelite" && t !== "reconquete" ? "s" : ""}`)
      .join(" · ");
  }, [roundReady]);

  const groups = praticiennes
    .map((staff) => ({
      staff,
      items: dayRows
        .filter((r) => r.rv.staffId === staff.id || r.rv.secondStaffId === staff.id)
        .sort((a, b) => a.rv.start.localeCompare(b.rv.start)),
    }))
    .filter((g) => g.items.length > 0);

  const liveCount = new Set(dayRows.map((r) => r.rv.id)).size;

  return (
    <div className="flex flex-col gap-6">
      <BoardHeader
        section="Accueil"
        context={
          <span>
            {greeting()} {currentUser.name.split(" ")[0]}.{" "}
            <span className="capitalize">{DAY_FMT.format(new Date())}</span>.
          </span>
        }
      />

      {/* Le point du jour — deux repères, pas trois hero-metrics */}
      <Board legend="Le point du jour" tone="now">
        <div className="flex divide-x divide-[var(--board-groove)]">
          <PointCell
            href="/recap-ventes"
            label="Encaissé aujourd'hui"
            value={encaisseAujourdhui > 0 ? `${encaisseAujourdhui.toLocaleString("fr-FR")} F` : "Rien encore"}
            hint="Voir le récap complet"
            muted={encaisseAujourdhui === 0}
          />
          <PointCell href="/planning" label="Rendez-vous du jour" value={String(liveCount)} hint="Ouvrir le planning" />
        </div>
      </Board>

      {/* Tournée du matin — rappel de ce qui part automatiquement aujourd'hui (ADR 0010, lecture seule) */}
      <Board legend="Tournée du matin" tone={roundReady.length > 0 ? "act" : "plain"}>
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-heading)] text-[15px] font-semibold text-[var(--color-gray-900)]">
              {roundReady.length === 0
                ? "Aucune relance ne part aujourd'hui."
                : `${roundReady.length} relance${roundReady.length > 1 ? "s" : ""} part${roundReady.length > 1 ? "ent" : ""} automatiquement aujourd'hui.`}
            </p>
            {roundBreakdown && <p className="mt-0.5 text-sm text-[var(--color-gray-500)]">{roundBreakdown}</p>}
          </div>
          <Button variant="outline" size="sm" href="/relances" icon={<ArrowRight className="size-4" />} className="shrink-0">
            Ouvrir les relances
          </Button>
        </div>
      </Board>

      {/* Le jour — mêmes lignes, mêmes jetons que le Planning */}
      <Board legend={`Le jour · ${liveCount} rendez-vous`}>
        {groups.length === 0 ? (
          <BoardEmpty
            title="Journée libre"
            hint="Aucun rendez-vous aujourd'hui."
            action={
              <Button href="/planning" variant="outline">
                Ouvrir le planning
              </Button>
            }
          />
        ) : (
          groups.map(({ staff, items }) => (
            <div key={staff.id}>
              <div className="flex items-center gap-2 border-b border-[var(--board-groove)] bg-black/[0.02] px-4 py-2">
                <Legend>{staff.name} · {items.length}</Legend>
                {staff.unavailableToday && <FlipChip value="Absente" tone="signal" className="min-w-0 px-1.5 py-0.5 text-[0.5rem]" />}
              </div>
              {items.map(({ rv, reservation }) => {
                const client = clients.find((c) => c.id === reservation.payerClientId);
                const service = serviceById(rv.serviceId);
                const second = rv.secondStaffId ? praticiennes.find((p) => p.id === rv.secondStaffId) : null;
                const benef = rv.beneficiaryClientId
                  ? clients.find((c) => c.id === rv.beneficiaryClientId)?.lastName
                  : rv.beneficiaryName;
                const absent = staff.unavailableToday;
                const hasSale = Boolean(reservation.saleId);
                const siblings = reservation.rendezVous.filter((x) => x.status !== "annule").length - 1;
                return (
                  <Lane
                    key={rv.id}
                    leading={
                      <span className="flex flex-col leading-tight">
                        <span>{rv.start}</span>
                        <span className="text-[0.7rem] font-normal text-[var(--color-gray-400)]">{appointmentEndTime(rv)}</span>
                      </span>
                    }
                    title={
                      <span className="flex items-center gap-2">
                        <Avatar initial={client ? clientInitial(client) : "?"} size={26} className="bg-accent text-[0.65rem] font-semibold text-secondary" />
                        {client ? clientFullName(client) : "Cliente"}
                      </span>
                    }
                    meta={
                      `${service?.name ?? "Prestation"}` +
                      (benef ? ` · pour ${benef}` : "") +
                      (second ? ` · à 2 (${second.name})` : "") +
                      (siblings > 0 ? ` · +${siblings} sur la note` : "") +
                      (absent ? " · praticienne absente" : "")
                    }
                    chip={
                      (hasSale || second) && (
                        <span className="flex items-center gap-1">
                          {second && <Users aria-hidden className="size-3.5 text-[var(--brand-taupe-muted)]" />}
                          {hasSale && <FlipChip value="En cours" tone="signal" />}
                        </span>
                      )
                    }
                    signal={absent ? "hold" : "none"}
                    onSelect={() => setDetail(rv)}
                    actions={
                      <Button size="sm" variant={hasSale ? "outline" : "dark"} onClick={() => requestEncaissement(reservation.id)}>
                        {hasSale ? "Voir la vente" : "Encaisser"}
                      </Button>
                    }
                  />
                );
              })}
            </div>
          ))
        )}
      </Board>

      <AppointmentDetailSheet
        appointment={detail}
        onClose={() => setDetail(null)}
        onEncaisser={(id) => {
          setDetail(null);
          requestEncaissement(id);
        }}
      />

      {encaissementDialog}
    </div>
  );
}

function PointCell({
  href,
  label,
  value,
  hint,
  muted,
}: {
  href: string;
  label: string;
  value: string;
  hint: string;
  muted?: boolean;
}) {
  return (
    <Link href={href} className="group flex flex-1 items-center justify-between gap-3 px-5 py-4 transition hover:bg-black/[0.02]">
      <span className="min-w-0">
        <Legend>{label}</Legend>
        <span
          className={
            muted
              ? "mt-1 block font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-gray-400)]"
              : "mt-1 block font-[family-name:var(--font-heading)] text-2xl font-semibold tabular-nums text-[var(--color-gray-900)]"
          }
        >
          {value}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--brand-taupe-muted)]">
        {hint}
        <ChevronRight className="size-3.5 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
