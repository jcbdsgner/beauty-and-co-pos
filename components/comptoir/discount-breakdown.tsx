import { computeTotals } from "@/components/providers/app-data-provider";
import { cn, formatFcfa } from "@/lib/utils";
import type { Sale } from "@/lib/data/types";

/**
 * The itemised discount lines — one per mechanism that actually reduced the total, plus the
 * granted-discount motif and the gift-card reliquat as captions. Shared by the receipt step and
 * the read-only receipt in Récap des ventes so the two never drift. Renders nothing when the sale
 * carries no discount.
 */
export function DiscountBreakdown({ sale, className }: { sale: Sale; className?: string }) {
  const t = computeTotals(sale);
  if (t.totalDiscount <= 0) return null;

  return (
    <div className={cn("flex flex-col gap-1 text-[var(--color-success)]", className)}>
      {t.grantedDiscount > 0 && (
        <div className="flex justify-between gap-3">
          <span>
            Remise accordée
            {sale.discountGranted?.mode === "pourcentage" && ` (${sale.discountGranted.value} %)`}
            {sale.discountGranted?.managerCode && " · code manager"}
          </span>
          <span className="tabular-nums">−{formatFcfa(t.grantedDiscount)}</span>
        </div>
      )}
      {t.loyaltyDiscount > 0 && (
        <div className="flex justify-between gap-3">
          <span>Points fidélité ({sale.loyaltyPointsUsed} pts)</span>
          <span className="tabular-nums">−{formatFcfa(t.loyaltyDiscount)}</span>
        </div>
      )}
      {t.giftCardDiscount > 0 && (
        <div className="flex justify-between gap-3">
          <span>Carte cadeau{sale.giftCardApplied && ` « ${sale.giftCardApplied.code} »`}</span>
          <span className="tabular-nums">−{formatFcfa(t.giftCardDiscount)}</span>
        </div>
      )}
      {sale.discountGranted?.reason && (
        <p className="text-xs text-[var(--color-gray-500)]">Motif de la remise : {sale.discountGranted.reason}</p>
      )}
      {t.giftCardRemaining > 0 && (
        <p className="text-xs text-[var(--color-gray-500)]">Reste {formatFcfa(t.giftCardRemaining)} sur la carte cadeau.</p>
      )}
    </div>
  );
}
