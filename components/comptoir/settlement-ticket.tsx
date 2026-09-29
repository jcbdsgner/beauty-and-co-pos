"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { TicketClientCard, TicketFrame, TicketHead, TicketLineBody, TicketTotals } from "@/components/comptoir/ticket-parts";
import { useAppData, computeTotals } from "@/components/providers/app-data-provider";
import { formatFcfa } from "@/lib/utils";
import type { Sale } from "@/lib/data/types";

/**
 * The ticket at the règlement — the same block as on the panier, same place, same total, same
 * button spot. Read-only: quantities, remises and avantages were all settled on the panier
 * (« Remises et avantages », ADR 0038); here each line only shows its final price and remise tag.
 */
export function SettlementTicket({
  sale,
  onConfirm,
  canConfirm,
  confirmHint,
}: {
  sale: Sale;
  onConfirm: () => void;
  canConfirm: boolean;
  confirmHint: string | null;
}) {
  const { clients } = useAppData();
  const client = sale.clientId ? clients.find((c) => c.id === sale.clientId) : undefined;
  const totals = computeTotals(sale);

  return (
    <TicketFrame>
      <TicketHead sale={sale}>
        {client ? (
          <TicketClientCard client={client} />
        ) : (
          <p className="rounded-field bg-base-200 px-3 py-3 text-sm text-base-content/55">Vente sans cliente identifiée</p>
        )}
      </TicketHead>

      <div className="min-h-0 flex-1 overflow-y-auto px-5">
        <ul className="flex flex-col divide-y divide-border">
          {sale.cart.map((line) => {
            const discount = totals.lineDiscount[line.id] ?? 0;
            const r = sale.remises.find((x) => x.lineIds.includes(line.id));
            return (
              <li key={line.id} className="flex py-3.5">
                <TicketLineBody
                  line={line}
                  covered={totals.coveredAmountByService[line.refId] ?? 0}
                  discount={discount}
                  tag={<RemiseTag remise={r} discount={discount} />}
                />
              </li>
            );
          })}
        </ul>
      </div>

      <div className="shrink-0 border-t border-border bg-white px-5 pt-3 pb-5">
        <TicketTotals sale={sale} className="mb-3" />
        <Button
          variant="brand"
          size="xl"
          className="w-full"
          icon={<Check className="size-5" />}
          disabled={!canConfirm}
          onClick={onConfirm}
        >
          Confirmer l&apos;encaissement
        </Button>
        {confirmHint && <p className="mt-1.5 text-center text-xs font-medium text-base-content/55">{confirmHint}</p>}
      </div>
    </TicketFrame>
  );
}

/** A line's remise, read-only — « Remise −10 % » under its name. */
export function RemiseTag({ remise, discount }: { remise: Sale["remises"][number] | undefined; discount: number }) {
  if (!remise || discount <= 0) return null;
  return (
    <span className="mt-1 inline-flex items-center rounded-field bg-accent px-2.5 py-1 text-xs font-semibold text-secondary">
      Remise {remise.mode === "pourcentage" ? `−${remise.value} %` : `−${formatFcfa(discount)}`}
    </span>
  );
}
