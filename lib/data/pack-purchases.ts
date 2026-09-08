import type { PackPurchase } from "@/lib/data/types";
import { packById } from "@/lib/data/packs";

/* ────────────────────────────────────────────────────────────────────────────
   Mock ledger — Packs achetés hors app (plateforme b&co). Mêmes règles que les
   Abonnements : cette liste est toute la « base », mutée sur place au décompte,
   remise à zéro par un refresh. Un Pack n'expire jamais et ne se recharge jamais
   — `redeemedPrestationIds` ne fait que grandir. ADR 0017.
   ──────────────────────────────────────────────────────────────────────────── */

export const PACK_PURCHASES: PackPurchase[] = [
  // cl-1 — Cocooning Duo intact (couvre le Soin du dos de sa réservation du jour).
  { id: "pp-1", packId: "cocooning-duo", ownerClientId: "cl-1", purchasedAt: "2026-08-12", redeemedPrestationIds: [] },
  // cl-2 — Éclat Express intact (couvre son Shampoing Brushing du jour).
  { id: "pp-2", packId: "eclat-express", ownerClientId: "cl-2", purchasedAt: "2026-08-25", redeemedPrestationIds: [] },
  // cl-6 — Glow Total entamé : l'épilation complète déjà consommée.
  {
    id: "pp-3",
    packId: "glow-total",
    ownerClientId: "cl-6",
    purchasedAt: "2026-07-30",
    redeemedPrestationIds: ["epilation-pack-epilations-completes"],
  },
  // cl-7 — Beauté des Mains entamé : la Pédicure Me Spa déjà consommée.
  {
    id: "pp-4",
    packId: "beaute-des-mains",
    ownerClientId: "cl-7",
    purchasedAt: "2026-08-05",
    redeemedPrestationIds: ["manucure-pedicure-pedicure-me-spa"],
  },
  // cl-4 — Beauté des Mains entièrement utilisé (état « épuisé » sur la fiche).
  {
    id: "pp-5",
    packId: "beaute-des-mains",
    ownerClientId: "cl-4",
    purchasedAt: "2026-05-01",
    redeemedPrestationIds: [
      "manucure-pedicure-manucure-spa-express",
      "manucure-pedicure-pedicure-me-spa",
      "onglerie-remplissage-gel",
    ],
  },
];

export function packPurchaseById(id: string): PackPurchase | undefined {
  return PACK_PURCHASES.find((p) => p.id === id);
}

export function packPurchasesForClient(clientId: string | null | undefined): PackPurchase[] {
  if (!clientId) return [];
  return PACK_PURCHASES.filter((p) => p.ownerClientId === clientId);
}

/** Prestations pas encore consommées d'un achat de pack. */
export function packRemainingPrestations(pp: PackPurchase): string[] {
  const pack = packById(pp.packId);
  if (!pack) return [];
  return pack.prestationIds.filter((id) => !pp.redeemedPrestationIds.includes(id));
}

export function packFullyUsed(pp: PackPurchase): boolean {
  return packRemainingPrestations(pp).length === 0;
}
