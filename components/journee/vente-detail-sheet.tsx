"use client";

import Link from "next/link";
import { ArrowUpRight, Coffee, ShoppingBag, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Legend } from "@/components/ui/board";
import { Dialog } from "@/components/ui/molecules/dialog";
import { DiscountBreakdown } from "@/components/comptoir/discount-breakdown";
import { DepositLine } from "@/components/comptoir/deposit-line";
import { SendReceiptButtons } from "@/components/comptoir/send-receipt-buttons";
import { computeTotals, useAppData } from "@/components/providers/app-data-provider";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import { PAYMENT_MODE_LABEL, saleNumber, salonLabel, type CaisseEntry } from "@/lib/data/ventes";
import { formatFcfa } from "@/lib/utils";
import type { CartLine, Cliente } from "@/lib/data/types";

const KIND_ICON: Record<CartLine["kind"], typeof Sparkles> = { service: Sparkles, produit: ShoppingBag, boisson: Coffee };

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(d);
  return `${day.charAt(0).toUpperCase()}${day.slice(1)} · ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}

/**
 * Détail d'une ligne de la vue Ventes (ADR 0043) — panneau latéral, comme la fiche réservation :
 * tout ce qu'il s'est passé à la caisse (lignes, remises et avantages, acompte, parts du règlement,
 * pourboire, points), la cliente et la réservation d'origine, et le renvoi du reçu. Un acompte
 * s'ouvre aussi : montant, moyen, et la réservation qu'il paie d'avance.
 */
export function VenteDetailSheet({ entry, onClose }: { entry: CaisseEntry | null; onClose: () => void }) {
  const { clients, sales } = useAppData();
  if (!entry) return null;

  const clientId = entry.type === "acompte" ? entry.reservation.payerClientId : entry.sale.clientId;
  const client = clientId ? clients.find((c) => c.id === clientId) : undefined;
  const reservationId = entry.type === "acompte" ? entry.reservation.id : entry.sale.originReservationId;

  return (
    <Dialog open variant="side" onClose={onClose} labelledBy="vente-detail-title" className="relative flex max-w-[560px] flex-col p-0">
      <CloseButton onClick={onClose} />

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-base-300 bg-base-100 py-5 pr-16 pl-8 text-base-content">
        <h2 id="vente-detail-title" className="font-[family-name:var(--font-heading)] text-xl font-semibold tabular-nums">
          {entry.type === "acompte" ? "Acompte" : `Vente n° ${saleNumber(entry.sale)}`}
        </h2>
        <span className="w-full text-xs text-base-content/65">
          {formatDateTime(entry.at)} · <span className="font-semibold text-base-content">{salonLabel(entry.salonId)}</span>
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <ClientBlock client={client} reservationId={reservationId} walkIn={entry.type === "vente" && !entry.sale.cart.some((l) => l.kind === "service")} />
        {entry.type === "acompte" ? <AcompteBody entry={entry} sales={sales} /> : <VenteBody entry={entry} client={client} />}
      </div>
    </Dialog>
  );
}

function ClientBlock({ client, reservationId, walkIn }: { client: Cliente | undefined; reservationId: string | undefined; walkIn: boolean }) {
  return (
    <div className="flex items-center gap-3 border-b border-base-300 px-8 py-5">
      <Avatar initial={client ? clientInitial(client) : "–"} size={44} className="shrink-0 bg-accent text-sm font-semibold text-secondary" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-base-content">{client ? clientFullName(client) : "Sans cliente"}</p>
        {reservationId ? (
          <Link href={`/reservations/${reservationId}`} className="inline-flex items-center gap-1 text-xs text-base-content/65 underline-offset-2 hover:underline">
            Réservation {reservationId}
            <ArrowUpRight aria-hidden className="size-3" />
          </Link>
        ) : (
          walkIn && <p className="text-xs text-base-content/65">Vente au comptoir, sans réservation</p>
        )}
      </div>
      {client && (
        <Link href={`/clientele/${client.id}`} className="btn btn-outline btn-sm shrink-0">
          Fiche
        </Link>
      )}
    </div>
  );
}

function Row({ label, value, strong, muted }: { label: React.ReactNode; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-3 ${strong ? "font-semibold text-base-content" : muted ? "text-base-content/65" : "text-base-content/80"}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function VenteBody({ entry, client }: { entry: Extract<CaisseEntry, { type: "vente" }>; client: Cliente | undefined }) {
  const sale = entry.sale;
  const t = computeTotals(sale);
  const hasAdjustments = t.totalDiscount > 0 || t.coverageDiscount > 0;

  return (
    <>
      <section className="flex flex-col gap-3 border-b border-base-300 px-8 py-5">
        <Legend>Contenu</Legend>
        <ul className="flex flex-col gap-2.5 text-sm">
          {sale.cart.map((line) => {
            const Icon = KIND_ICON[line.kind];
            return (
              <li key={line.id} className="flex items-start gap-3">
                <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-base-content/40" />
                <span className="min-w-0 flex-1">
                  <span className="block text-base-content">
                    {line.name}
                    {line.qty > 1 && <span className="text-base-content/65"> × {line.qty}</span>}
                  </span>
                  {line.beneficiary && <span className="block text-xs text-base-content/65">pour {line.beneficiary}</span>}
                </span>
                <span className="tabular-nums text-base-content/80">{formatFcfa(line.unitPrice * line.qty)}</span>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-col gap-1 border-t border-base-300 pt-3 text-sm">
          {hasAdjustments && <Row label="Sous-total" value={formatFcfa(t.subtotal)} muted />}
          <DiscountBreakdown sale={sale} showReason />
          <Row label="Total" value={formatFcfa(t.total)} strong />
          {t.depositPaid > 0 && (
            <>
              <DepositLine sale={sale} />
              <Row label="Reste encaissé" value={formatFcfa(t.amountDue)} strong />
            </>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3 border-b border-base-300 px-8 py-5">
        <Legend>Règlement</Legend>
        <div className="flex flex-col gap-1 text-sm">
          {(sale.payment?.modes ?? []).map((m, i) => (
            <Row key={i} label={PAYMENT_MODE_LABEL[m.mode]} value={formatFcfa(m.amount)} />
          ))}
          {sale.payment?.cashReceived !== undefined && (
            <Row label="Espèces reçues · rendu" value={`${formatFcfa(sale.payment.cashReceived)} · ${formatFcfa(sale.payment.change ?? 0)}`} muted />
          )}
          {(sale.payment?.modes.length ?? 0) > 1 && <Row label="Encaissé" value={formatFcfa(t.amountDue)} strong />}
          {sale.tip && <Row label={`Pourboire · ${PAYMENT_MODE_LABEL[sale.tip.mode]}`} value={formatFcfa(sale.tip.amount)} muted />}
          {client && <Row label="Points gagnés" value={`+${sale.loyaltyPointsEarned ?? 0} pts · solde ${client.points} pts`} muted />}
        </div>

      </section>

      <section className="px-8 py-5">
        <SendReceiptButtons client={client} />
      </section>
    </>
  );
}

function AcompteBody({ entry, sales }: { entry: Extract<CaisseEntry, { type: "acompte" }>; sales: { id: string; status: string; encaisseeAt?: string }[] }) {
  const settled = entry.reservation.saleId ? sales.find((s) => s.id === entry.reservation.saleId && s.status === "encaissee") : undefined;
  return (
    <section className="flex flex-col gap-3 px-8 py-5">
      <Legend>Règlement</Legend>
      <div className="flex flex-col gap-1 text-sm">
        <Row label={entry.modeLabel} value={formatFcfa(entry.amount)} strong />
      </div>
      <p className="text-sm text-base-content/60">
        {settled?.encaisseeAt
          ? `Déduit de la vente encaissée le ${new Date(settled.encaisseeAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}.`
          : "Sera déduit au moment d'encaisser la réservation."}
      </p>
    </section>
  );
}
