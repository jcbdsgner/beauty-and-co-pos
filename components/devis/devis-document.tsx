import Image from "next/image";
import { salonById } from "@/lib/data/entreprises";
import { clientFullName } from "@/lib/data/clientele";
import { documentTotals } from "@/components/devis/lib";
import { cn, formatPhone } from "@/lib/utils";
import type { BillingCompany, Cliente, Devis, DevisLine, Facture } from "@/lib/data/types";

type DevisDocumentProps =
  | { kind: "devis"; devis: Devis; client: Cliente; className?: string }
  | { kind: "facture"; facture: Facture; client: Cliente; className?: string };

const DATE = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
const DECIMAL = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const INTEGER = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** « 389 700 CFA » — espaces insécables, pour qu'un montant ne se coupe jamais. */
const cfa = (n: number) => `${INTEGER.format(Math.round(n))} CFA`.replace(/\s/g, " ");
const decimal = (n: number) => DECIMAL.format(n).replace(/\s/g, " ");

/**
 * Le PDF envoyé à la cliente (ADR 0042) — devis ou facture, le contenu exact de l'ébauche validée :
 * logo, salon et pays, le destinataire, « Devis # / Facture # », date, vendeur, le tableau (description,
 * quantité, prix unitaire, taxes, montant), total (TTC). Rien d'autre.
 * Une remise accordée se lit dans le prix unitaire de la ligne (prix négocié) : quantité × prix
 * unitaire = montant, toujours.
 */
export function DevisDocument(props: DevisDocumentProps) {
  const { client, className } = props;
  const doc = props.kind === "devis" ? props.devis : props.facture;
  const salon = salonById(doc.salonId);
  const { lineDiscount, total } = documentTotals(doc.lines, doc.remises);
  const title = props.kind === "devis" ? "Devis" : "Facture";
  const number = props.kind === "devis" && props.devis.version > 1 ? `${props.devis.number} v${props.devis.version}` : doc.number;
  const date = props.kind === "devis" ? (props.devis.sentAt ?? props.devis.createdAt) : props.facture.issuedAt;

  const net = (l: DevisLine) => l.unitPrice * l.qty - (lineDiscount[l.id] ?? 0);

  return (
    <article
      className={cn(
        "flex aspect-[210/297] w-full flex-col bg-white print:aspect-auto print:min-h-[273mm] print:w-[210mm] print:pt-0 print:pb-0 px-[7.5%] pt-[7%] pb-[6%] text-[11px] leading-snug text-[#2a2320]",
        "shadow-[0_1px_2px_rgba(42,35,32,0.06),0_10px_30px_-14px_rgba(42,35,32,0.22)] print:shadow-none",
        className,
      )}
    >
      {/* Émettrice : le logo, le salon et son pays */}
      <header className="flex items-center justify-between">
        <Image src="/images/brand/logo-bc.jpg" alt="Beauty & Co London" width={1200} height={1197} className="size-[104px] object-contain" priority />
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{salon?.name ?? ""}</p>
          <p className="mt-0.5 text-[#2a2320]/60">Sénégal</p>
        </div>
      </header>

      {/* Le document et sa destinataire, une seule colonne alignée à gauche */}
      <h1 className="mt-12 text-[26px] font-light leading-none tracking-[-0.01em] text-[#886666]">
        {title} <span className="text-[#886666]/55">#</span> <span className="tabular-nums">{number}</span>
      </h1>
      <Recipient client={client} billTo={doc.billTo} />

      <dl className="mt-6 grid grid-cols-2 gap-x-10 border-y border-[#886666]/25 py-3">
        <div>
          <dt className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#2a2320]/55">
            {props.kind === "devis" ? "Date du devis" : "Date de la facture"}
          </dt>
          <dd className="mt-1 text-[12px] font-medium tabular-nums">{DATE.format(new Date(date))}</dd>
        </div>
        <div>
          <dt className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#2a2320]/55">Vendeur</dt>
          <dd className="mt-1 text-[12px] font-medium">{doc.sellerName}</dd>
        </div>
      </dl>

      {/* Lignes */}
      <table className="mt-8 w-full border-collapse">
        <thead>
          <tr className="text-[9.5px] [&>th]:border-b-[1.5px] [&>th]:border-[#886666] font-semibold uppercase tracking-[0.12em] text-[#886666]">
            <th className="pb-2 text-left font-semibold">Description</th>
            <th className="w-[15%] pb-2 text-right font-semibold">Quantité</th>
            <th className="w-[17%] pb-2 text-right font-semibold">Prix unitaire</th>
            <th className="w-[10%] pb-2 text-right font-semibold">Taxes</th>
            <th className="w-[17%] pb-2 text-right font-semibold">Montant</th>
          </tr>
        </thead>
        <tbody>
          {doc.lines.map((l) => (
            <tr key={l.id} className="break-inside-avoid align-top [&>td]:border-b [&>td]:border-[#886666]/20">
              <td className="py-3 pr-4 font-medium uppercase">{l.name}</td>
              <td className="py-3 text-right tabular-nums text-[#2a2320]/75">{decimal(l.qty)}&nbsp;Unité(s)</td>
              <td className="py-3 text-right tabular-nums text-[#2a2320]/75">{decimal(net(l) / l.qty)}</td>
              <td className="py-3 text-right" />
              <td className="py-3 text-right font-medium tabular-nums">{cfa(net(l))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totaux */}
      <div className="mt-6 ml-auto w-[52%] break-inside-avoid tabular-nums">
        <div className="flex items-baseline justify-between bg-[#886666] px-4 py-3 text-white [-webkit-print-color-adjust:exact] [print-color-adjust:exact]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Total (TTC)</span>
          <span className="text-[16px] font-semibold">{cfa(total)}</span>
        </div>
      </div>
    </article>
  );
}

/**
 * Le destinataire, avec tout ce qu'on sait de lui. Une société : raison sociale, adresse, NINEA,
 * RCCM, puis la cliente « à l'attention de » — son nom seul : la facture circule au service
 * comptable, ses coordonnées personnelles n'y ont pas leur place. Une personne : son
 * nom, son adresse si on l'a, son téléphone, son e-mail. Une ligne manquante ne laisse pas de trou.
 */
function Recipient({ client, billTo }: { client: Cliente; billTo?: BillingCompany }) {
  const contact = [formatPhone(client.phone), client.email].filter(Boolean).join("  ·  ");
  const label = "mb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#2a2320]/55";
  if (billTo) {
    return (
      <div className="mt-5 grid grid-cols-2 gap-x-10">
        <div>
          <p className={label}>Société</p>
          <p className="text-[14px] font-medium">{billTo.name}</p>
          {billTo.address && <p className="mt-0.5 text-[#2a2320]/75">{billTo.address}</p>}
          {billTo.ninea && <p className="mt-0.5 whitespace-nowrap tabular-nums text-[#2a2320]/75">NINEA {billTo.ninea}</p>}
          {billTo.rccm && <p className="whitespace-nowrap tabular-nums text-[#2a2320]/75">RCCM {billTo.rccm}</p>}
        </div>
        <div>
          <p className={label}>À l&apos;attention de</p>
          <p className="text-[12px] font-medium">{clientFullName(client)}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-5">
      <p className={label}>Client</p>
      <p className="text-[14px] font-medium">{clientFullName(client)}</p>
      {client.address && <p className="mt-0.5 text-[#2a2320]/75">{client.address}</p>}
      {contact && <p className="mt-0.5 tabular-nums text-[#2a2320]/75">{contact}</p>}
    </div>
  );
}
