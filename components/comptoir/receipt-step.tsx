"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Home, Plus, Printer } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { computeTotals, useAppData } from "@/components/providers/app-data-provider";
import { NoterClienteDialog } from "@/components/comptoir/noter-cliente-dialog";
import { SendReceiptButtons } from "@/components/comptoir/send-receipt-buttons";
import { PAYMENT_MODE_LABEL, PaymentModeGlyph } from "@/components/comptoir/payment-modes";
import { PrintedReceipt } from "@/components/comptoir/printed-receipt";
import { TicketFrame, TicketHead, TicketLineBody, TicketTotals } from "@/components/comptoir/ticket-parts";
import { clientFullName } from "@/lib/data/clientele";
import { cn, formatFcfa } from "@/lib/utils";
import type { Sale } from "@/lib/data/types";

const RECEIPT_DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const PRINT_PAGE_STYLE = `
  @page { size: 80mm auto; margin: 6mm 6mm 10mm; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
`;

/** A cashed-in sale with an identified cliente holds the Comptoir until she has been noted
 *  (« Noter la cliente », `Sale.clientRatedAt`). */
export function isReceiptLocked(sale: Sale | undefined): boolean {
  return !!sale && sale.step === "recu" && !!sale.clientId && !sale.clientRatedAt;
}

/**
 * La station Reçu (ADR 0031). Same sheet again: the ticket, still in the right column, is now the
 * receipt that prints. On the left, what just happened, then « Continuer »: the remise's motif
 * (internal — never on the receipt) when one was granted, then « Noter la cliente », both in
 * `NoterClienteDialog`, once everything that touches the receipt is settled.
 */
export function ReceiptStep({ sale }: { sale: Sale }) {
  const router = useRouter();
  const { closeTab, openNewTab, clients } = useAppData();
  const [noterOpen, setNoterOpen] = useState(false);
  const [printError, setPrintError] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const totals = computeTotals(sale);
  const client = sale.clientId ? clients.find((c) => c.id === sale.clientId) : undefined;

  const needsReason = totals.grantedDiscount > 0 && sale.remiseReason === null;

  const print = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Recu-${sale.label.replace(/\s+/g, "-")}`,
    pageStyle: PRINT_PAGE_STYLE,
    onBeforePrint: async () => setPrintError(false),
    onPrintError: () => setPrintError(true),
  });

  const modes = sale.payment?.modes ?? [];

  // With an identified cliente, the receipt holds everything but printing / sending until she has
  // been noted (`isReceiptLocked`) — the tabs and « Replier » are locked in the panel too.
  const mustRate = !!client && !sale.clientRatedAt;

  return (
    <div className="grid h-full grid-cols-[minmax(0,1fr)_440px] gap-5 p-5">
      <section className="flex min-h-0 flex-col overflow-y-auto rounded-[14px] border border-border bg-white">
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-8 px-8 py-10">
          {/* What happened */}
          <div className="flex items-center gap-5">
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-heading)] text-2xl font-bold text-base-content">Vente encaissée</p>
              <p className="font-[family-name:var(--font-heading)] text-[3rem] leading-tight font-semibold text-base-content tabular-nums">
                {formatFcfa(totals.amountDue)}
              </p>
              {client && <p className="text-sm text-base-content/55">{clientFullName(client)}</p>}
            </div>
          </div>

          {/* How it was paid */}
          {modes.length > 0 && (
            <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border">
              {modes.map((m, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-base-200">
                    <PaymentModeGlyph
                      mode={m.mode}
                      className={m.mode === "carte" || m.mode === "especes" ? "size-6 text-secondary" : "max-h-6 max-w-8"}
                    />
                  </span>
                  <span className="flex-1 text-[15px] font-medium text-base-content">
                    {PAYMENT_MODE_LABEL[m.mode]}
                    {m.mode === "especes" && sale.payment?.cashReceived !== undefined && (
                      <span className="block text-xs font-normal text-base-content/55 tabular-nums">
                        Reçu {formatFcfa(sale.payment.cashReceived)} · rendu {formatFcfa(sale.payment.change ?? 0)}
                      </span>
                    )}
                  </span>
                  <span className="text-[15px] font-semibold tabular-nums">{formatFcfa(m.amount)}</span>
                </li>
              ))}
              {client && (
                <li className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-base-content/55">Points fidélité</span>
                  <span className="tabular-nums">
                    <span className="font-semibold text-success">+{sale.loyaltyPointsEarned ?? 0}</span>
                    <span className="text-base-content/55"> · solde {client.points} pts</span>
                  </span>
                </li>
              )}
            </ul>
          )}

          {/* Next */}
          <div className="flex flex-col gap-3">
            {client && (mustRate || needsReason) ? (
              <div className="flex flex-col gap-1.5">
                <Button variant="brand" size="xl" className="w-full" onClick={() => setNoterOpen(true)}>
                  Continuer
                </Button>
                <p className="text-center text-xs text-base-content/55">
                  {needsReason ? "Le motif de la remise, puis ce qu’elle a fait et aimé" : "Ce qu’elle a fait et aimé, puis une note interne"} — avant de passer à la suite.
                </p>
              </div>
            ) : (
              <Button variant="brand" size="xl" className="w-full" icon={<Plus className="size-5" />} onClick={() => openNewTab()}>
                Nouvelle vente
              </Button>
            )}
            <div className={cn("grid gap-3", mustRate ? "grid-cols-1" : "grid-cols-2")}>
              {printError ? (
                <Button variant="danger-outline" size="default" onClick={() => print()}>
                  Réessayer l&apos;impression
                </Button>
              ) : (
                <Button variant="outline" size="default" icon={<Printer className="size-4" />} onClick={() => print()}>
                  Imprimer le reçu
                </Button>
              )}
              {!mustRate && (
              <Button
                variant="outline"
                size="default"
                icon={<Home className="size-4" />}
                onClick={() => {
                  router.push("/");
                  closeTab(sale.id);
                }}
              >
                Revenir à l&apos;Accueil
              </Button>
              )}
            </div>
            <SendReceiptButtons client={client} />
          </div>
        </div>
      </section>

      {/* Off-screen print target — the thermal receipt (react-to-print reads the live DOM, so keep it mounted). */}
      <div aria-hidden className="pointer-events-none fixed -left-[9999px] top-0">
        <div ref={receiptRef}>
          <PrintedReceipt sale={sale} client={client} />
        </div>
      </div>

      {/* The ticket, now the receipt's on-screen preview */}
      <div className="h-full min-h-0">
        <TicketFrame>
          <TicketHead sale={sale} title="Reçu">
            <p className="text-xs text-base-content/55">
              Beauty and Co · {sale.label} · {RECEIPT_DATE_FMT.format(new Date(sale.encaisseeAt ?? sale.createdAt))}
              {client && (
                <>
                  <br />
                  Cliente : {clientFullName(client)}
                </>
              )}
            </p>
          </TicketHead>
          <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto px-5">
            {sale.cart.map((line) => (
              <li key={line.id} className="flex py-3">
                <TicketLineBody
                  line={line}
                  covered={totals.coveredAmountByService[line.refId] ?? 0}
                  discount={totals.lineDiscount[line.id] ?? 0}
                />
              </li>
            ))}
          </ul>
          <div className="shrink-0 border-t border-border px-5 pt-3 pb-5">
            <TicketTotals sale={sale} />
            {modes.length > 0 && (
              <p className="mt-2 text-xs text-base-content/55 tabular-nums">
                {modes.map((m) => `${PAYMENT_MODE_LABEL[m.mode]} · ${formatFcfa(m.amount)}`).join("  +  ")}
              </p>
            )}
          </div>
        </TicketFrame>
      </div>
      {client && (
        <NoterClienteDialog open={noterOpen} sale={sale} client={client} needsReason={needsReason} onClose={() => setNoterOpen(false)} />
      )}
    </div>
  );
}
