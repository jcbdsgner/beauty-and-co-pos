"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { Toolbar } from "@/components/ui/organisms/toolbar";
import { DataTable, type DataTableColumn } from "@/components/ui/organisms/data-table";
import { StatTile, StatTileRow } from "@/components/ui/molecules/stat-tile";
import { EmptyState } from "@/components/ui/molecules/empty-state";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Badge } from "@/components/ui/atoms/badge";
import { ReceiptView } from "@/components/journee/receipt-view";
import { computeTotals, useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import { formatFcfa } from "@/lib/utils";
import type { PaymentMode, Sale } from "@/lib/data/types";

const PERIOD_OPTIONS = [
  { value: "jour", label: "Aujourd'hui" },
  { value: "semaine", label: "Cette semaine" },
  { value: "mois", label: "Ce mois" },
];

const MODE_LABEL: Record<PaymentMode, string> = { wave: "Wave", orange_money: "Orange Money", especes: "Espèces", carte: "Carte" };

export default function RecapVentesPage() {
  const { sales, clients } = useAppData();
  const [period, setPeriod] = useState("jour");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // The mock data model only ever holds this session's sales (implicitly "today") — there's no
  // historical range to slice by week/month yet, so every period currently resolves to the same
  // set rather than fabricating data. Known limit, noted in the final report.
  const encaissees = sales.filter((s) => s.status === "encaissee");
  const abandonnees = sales.filter((s) => s.status === "abandonnee");

  const total = encaissees.reduce((sum, s) => sum + computeTotals(s).total, 0);
  const panierMoyen = encaissees.length > 0 ? Math.round(total / encaissees.length) : 0;

  const columns: DataTableColumn<Sale>[] = [
    {
      key: "heure",
      header: "Heure",
      render: (s) => (s.encaisseeAt ? new Date(s.encaisseeAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—"),
    },
    {
      key: "cliente",
      header: "Cliente",
      render: (s) => {
        const client = s.clientId ? clients.find((c) => c.id === s.clientId) : undefined;
        return client ? clientFullName(client) : "Cliente de passage";
      },
    },
    { key: "total", header: "Total", align: "right", render: (s) => formatFcfa(computeTotals(s).total) },
    {
      key: "mode",
      header: "Mode de paiement",
      render: (s) => s.payment?.modes.map((m) => MODE_LABEL[m.mode]).join(" + ") ?? "—",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Récap des ventes" subtitle="Ventes encaissées de la période." backHref="/" />

      <Toolbar filters={PERIOD_OPTIONS} filterValue={period} onFilterChange={setPeriod} />

      {encaissees.length === 0 ? (
        <EmptyState icon={<Receipt />} title="Aucune vente sur cette période" subtitle="Les ventes encaissées apparaîtront ici." />
      ) : (
        <>
          <StatTileRow>
            <StatTile value={formatFcfa(total)} label="Total encaissé" tone="success" />
            <StatTile value={encaissees.length} label="Ventes" />
            <StatTile value={formatFcfa(panierMoyen)} label="Panier moyen" />
          </StatTileRow>

          <DataTable columns={columns} rows={encaissees} rowKey={(s) => s.id} onRowClick={setSelectedSale} />
        </>
      )}

      {abandonnees.length > 0 && (
        <p className="flex items-center gap-2 text-sm text-[var(--color-gray-500)]">
          <Badge variant="neutral">{abandonnees.length}</Badge>
          vente{abandonnees.length > 1 ? "s" : ""} abandonnée{abandonnees.length > 1 ? "s" : ""} sur la période — non comptée{abandonnees.length > 1 ? "s" : ""} dans le total encaissé.
        </p>
      )}

      {selectedSale && (
        <Dialog open labelledBy="receipt-dialog-title" className="relative max-w-md rounded-3xl p-6">
          <CloseButton onClick={() => setSelectedSale(null)} />
          <h2 id="receipt-dialog-title" className="sr-only">
            Reçu de la vente
          </h2>
          <ReceiptView sale={selectedSale} />
        </Dialog>
      )}
    </div>
  );
}
