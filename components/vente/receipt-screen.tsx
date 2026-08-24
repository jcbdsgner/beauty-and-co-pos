"use client";

import { Button } from "@/components/ui/button";
import { HomeIcon, PlusIcon } from "@/components/ui/icons";
import { CheckCircleIcon, StarGlyphIcon, CalendarSuggestIcon } from "@/components/vente/icons";
import { SALON, computeTotals, formatFcfa, type Sale } from "@/lib/data/vente";

export type PaymentLine = { label: string; amount: number };

export type NextVisitSuggestion = { dateLabel: string; serviceName: string };

type ReceiptScreenProps = {
  sale: Sale;
  invoiceNumber: string;
  dateLabel: string;
  paymentLines: PaymentLine[];
  loyaltyEarned: number;
  loyaltyBalance: number | null;
  nextVisit: NextVisitSuggestion | null;
  onNewSale: () => void;
};

/** Success/receipt screen — the last stop of the sale tunnel. Green flat banner (no gradient),
 * full ticket breakdown, loyalty upsell and a next-visit nudge, with a sticky action bar. */
export function ReceiptScreen({ sale, invoiceNumber, dateLabel, paymentLines, loyaltyEarned, loyaltyBalance, nextVisit, onNewSale }: ReceiptScreenProps) {
  const totals = computeTotals(sale);
  const clientFirstName = sale.client?.name.split(" ")[0] ?? "";

  return (
    <div className="flex flex-col pb-8">
      <div className="mx-auto flex w-full max-w-lg flex-col">
      <div className="relative overflow-hidden rounded-t-2xl bg-[var(--color-success)] px-6 py-10 text-center text-white">
        <span className="pointer-events-none absolute -top-6 -left-6 size-28 rounded-full bg-white/10" />
        <span className="pointer-events-none absolute -right-8 top-8 size-20 rounded-full bg-white/10" />
        <span className="pointer-events-none absolute bottom-[-2rem] left-1/3 size-24 rounded-full bg-white/10" />
        <span className="relative mx-auto flex size-14 items-center justify-center rounded-full bg-white/20">
          <CheckCircleIcon className="size-8" />
        </span>
        <p className="relative mt-3 font-[var(--font-heading)] text-2xl">Paiement réussi !</p>
        <p className="relative mt-1 text-3xl font-semibold">{formatFcfa(totals.total)}</p>
      </div>

      <div className="rounded-b-2xl border border-t-0 border-[var(--color-gray-200)] bg-white p-6">
        <div className="text-center">
          <p className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">{SALON.name}</p>
          <p className="text-sm text-[var(--color-gray-500)]">{SALON.area}</p>
          <p className="text-sm text-[var(--color-gray-500)]">{SALON.address}</p>
          <p className="text-sm text-[var(--color-gray-500)]">{SALON.phone}</p>
        </div>

        <div className="mt-5 flex items-center justify-between text-xs text-[var(--color-gray-500)]">
          <span>N° {invoiceNumber}</span>
          <span>{dateLabel}</span>
        </div>
        <p className="mt-1 text-xs text-[var(--color-gray-500)]">Caissier(ère) : {SALON.cashier}</p>

        {sale.client ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-[var(--brand-cream)] p-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white font-semibold text-[var(--brand-taupe-muted)]">
              {sale.client.initial}
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--color-gray-900)]">{sale.client.name}</p>
              <p className="flex items-center gap-1 text-xs text-[var(--color-gray-500)]">
                <StarGlyphIcon className="size-3.5" filled={!!sale.client.badge} />
                {sale.client.badge?.label ?? "Classic"}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--color-gray-500)]">Client — —</p>
        )}

        <div className="my-5 border-t border-dashed border-[var(--color-gray-300)]" />

        <div className="flex flex-col gap-2">
          {sale.cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm text-[var(--color-gray-800)]">
              <span>
                {item.name}
                {item.qty > 1 ? ` x${item.qty}` : ""}
              </span>
              <span>{formatFcfa(item.unitPrice * item.qty)}</span>
            </div>
          ))}
        </div>

        <div className="my-5 border-t border-dashed border-[var(--color-gray-300)]" />

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-sm text-[var(--color-gray-600)]">
            <span>Sous-total</span>
            <span>{formatFcfa(totals.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between font-[var(--font-heading)] text-lg text-[var(--color-gray-900)]">
            <span>TOTAL</span>
            <span>{formatFcfa(totals.total)}</span>
          </div>
        </div>

        <div className="my-5 border-t border-dashed border-[var(--color-gray-300)]" />

        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">Paiement</p>
          {paymentLines.map((line) => (
            <div key={line.label} className="flex items-center justify-between text-sm text-[var(--color-gray-800)]">
              <span>{line.label}</span>
              <span>{formatFcfa(line.amount)}</span>
            </div>
          ))}
        </div>

        {sale.client && (
          <>
            <div className="my-5 border-t border-dashed border-[var(--color-gray-300)]" />
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
                <StarGlyphIcon className="size-3.5" filled /> Fidélité
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-gray-600)]">Points gagnés</span>
                <span className="font-semibold text-[var(--color-success)]">+{loyaltyEarned} pts</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-gray-600)]">Solde actuel</span>
                <span className="font-semibold text-[var(--color-gray-900)]">{loyaltyBalance ?? "—"} pts</span>
              </div>
            </div>
          </>
        )}

        {nextVisit && (
          <div className="mt-6 rounded-2xl bg-[var(--brand-rose-soft)] p-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-gray-900)]">
              <CalendarSuggestIcon className="size-5 text-[var(--brand-taupe-muted)]" />
              Prochaine visite conseillée
            </p>
            <p className="mb-3 text-sm text-[var(--color-gray-700)]">
              Proposez à <strong>{clientFirstName}</strong> son prochain rendez-vous <strong>{nextVisit.dateLabel}</strong> (
              {nextVisit.serviceName.toLowerCase()}) — avant qu&apos;elle ne parte&nbsp;!
            </p>
            <Button variant="brand" href="/planning" className="w-full">
              Prendre le rendez-vous maintenant
            </Button>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-[var(--color-gray-500)]">
          Merci de votre visite !
          <br />À bientôt chez Beauty and Co ✨
        </p>
      </div>
    </div>

      <div className="sticky bottom-0 z-10 -mx-8 mt-8 border-t border-[var(--color-gray-200)] bg-white/95 px-8 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-lg gap-3">
          <Button variant="outline" href="/" icon={<HomeIcon />} className="flex-1">
            Accueil POS
          </Button>
          <Button variant="brand" onClick={onNewSale} icon={<PlusIcon />} className="flex-1">
            Nouvelle vente
          </Button>
        </div>
      </div>
    </div>
  );
}
