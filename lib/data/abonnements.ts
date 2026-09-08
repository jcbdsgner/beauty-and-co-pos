import type { Abonnement } from "@/lib/data/types";
import { forfaitById } from "@/lib/data/forfaits";

/* ────────────────────────────────────────────────────────────────────────────
   Mock ledger — Abonnements souscrits hors app (plateforme b&co). Aucun backend :
   cette liste est toute la « base ». Elle est mutée sur place à « Confirmer
   l'encaissement » (redeemedPrestationIds) et remise à zéro par un refresh.
   ADR 0017.
   ──────────────────────────────────────────────────────────────────────────── */

export const ABONNEMENTS: Abonnement[] = [
  // cl-1 — à jour, rien consommé ce cycle (Mains & Pieds : cycle de 42 j).
  {
    id: "ab-1",
    forfaitId: "mains-et-pieds",
    payerClientId: "cl-1",
    subscribedAt: "2026-06-15",
    lastPaidAt: "2026-08-20",
    revokedAt: null,
    redeemedPrestationIds: [],
  },
  // cl-3 — à jour, une prestation déjà prise ce cycle (le Glow Facial).
  {
    id: "ab-2",
    forfaitId: "eclat-mensuel",
    payerClientId: "cl-3",
    subscribedAt: "2026-02-01",
    lastPaidAt: "2026-08-28",
    revokedAt: null,
    redeemedPrestationIds: ["soin-du-visage-glow-me-facial"],
  },
  // cl-6 — échéance dépassée : « à régler », non décomptable au comptoir.
  {
    id: "ab-3",
    forfaitId: "detente-spa",
    payerClientId: "cl-6",
    subscribedAt: "2026-03-10",
    lastPaidAt: "2026-07-01",
    revokedAt: null,
    redeemedPrestationIds: [],
  },
  // cl-8 — révoqué (fin d'engagement sur la plateforme b&co).
  {
    id: "ab-4",
    forfaitId: "eclat-mensuel",
    payerClientId: "cl-8",
    subscribedAt: "2026-01-05",
    lastPaidAt: "2026-06-05",
    revokedAt: "2026-07-10",
    redeemedPrestationIds: [],
  },
];

export type AbonnementStatus = "a_jour" | "a_regler" | "revoque";

export const ABONNEMENT_STATUS_LABEL: Record<AbonnementStatus, string> = {
  a_jour: "À jour",
  a_regler: "À régler",
  revoque: "Révoqué",
};

export function abonnementById(id: string): Abonnement | undefined {
  return ABONNEMENTS.find((a) => a.id === id);
}

export function abonnementsForClient(clientId: string | null | undefined): Abonnement[] {
  if (!clientId) return [];
  return ABONNEMENTS.filter((a) => a.payerClientId === clientId);
}

/** Prochaine échéance = dernier paiement + la durée de cycle du Forfait. */
export function abonnementNextDueDate(ab: Abonnement): Date | null {
  const forfait = forfaitById(ab.forfaitId);
  if (!forfait) return null;
  const due = new Date(ab.lastPaidAt);
  due.setDate(due.getDate() + forfait.cycleDays);
  return due;
}

export function abonnementStatus(ab: Abonnement): AbonnementStatus {
  if (ab.revokedAt) return "revoque";
  const due = abonnementNextDueDate(ab);
  if (due && due.getTime() <= Date.now()) return "a_regler";
  return "a_jour";
}

/** Prestations encore disponibles ce cycle — contenu du forfait moins ce qui est déjà consommé.
 *  Ne compte que si l'abonnement est à jour et non révoqué. */
export function abonnementAvailablePrestations(ab: Abonnement): string[] {
  if (abonnementStatus(ab) !== "a_jour") return [];
  const forfait = forfaitById(ab.forfaitId);
  if (!forfait) return [];
  return forfait.prestationIds.filter((id) => !ab.redeemedPrestationIds.includes(id));
}
