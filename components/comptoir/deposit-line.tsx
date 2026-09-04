import { cn, formatFcfa } from "@/lib/utils";
import type { Sale } from "@/lib/data/types";

/**
 * The acompte line — what the cliente already paid on the external platform when she booked.
 * Not a Remise (it doesn't change the sale's value, only what's left to ask for), so it never
 * joins `DiscountBreakdown`'s ventilation. Shared by the cart foot, payment step and receipt so
 * the wording never drifts. Renders nothing when the sale carries no acompte.
 */
export function DepositLine({ sale, className }: { sale: Sale; className?: string }) {
  if (!sale.depositPaid) return null;

  return (
    <div className={cn("flex justify-between gap-3 text-success", className)}>
      <span>Acompte versé</span>
      <span className="tabular-nums">−{formatFcfa(sale.depositPaid)}</span>
    </div>
  );
}
