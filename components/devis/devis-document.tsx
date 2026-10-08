import { Logo } from "@/components/ui/atoms/logo";
import { COMPANIES } from "@/lib/data/entreprises";
import { clientFullName } from "@/lib/data/clientele";
import { cn, formatFcfa, formatPhone } from "@/lib/utils";
import { DATE_FMT, documentTotals } from "@/components/devis/lib";
import type { Cliente, Devis, Facture } from "@/lib/data/types";

const PAYMENT_LABEL = { wave: "Wave", orange_money: "Orange Money", especes: "espèces", carte: "carte" } as const;

type DevisDocumentProps =
  | { kind: "devis"; devis: Devis; client: Cliente; className?: string }
  | { kind: "facture"; facture: Facture; client: Cliente; className?: string };

/**
 * Le document tel que la cliente le reçoit (ADR 0042) — une feuille, pas une carte d'interface :
 * l'émettrice en tête, la destinataire (la cliente, ou sa société facturée), les lignes au prix
 * du Menu, les remises accordées ventilées, un seul total TTC. Montré tel quel dans la section
 * Devis et sur la page côté cliente.
 */
export function DevisDocument(props: DevisDocumentProps) {
  const { client, className } = props;
  const company = COMPANIES[0];
  const doc = props.kind === "devis" ? props.devis : props.facture;
  const { subtotal, lineDiscount, discount, total } = documentTotals(doc.lines, doc.remises);
  const billTo = doc.billTo;
  const title = props.kind === "devis" ? "Devis" : "Facture";
  const number = props.kind === "devis" ? `${props.devis.number}${props.devis.version > 1 ? ` · v${props.devis.version}` : ""}` : props.facture.number;
  const issued = props.kind === "devis" ? (props.devis.sentAt ?? props.devis.createdAt) : props.facture.issuedAt;

  return (
    <article
      className={cn(
        "relative flex flex-col gap-6 bg-white px-5 py-6 text-[13px] sm:gap-8 sm:px-10 sm:py-9 leading-relaxed text-base-content shadow-[0_1px_2px_rgba(42,35,32,0.06),0_8px_24px_-12px_rgba(42,35,32,0.18)]",
        className,
      )}
    >
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:gap-6">
        <Logo size="footer" className="h-12 w-[104px] shrink-0" />
        <div className="text-xs leading-5 text-base-content/60 sm:text-right">
          <p className="font-semibold text-base-content">{company.name}</p>
          <p>{company.address}</p>
          <p>{company.phone} · {company.email}</p>
        </div>
      </header>

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end sm:gap-6">
        <div>
          <p className="font-[family-name:var(--font-heading)] text-[28px] font-medium leading-none tracking-[-0.02em]">{title}</p>
          <p className="mt-2 font-semibold tabular-nums text-base-content/70">{number}</p>
          <p className="text-base-content/55">Émis le {DATE_FMT.format(new Date(issued))}</p>
          {props.kind === "devis" && (
            <p className="text-base-content/55">Valable jusqu&apos;au {DATE_FMT.format(new Date(props.devis.validUntil))}</p>
          )}
        </div>
        <div className="sm:max-w-[46%] sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--brand-taupe-muted)]">Destinataire</p>
          {billTo ? (
            <>
              <p className="font-semibold">{billTo.name}</p>
              <p className="text-base-content/65">{billTo.address}</p>
              <p className="text-base-content/65 tabular-nums">NINEA {billTo.ninea}{billTo.rccm ? ` · RCCM ${billTo.rccm}` : ""}</p>
              <p className="text-base-content/65">À l&apos;attention de {clientFullName(client)}</p>
            </>
          ) : (
            <>
              <p className="font-semibold">{clientFullName(client)}</p>
              <p className="text-base-content/65 tabular-nums">{formatPhone(client.phone)}</p>
              <p className="text-base-content/65">{client.email}</p>
            </>
          )}
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-base-content/80 text-left text-xs font-semibold uppercase tracking-[0.06em] text-base-content/60">
            <th className="pb-2 font-semibold">Désignation</th>
            <th className="w-10 pb-2 text-right font-semibold">Qté</th>
            <th className="hidden w-24 pb-2 text-right font-semibold sm:table-cell">Prix</th>
            <th className="w-28 pb-2 text-right font-semibold">Montant</th>
          </tr>
        </thead>
        <tbody>
          {doc.lines.map((l) => {
            const off = lineDiscount[l.id] ?? 0;
            return (
              <tr key={l.id} className="border-b border-base-300 align-top">
                <td className="py-2.5 pr-3">
                  <span className="font-medium">{l.name}</span>
                  <span className="block text-xs text-base-content/50">{l.kind === "service" ? "Prestation" : "Produit"}</span>
                </td>
                <td className="py-2.5 text-right tabular-nums">{l.qty}</td>
                <td className="hidden py-2.5 text-right tabular-nums sm:table-cell">{formatFcfa(l.unitPrice)}</td>
                <td className="py-2.5 text-right tabular-nums">
                  {formatFcfa(l.unitPrice * l.qty)}
                  {off > 0 && <span className="block text-xs text-[var(--brand-taupe-muted)]">− {formatFcfa(off)}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex w-full flex-col gap-1 tabular-nums sm:ml-auto sm:w-64">
        {discount > 0 && (
          <>
            <div className="flex justify-between text-base-content/65"><span>Sous-total</span><span>{formatFcfa(subtotal)}</span></div>
            <div className="flex justify-between text-[var(--brand-taupe-muted)]"><span>Remise accordée</span><span>− {formatFcfa(discount)}</span></div>
          </>
        )}
        <div className="mt-1 flex items-baseline justify-between border-t border-base-content/80 pt-2">
          <span className="font-semibold">Total</span>
          <span className="font-[family-name:var(--font-heading)] text-xl font-semibold">{formatFcfa(total)}</span>
        </div>
      </div>

      {props.kind === "facture" && props.facture.status === "payee" && props.facture.paidAt && (
        <p className="self-start rounded-sm border border-[var(--color-success)]/40 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-success)]">
          Payée le {DATE_FMT.format(new Date(props.facture.paidAt))}
          {props.facture.payment ? ` · ${PAYMENT_LABEL[props.facture.payment.mode]}` : ""}
        </p>
      )}
      {props.kind === "facture" && props.facture.status === "annulee" && props.facture.avoir && (
        <p className="self-start rounded-sm border border-base-300 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-base-content/55">
          Annulée par l&apos;avoir {props.facture.avoir.number}
        </p>
      )}

      <footer className="mt-auto border-t border-base-300 pt-3 text-[11px] leading-4 text-base-content/50">
        {company.name} · NINEA {company.ninea} · RCCM {company.rccm}
      </footer>
    </article>
  );
}
