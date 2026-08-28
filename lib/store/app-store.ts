"use client";

import { create } from "zustand";
import { CLIENTS, clientFullName } from "@/lib/data/clientele";
import { RESERVATIONS, reservationById } from "@/lib/data/planning";
import { serviceById } from "@/lib/data/menu";
import { PRATICIENNES } from "@/lib/data/praticiennes";
import { RELANCES } from "@/lib/data/relances";
import { styleById } from "@/lib/data/styles";
import { CARTES_CADEAUX, carteCadeauByCode, giftCardExpiryLabel, normalizeGiftCardCode } from "@/lib/data/cartes-cadeaux";
import { formatFcfa } from "@/lib/utils";
import type {
  CartLine,
  Cliente,
  PaymentMode,
  Praticienne,
  Relance,
  RelanceStatus,
  RemiseMode,
  RendezVous,
  Reservation,
  Sale,
} from "@/lib/data/types";

/** A sent tournée du matin — kept in the store so its history survives a volet switch. */
export type TourneeBatch = { id: string; sentAt: string; count: number; relanceIds: string[] };

/* ────────────────────────────────────────────────────────────────────────────
   Session state store — was a React context (components/providers/
   app-data-provider.tsx), now Zustand. Same state keys, same action names, same
   logic; `useAppData()` in the old file is kept as a thin selector facade so the
   ~30 consumers never had to change. All data is in-memory mock fixtures — no
   backend, a page refresh resets everything.
   ──────────────────────────────────────────────────────────────────────────── */

let uid = 0;
function nextId(prefix: string) {
  uid += 1;
  return `${prefix}-${Date.now()}-${uid}`;
}

/** Patch one atomic rendez-vous wherever it sits in the nested réservation tree. */
function patchRendezVous(reservations: Reservation[], rvId: string, patch: Partial<RendezVous>) {
  return reservations.map((r) =>
    r.rendezVous.some((rv) => rv.id === rvId)
      ? { ...r, rendezVous: r.rendezVous.map((rv) => (rv.id === rvId ? { ...rv, ...patch } : rv)) }
      : r,
  );
}

/** The bénéficiaire's display name, or undefined when it's the payer herself. */
function beneficiaryLabel(rv: RendezVous, clients: Cliente[]) {
  if (rv.beneficiaryClientId) {
    const c = clients.find((x) => x.id === rv.beneficiaryClientId);
    return c ? clientFullName(c) : undefined;
  }
  return rv.beneficiaryName ?? undefined;
}

function emptySale(label: string): Sale {
  return {
    id: nextId("sale"),
    label,
    clientId: null,
    cart: [],
    giftCardCode: "",
    giftCardApplied: null,
    loyaltyPointsUsed: 0,
    discountGranted: null,
    status: "ouverte",
    step: "vente",
    createdAt: new Date().toISOString(),
  };
}

/** The most a receptionist can knock off with her own code, as a share of the prestations total. */
export const MAX_REMISE_PCT = 20;

/**
 * Pure. The three discount mechanisms stack and can bring the total to 0 F. Order matters because
 * one is a percentage: (1) the receptionist's granted discount, always figured against the
 * *prestations* total (services only — products are never discounted this way) and capped at
 * MAX_REMISE_PCT; (2) loyalty points; (3) the gift card last, clamped to whatever is still owed so
 * its unused value (`giftCardRemaining`) stays on the card. Used by the cart, payment step, receipt
 * and the header pastille.
 */
export function computeTotals(sale: Sale) {
  const prestations = sale.cart.filter((l) => l.kind === "service").reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const produits = sale.cart.filter((l) => l.kind === "produit").reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const subtotal = prestations + produits;

  const maxGrantedDiscount = Math.round((prestations * MAX_REMISE_PCT) / 100);
  const g = sale.discountGranted;
  const grantedDiscount = !g
    ? 0
    : g.mode === "pourcentage"
      ? Math.round((prestations * Math.min(Math.max(g.value, 0), MAX_REMISE_PCT)) / 100)
      : Math.min(Math.max(g.value, 0), maxGrantedDiscount);

  const loyaltyDiscount = Math.floor(sale.loyaltyPointsUsed / 100) * 1000;

  const beforeGiftCard = Math.max(0, subtotal - grantedDiscount - loyaltyDiscount);
  const giftCardBalance = sale.giftCardApplied?.balance ?? 0;
  const giftCardDiscount = Math.min(giftCardBalance, beforeGiftCard);
  const giftCardRemaining = sale.giftCardApplied ? giftCardBalance - giftCardDiscount : 0;

  const total = beforeGiftCard - giftCardDiscount;
  const totalDiscount = grantedDiscount + loyaltyDiscount + giftCardDiscount;

  return {
    subtotal,
    prestations,
    produits,
    grantedDiscount,
    loyaltyDiscount,
    giftCardDiscount,
    giftCardRemaining,
    maxGrantedDiscount,
    totalDiscount,
    total,
  };
}

type NewTabPrefill = {
  clientId?: string;
  /** Open a sale from a réservation — seeds the payeur + every prestation planifiée of the booking. */
  reservationId?: string;
  /** Replacement praticiennes, keyed by rendez-vous id — set when "Encaisser" follows a
   *  "Marquer indisponible" guard. Patches each rendez-vous' staffId so the day's planning stays
   *  truthful and the sale is attributed to whoever actually did the prestation. */
  staffOverrides?: Record<string, string>;
};

export type AppState = {
  clients: Cliente[];
  reservations: Reservation[];
  praticiennes: Praticienne[];
  sales: Sale[];
  openTabIds: string[];
  activeSaleId: string | null;
  comptoirDeployed: boolean;
  /** Client ids most recently opened on this station, newest first — powers "Vues récemment" on
   *  the Clientèle landing. Session-only, capped, no persistence (consistent with the rest of the store). */
  recentClientIds: string[];
  /** The one shared follow-up list — the Fiche cliente and La Tournée du matin read the same
   *  state, so "Proposer" on a recommendation really lands in the morning round. */
  relances: Relance[];
  tourneeBatches: TourneeBatch[];

  // Clients
  addClient: (data: Omit<Cliente, "id" | "points" | "totalSpent" | "totalVisits" | "createdAt" | "tier">) => Cliente;
  updateClient: (id: string, patch: Partial<Cliente>) => void;
  findDuplicatePhone: (phone: string) => Cliente | undefined;
  /** Record that a cliente's fiche was opened (called from FicheClienteView). */
  noteClientViewed: (id: string) => void;

  // Rendez-vous (atomic, nested inside their Réservation). No création/édition here — the booking
  // journey lives on the external platform; the receptionist only confirms, cancels or cashes in.
  confirmAppointment: (rvId: string) => void;
  cancelAppointment: (rvId: string) => void;
  markStaffUnavailable: (staffId: string) => void;

  // Comptoir / Sales
  deployComptoir: () => void;
  collapseComptoir: () => void;
  openNewTab: (prefill?: NewTabPrefill) => void;
  switchTab: (saleId: string) => void;
  closeTab: (saleId: string) => void;
  updateSale: (saleId: string, patch: Partial<Sale>) => void;
  addCartLine: (saleId: string, line: Omit<CartLine, "id" | "qty">) => void;
  updateCartQty: (saleId: string, lineId: string, qty: number) => void;
  removeCartLine: (saleId: string, lineId: string) => void;
  applyGiftCard: (saleId: string, code: string) => { ok: boolean; message: string };
  /** Validate a receptionist's personal code and attach a discretionary discount (≤ 20 % of the
   *  prestations total). The `reason` is captured later, after the sale is cashed in. */
  grantDiscount: (saleId: string, code: string, mode: RemiseMode, value: number) => { ok: boolean; message: string };
  /** Store the free-text justification for a granted discount (the post-payment step). */
  setDiscountReason: (saleId: string, reason: string) => void;
  setLoyaltyPointsUsed: (saleId: string, points: number) => void;
  confirmPayment: (saleId: string, modes: { mode: PaymentMode; amount: number }[]) => void;
  activeSale: () => Sale | undefined;

  // Relances (shared follow-up list — see `relances` above)
  setRelanceStatus: (id: string, status: RelanceStatus) => void;
  /** Create a "recommandation" card from a Fiche cliente. Returns the new id (for an undo toast). */
  proposeStyleRelance: (clientId: string, styleId: string) => string;
  removeRelance: (id: string) => void;
  /** Send every actionable "en_attente"/"autorisee" card due today in one go. Returns the affected
   *  ids + the batch id so the caller can offer a real "Annuler". */
  sendTourneeBatch: (ids: string[]) => { batchId: string };
  revertTourneeBatch: (batchId: string, ids: string[]) => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  clients: CLIENTS,
  reservations: RESERVATIONS,
  praticiennes: PRATICIENNES,
  sales: [],
  openTabIds: [],
  activeSaleId: null,
  comptoirDeployed: false,
  recentClientIds: [],
  relances: RELANCES,
  tourneeBatches: [],

  addClient: (data) => {
    const client: Cliente = { ...data, id: nextId("cl"), tier: null, points: 0, totalSpent: 0, totalVisits: 0, createdAt: new Date().toISOString() };
    set((s) => ({ clients: [client, ...s.clients] }));
    return client;
  },

  updateClient: (id, patch) => set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

  findDuplicatePhone: (phone) => get().clients.find((c) => c.phone.replace(/\s/g, "") === phone.replace(/\s/g, "")),

  noteClientViewed: (id) =>
    set((s) => ({ recentClientIds: [id, ...s.recentClientIds.filter((x) => x !== id)].slice(0, 8) })),

  confirmAppointment: (rvId) => set((s) => ({ reservations: patchRendezVous(s.reservations, rvId, { status: "confirme" }) })),

  cancelAppointment: (rvId) => set((s) => ({ reservations: patchRendezVous(s.reservations, rvId, { status: "annule" }) })),

  markStaffUnavailable: (staffId) =>
    set((s) => ({ praticiennes: s.praticiennes.map((p) => (p.id === staffId ? { ...p, unavailableToday: true } : p)) })),

  deployComptoir: () => set({ comptoirDeployed: true }),
  collapseComptoir: () => set({ comptoirDeployed: false }),

  openNewTab: (prefill) => {
    const { reservations, sales, clients } = get();

    // Re-tapping "Encaisser" on a réservation that already has an open sale switches to that tab
    // instead of opening a duplicate — per USERFLOW.md's Accueil section.
    if (prefill?.reservationId) {
      const existing = reservationById(reservations, prefill.reservationId);
      if (existing?.saleId) {
        set({ activeSaleId: existing.saleId, comptoirDeployed: true });
        return;
      }
    }

    const sale = emptySale(`Vente ${sales.length + 1}`);
    sale.clientId = prefill?.clientId ?? null;

    if (prefill?.reservationId) {
      const reservation = reservationById(reservations, prefill.reservationId);
      if (reservation) {
        sale.clientId = reservation.payerClientId;
        sale.originReservationId = reservation.id;

        // One cart line per prestation planifiée. Merge identical lines (same service, same
        // bénéficiaire) into a quantity so a repeated prestation stays one row.
        const lines: CartLine[] = [];
        for (const rv of reservation.rendezVous) {
          if (rv.status === "annule") continue;
          const service = serviceById(rv.serviceId);
          if (!service) continue;
          const benef = beneficiaryLabel(rv, clients);
          const twin = lines.find((l) => l.refId === service.id && l.beneficiary === benef);
          if (twin) {
            twin.qty += 1;
          } else {
            lines.push({
              id: nextId("line"),
              refId: service.id,
              kind: "service",
              name: service.name,
              unitPrice: service.price,
              qty: 1,
              ...(benef ? { beneficiary: benef } : {}),
            });
          }
        }
        sale.cart = lines;

        // Attach the sale + apply any last-minute replacement praticiennes to the planning.
        const overrides = prefill.staffOverrides ?? {};
        set((s) => ({
          reservations: s.reservations.map((r) =>
            r.id === reservation.id
              ? {
                  ...r,
                  saleId: sale.id,
                  rendezVous: r.rendezVous.map((rv) =>
                    overrides[rv.id] ? { ...rv, staffId: overrides[rv.id] } : rv,
                  ),
                }
              : r,
          ),
        }));
      }
    }

    set((s) => ({
      sales: [...s.sales, sale],
      openTabIds: [...s.openTabIds, sale.id],
      activeSaleId: sale.id,
      comptoirDeployed: true,
    }));
  },

  switchTab: (saleId) => set({ activeSaleId: saleId }),

  closeTab: (saleId) =>
    set((s) => {
      const nextOpen = s.openTabIds.filter((id) => id !== saleId);
      const abandoned = s.sales.find((sale) => sale.id === saleId && sale.status === "ouverte");
      return {
        sales: s.sales.map((sale) => (sale.id === saleId && sale.status === "ouverte" ? { ...sale, status: "abandonnee" } : sale)),
        // A réservation whose sale was abandoned becomes encaissable again.
        reservations: abandoned?.originReservationId
          ? s.reservations.map((r) => (r.saleId === saleId ? { ...r, saleId: undefined } : r))
          : s.reservations,
        openTabIds: nextOpen,
        activeSaleId: s.activeSaleId === saleId ? (nextOpen[nextOpen.length - 1] ?? null) : s.activeSaleId,
      };
    }),

  updateSale: (saleId, patch) => set((s) => ({ sales: s.sales.map((sale) => (sale.id === saleId ? { ...sale, ...patch } : sale)) })),

  addCartLine: (saleId, line) =>
    set((s) => ({
      sales: s.sales.map((sale) => {
        if (sale.id !== saleId) return sale;
        const existing = sale.cart.find((l) => l.refId === line.refId);
        if (existing) {
          return { ...sale, cart: sale.cart.map((l) => (l.id === existing.id ? { ...l, qty: Math.min(20, l.qty + 1) } : l)) };
        }
        return { ...sale, cart: [...sale.cart, { ...line, id: nextId("line"), qty: 1 }] };
      }),
    })),

  updateCartQty: (saleId, lineId, qty) =>
    set((s) => ({
      sales: s.sales.map((sale) => (sale.id === saleId ? { ...sale, cart: sale.cart.map((l) => (l.id === lineId ? { ...l, qty } : l)) } : sale)),
    })),

  removeCartLine: (saleId, lineId) =>
    set((s) => ({
      sales: s.sales.map((sale) => (sale.id === saleId ? { ...sale, cart: sale.cart.filter((l) => l.id !== lineId) } : sale)),
    })),

  applyGiftCard: (saleId, code) => {
    const normalized = normalizeGiftCardCode(code);
    if (!normalized) return { ok: false, message: "Saisissez ou scannez le code de la carte." };
    const card = carteCadeauByCode(normalized);
    if (!card) return { ok: false, message: "Ce code n'est pas reconnu — vérifiez-le ou continuez sans remise." };
    if (card.status === "used") return { ok: false, message: "Cette carte a déjà été utilisée." };
    if (card.status === "expired") {
      const on = giftCardExpiryLabel(card);
      return { ok: false, message: on ? `Cette carte a expiré le ${on}.` : "Cette carte a expiré." };
    }
    if (card.balance <= 0) return { ok: false, message: "Cette carte n'a plus de solde." };
    const sale = get().sales.find((s) => s.id === saleId);
    const replaced = sale?.giftCardApplied;
    get().updateSale(saleId, { giftCardApplied: { code: card.code, balance: card.balance }, giftCardCode: "" });
    return {
      ok: true,
      message:
        replaced && replaced.code !== card.code
          ? `Remplace la carte « ${replaced.code} » — solde ${formatFcfa(card.balance)}.`
          : `Carte « ${card.code} » appliquée — solde ${formatFcfa(card.balance)}.`,
    };
  },

  grantDiscount: (saleId, code, mode, value) => {
    const trimmed = code.trim();
    if (trimmed.length < 4) return { ok: false, message: "Entrez votre code réceptionniste." };
    const sale = get().sales.find((s) => s.id === saleId);
    if (!sale) return { ok: false, message: "Vente introuvable." };
    const { prestations, maxGrantedDiscount } = computeTotals(sale);
    if (prestations <= 0) return { ok: false, message: "Ajoutez une prestation avant d'accorder une remise." };
    if (!Number.isFinite(value) || value <= 0) return { ok: false, message: "Indiquez le montant ou le pourcentage de la remise." };
    if (mode === "pourcentage" && value > MAX_REMISE_PCT) {
      return { ok: false, message: `Une réceptionniste peut accorder jusqu'à ${MAX_REMISE_PCT} %. Au-delà, il faut l'accord de la direction.` };
    }
    if (mode === "montant" && value > maxGrantedDiscount) {
      return {
        ok: false,
        message: `Le maximum sur ce panier est ${formatFcfa(maxGrantedDiscount)} — ${MAX_REMISE_PCT} % des prestations.`,
      };
    }
    get().updateSale(saleId, { discountGranted: { mode, value, grantedByCode: trimmed.toUpperCase(), reason: null } });
    return { ok: true, message: "Remise accordée. Le motif vous sera demandé après l'encaissement." };
  },

  setDiscountReason: (saleId, reason) =>
    set((s) => ({
      sales: s.sales.map((sale) =>
        sale.id === saleId && sale.discountGranted
          ? { ...sale, discountGranted: { ...sale.discountGranted, reason: reason.trim() || null } }
          : sale,
      ),
    })),

  setLoyaltyPointsUsed: (saleId, points) => get().updateSale(saleId, { loyaltyPointsUsed: points }),

  confirmPayment: (saleId, modes) => {
    const sale = get().sales.find((s) => s.id === saleId);
    if (!sale) return;
    const { total, giftCardRemaining } = computeTotals(sale);
    const earned = Math.floor(total / 1000) * 10;

    // Burn what the sale spent off the gift card so its reliquat is real on the next scan.
    if (sale.giftCardApplied) {
      const card = CARTES_CADEAUX.find((c) => c.code === sale.giftCardApplied!.code);
      if (card) {
        card.balance = giftCardRemaining;
        if (card.balance <= 0) card.status = "used";
      }
    }
    set((s) => ({
      sales: s.sales.map((x) =>
        x.id === saleId
          ? { ...x, status: "encaissee", step: "recu", payment: { modes }, loyaltyPointsEarned: earned, encaisseeAt: new Date().toISOString() }
          : x,
      ),
      clients: sale.clientId
        ? s.clients.map((c) =>
            c.id === sale.clientId
              ? {
                  ...c,
                  points: c.points - sale.loyaltyPointsUsed + earned,
                  totalSpent: c.totalSpent + total,
                  totalVisits: c.totalVisits + 1,
                  lastVisit: "Aujourd'hui",
                }
              : c,
          )
        : s.clients,
    }));
  },

  activeSale: () => {
    const { sales, activeSaleId } = get();
    return sales.find((s) => s.id === activeSaleId);
  },

  setRelanceStatus: (id, status) =>
    set((s) => ({ relances: s.relances.map((r) => (r.id === id ? { ...r, status } : r)) })),

  proposeStyleRelance: (clientId, styleId) => {
    const id = nextId("rel");
    const style = styleById(styleId);
    const relance: Relance = {
      id,
      clientId,
      type: "recommandation",
      status: "en_attente",
      message: style
        ? `Ce style pourrait vous plaire pour votre prochain rendez-vous : ${style.name}.`
        : "Un style qui pourrait vous plaire pour votre prochain rendez-vous.",
      styleId,
    };
    set((s) => ({ relances: [relance, ...s.relances] }));
    return id;
  },

  removeRelance: (id) => set((s) => ({ relances: s.relances.filter((r) => r.id !== id) })),

  sendTourneeBatch: (ids) => {
    const batchId = nextId("batch");
    const batch: TourneeBatch = {
      id: batchId,
      sentAt: new Date().toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }),
      count: ids.length,
      relanceIds: ids,
    };
    set((s) => ({
      relances: s.relances.map((r) => (ids.includes(r.id) ? { ...r, status: "envoyee" as RelanceStatus } : r)),
      tourneeBatches: [batch, ...s.tourneeBatches],
    }));
    return { batchId };
  },

  revertTourneeBatch: (batchId, ids) =>
    set((s) => ({
      relances: s.relances.map((r) => (ids.includes(r.id) ? { ...r, status: "en_attente" as RelanceStatus } : r)),
      tourneeBatches: s.tourneeBatches.filter((b) => b.id !== batchId),
    })),
}));
