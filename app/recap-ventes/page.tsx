"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";
import { BoardHeader } from "@/components/ui/board";
import { Pills } from "@/components/ui/molecules/pills";
import { DataTable, type DataTableColumn } from "@/components/ui/organisms/data-table";
import { StatBand } from "@/components/ui/molecules/stat-tile";
import { EmptyState } from "@/components/ui/molecules/empty-state";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Badge } from "@/components/ui/atoms/badge";
import { ReceiptView } from "@/components/journee/receipt-view";
import { computeTotals, useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import { serviceById } from "@/lib/data/menu";
import { formatFcfa } from "@/lib/utils";
import type { PaymentMode, Sale } from "@/lib/data/types";

const PERIOD_OPTIONS = [
  { value: "jour", label: "Aujourd'hui" },
  { value: "semaine", label: "Cette semaine" },
  { value: "mois", label: "Ce mois" },
];

const MODE_LABEL: Record<PaymentMode, string> = { wave: "Wave", orange_money: "Orange Money", especes: "Espèces", carte: "Carte" };
const MODE_ORDER: PaymentMode[] = ["wave", "orange_money", "especes", "carte"];

export default function RecapVentesPage() {
  const { sales, clients, praticiennes, reservations } = useAppData();
  const [period, setPeriod] = useState("jour");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // The mock model only holds this session's sales (implicitly "today") — every period resolves
  // to the same set rather than fabricating data. Known limit.
  const encaissees = sales.filter((s) => s.status === "encaissee");
  const abandonnees = sales.filter((s) => s.status === "abandonnee");
  const total = encaissees.reduce((sum, s) => sum + computeTotals(s).total, 0);
  const panierMoyen = encaissees.length > 0 ? Math.round(total / encaissees.length) : 0;

  const byMode = new Map<PaymentMode, number>();
  for (const s of encaissees) for (const p of s.payment?.modes ?? []) byMode.set(p.mode, (byMode.get(p.mode) ?? 0) + p.amount);

  // Practitioner attribution comes from the sale's origin réservation, split across its rendez-vous
  // in proportion to each prestation's price. Walk-in sales with no réservation → "Sans rendez-vous".
  const byStaff = new Map<string, number>();
  for (const s of encaissees) {
    const t = computeTotals(s).total;
    const reservation = s.originReservationId ? reservations.find((r) => r.id === s.originReservationId) : undefined;
    const live = reservation?.rendezVous.filter((rv) => rv.status !== "annule") ?? [];
    const priced = live.map((rv) => ({ rv, price: serviceById(rv.serviceId)?.price ?? 0 }));
    const base = priced.reduce((sum, p) => sum + p.price, 0);
    if (priced.length === 0 || base === 0) {
      byStaff.set("__none__", (byStaff.get("__none__") ?? 0) + t);
    } else {
      for (const { rv, price } of priced) {
        byStaff.set(rv.staffId, (byStaff.get(rv.staffId) ?? 0) + Math.round((t * price) / base));
      }
    }
  }

  const columns: DataTableColumn<Sale>[] = [
    {
      key: "heure",
      header: "Heure",
      render: (s) => (s.encaisseeAt ? new Date(s.encaisseeAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—"),
    },
    {
      key: "cliente",
      header: "Cliente",
      weight: 2,
      render: (s) => {
        const client = s.clientId ? clients.find((c) => c.id === s.clientId) : undefined;
        return client ? clientFullName(client) : "Cliente de passage";
      },
    },
    { key: "mode", header: "Paiement", render: (s) => s.payment?.modes.map((m) => MODE_LABEL[m.mode]).join(" + ") ?? "—" },
    {
      key: "remise",
      header: "Remise",
      align: "right",
      render: (s) => {
        const { totalDiscount } = computeTotals(s);
        return totalDiscount > 0 ? (
          <span className="tabular-nums text-[var(--color-success)]">−{formatFcfa(totalDiscount)}</span>
        ) : (
          <span className="text-[var(--color-gray-300)]">—</span>
        );
      },
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      render: (s) => <span className="font-semibold text-[var(--button-2-color)] tabular-nums">{formatFcfa(computeTotals(s).total)}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <BoardHeader section="Récap des ventes" backHref="/" backLabel="Accueil" />

      <Pills options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />

      {encaissees.length === 0 ? (
        <EmptyState icon={<Receipt />} title="Aucune vente sur cette période" subtitle="Les ventes encaissées apparaîtront ici." />
      ) : (
        <>
          <StatBand
            items={[
              { label: "Total encaissé", value: formatFcfa(total), tone: "success" },
              { label: "Ventes", value: encaissees.length },
              { label: "Panier moyen", value: formatFcfa(panierMoyen) },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="mb-3 text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">Par mode de paiement</p>
              <ul className="flex flex-col gap-2">
                {MODE_ORDER.filter((m) => byMode.has(m)).map((m) => (
                  <li key={m} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-gray-700)]">{MODE_LABEL[m]}</span>
                    <span className="font-semibold text-[var(--color-gray-900)] tabular-nums">{formatFcfa(byMode.get(m) ?? 0)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="mb-3 text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">Par praticienne</p>
              {byStaff.size === 0 ? (
                <p className="text-sm text-[var(--color-gray-400)]">Aucune vente sur la période.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {[...byStaff.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .map(([id, amount]) => (
                      <li key={id} className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-gray-700)]">
                          {id === "__none__" ? "Sans rendez-vous" : (praticiennes.find((p) => p.id === id)?.name ?? "—")}
                        </span>
                        <span className="font-semibold text-[var(--color-gray-900)] tabular-nums">{formatFcfa(Math.round(amount))}</span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          <DataTable columns={columns} rows={encaissees} rowKey={(s) => s.id} onRowClick={setSelectedSale} />
        </>
      )}

      {abandonnees.length > 0 && (
        <p className="flex items-center gap-2 text-sm text-[var(--color-gray-500)]">
          <Badge variant="neutral">{abandonnees.length}</Badge>
          vente{abandonnees.length > 1 ? "s" : ""} abandonnée{abandonnees.length > 1 ? "s" : ""} — non comptée{abandonnees.length > 1 ? "s" : ""} dans le total encaissé.
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
