import { forfaitById } from "@/lib/data/forfaits";
import { packById } from "@/lib/data/packs";
import { abonnementsForClient, abonnementAvailablePrestations } from "@/lib/data/abonnements";
import { packPurchasesForClient, packRemainingPrestations } from "@/lib/data/pack-purchases";
import { factureRemainingServiceIds } from "@/lib/data/devis";
import type { CartLine, Facture, RendezVous, SaleCoverage } from "@/lib/data/types";

/**
 * Auto-detect which cart prestations the payer's Facture(s) payée(s), Pack(s) / Abonnement(s) can
 * cover (ADR 0017, 0042). Facture first (paid ahead for this very visit), then Abonnement before Pack (it recharges next cycle — cheaper to burn), most recent first; one
 * instrument per serviceId; one unit each. Everything it returns is ticked by default — the
 * receptionist un-ticks what the cliente wants to keep for later.
 */
export function detectCoverage(clientId: string | null, cart: CartLine[], factures: Facture[] = []): SaleCoverage[] {
  if (!clientId) return [];
  const serviceIds = cart.filter((l) => l.kind === "service").map((l) => l.refId);
  if (serviceIds.length === 0) return [];

  const claimed = new Set<string>();
  const out: SaleCoverage[] = [];

  // Factures payées d'abord (ADR 0042) : ces prestations ont été réglées d'avance pour ce passage.
  const paid = factures
    .filter((f) => f.clientId === clientId && f.status === "payee")
    .sort((a, b) => (a.paidAt ?? "").localeCompare(b.paidAt ?? ""));
  for (const f of paid) {
    const remaining = factureRemainingServiceIds(f);
    const hit = [...new Set(serviceIds.filter((id) => remaining.includes(id) && !claimed.has(id)))];
    if (hit.length === 0) continue;
    hit.forEach((id) => claimed.add(id));
    out.push({ source: "facture", instanceId: f.id, planId: f.id, planLabel: `Facture ${f.number}`, serviceIds: hit, checkedServiceIds: hit });
  }

  const abos = abonnementsForClient(clientId)
    .filter((a) => abonnementAvailablePrestations(a).length > 0)
    .sort((a, b) => b.subscribedAt.localeCompare(a.subscribedAt));
  for (const ab of abos) {
    const forfait = forfaitById(ab.forfaitId);
    if (!forfait) continue;
    const available = abonnementAvailablePrestations(ab);
    const hit = [...new Set(serviceIds.filter((id) => available.includes(id) && !claimed.has(id)))];
    if (hit.length === 0) continue;
    hit.forEach((id) => claimed.add(id));
    out.push({ source: "abonnement", instanceId: ab.id, planId: forfait.id, planLabel: forfait.label, serviceIds: hit, checkedServiceIds: hit });
  }

  const packs = packPurchasesForClient(clientId).sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));
  for (const pp of packs) {
    const pack = packById(pp.packId);
    if (!pack) continue;
    const remaining = packRemainingPrestations(pp);
    const hit = [...new Set(serviceIds.filter((id) => remaining.includes(id) && !claimed.has(id)))];
    if (hit.length === 0) continue;
    hit.forEach((id) => claimed.add(id));
    out.push({ source: "pack", instanceId: pp.id, planId: pack.id, planLabel: pack.label, serviceIds: hit, checkedServiceIds: hit });
  }

  return out;
}

export type RendezVousCoverage = { source: SaleCoverage["source"]; planLabel: string };

/**
 * Which rendez-vous of a réservation the payer's Pack(s) / Abonnement(s) would cover — same rules
 * as `detectCoverage` (it runs it). Cancelled lines are ignored; every bénéficiaire counts, invitées
 * included (the payer's pack or abonnement can cover someone else's prestation). One unit per
 * serviceId, so when two lines share a serviceId only the earliest by `start` is covered.
 * Keyed by `RendezVous.id`.
 */
export function rendezVousCoverage(
  payerClientId: string | null | undefined,
  lines: RendezVous[],
  factures: Facture[] = [],
): Map<string, RendezVousCoverage> {
  const out = new Map<string, RendezVousCoverage>();
  if (!payerClientId) return out;

  const firstByService = new Map<string, RendezVous>();
  for (const rv of lines.filter((l) => l.status !== "annule").sort((a, b) => a.start.localeCompare(b.start))) {
    if (!firstByService.has(rv.serviceId)) firstByService.set(rv.serviceId, rv);
  }
  const cart: CartLine[] = [...firstByService.values()].map((rv) => ({
    id: rv.id,
    refId: rv.serviceId,
    kind: "service",
    name: "",
    unitPrice: 0,
    qty: 1,
  }));

  for (const cov of detectCoverage(payerClientId, cart, factures)) {
    for (const serviceId of cov.serviceIds) {
      const rv = firstByService.get(serviceId);
      if (rv) out.set(rv.id, { source: cov.source, planLabel: cov.planLabel });
    }
  }
  return out;
}
