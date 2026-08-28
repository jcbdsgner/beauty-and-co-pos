import type { CarteCadeau } from "@/lib/data/types";

/* ────────────────────────────────────────────────────────────────────────────
   Mock gift-card ledger. A carte cadeau is a PREPAID instrument, not a discount:
   it carries its own stored `balance`, the sale consumes only what it needs, and
   whatever is left stays on the card (the reliquat). No backend — this list is
   the whole "database", and a page refresh resets any balance a sale spent.
   ──────────────────────────────────────────────────────────────────────────── */

export const CARTES_CADEAUX: CarteCadeau[] = [
  { code: "BACO-GIFT-25000", balance: 25000, status: "active" },
  { code: "BACO-GIFT-50000", balance: 50000, status: "active" },
  { code: "BACO-NOEL-15000", balance: 15000, status: "active" },
  { code: "BACO-SOIN-8000", balance: 8000, status: "active" },
  { code: "BACO-EXPIRED", balance: 20000, status: "expired", expiresOn: "2025-12-31" },
  { code: "BACO-USED", balance: 0, status: "used" },
];

export function normalizeGiftCardCode(raw: string) {
  return raw.trim().toUpperCase();
}

export function carteCadeauByCode(raw: string): CarteCadeau | undefined {
  const code = normalizeGiftCardCode(raw);
  return CARTES_CADEAUX.find((c) => c.code === code);
}

/** French-formatted expiry date for the "carte expirée" message, or null if unknown. */
export function giftCardExpiryLabel(card: CarteCadeau): string | null {
  if (!card.expiresOn) return null;
  const d = new Date(card.expiresOn);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("fr-FR");
}
