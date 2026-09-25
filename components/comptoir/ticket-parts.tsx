"use client";

import { Badge } from "@/components/ui/atoms/badge";
import { DiscountBreakdown } from "@/components/comptoir/discount-breakdown";
import { DepositLine } from "@/components/comptoir/deposit-line";
import { ClientPreferences } from "@/components/shared/client-preferences";
import { computeTotals } from "@/components/providers/app-data-provider";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import { cn, formatFcfa } from "@/lib/utils";
import type { CartLine, Cliente, Sale } from "@/lib/data/types";

/**
 * The ticket's building blocks, shared by the three stations of a sale (ADR 0031): the panier
 * (lines editable), the règlement (lines selectable for a remise) and the reçu. The ticket never
 * moves — it holds the right column of the Comptoir from the first line to the printed receipt;
 * only what sits to its left changes.
 */

const TIER_BADGE = {
  vip: { label: "VIP", variant: "vip" as const },
  platinum: { label: "Platinum", variant: "platinum" as const },
  gold: { label: "Gold", variant: "gold" as const },
  silver: { label: "Silver", variant: "silver" as const },
};

export function TicketFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-border bg-white", className)}>
      {children}
    </div>
  );
}

/** « Ticket · 3 articles » over the cliente slot, with the brand mark bleeding off the corner. */
export function TicketHead({
  sale,
  title = "Ticket",
  children,
}: {
  sale: Sale;
  title?: string;
  children?: React.ReactNode;
}) {
  const itemCount = sale.cart.reduce((n, l) => n + l.qty, 0);
  return (
    <div className="relative shrink-0 overflow-hidden border-b border-border px-5 pt-5 pb-4">
      <div className="relative flex items-baseline gap-2">
        <p className="font-[family-name:var(--font-heading)] font-bold text-lg text-base-content">{title}</p>
        {itemCount > 0 && (
          <span className="text-xs font-semibold tracking-[0.08em] text-base-content/45 uppercase tabular-nums">
            {itemCount} {itemCount > 1 ? "articles" : "article"}
          </span>
        )}
      </div>
      {children && <div className="relative mt-3">{children}</div>}
    </div>
  );
}

/** The identified cliente, with her preferences always shown beneath — never folded away. */
export function TicketClientCard({ client, onRemove }: { client: Cliente; onRemove?: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 rounded-2xl bg-accent px-3 py-2.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white font-semibold text-secondary">
          {clientInitial(client)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-[family-name:var(--font-heading)] font-semibold text-[15px] text-base-content">
              {clientFullName(client)}
            </span>
            {client.tier && <Badge {...TIER_BADGE[client.tier]}>{TIER_BADGE[client.tier].label}</Badge>}
          </span>
          <span className="block truncate text-xs text-base-content/55">{client.phone}</span>
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="-mr-1 inline-flex min-h-11 shrink-0 items-center rounded-full bg-white/70 px-3 text-xs font-semibold text-secondary transition active:scale-95 hover:bg-white"
          >
            Retirer
          </button>
        )}
      </div>
      <ClientPreferences client={client} />
    </div>
  );
}

/**
 * One line's name + price block. The price reads the line's story: gross in taupe when nothing
 * touches it; gross struck through over the net when a Pack covers it (green — prépayé) or a
 * remise lowers it (ink, with the remise tag beside the name).
 */
export function TicketLineBody({
  line,
  covered = 0,
  discount = 0,
  tag,
  muted,
  hideQty,
}: {
  line: CartLine;
  covered?: number;
  discount?: number;
  /** Rendered under the name — the remise chip on the règlement ticket. */
  tag?: React.ReactNode;
  muted?: boolean;
  /** The panier shows quantity on its stepper — no « 2 × » prefix there. */
  hideQty?: boolean;
}) {
  const gross = line.unitPrice * line.qty;
  const net = Math.max(0, gross - covered - discount);
  const changed = covered > 0 || discount > 0;
  return (
    <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[15px] font-semibold", muted ? "text-base-content/55" : "text-base-content")}>
          {line.qty > 1 && !hideQty && <span className="tabular-nums">{line.qty} × </span>}
          {line.name}
        </span>
        {line.beneficiary && <span className="block text-xs font-medium text-primary">pour {line.beneficiary}</span>}
        {covered > 0 && <span className="block text-xs font-medium text-success">Déjà payé</span>}
        {tag}
      </span>
      {changed ? (
        <span className="shrink-0 text-right tabular-nums">
          <span className="block text-xs text-base-content/45 line-through">{formatFcfa(gross)}</span>
          <span className={cn("block text-[15px] font-semibold", covered > 0 && discount === 0 ? "text-success" : "text-base-content")}>
            {formatFcfa(net)}
          </span>
        </span>
      ) : (
        <span className={cn("shrink-0 text-[15px] font-semibold tabular-nums", muted ? "text-base-content/55" : "text-primary")}>
          {formatFcfa(gross)}
        </span>
      )}
    </div>
  );
}

/** Sous-total → every mechanism ventilated → acompte, then the one oversized figure. */
export function TicketTotals({ sale, className }: { sale: Sale; className?: string }) {
  const totals = computeTotals(sale);
  const touched = totals.totalDiscount > 0 || totals.coverageDiscount > 0;
  return (
    <div className={className}>
      {(touched || totals.depositPaid > 0) && (
        <div className="mb-2 flex flex-col gap-0.5 text-sm">
          {touched && (
            <div className="flex justify-between text-base-content/55">
              <span>Sous-total</span>
              <span className="tabular-nums">{formatFcfa(totals.subtotal)}</span>
            </div>
          )}
          <DiscountBreakdown sale={sale} />
          {totals.depositPaid > 0 && (
            <>
              <div className="flex justify-between text-base-content/55">
                <span>Total</span>
                <span className="tabular-nums">{formatFcfa(totals.total)}</span>
              </div>
              <DepositLine sale={sale} />
            </>
          )}
        </div>
      )}
      <div className="flex items-end justify-between">
        <span className="pb-1.5 text-xs font-semibold tracking-[0.12em] text-base-content/55 uppercase">
          {totals.depositPaid > 0 ? "Reste à payer" : "Total"}
        </span>
        <span
          key={totals.amountDue}
          className="animate-total-pulse origin-right font-[family-name:var(--font-heading)] font-semibold text-[2.75rem] leading-none text-base-content tabular-nums tracking-[0.01em]"
        >
          {formatFcfa(totals.amountDue)}
        </span>
      </div>
    </div>
  );
}
