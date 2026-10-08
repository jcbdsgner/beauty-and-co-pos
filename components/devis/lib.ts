import { computeTotals, devisAsSale } from "@/lib/store/app-store";
import type { Devis, DevisLine, DevisStatus, Facture, RemiseAccordee } from "@/lib/data/types";

/** Totaux d'un devis ou d'une facture — la même chaîne de remises que le panier (ADR 0042 : mêmes
 *  règles qu'au comptoir), sans aucun avantage personnel. */
export function documentTotals(lines: DevisLine[], remises: RemiseAccordee[]) {
  const t = computeTotals(devisAsSale({ lines, remises }));
  return { subtotal: t.subtotal, lineDiscount: t.lineDiscount, discount: t.grantedDiscount, total: t.total };
}

/**
 * Où en est un dossier — un numéro de devis, sa dernière version et sa facture éventuelle —, vu
 * depuis ce qu'il reste à faire au salon. C'est l'ordre de la liste.
 */
export type DossierStage =
  | "envoye" // attend la réponse de la cliente → Facturer
  | "a_payer" // facture émise, pas encore réglée
  | "a_remettre" // payée, des produits à lui remettre
  | "brouillon"
  | "prepaye" // payée, prestations encore à consommer au comptoir
  | "clos"; // refusé, expiré, annulé ou entièrement consommé

export type Dossier = {
  number: string;
  devis: Devis; // dernière version
  versions: Devis[]; // la plus récente d'abord
  facture?: Facture;
  stage: DossierStage;
  total: number;
  /** date qui ordonne le dossier dans son groupe */
  at: string;
};

export const STAGE_ORDER: DossierStage[] = ["envoye", "a_payer", "a_remettre", "brouillon", "prepaye", "clos"];

export const STAGE_LABEL: Record<DossierStage, string> = {
  envoye: "En attente de réponse",
  a_payer: "Factures à payer",
  a_remettre: "Produits à remettre",
  brouillon: "Brouillons",
  prepaye: "Prépayés en cours",
  clos: "Historique",
};

/** Le statut court d'un dossier, pour une puce. */
export function dossierChip(d: Dossier): { value: string; tone: "neutral" | "act" | "now" | "done" | "void" | "signal" } {
  if (d.facture) {
    if (d.facture.status === "annulee") return { value: "Annulée", tone: "void" };
    if (d.facture.status === "a_payer") return { value: "À payer", tone: "act" };
    if (d.stage === "a_remettre") return { value: "À remettre", tone: "now" };
    if (d.stage === "prepaye") return { value: "Payée", tone: "done" };
    return { value: "Soldée", tone: "void" };
  }
  switch (devisStatus(d.devis)) {
    case "brouillon": return { value: "Brouillon", tone: "neutral" };
    case "envoye": return { value: "Envoyé", tone: "act" };
    case "refuse": return { value: "Refusé", tone: "void" };
    case "expire": return { value: "Expiré", tone: "void" };
    default: return { value: "Remplacé", tone: "void" };
  }
}

/** Un devis envoyé dont la validité est passée est expiré — l'état se lit, il n'est pas stocké. */
export function devisStatus(d: Devis, now = new Date()): DevisStatus {
  return d.status === "envoye" && new Date(d.validUntil) < now ? "expire" : d.status;
}

export function buildDossiers(devis: Devis[], factures: Facture[]): Dossier[] {
  const byNumber = new Map<string, Devis[]>();
  for (const d of devis) byNumber.set(d.number, [...(byNumber.get(d.number) ?? []), d]);
  return [...byNumber.entries()].map(([number, vs]) => {
    const versions = [...vs].sort((a, b) => b.version - a.version);
    const latest = versions.find((v) => v.status !== "brouillon") ?? versions[0];
    const facture = latest.factureId ? factures.find((f) => f.id === latest.factureId) : undefined;
    let stage: DossierStage;
    if (facture) {
      const hasProducts = facture.lines.some((l) => l.kind === "produit");
      const servicesLeft = facture.lines.some((l) => l.kind === "service" && !facture.redeemedLineIds.includes(l.id));
      if (facture.status === "annulee") stage = "clos";
      else if (facture.status === "a_payer") stage = "a_payer";
      else if (hasProducts && !facture.productsHandedOverAt) stage = "a_remettre";
      else if (servicesLeft) stage = "prepaye";
      else stage = "clos";
    } else if (devisStatus(latest) === "envoye") stage = "envoye";
    else if (latest.status === "brouillon") stage = "brouillon";
    else stage = "clos";
    const total = facture?.total ?? documentTotals(latest.lines, latest.remises).total;
    const at = facture?.paidAt ?? facture?.issuedAt ?? latest.sentAt ?? latest.createdAt;
    return { number, devis: latest, versions, facture, stage, total, at };
  });
}

export function groupDossiers(dossiers: Dossier[]) {
  return STAGE_ORDER.map((stage) => ({
    stage,
    items: dossiers
      .filter((d) => d.stage === stage)
      .sort((a, b) => (stage === "clos" ? b.at.localeCompare(a.at) : a.at.localeCompare(b.at))),
  })).filter((g) => g.items.length > 0);
}

const DAY = 24 * 3600 * 1000;
/** « il y a 3 j », « aujourd'hui » — l'ancienneté d'un envoi, en texte neutre. */
export function sinceLabel(iso: string, now = new Date()) {
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / DAY);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "hier";
  return `il y a ${days} j`;
}

export const DATE_FMT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
export const SHORT_DATE_FMT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
