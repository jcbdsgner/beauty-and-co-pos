"use client";

import { create } from "zustand";
import { CLIENTS, clientFullName } from "@/lib/data/clientele";
import { RESERVATIONS, reservationById, timeToMinutes } from "@/lib/data/planning";
import { PRODUITS, serviceById } from "@/lib/data/menu";
import { PRATICIENNES } from "@/lib/data/praticiennes";
import { CONVERSATIONS } from "@/lib/data/conversations";
import {
  CARTES_CADEAUX,
  GIFT_CARD_ORDERS,
  carteCadeauByCode,
  giftCardExpiryLabel,
  normalizeGiftCardCode,
} from "@/lib/data/cartes-cadeaux";
import { formatFcfa } from "@/lib/utils";
import type {
  CartLine,
  Cliente,
  Conversation,
  GiftCardOrder,
  PaymentMode,
  Praticienne,
  Produit,
  RemiseMode,
  RendezVous,
  Reservation,
  Sale,
} from "@/lib/data/types";

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

/** Do two time ranges share any minute? */
function timeRangesOverlap(a: { start: string; durationMin: number }, b: { start: string; durationMin: number }) {
  const aStart = timeToMinutes(a.start);
  const bStart = timeToMinutes(b.start);
  return aStart < bStart + b.durationMin && bStart < aStart + a.durationMin;
}

/**
 * The one hard guard on rendez-vous edits (ADR 0009): a praticienne can't hold two rendez-vous that
 * overlap. Checks a candidate slot against every other active rendez-vous that shares a praticienne.
 */
function findStaffClash(
  reservations: Reservation[],
  rvId: string,
  cand: { staffIds: string[]; start: string; durationMin: number },
): { staffId: string; other: RendezVous } | null {
  for (const r of reservations) {
    for (const rv of r.rendezVous) {
      if (rv.id === rvId || rv.status === "annule") continue;
      const otherStaff = [rv.staffId, rv.secondStaffId].filter(Boolean) as string[];
      const shared = cand.staffIds.find((id) => otherStaff.includes(id));
      if (shared && timeRangesOverlap(cand, rv)) return { staffId: shared, other: rv };
    }
  }
  return null;
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

/**
 * Whether this sale can only be cashed in against an identified cliente. True as soon as it holds
 * one prestation line: a service means someone was served and the note must name her. A
 * products-only sale (the walk-in "+ Nouvelle vente" case — services never originate at the
 * counter, they arrive from a réservation that already carries its payeuse) checks out anonymously.
 * See ADR 0013.
 */
export function saleNeedsClient(sale: Sale) {
  return sale.cart.some((l) => l.kind === "service");
}

/** The most a receptionist can knock off with her own code alone, as a share of the prestations. */
export const RECEPTIONIST_MAX_PCT = 10;
/** The absolute ceiling on a granted discount — reachable only with a manager code (ADR 0008). */
export const MAX_REMISE_PCT = 20;

/**
 * Pure. The three discount mechanisms stack and can bring the total to 0 F. Order matters because
 * one is a percentage: (1) the receptionist's granted discount, always figured against the
 * *prestations* total (services only — products are never discounted this way) and capped at
 * MAX_REMISE_PCT; (2) loyalty points; (3) the gift card last, clamped to whatever is still owed so
 * its unused value (`giftCardRemaining`) stays on the card. Used by the cart, payment step, receipt
 * and the header pastille.
 *
 * `depositPaid` (an acompte already settled on the external platform, ADR 0015) is deducted last,
 * *after* the discount chain — it isn't a Remise, it doesn't change what the sale is worth, only
 * how much of it is still to be asked for (`amountDue`). Points earned at `confirmPayment` are
 * still computed against `total`, not `amountDue` — the cliente bought the full sale.
 */
export function computeTotals(sale: Sale) {
  const prestations = sale.cart.filter((l) => l.kind === "service").reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const produits = sale.cart.filter((l) => l.kind === "produit").reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const subtotal = prestations + produits;

  const maxGrantedDiscount = Math.round((prestations * MAX_REMISE_PCT) / 100);
  const receptionistMaxDiscount = Math.round((prestations * RECEPTIONIST_MAX_PCT) / 100);
  const g = sale.discountGranted;
  const grantedDiscount = !g
    ? 0
    : g.mode === "pourcentage"
      ? Math.round((prestations * Math.min(Math.max(g.value, 0), MAX_REMISE_PCT)) / 100)
      : Math.min(Math.max(g.value, 0), maxGrantedDiscount);

  const loyaltyDiscount = Math.floor(sale.loyaltyPointsUsed / 100) * 1000;

  const beforeGiftCard = Math.max(0, subtotal - grantedDiscount - loyaltyDiscount);
  const gc = sale.giftCardApplied;
  // What this card is willing to take off *this* ticket, before the "still owed" clamp.
  let giftCardCap = 0;
  let giftCardCovered = 0; // for a prestations card: value of the covered lines in the cart
  if (gc) {
    if (gc.kind === "prestations") {
      const covered = gc.coveredServiceIds ?? gc.serviceIds ?? [];
      giftCardCovered = sale.cart
        .filter((l) => l.kind === "service" && covered.includes(l.refId))
        .reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
      giftCardCap = Math.min(gc.balance, giftCardCovered);
    } else {
      giftCardCap = Math.min(gc.balance, gc.appliedAmount ?? gc.balance);
    }
  }
  const giftCardDiscount = Math.min(Math.max(0, giftCardCap), beforeGiftCard);
  const giftCardRemaining = gc ? gc.balance - giftCardDiscount : 0;

  const total = beforeGiftCard - giftCardDiscount;
  const totalDiscount = grantedDiscount + loyaltyDiscount + giftCardDiscount;

  const depositPaid = sale.depositPaid ?? 0;
  const amountDue = Math.max(0, total - depositPaid);

  return {
    subtotal,
    prestations,
    produits,
    grantedDiscount,
    loyaltyDiscount,
    giftCardDiscount,
    giftCardRemaining,
    giftCardCovered,
    maxGrantedDiscount,
    receptionistMaxDiscount,
    totalDiscount,
    total,
    depositPaid,
    amountDue,
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
  /** Produits en rayon with their live stock — decremented at `confirmPayment`. Read by the Menu
   *  panel (blocks adding a produit at 0) and the Catalogue "Produits" volet. Session-only. */
  produits: Produit[];
  sales: Sale[];
  openTabIds: string[];
  activeSaleId: string | null;
  comptoirDeployed: boolean;
  /** Client ids most recently opened on this station, newest first — powers "Vues récemment" on
   *  the Clientèle landing. Session-only, capped, no persistence (consistent with the rest of the store). */
  recentClientIds: string[];
  /** One message thread per cliente (ADR 0011). The receptionist can take a thread over and write,
   *  hand it back to the Conseillère, or transfer it to the direction (terminal). Scheduled
   *  relances stay defined in the direction's back-office — the app only writes *into* a thread. */
  conversations: Conversation[];
  /** Printed gift cards bought on the external platform, awaiting preparation (ADR 0012). Reactive
   *  so marking one handed-over drops its row from the queue immediately. */
  giftCardOrders: GiftCardOrder[];

  // Clients
  addClient: (data: Omit<Cliente, "id" | "loyaltyCode" | "points" | "totalSpent" | "totalVisits" | "createdAt" | "tier">) => Cliente;
  updateClient: (id: string, patch: Partial<Cliente>) => void;
  findDuplicatePhone: (phone: string) => Cliente | undefined;
  /** Record that a cliente's fiche was opened (called from FicheClienteView). */
  noteClientViewed: (id: string) => void;

  // Rendez-vous (atomic, nested inside their Réservation). No création de réservation here — the
  // booking journey lives on the external platform. But the receptionist adjusts what arrives
  // (ADR 0009): reschedule, reassign, swap prestation / bénéficiaire, add / remove a rendez-vous,
  // cancel with a reason. The one hard block is a praticienne double-booked (findStaffClash).
  cancelAppointment: (rvId: string, reason?: string) => void;
  rescheduleRendezVous: (rvId: string, start: string) => { ok: boolean; message: string };
  updateRendezVous: (
    rvId: string,
    patch: Partial<Pick<RendezVous, "serviceId" | "staffId" | "secondStaffId" | "beneficiaryClientId" | "beneficiaryName" | "durationMin">>,
  ) => { ok: boolean; message: string };
  addRendezVous: (
    reservationId: string,
    data: Pick<RendezVous, "serviceId" | "staffId" | "start"> &
      Partial<Pick<RendezVous, "secondStaffId" | "beneficiaryClientId" | "beneficiaryName" | "durationMin">>,
  ) => { ok: boolean; message: string };
  removeRendezVous: (rvId: string) => void;
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
  /** Adjust how much of an applied gift card this ticket consumes:
   *  - a `montant` card → `appliedAmount` (clamped to [0, balance]);
   *  - a `prestations` card → `coveredServiceIds` (subset of the card's prestations). */
  setGiftCardAdjustment: (
    saleId: string,
    patch: { appliedAmount?: number; coveredServiceIds?: string[] },
  ) => void;
  /** Validate a receptionist's personal code and attach a discretionary discount: ≤ 10 % of the
   *  prestations with her code alone, up to 20 % with a `managerCode` (ADR 0008). The `reason` is
   *  captured later, after the sale is cashed in. */
  grantDiscount: (
    saleId: string,
    code: string,
    mode: RemiseMode,
    value: number,
    managerCode?: string,
  ) => { ok: boolean; message: string };
  /** Store the free-text justification for a granted discount (the post-payment step). */
  setDiscountReason: (saleId: string, reason: string) => void;
  setLoyaltyPointsUsed: (saleId: string, points: number) => void;
  confirmPayment: (saleId: string, modes: { mode: PaymentMode; amount: number }[]) => void;
  activeSale: () => Sale | undefined;

  // Messages (ADR 0011)
  /** Receptionist takes a thread over — she now writes; that cliente's pending relances are held. */
  takeOverConversation: (convId: string) => void;
  /** Hand a thread back to the Conseillère (never back to `auto`). */
  handBackToConseillere: (convId: string) => void;
  /** Transfer a thread to the direction — terminal, the thread leaves the app and freezes. */
  transferToDirection: (convId: string) => void;
  /** Append a receptionist message; no-op unless the thread is `receptionniste`. Scripts one
   *  client reply back after ~1.5s (prototype, like the scanner demo). */
  sendClientMessage: (convId: string, body: string) => void;
  /** A client reply has been seen — clears the amber signal. */
  markConversationRead: (convId: string) => void;

  // Cartes cadeaux à préparer (ADR 0012)
  /** `a_imprimer → imprimee`. No-op past that. The actual print fires in the component. */
  printGiftCardOrder: (orderId: string) => void;
  /** `imprimee → remise` (retrait) / `→ livree` (livraison) — the order leaves the queue. */
  markGiftCardOrderHandedOver: (orderId: string) => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  clients: CLIENTS,
  reservations: RESERVATIONS,
  praticiennes: PRATICIENNES,
  produits: PRODUITS,
  sales: [],
  openTabIds: [],
  activeSaleId: null,
  comptoirDeployed: false,
  recentClientIds: [],
  conversations: CONVERSATIONS,
  giftCardOrders: GIFT_CARD_ORDERS,

  addClient: (data) => {
    const client: Cliente = {
      ...data,
      id: nextId("cl"),
      loyaltyCode: `BACO-FID-${Math.floor(1000 + Math.random() * 9000)}`,
      tier: null,
      points: 0,
      totalSpent: 0,
      totalVisits: 0,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ clients: [client, ...s.clients] }));
    return client;
  },

  updateClient: (id, patch) => set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

  findDuplicatePhone: (phone) => get().clients.find((c) => c.phone.replace(/\s/g, "") === phone.replace(/\s/g, "")),

  noteClientViewed: (id) =>
    set((s) => ({ recentClientIds: [id, ...s.recentClientIds.filter((x) => x !== id)].slice(0, 8) })),

  cancelAppointment: (rvId, reason) =>
    set((s) => ({
      reservations: patchRendezVous(s.reservations, rvId, {
        status: "annule",
        ...(reason?.trim() ? { cancelReason: reason.trim() } : {}),
      }),
    })),

  rescheduleRendezVous: (rvId, start) => {
    const { reservations } = get();
    const rv = reservations.flatMap((r) => r.rendezVous).find((x) => x.id === rvId);
    if (!rv) return { ok: false, message: "Rendez-vous introuvable." };
    if (!/^\d{2}:\d{2}$/.test(start)) return { ok: false, message: "Indiquez une heure valide (HH:MM)." };
    const staffIds = [rv.staffId, rv.secondStaffId].filter(Boolean) as string[];
    const clash = findStaffClash(reservations, rvId, { staffIds, start, durationMin: rv.durationMin });
    if (clash) {
      const who = get().praticiennes.find((p) => p.id === clash.staffId)?.name ?? "La praticienne";
      return { ok: false, message: `${who} a déjà un rendez-vous à ${clash.other.start} — choisissez un autre créneau.` };
    }
    set((s) => ({ reservations: patchRendezVous(s.reservations, rvId, { start }) }));
    return { ok: true, message: "Rendez-vous reprogrammé." };
  },

  updateRendezVous: (rvId, patch) => {
    const { reservations } = get();
    const rv = reservations.flatMap((r) => r.rendezVous).find((x) => x.id === rvId);
    if (!rv) return { ok: false, message: "Rendez-vous introuvable." };

    const next: RendezVous = { ...rv, ...patch };
    // Changing the prestation carries its duration unless the caller set one explicitly.
    if (patch.serviceId && patch.durationMin === undefined) {
      next.durationMin = serviceById(patch.serviceId)?.durationMinutes ?? rv.durationMin;
    }
    // A bénéficiaire is one or the other, never both.
    if (patch.beneficiaryClientId) next.beneficiaryName = undefined;
    if (patch.beneficiaryName) next.beneficiaryClientId = undefined;

    if (patch.staffId || patch.secondStaffId !== undefined || patch.serviceId || patch.durationMin !== undefined) {
      const staffIds = [next.staffId, next.secondStaffId].filter(Boolean) as string[];
      const clash = findStaffClash(reservations, rvId, { staffIds, start: next.start, durationMin: next.durationMin });
      if (clash) {
        const who = get().praticiennes.find((p) => p.id === clash.staffId)?.name ?? "La praticienne";
        return { ok: false, message: `${who} est déjà prise à ${clash.other.start} — impossible sur ce créneau.` };
      }
    }
    set((s) => ({ reservations: patchRendezVous(s.reservations, rvId, next) }));
    return { ok: true, message: "Rendez-vous modifié." };
  },

  addRendezVous: (reservationId, data) => {
    const { reservations } = get();
    const reservation = reservationById(reservations, reservationId);
    if (!reservation) return { ok: false, message: "Réservation introuvable." };
    const durationMin = data.durationMin ?? serviceById(data.serviceId)?.durationMinutes ?? 30;
    const staffIds = [data.staffId, data.secondStaffId].filter(Boolean) as string[];
    const clash = findStaffClash(reservations, "", { staffIds, start: data.start, durationMin });
    if (clash) {
      const who = get().praticiennes.find((p) => p.id === clash.staffId)?.name ?? "La praticienne";
      return { ok: false, message: `${who} a déjà un rendez-vous à ${clash.other.start} — choisissez un autre créneau.` };
    }
    const rv: RendezVous = {
      id: nextId("rdv"),
      reservationId,
      serviceId: data.serviceId,
      staffId: data.staffId,
      start: data.start,
      durationMin,
      status: "actif",
      ...(data.secondStaffId ? { secondStaffId: data.secondStaffId } : {}),
      ...(data.beneficiaryClientId ? { beneficiaryClientId: data.beneficiaryClientId } : {}),
      ...(data.beneficiaryName ? { beneficiaryName: data.beneficiaryName } : {}),
    };
    set((s) => ({
      reservations: s.reservations.map((r) => (r.id === reservationId ? { ...r, rendezVous: [...r.rendezVous, rv] } : r)),
    }));
    return { ok: true, message: "Rendez-vous ajouté à la réservation." };
  },

  removeRendezVous: (rvId) =>
    set((s) => ({
      reservations: s.reservations.map((r) => {
        if (!r.rendezVous.some((rv) => rv.id === rvId)) return r;
        return { ...r, rendezVous: r.rendezVous.filter((rv) => rv.id !== rvId) };
      }),
    })),

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
        if (reservation.depositPaid) sale.depositPaid = reservation.depositPaid;

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
    set((s) => {
      // A produit can't be added past what's left in the salon; a prestation is capped at 20.
      const produit = line.kind === "produit" ? s.produits.find((p) => p.id === line.refId) : undefined;
      const max = produit ? produit.stock : 20;
      return {
        sales: s.sales.map((sale) => {
          if (sale.id !== saleId) return sale;
          const existing = sale.cart.find((l) => l.refId === line.refId);
          if (existing) {
            return { ...sale, cart: sale.cart.map((l) => (l.id === existing.id ? { ...l, qty: Math.min(max, l.qty + 1) } : l)) };
          }
          if (max < 1) return sale;
          return { ...sale, cart: [...sale.cart, { ...line, id: nextId("line"), qty: 1 }] };
        }),
      };
    }),

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

    const applied: NonNullable<Sale["giftCardApplied"]> =
      card.kind === "prestations"
        ? {
            code: card.code,
            balance: card.balance,
            kind: "prestations",
            serviceIds: card.serviceIds ?? [],
            coveredServiceIds: card.serviceIds ?? [],
          }
        : { code: card.code, balance: card.balance, kind: "montant" };

    const patch: Partial<Sale> = { giftCardApplied: applied, giftCardCode: "" };

    // Both cards identify (ADR 0013): a card that names a holder attaches her fiche — unless the
    // sale already has a cliente, which always wins (she's the one in front).
    let identified: Cliente | undefined;
    if (card.holderClientId && !sale?.clientId) {
      identified = get().clients.find((c) => c.id === card.holderClientId);
      if (identified) patch.clientId = identified.id;
    }

    get().updateSale(saleId, patch);

    const head =
      replaced && replaced.code !== card.code
        ? `Remplace la carte « ${replaced.code} ».`
        : `Carte « ${card.code} » appliquée.`;
    const idNote = identified ? ` Cliente identifiée : ${identified.firstName} ${identified.lastName}.` : "";
    const kindNote =
      card.kind === "prestations"
        ? " Carte prestations — ajustez les soins couverts dans la Remise."
        : ` Solde ${formatFcfa(card.balance)} — ajustez le montant appliqué dans la Remise.`;
    return { ok: true, message: head + idNote + kindNote };
  },

  setGiftCardAdjustment: (saleId, patch) =>
    set((s) => ({
      sales: s.sales.map((sale) => {
        if (sale.id !== saleId || !sale.giftCardApplied) return sale;
        const gc = sale.giftCardApplied;
        const next = { ...gc };
        if (patch.appliedAmount !== undefined) {
          next.appliedAmount = Math.min(Math.max(0, Math.round(patch.appliedAmount)), gc.balance);
        }
        if (patch.coveredServiceIds !== undefined) {
          const allowed = new Set(gc.serviceIds ?? []);
          next.coveredServiceIds = patch.coveredServiceIds.filter((id) => allowed.has(id));
        }
        return { ...sale, giftCardApplied: next };
      }),
    })),

  grantDiscount: (saleId, code, mode, value, managerCode) => {
    const trimmed = code.trim();
    if (trimmed.length < 4) return { ok: false, message: "Entrez votre code réceptionniste." };
    const sale = get().sales.find((s) => s.id === saleId);
    if (!sale) return { ok: false, message: "Vente introuvable." };
    const { prestations, maxGrantedDiscount, receptionistMaxDiscount } = computeTotals(sale);
    if (prestations <= 0) return { ok: false, message: "Ajoutez une prestation avant d'accorder une remise." };
    if (!Number.isFinite(value) || value <= 0) return { ok: false, message: "Indiquez le montant ou le pourcentage de la remise." };

    // The request as a share of the prestations, whichever way it was entered.
    const requestedPct = mode === "pourcentage" ? value : (value / prestations) * 100;
    const mgr = managerCode?.trim() ?? "";

    if (requestedPct > MAX_REMISE_PCT + 1e-6) {
      return mode === "pourcentage"
        ? { ok: false, message: `${MAX_REMISE_PCT} % est le plafond absolu — aucune remise plus forte n'est possible ici.` }
        : { ok: false, message: `Le maximum absolu sur ce panier est ${formatFcfa(maxGrantedDiscount)} — ${MAX_REMISE_PCT} % des prestations.` };
    }
    if (requestedPct > RECEPTIONIST_MAX_PCT + 1e-6) {
      if (!mgr) {
        return mode === "pourcentage"
          ? { ok: false, message: `Au-delà de ${RECEPTIONIST_MAX_PCT} %, saisissez le code manager.` }
          : { ok: false, message: `Au-delà de ${formatFcfa(receptionistMaxDiscount)} (${RECEPTIONIST_MAX_PCT} % des prestations), saisissez le code manager.` };
      }
      if (!/^\d{4,6}$/.test(mgr)) {
        return { ok: false, message: "Le code manager doit faire 4 à 6 chiffres." };
      }
    }

    get().updateSale(saleId, {
      discountGranted: {
        mode,
        value,
        grantedByCode: trimmed.toUpperCase(),
        ...(requestedPct > RECEPTIONIST_MAX_PCT && mgr ? { managerCode: mgr } : {}),
        reason: null,
      },
    });
    return {
      ok: true,
      message: mgr
        ? "Remise accordée avec le code manager. Le motif vous sera demandé après l'encaissement."
        : "Remise accordée. Le motif vous sera demandé après l'encaissement.",
    };
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
      // Take the produits sold off the shelf — their stock is now real for the next sale.
      produits: s.produits.map((p) => {
        const line = sale.cart.find((l) => l.kind === "produit" && l.refId === p.id);
        return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
      }),
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

  // ── Messages (ADR 0011) ────────────────────────────────────────────────
  takeOverConversation: (convId) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === convId && c.state !== "direction" ? { ...c, state: "receptionniste" } : c,
      ),
    })),

  handBackToConseillere: (convId) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === convId && c.state === "receptionniste" ? { ...c, state: "conseillere" } : c,
      ),
    })),

  transferToDirection: (convId) =>
    set((s) => ({
      conversations: s.conversations.map((c) => (c.id === convId ? { ...c, state: "direction" } : c)),
    })),

  markConversationRead: (convId) =>
    set((s) => ({
      conversations: s.conversations.map((c) => (c.id === convId && c.unread ? { ...c, unread: false } : c)),
    })),

  sendClientMessage: (convId, body) => {
    const text = body.trim();
    if (!text) return;
    const conv = get().conversations.find((c) => c.id === convId);
    if (!conv || conv.state !== "receptionniste") return;
    const now = new Date().toISOString();
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: [
                ...c.messages,
                { id: `m-${convId}-${c.messages.length + 1}`, sender: "receptionniste", channel: c.channel, at: now, body: text },
              ],
            }
          : c,
      ),
    }));
    // Scripted client reply, like the scanner demo — one line, once, after a short delay.
    setTimeout(() => {
      set((s) => ({
        conversations: s.conversations.map((c) =>
          c.id === convId
            ? {
                ...c,
                unread: true,
                messages: [
                  ...c.messages,
                  {
                    id: `m-${convId}-${c.messages.length + 1}`,
                    sender: "cliente",
                    channel: c.channel,
                    at: new Date().toISOString(),
                    body: "Merci, c'est noté 🙏",
                  },
                ],
              }
            : c,
        ),
      }));
    }, 1500);
  },

  // ── Cartes cadeaux à préparer (ADR 0012) ───────────────────────────────
  printGiftCardOrder: (orderId) =>
    set((s) => ({
      giftCardOrders: s.giftCardOrders.map((o) =>
        o.id === orderId && o.status === "a_imprimer" ? { ...o, status: "imprimee" } : o,
      ),
    })),

  markGiftCardOrderHandedOver: (orderId) =>
    set((s) => ({
      giftCardOrders: s.giftCardOrders.map((o) =>
        o.id === orderId && o.status === "imprimee"
          ? { ...o, status: o.fulfillment === "retrait" ? "remise" : "livree" }
          : o,
      ),
    })),
}));
