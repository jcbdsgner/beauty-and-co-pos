import { CheckCircle2 } from "lucide-react";
import { HeroNumber } from "@/components/ui/atoms/hero-number";
import { StatTile, StatTileRow } from "@/components/ui/molecules/stat-tile";
import { computeTotals, useAppData } from "@/components/providers/app-data-provider";
import { DiscountBreakdown } from "@/components/comptoir/discount-breakdown";
import { SendReceiptButtons } from "@/components/comptoir/send-receipt-buttons";
import { clientFullName } from "@/lib/data/clientele";
import { formatFcfa } from "@/lib/utils";
import type { Sale } from "@/lib/data/types";

const MODE_LABEL = { wave: "Wave", orange_money: "Orange Money", especes: "Espèces", carte: "Carte" };

/**
 * Read-only reçu — same visual structure as the Comptoir's ReceiptStep (never a re-typed
 * duplicate), minus its post-encaissement actions ("Imprimer", "Nouvelle vente"…), which don't
 * belong on a historical lookup from Récap des ventes. Per USERFLOW.md § Récap des ventes.
 */
export function ReceiptView({ sale }: { sale: Sale }) {
  const { clients } = useAppData();
  const totals = computeTotals(sale);
  const client = sale.clientId ? clients.find((c) => c.id === sale.clientId) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 rounded-3xl bg-accent p-6 text-center">
        <CheckCircle2 aria-hidden className="size-10 text-success" />
        <p className="font-semibold text-base-content">Vente encaissée</p>
        {client && <p className="text-sm text-base-content/70">{clientFullName(client)}</p>}
      </div>

      <HeroNumber label="Total payé" value={formatFcfa(totals.total)} align="center" size="lg" />

      <div className="flex flex-col gap-1 rounded-2xl border border-base-300 p-4 text-sm">
        {sale.cart.map((line) => (
          <div key={line.id} className="flex items-center justify-between text-base-content/80">
            <span>
              {line.name} × {line.qty}
              {line.beneficiary && <span className="text-base-content/45"> · {line.beneficiary}</span>}
            </span>
            <span>{formatFcfa(line.unitPrice * line.qty)}</span>
          </div>
        ))}
        {totals.totalDiscount > 0 && (
          <>
            <div className="mt-2 flex items-center justify-between border-t border-base-300 pt-2 text-base-content/55">
              <span>Sous-total</span>
              <span className="tabular-nums">{formatFcfa(totals.subtotal)}</span>
            </div>
            <DiscountBreakdown sale={sale} />
            <div className="flex items-center justify-between font-semibold text-base-content">
              <span>Total</span>
              <span className="tabular-nums">{formatFcfa(totals.total)}</span>
            </div>
          </>
        )}
        {sale.payment && (
          <p className="mt-2 border-t border-base-300 pt-2 text-xs text-base-content/55">
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

      <SendReceiptButtons client={client} />
    </div>
  );
}
