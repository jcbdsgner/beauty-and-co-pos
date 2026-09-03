import type { CarteCadeau, GiftCardOrder } from "@/lib/data/types";

/* ────────────────────────────────────────────────────────────────────────────
   Mock gift-card ledger. A carte cadeau is a PREPAID instrument, not a discount:
   it carries its own stored `balance`, the sale consumes only what it needs, and
   whatever is left stays on the card (the reliquat). No backend — this list is
   the whole "database", and a page refresh resets any balance a sale spent.
   ──────────────────────────────────────────────────────────────────────────── */

export const CARTES_CADEAUX: CarteCadeau[] = [
  // Montant cards — a free balance to spend. Some carry a holder (identify at the counter), some
  // are pure bearer cards (offered to someone not on file).
  { code: "BACO-GIFT-25000", balance: 25000, status: "active", kind: "montant" },
  { code: "BACO-GIFT-30000", balance: 30000, status: "active", kind: "montant" },
  { code: "BACO-GIFT-50000", balance: 50000, status: "active", kind: "montant" },
  { code: "BACO-NOEL-15000", balance: 15000, status: "active", kind: "montant" },
  { code: "BACO-ANNIV-20000", balance: 20000, status: "active", kind: "montant", holderClientId: "cl-1" },
  { code: "BACO-SOIN-8000", balance: 8000, status: "active", kind: "montant", holderClientId: "cl-3" },
  { code: "BACO-EXPIRED", balance: 20000, status: "expired", expiresOn: "2025-12-31", kind: "montant" },
  { code: "BACO-USED", balance: 0, status: "used", kind: "montant" },
  // Prestations card — pays for a fixed set of services, `balance` is their value at purchase.
  {
    code: "BACO-DUO-EVASION",
    balance: 109000,
    status: "active",
    kind: "prestations",
    serviceIds: ["soin-du-visage-glow-me-facial", "spa-relax-me-time"],
    holderClientId: "cl-2",
  },
];

/**
 * Gift cards bought (and paid) on the external platform in a printed version — the salon's
 * preparation queue (ADR 0012). In the store as a reactive slice: marking one "remise" / "livrée"
 * must drop its row from the queue on screen right away.
 */
export const GIFT_CARD_ORDERS: GiftCardOrder[] = [
  {
    id: "gco-1",
    buyerClientId: "cl-1",
    code: "BACO-ANNIV-20000",
    amount: 20000,
    fulfillment: "retrait",
    orderedAt: "2026-09-01",
    status: "a_imprimer",
  },
  {
    id: "gco-2",
    buyerClientId: "cl-3",
    code: "BACO-SOIN-8000",
    amount: 8000,
    fulfillment: "retrait",
    orderedAt: "2026-08-30",
    status: "imprimee",
  },
  {
    id: "gco-3",
    buyerClientId: "cl-5",
    code: "BACO-GIFT-30000",
    amount: 30000,
    fulfillment: "livraison",
    orderedAt: "2026-08-31",
    status: "a_imprimer",
    recipientName: "Aïda Ndiaye",
    recipientPhone: "+221 77 412 08 55",
    deliveryAddress: "Cité Aliou Sow, Almadies, Dakar",
  },
  {
    id: "gco-4",
    buyerClientId: "cl-7",
    code: "BACO-GIFT-25000",
    amount: 25000,
    fulfillment: "livraison",
    orderedAt: "2026-08-29",
    status: "a_imprimer",
    recipientName: "Mame Diarra Fall",
    recipientPhone: "+221 78 630 22 14",
    deliveryAddress: "Rue de Ngor, en face de la mosquée, Ngor, Dakar",
  },
  {
    id: "gco-5",
    buyerClientId: "cl-9",
    code: "BACO-NOEL-15000",
    amount: 15000,
    fulfillment: "livraison",
    orderedAt: "2026-08-28",
    status: "imprimee",
    recipientName: "Bijou Sagna",
    recipientPhone: "+221 76 905 47 32",
    deliveryAddress: "Villa 214, Sicap Mermoz, Dakar",
  },
];

export function normalizeGiftCardCode(raw: string) {
  return raw.trim().toUpperCase();
}

export function carteCadeauByCode(raw: string): CarteCadeau | undefined {
  const code = normalizeGiftCardCode(raw);
  return CARTES_CADEAUX.find((c) => c.code === code);
}

const GIFT_CARD_DATE_FMT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/** French-formatted expiry date for the "carte expirée" message, or null if unknown. */
export function giftCardExpiryLabel(card: CarteCadeau): string | null {
  if (!card.expiresOn) return null;
  const d = new Date(card.expiresOn);
  return Number.isNaN(d.getTime()) ? null : GIFT_CARD_DATE_FMT.format(d);
}

export function giftCardOrderById(id: string): GiftCardOrder | undefined {
  return GIFT_CARD_ORDERS.find((o) => o.id === id);
}
