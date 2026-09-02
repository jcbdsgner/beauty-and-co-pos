"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Check, Printer, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { BrandMark } from "@/components/ui/atoms/brand-mark";
import { Textarea } from "@/components/ui/atoms/textarea";
import { Dialog } from "@/components/ui/molecules/dialog";
import { computeTotals, useAppData } from "@/components/providers/app-data-provider";
import { DiscountBreakdown } from "@/components/comptoir/discount-breakdown";
import { SendReceiptButtons } from "@/components/comptoir/send-receipt-buttons";
import { clientFullName } from "@/lib/data/clientele";
import { formatFcfa } from "@/lib/utils";
import type { Sale } from "@/lib/data/types";

const MODE_LABEL = { wave: "Wave", orange_money: "Orange Money", especes: "Espèces", carte: "Carte" };

const RECEIPT_DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const PRINT_PAGE_STYLE = `
  @page { size: 80mm auto; margin: 6mm; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
`;

export function ReceiptStep({ sale }: { sale: Sale }) {
  const router = useRouter();
  const { closeTab, openNewTab, clients, setDiscountReason } = useAppData();
  const [printError, setPrintError] = useState(false);
  const [reasonDraft, setReasonDraft] = useState("");
  const receiptRef = useRef<HTMLDivElement>(null);
  const totals = computeTotals(sale);
  const client = sale.clientId ? clients.find((c) => c.id === sale.clientId) : undefined;

  // A receptionist-granted discount needs its justification on file — asked now, once the sale is
  // already cashed in, so it never slows the counter down mid-transaction.
  const needsReason = !!sale.discountGranted && sale.discountGranted.reason === null;

  const print = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Recu-${sale.label.replace(/\s+/g, "-")}`,
    pageStyle: PRINT_PAGE_STYLE,
    onBeforePrint: async () => setPrintError(false),
    onPrintError: () => setPrintError(true),
  });

  return (
    <div className="mx-auto flex h-full max-w-md flex-col items-center gap-5 overflow-y-auto px-6 py-10 text-center">
      <span className="relative flex size-20 items-center justify-center">
        <BrandMark variant="fill" className="absolute inset-0 size-full" />
        <Check aria-hidden className="relative size-9 text-[var(--on-core-brand-color)]" strokeWidth={2.5} />
      </span>

      <div>
        <p className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[var(--color-gray-900)]">Vente encaissée</p>
        {client && <p className="mt-0.5 text-sm text-[var(--color-gray-500)]">{clientFullName(client)}</p>}
      </div>

      <p className="font-[family-name:var(--font-heading)] font-semibold text-[3rem] leading-none text-[var(--color-gray-900)] tabular-nums">
        {formatFcfa(totals.total)}
      </p>

      {/* Printable ticket */}
      <div
        ref={receiptRef}
        className="w-full rounded-2xl border border-border bg-white p-4 text-left text-sm text-[var(--color-gray-800)] print:border-0"
      >
        <div className="mb-2 text-center">
          <p className="font-[family-name:var(--font-heading)] font-semibold text-base">Beauty and Co</p>
          <p className="text-xs text-[var(--color-gray-500)]">
            {sale.label} · {RECEIPT_DATE_FMT.format(new Date(sale.encaisseeAt ?? sale.createdAt))}
          </p>
          {client && <p className="text-xs text-[var(--color-gray-500)]">Cliente : {clientFullName(client)}</p>}
        </div>
        <div className="flex flex-col gap-1 border-t border-border pt-2">
          {sale.cart.map((line) => (
            <div key={line.id} className="flex justify-between">
              <span>
                {line.name} × {line.qty}
                {line.beneficiary && <span className="text-[var(--color-gray-400)]"> · {line.beneficiary}</span>}
              </span>
              <span className="tabular-nums">{formatFcfa(line.unitPrice * line.qty)}</span>
            </div>
          ))}
        </div>
        {totals.totalDiscount > 0 && (
          <>
            <div className="mt-1 flex justify-between border-t border-border pt-2 text-[var(--color-gray-500)]">
              <span>Sous-total</span>
              <span className="tabular-nums">{formatFcfa(totals.subtotal)}</span>
            </div>
            <DiscountBreakdown sale={sale} className="mt-1" />
          </>
        )}
        <div className="mt-1 flex justify-between border-t border-border pt-2 font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatFcfa(totals.total)}</span>
        </div>
        {sale.payment && (
          <p className="mt-1 text-xs text-[var(--color-gray-500)]">
            {sale.payment.modes.map((m) => `${MODE_LABEL[m.mode]} · ${formatFcfa(m.amount)}`).join("  +  ")}
          </p>
        )}
        {client && (
          <div className="mt-2 flex flex-col gap-0.5 border-t border-border pt-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--color-gray-500)]">Points gagnés</span>
              <span className="font-semibold tabular-nums text-[var(--color-success)]">+{sale.loyaltyPointsEarned ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-gray-500)]">Nouveau solde</span>
              <span className="font-semibold tabular-nums text-[var(--color-gray-800)]">{client.points} points</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-1 flex w-full flex-col gap-2">
        <Button variant="brand" size="xl" className="w-full" onClick={() => openNewTab()}>
          Nouvelle vente
        </Button>
        {printError ? (
          <Button variant="danger-outline" size="default" className="w-full" onClick={() => print()}>
            Réessayer l&apos;impression
          </Button>
        ) : (
          <Button variant="outline" size="default" className="w-full" icon={<Printer className="size-4" />} onClick={() => print()}>
            Imprimer le reçu
          </Button>
        )}
        <SendReceiptButtons client={client} />
        <div className="mt-1 flex justify-center gap-4 text-sm">
          <button
            type="button"
            onClick={() => {
              router.push("/");
              closeTab(sale.id);
            }}
            className="font-medium text-secondary underline underline-offset-2"
          >
            Revenir à l&apos;Accueil
          </button>
        </div>
      </div>

      <Dialog open={needsReason} labelledBy="motif-remise-title" role="alertdialog" className="max-w-md p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-secondary">
            <ShieldCheck aria-hidden className="size-4" />
          </span>
          <h2
            id="motif-remise-title"
            className="font-[family-name:var(--font-heading)] font-semibold text-lg text-[var(--color-gray-900)]"
          >
            Motif de la remise accordée
          </h2>
        </div>
        <p className="mt-2 text-sm text-[var(--color-gray-500)]">
          {sale.discountGranted?.mode === "pourcentage"
            ? `${sale.discountGranted.value} % des prestations`
            : "Montant fixe"}{" "}
          · −{formatFcfa(totals.grantedDiscount)} · code {sale.discountGranted?.grantedByCode}
          {sale.discountGranted?.managerCode ? ` · code manager ${sale.discountGranted.managerCode}` : ""}. Indiquez
          pourquoi cette remise a été accordée — elle apparaîtra dans le récap des ventes.
        </p>
        <Textarea
          className="mt-3"
          rows={3}
          value={reasonDraft}
          onChange={(e) => setReasonDraft(e.target.value)}
          placeholder="Ex. Geste commercial — retard de prise en charge de 40 min."
          autoFocus
        />
        <Button
          variant="brand"
          size="default"
          className="mt-4 w-full"
          disabled={reasonDraft.trim().length < 3}
          onClick={() => {
            setDiscountReason(sale.id, reasonDraft);
            setReasonDraft("");
          }}
        >
          Enregistrer le motif
        </Button>
      </Dialog>
    </div>
  );
}
