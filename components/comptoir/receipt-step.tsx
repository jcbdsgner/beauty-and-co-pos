"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Printer, Star } from "lucide-react";
import { HeroNumber } from "@/components/ui/atoms/hero-number";
import { Button } from "@/components/ui/atoms/button";
import { StatTile, StatTileRow } from "@/components/ui/molecules/stat-tile";
import { computeTotals, useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import { formatFcfa } from "@/lib/utils";
import type { Sale } from "@/lib/data/types";

const MODE_LABEL = { wave: "Wave", orange_money: "Orange Money", especes: "Espèces", carte: "Carte" };

export function ReceiptStep({ sale }: { sale: Sale }) {
  const router = useRouter();
  const { closeTab, openNewTab, clients } = useAppData();
  const [printFailed, setPrintFailed] = useState(false);
  const totals = computeTotals(sale);
  const client = sale.clientId ? clients.find((c) => c.id === sale.clientId) : undefined;

  function handlePrint() {
    // No real printer in this environment — simulate the occasional failure the spec calls out,
    // so "Réessayer l'impression" has something real to demonstrate.
    setPrintFailed(Math.random() < 0.3);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 py-8">
      <div className="flex flex-col items-center gap-2 rounded-3xl bg-[var(--brand-rose-soft)] p-6 text-center">
        <CheckCircle2 aria-hidden className="size-10 text-[var(--color-success)]" />
        <p className="font-semibold text-[var(--color-gray-900)]">Vente encaissée</p>
        {client && <p className="text-sm text-[var(--color-gray-600)]">{clientFullName(client)}</p>}
      </div>

      <HeroNumber label="Total payé" value={formatFcfa(totals.total)} align="center" size="lg" />

      <div className="flex flex-col gap-1 rounded-2xl border border-[var(--color-gray-200)] p-4 text-sm">
        {sale.cart.map((line) => (
          <div key={line.id} className="flex items-center justify-between text-[var(--color-gray-700)]">
            <span>
              {line.name} × {line.qty}
            </span>
            <span>{formatFcfa(line.unitPrice * line.qty)}</span>
          </div>
        ))}
        {sale.payment && (
          <p className="mt-2 border-t border-[var(--color-gray-200)] pt-2 text-xs text-[var(--color-gray-500)]">
            {sale.payment.modes.map((m) => `${MODE_LABEL[m.mode]} · ${formatFcfa(m.amount)}`).join(" + ")}
          </p>
        )}
      </div>

      {client && (
        <StatTileRow className="grid-cols-2">
          <StatTile value={`+${sale.loyaltyPointsEarned ?? 0}`} label="Points gagnés" tone="success" />
          <StatTile value={client.points} label="Solde fidélité" />
        </StatTileRow>
      )}

      {printFailed ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-[var(--color-error-soft)] p-4 text-center">
          <p className="text-sm font-medium text-[var(--color-error)]">Impression impossible — imprimante hors ligne.</p>
          <Button variant="danger-outline" onClick={handlePrint}>
            Réessayer l&apos;impression
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={handlePrint} icon={<Printer className="size-4" />}>
          Imprimer le reçu
        </Button>
      )}

      <div className="flex flex-col gap-2">
        <Button
          variant="brand"
          icon={<Star className="size-4" />}
          onClick={() => {
            router.push("/");
            closeTab(sale.id);
          }}
        >
          Accueillir un nouveau rendez-vous maintenant
        </Button>
        <Button variant="dark" onClick={() => openNewTab()}>
          Nouvelle vente
        </Button>
      </div>
    </div>
  );
}
