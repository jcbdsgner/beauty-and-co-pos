import { serviceById, produitById } from "@/lib/data/menu";
import type { BillingCompany, Conversation, Devis, DevisLine, Facture, Message } from "@/lib/data/types";

/**
 * Devis & factures (ADR 0042) — démo simulée : numéros, envois et paiements sont joués dans la
 * session, rien n'est persisté. Les lignes reprennent le Menu réel (libellés et prix verbatim).
 */

/** Durée de validité d'un devis, prix figés pendant ce temps. */
export const DEVIS_VALIDITY_DAYS = 30;

let lineSeq = 0;
/** Une ligne de devis tirée du Menu — prestation ou produit, au prix du jour. */
export function devisLineFrom(refId: string, qty = 1): DevisLine {
  lineSeq += 1;
  const service = serviceById(refId);
  if (service) return { id: `dl-${lineSeq}`, refId, kind: "service", name: service.name, unitPrice: service.price, qty };
  const produit = produitById(refId);
  if (!produit) throw new Error(`Inconnu au Menu : ${refId}`);
  return { id: `dl-${lineSeq}`, refId, kind: "produit", name: produit.name, unitPrice: produit.price, qty };
}

export function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const KER_DIGITAL: BillingCompany = {
  name: "Kër Digital SARL",
  address: "Immeuble Fayçal, 4e étage, rue Carnot, Dakar",
  ninea: "009876543 2G3",
  rccm: "SN-DKR-2021-B-14532",
};

const sent = (at: string) => ({ sentAt: at, validUntil: addDays(at, DEVIS_VALIDITY_DAYS) });

const L = devisLineFrom;

const d13v1Lines = [L("soin-du-visage-golden-vip-facial"), L("coiffure-head-spa-ultimate-deep-relaxation"), L("nutritive-masque-riche-200ml")];
const d13v2Lines = [L("soin-du-visage-golden-vip-facial"), L("coiffure-head-spa-ultimate-deep-relaxation")];
const d11Lines = [L("soin-du-visage-hydrafacial-deep-clean"), L("nutritive-bain-riche-250ml")];
const d10Lines = [L("coiffure-pose-clips"), L("genesis-cure-90ml"), L("k-chroma-oil")];
const d09Lines = [L("soin-du-visage-glow-me-facial", 2), L("nutritive-bain-satin-250ml")];

export const DEVIS: Devis[] = [
  {
    id: "dev-14", number: "DEV-2026-0014", version: 1, clientId: "cl-5",
    lines: [L("soin-du-visage-glow-me-facial"), L("spa-steam-time")],
    remises: [], remiseReason: null, status: "brouillon",
    createdAt: "2026-10-08T09:40:00", validUntil: addDays("2026-10-08T09:40:00", DEVIS_VALIDITY_DAYS),
  },
  {
    id: "dev-13-v2", number: "DEV-2026-0013", version: 2, clientId: "cl-1", billTo: KER_DIGITAL,
    lines: d13v2Lines,
    remises: [{ id: "rm-13", lineIds: d13v2Lines.map((l) => l.id), mode: "pourcentage", value: 10 }],
    remiseReason: "Geste commercial — prise en charge par l'employeur",
    status: "envoye", createdAt: "2026-10-06T15:10:00", sentChannel: "whatsapp", ...sent("2026-10-06T15:12:00"),
  },
  {
    id: "dev-13-v1", number: "DEV-2026-0013", version: 1, clientId: "cl-1", billTo: KER_DIGITAL,
    lines: d13v1Lines, remises: [], remiseReason: null,
    status: "remplace", createdAt: "2026-10-04T11:00:00", sentChannel: "whatsapp", ...sent("2026-10-04T11:05:00"),
  },
  {
    id: "dev-12", number: "DEV-2026-0012", version: 1, clientId: "cl-2",
    lines: [L("onglerie-polygel-extensions"), L("manucure-pedicure-manucure-russe-sans-vernis-sans-gel"), L("k-chroma-oil")],
    remises: [], remiseReason: null,
    status: "envoye", createdAt: "2026-10-02T10:20:00", sentChannel: "email", ...sent("2026-10-02T10:25:00"),
  },
  {
    id: "dev-11", number: "DEV-2026-0011", version: 1, clientId: "cl-10",
    lines: d11Lines, remises: [], remiseReason: null,
    status: "facture", factureId: "fac-07", createdAt: "2026-09-30T16:00:00", sentChannel: "whatsapp", ...sent("2026-09-30T16:02:00"),
  },
  {
    id: "dev-10", number: "DEV-2026-0010", version: 1, clientId: "cl-3",
    lines: d10Lines, remises: [], remiseReason: null,
    status: "facture", factureId: "fac-06", createdAt: "2026-09-26T12:00:00", sentChannel: "whatsapp", ...sent("2026-09-26T12:01:00"),
  },
  {
    id: "dev-09", number: "DEV-2026-0009", version: 1, clientId: "cl-4",
    lines: d09Lines, remises: [], remiseReason: null,
    status: "facture", factureId: "fac-05", createdAt: "2026-09-18T10:00:00", sentChannel: "email", ...sent("2026-09-18T10:03:00"),
  },
  {
    id: "dev-08", number: "DEV-2026-0008", version: 1, clientId: "cl-7",
    lines: [L("spa-steam-time"), L("epilation-epilation-maillot-bresilien")],
    remises: [], remiseReason: null,
    status: "refuse", createdAt: "2026-09-15T09:00:00", sentChannel: "whatsapp", ...sent("2026-09-15T09:02:00"),
  },
  {
    id: "dev-07", number: "DEV-2026-0007", version: 1, clientId: "cl-9",
    lines: [L("coiffure-pose-clips"), L("soin-du-visage-detox-me-facial")],
    remises: [], remiseReason: null,
    status: "expire", createdAt: "2026-09-01T14:00:00", sentChannel: "email", ...sent("2026-09-01T14:05:00"),
  },
];

const sum = (lines: DevisLine[]) => lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);

export const FACTURES: Facture[] = [
  {
    id: "fac-07", number: "FAC-2026-0007", devisId: "dev-11", clientId: "cl-10",
    lines: d11Lines, remises: [], total: sum(d11Lines),
    status: "a_payer", issuedAt: "2026-10-05T11:30:00", redeemedLineIds: [],
  },
  {
    id: "fac-06", number: "FAC-2026-0006", devisId: "dev-10", clientId: "cl-3",
    lines: d10Lines, remises: [], total: sum(d10Lines),
    status: "payee", issuedAt: "2026-09-29T10:00:00", paidAt: "2026-10-01T18:42:00",
    payment: { mode: "wave", via: "lien" }, redeemedLineIds: [],
  },
  {
    id: "fac-05", number: "FAC-2026-0005", devisId: "dev-09", clientId: "cl-4",
    lines: d09Lines, remises: [], total: sum(d09Lines),
    status: "payee", issuedAt: "2026-09-20T15:00:00", paidAt: "2026-09-21T11:05:00",
    payment: { mode: "especes", via: "salon" }, redeemedLineIds: [], productsHandedOverAt: "2026-09-27T12:00:00",
  },
];

/* ── Le devis dans le fil Messages (ADR 0042, rév.) ─────────────────────────
   Chaque envoi est un message de la réceptionniste qui porte le document ; les réponses de la
   cliente sont scénarisées, comme le reste des fils. */

type SeedMessage = { clientId: string; m: Omit<Message, "id"> };

const DEVIS_BODY = "Bonjour, voici votre devis. N'hésitez pas si vous avez une question.";
const FACTURE_BODY = "Merci pour votre accord ! Voici votre facture, vous pouvez la régler directement avec le bouton Payer.";

const SEED: SeedMessage[] = [
  { clientId: "cl-1", m: { sender: "receptionniste", channel: "whatsapp", at: "2026-10-04T11:05:00", body: DEVIS_BODY, devisId: "dev-13-v1" } },
  { clientId: "cl-1", m: { sender: "cliente", channel: "whatsapp", at: "2026-10-04T13:20:00", body: "Mon employeur ne prend pas les produits en charge. Vous pouvez retirer le masque ? Et la facture doit être au nom de Kër Digital." } },
  { clientId: "cl-1", m: { sender: "receptionniste", channel: "whatsapp", at: "2026-10-06T15:12:00", body: "C'est fait, voici le devis mis à jour au nom de Kër Digital, avec un geste de 10 %.", devisId: "dev-13-v2" } },
  { clientId: "cl-2", m: { sender: "receptionniste", channel: "email", at: "2026-10-02T10:25:00", body: DEVIS_BODY, devisId: "dev-12" } },
  { clientId: "cl-10", m: { sender: "receptionniste", channel: "whatsapp", at: "2026-09-30T16:02:00", body: DEVIS_BODY, devisId: "dev-11" } },
  { clientId: "cl-10", m: { sender: "cliente", channel: "whatsapp", at: "2026-10-05T10:50:00", body: "C'est parfait, je valide 👍" } },
  { clientId: "cl-10", m: { sender: "receptionniste", channel: "whatsapp", at: "2026-10-05T11:30:00", body: FACTURE_BODY, factureId: "fac-07" } },
  { clientId: "cl-3", m: { sender: "receptionniste", channel: "whatsapp", at: "2026-09-26T12:01:00", body: DEVIS_BODY, devisId: "dev-10" } },
  { clientId: "cl-3", m: { sender: "cliente", channel: "whatsapp", at: "2026-09-28T19:04:00", body: "Ok pour moi !" } },
  { clientId: "cl-3", m: { sender: "receptionniste", channel: "whatsapp", at: "2026-09-29T10:00:00", body: FACTURE_BODY, factureId: "fac-06" } },
  { clientId: "cl-4", m: { sender: "receptionniste", channel: "email", at: "2026-09-18T10:03:00", body: DEVIS_BODY, devisId: "dev-09" } },
  { clientId: "cl-4", m: { sender: "cliente", channel: "email", at: "2026-09-20T09:12:00", body: "Bonjour, je valide, je passerai régler au salon." } },
  { clientId: "cl-4", m: { sender: "receptionniste", channel: "email", at: "2026-09-20T15:00:00", body: FACTURE_BODY, factureId: "fac-05" } },
  { clientId: "cl-7", m: { sender: "receptionniste", channel: "whatsapp", at: "2026-09-15T09:02:00", body: DEVIS_BODY, devisId: "dev-08" } },
  { clientId: "cl-7", m: { sender: "cliente", channel: "whatsapp", at: "2026-09-16T18:30:00", body: "Merci, mais ce sera pour une autre fois." } },
  { clientId: "cl-9", m: { sender: "receptionniste", channel: "email", at: "2026-09-01T14:05:00", body: DEVIS_BODY, devisId: "dev-07" } },
];

/** Verse les échanges de devis dans les fils existants. Un fil où un devis est en cours passe en
 *  prise en main (l'envoi d'un devis la déclenche — ADR 0042). */
export function withDevisMessages(conversations: Conversation[]): Conversation[] {
  const active = new Set(["cl-1", "cl-2", "cl-10"]);
  return conversations.map((c) => {
    const extra = SEED.filter((s) => s.clientId === c.clientId).map((s, i) => ({ ...s.m, id: `m-dv-${c.id}-${i}` }));
    if (extra.length === 0) return c;
    return {
      ...c,
      state: active.has(c.clientId) && c.state !== "manager" ? "receptionniste" : c.state,
      messages: [...c.messages, ...extra],
    };
  });
}
