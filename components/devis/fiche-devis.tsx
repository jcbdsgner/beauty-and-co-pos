"use client";

/**
 * Devis et factures sur la fiche cliente (ADR 0042) : tout l'historique au même endroit, et
 * « Nouveau devis » — y compris pour une cliente qui n'a pas encore de fil. Une ligne ouvre son fil,
 * où l'on agit. La société facturée s'ajoute aux Coordonnées.
 */

import Link from "next/link";
import { Building2, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { Board, BoardEmpty, FlipChip } from "@/components/ui/board";
import { buildDossiers, dossierChip, SHORT_DATE_FMT, type Dossier } from "@/components/devis/lib";
import { useAppData } from "@/components/providers/app-data-provider";
import { formatFcfa } from "@/lib/utils";
import type { Cliente } from "@/lib/data/types";

function useClientDossiers(clientId: string) {
  const { devis, factures } = useAppData();
  return buildDossiers(devis.filter((d) => d.clientId === clientId), factures).sort((a, b) => b.at.localeCompare(a.at));
}

function DossierRow({ d, clientId }: { d: Dossier; clientId: string }) {
  const chip = dossierChip(d);
  return (
    <Link href={`/messages?client=${clientId}`} className="flex min-h-16 items-center gap-3 px-4 py-3 transition hover:bg-base-200/60">
      <FileText aria-hidden className="size-5 shrink-0 text-base-content/40" />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold tabular-nums">{d.facture?.number ?? d.number}</span>
        <span className="block truncate text-sm text-base-content/55">
          {SHORT_DATE_FMT.format(new Date(d.at))} · {d.devis.lines.map((l) => l.name.toLowerCase()).join(", ")}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block font-semibold tabular-nums">{formatFcfa(d.total)}</span>
        <FlipChip value={chip.value} tone={chip.tone} className="mt-1" />
      </span>
    </Link>
  );
}

/** La société facturée, quand la fiche en a une — une ligne de plus dans Coordonnées. */
export function BillingCompanyRow({ client }: { client: Cliente }) {
  const b = client.billingCompany;
  if (!b) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-secondary"><Building2 className="size-5" /></span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-base-content/55">Société facturée</span>
        <span className="block text-[15px] font-medium">{b.name}</span>
        <span className="block text-sm text-base-content/55">{b.address} · NINEA {b.ninea}</span>
      </span>
    </div>
  );
}

export function DevisFacturesBoard({ client, onNew }: { client: Cliente; onNew: () => void }) {
  const dossiers = useClientDossiers(client.id);
  return (
    <Board legend="Devis et factures" legendRight={<Button variant="outline" size="sm" icon={<Plus className="size-4" />} onClick={onNew}>Nouveau devis</Button>}>
      {dossiers.length === 0 ? (
        <BoardEmpty title="Aucun devis" hint="Un devis envoyé part dans son fil Messages." />
      ) : (
        <div className="flex flex-col divide-y divide-border">{dossiers.map((d) => <DossierRow key={d.number} d={d} clientId={client.id} />)}</div>
      )}
    </Board>
  );
}
