import { CLIENTS } from "@/lib/data/clientele";
import { PRODUITS, SERVICES, serviceOfferedAt } from "@/lib/data/menu";
import { BOISSONS } from "@/lib/data/boissons";
import { SALONS, salonById } from "@/lib/data/entreprises";
import { dateISO } from "@/lib/data/planning";
import { isSalonClosed } from "@/lib/data/praticiennes";
import type { CartLine, DepositMode, PaymentMode, RemiseAccordee, Reservation, Sale } from "@/lib/data/types";

/**
 * Vue « Ventes » de l'Accueil (ADR 0043) — tout ce qui est entré en caisse sur une période : les
 * ventes encaissées et, à part, les acomptes réglés au comptoir le jour où ils sont payés.
 */

export type VenteKind = "service" | "produit" | "boisson";

export const PAYMENT_MODE_LABEL: Record<PaymentMode, string> = {
  especes: "Espèces",
  carte: "Carte",
  wave: "Wave",
  orange_money: "Orange Money",
};

const DEPOSIT_MODE_LABEL: Record<DepositMode, string> = { especes: "Espèces", carte: "Carte", mobile_money: "Mobile money" };

/** Une ligne de la vue Ventes : une vente encaissée, ou un acompte pris au comptoir. */
export type CaisseEntry =
  | { type: "vente"; id: string; at: string; salonId: string; sale: Sale }
  | { type: "acompte"; id: string; at: string; salonId: string; reservation: Reservation; amount: number; modeLabel: string };

/** Ce que la vente a fait entrer en caisse — la somme de ses parts, hors pourboire (ADR 0034). */
export function saleCashIn(sale: Sale): number {
  return (sale.payment?.modes ?? []).reduce((sum, p) => sum + p.amount, 0);
}

export function saleKinds(sale: Sale): Set<VenteKind> {
  return new Set(sale.cart.map((l) => l.kind));
}

function reservationSalonId(r: Reservation): string | undefined {
  return r.rendezVous.find((rv) => rv.status !== "annule")?.salonId ?? r.rendezVous[0]?.salonId;
}

/** Salon d'une vente : posé à l'encaissement ; à défaut, sa réservation d'origine, puis le poste. */
export function saleSalonId(sale: Sale, reservations: Reservation[], fallback: string): string {
  if (sale.salonId) return sale.salonId;
  const r = sale.originReservationId ? reservations.find((x) => x.id === sale.originReservationId) : undefined;
  return (r && reservationSalonId(r)) ?? fallback;
}

/** Toutes les entrées de caisse, les plus récentes d'abord. */
export function caisseEntries(sales: Sale[], reservations: Reservation[], posteSalonId: string): CaisseEntry[] {
  const entries: CaisseEntry[] = [];
  for (const sale of sales) {
    if (sale.status !== "encaissee" || !sale.encaisseeAt) continue;
    entries.push({ type: "vente", id: sale.id, at: sale.encaisseeAt, salonId: saleSalonId(sale, reservations, posteSalonId), sale });
  }
  for (const r of reservations) {
    // Seul l'acompte pris au comptoir entre dans la caisse (ADR 0032) ; celui réglé en ligne, non.
    if (!r.depositPaid || !r.depositMode || !r.depositPaidAt) continue;
    entries.push({
      type: "acompte",
      id: `acompte-${r.id}`,
      at: r.depositPaidAt,
      salonId: reservationSalonId(r) ?? posteSalonId,
      reservation: r,
      amount: r.depositPaid,
      modeLabel: DEPOSIT_MODE_LABEL[r.depositMode],
    });
  }
  return entries.sort((a, b) => b.at.localeCompare(a.at));
}

export function entryDay(e: CaisseEntry): string {
  return dateISO(new Date(e.at));
}

/** Encaissé par moyen de paiement (parts des ventes + acomptes). */
export function cashInByMode(entries: CaisseEntry[]): { label: string; amount: number }[] {
  const byMode = new Map<string, number>();
  for (const e of entries) {
    if (e.type === "acompte") byMode.set(e.modeLabel, (byMode.get(e.modeLabel) ?? 0) + e.amount);
    else for (const p of e.sale.payment?.modes ?? []) {
      const label = PAYMENT_MODE_LABEL[p.mode];
      byMode.set(label, (byMode.get(label) ?? 0) + p.amount);
    }
  }
  const order = ["Espèces", "Carte", "Wave", "Orange Money", "Mobile money"];
  return order.filter((l) => byMode.has(l)).map((label) => ({ label, amount: byMode.get(label)! }));
}

export function sumCashIn(entries: CaisseEntry[]): number {
  return entries.reduce((sum, e) => sum + (e.type === "acompte" ? e.amount : saleCashIn(e.sale)), 0);
}

export function sumTips(entries: CaisseEntry[]): number {
  return entries.reduce((sum, e) => sum + (e.type === "vente" ? (e.sale.tip?.amount ?? 0) : 0), 0);
}

/** Résumé d'une vente en une ligne : « Brushing, Pose gel + 2 autres ». */
export function saleSummary(sale: Sale, max = 2): string {
  const names = sale.cart.map((l) => (l.qty > 1 ? `${l.name} ×${l.qty}` : l.name));
  const shown = names.slice(0, max).join(", ");
  return names.length > max ? `${shown} + ${names.length - max} autre${names.length - max > 1 ? "s" : ""}` : shown;
}

/** Numéro court affiché d'une vente (suffixe de son id). */
export function saleNumber(sale: Pick<Sale, "id">): string {
  return sale.id.slice(sale.id.lastIndexOf("-") + 1).toUpperCase();
}

// ─── Historique de démo ──────────────────────────────────────────────────────────────────────
// Le mock ne garde que les ventes de la session : sans passé, la période Du/Au ne servirait à
// rien. On génère, au chargement et de façon déterministe, les ventes encaissées des 35 derniers
// jours (et du début de journée), cohérentes avec le menu, les salons et leurs jours de fermeture.

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HISTORY_DAYS = 35;
const REMISE_REASONS = ["Cliente fidèle", "Retard de la praticienne", "Geste commercial", "Anniversaire", "Retouche offerte"];
const MODES: PaymentMode[] = ["especes", "carte", "wave", "orange_money"];
const MODE_WEIGHTS = [0.3, 0.2, 0.32, 0.18];

export function generateSalesHistory(now = new Date()): Sale[] {
  const rand = mulberry32(20261015);
  const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
  const pickMode = () => {
    let r = rand();
    for (let i = 0; i < MODES.length; i++) {
      r -= MODE_WEIGHTS[i];
      if (r <= 0) return MODES[i];
    }
    return MODES[0];
  };
  const services = SERVICES.filter((s) => s.active && s.price > 0);
  const produits = PRODUITS.filter((p) => p.active && p.price > 0);
  const boissons = BOISSONS.filter((b) => b.active && b.price > 0);
  const salons = SALONS.filter((s) => s.active);
  const sales: Sale[] = [];
  let seq = 0;
  // La première vente de prestations du jour aux Almadies cumule tout (remise, points, deux parts,
  // pourboire) : un ticket complet toujours à portée pour la démo.
  let showcaseDone = false;

  for (let offset = HISTORY_DAYS; offset >= 0; offset--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    // Aujourd'hui : seulement les ventes déjà passées, pour que la journée ait commencé.
    const lastHour = offset === 0 ? Math.min(now.getHours() - 1, 19) : 19;
    if (lastHour < 10) continue;
    for (const salon of salons) {
      if (isSalonClosed(salon.id, day)) continue;
      const count = 3 + Math.floor(rand() * (salon.id === "almadies" ? 7 : 5));
      for (let i = 0; i < count; i++) {
        seq += 1;
        const at = new Date(day);
        at.setHours(10 + Math.floor(rand() * (lastHour - 9)), Math.floor(rand() * 60), 0, 0);
        if (at > now) continue;

        const cart: CartLine[] = [];
        const line = (kind: CartLine["kind"], item: { id: string; name: string; price: number }, qty = 1) =>
          cart.push({ id: `hl-${seq}-${cart.length}`, refId: item.id, kind, name: item.name, unitPrice: item.price, qty });
        const shape = rand();
        let clientId: string | null = pick(CLIENTS).id;
        if (shape < 0.62) {
          // Passage d'une réservation : 1 à 3 prestations, parfois une boisson ou un produit.
          const offered = services.filter((s) => serviceOfferedAt(s, salon.id));
          const n = 1 + Math.floor(rand() * rand() * 3);
          for (let k = 0; k < n; k++) line("service", pick(offered));
          if (rand() < 0.3) line("boisson", pick(boissons));
          if (rand() < 0.2) line("produit", pick(produits));
        } else if (shape < 0.85) {
          // Vente au comptoir de produits, cliente pas toujours identifiée.
          if (rand() < 0.45) clientId = null;
          line("produit", pick(produits), rand() < 0.2 ? 2 : 1);
          if (rand() < 0.3) line("produit", pick(produits));
        } else {
          clientId = rand() < 0.6 ? null : clientId;
          line("boisson", pick(boissons), 1 + Math.floor(rand() * 2));
        }

        const subtotal = cart.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
        const serviceLines = cart.filter((l) => l.kind === "service");
        const showcase = !showcaseDone && offset === 0 && salon.id === "almadies" && serviceLines.length > 0 && clientId !== null;
        if (showcase) showcaseDone = true;

        // Remise accordée sur les prestations (ADR 0031) — même calcul que `computeTotals` pour une
        // remise unique sans prestation couverte : % de l'assiette, ou montant plafonné à 20 %.
        const remises: RemiseAccordee[] = [];
        let remiseAmount = 0;
        if (serviceLines.length > 0 && (showcase || rand() < 0.22)) {
          const base = serviceLines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
          const pct = showcase ? 15 : pick([5, 10, 10, 15, 20]);
          const flat = !showcase && rand() < 0.3;
          const value = flat ? Math.min(pick([2000, 5000, 10000]), Math.round(base * 0.2)) : pct;
          remiseAmount = flat ? value : Math.round((base * pct) / 100);
          const overTen = remiseAmount > Math.round(base * 0.1);
          remises.push({
            id: `hr-${seq}`,
            lineIds: serviceLines.map((l) => l.id),
            mode: flat ? "montant" : "pourcentage",
            value,
            ...(overTen && { managerCode: `MGR-${100 + Math.floor(rand() * 900)}` }),
          });
        }
        const pointsUsed = clientId && (showcase || rand() < 0.12) ? pick([100, 200, 300]) : 0;
        const total = Math.max(0, subtotal - remiseAmount - Math.floor(pointsUsed / 100) * 1000);

        const modes: { mode: PaymentMode; amount: number }[] = [];
        if (showcase) {
          const first = Math.round((total * 0.6) / 1000) * 1000;
          modes.push({ mode: "especes", amount: total - first }, { mode: "wave", amount: first });
        } else if (total >= 30000 && rand() < 0.2) {
          const first = Math.round((total * (0.3 + rand() * 0.4)) / 1000) * 1000;
          modes.push({ mode: pickMode(), amount: first }, { mode: pickMode(), amount: total - first });
        } else {
          modes.push({ mode: pickMode(), amount: total });
        }
        const hasService = cart.some((l) => l.kind === "service");
        const tipAmount = showcase ? 5000 : hasService && rand() < 0.25 ? pick([2000, 2000, 5000, 5000, 10000]) : 0;

        sales.push({
          id: `sale-h${String(seq).padStart(4, "0")}-${Math.floor(rand() * 36 ** 5).toString(36).padStart(5, "0")}`,
          label: `Vente ${seq}`,
          clientId,
          cart,
          giftCardApplied: null,
          loyaltyPointsUsed: pointsUsed,
          coverage: [],
          remises,
          remiseReason: remises.length ? pick(REMISE_REASONS) : null,
          status: "encaissee",
          step: "recu",
          // Espèces de la vente vitrine : billet arrondi au 5 000 supérieur, monnaie rendue ; le
          // pourboire suit la dernière part (Wave), pas les espèces.
          payment: showcase
            ? { modes, cashReceived: Math.ceil(modes[0].amount / 5000) * 5000, change: Math.ceil(modes[0].amount / 5000) * 5000 - modes[0].amount }
            : { modes },
          ...(tipAmount > 0 && { tip: { amount: tipAmount, mode: modes[modes.length - 1].mode } }),
          loyaltyPointsEarned: clientId ? Math.floor(total / 1000) * 10 : 0,
          salonId: salon.id,
          createdAt: at.toISOString(),
          encaisseeAt: at.toISOString(),
          clientRatedAt: at.toISOString(),
        });
      }
    }
  }
  return sales;
}

/** Libellé de salon pour une ligne, quand la vue montre les deux salons. */
export function salonLabel(id: string): string {
  return salonById(id)?.name ?? "";
}

