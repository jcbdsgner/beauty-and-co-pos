"use client";

import { useState } from "react";
import { CalendarClock, Gift, PackageCheck, Star } from "lucide-react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { Button } from "@/components/ui/atoms/button";
import { Badge } from "@/components/ui/atoms/badge";
import { Textarea } from "@/components/ui/atoms/textarea";
import { Field } from "@/components/ui/molecules/field";
import { useAppData } from "@/components/providers/app-data-provider";
import { giftCardForClient } from "@/lib/data/cartes-cadeaux";
import { abonnementsForClient, abonnementStatus, ABONNEMENT_STATUS_LABEL } from "@/lib/data/abonnements";
import { forfaitById } from "@/lib/data/forfaits";
import { packPurchasesForClient, packRemainingPrestations } from "@/lib/data/pack-purchases";
import { packById } from "@/lib/data/packs";
import { clientFullName } from "@/lib/data/clientele";
import { boissonById } from "@/lib/data/boissons";
import { produitById, serviceById } from "@/lib/data/menu";
import { rendezVousCoverage, type RendezVousCoverage } from "@/lib/data/coverage";
import { appointmentEndTime, timeToMinutes } from "@/lib/data/planning";
import { formatFcfa } from "@/lib/utils";
import type { BeneficiaryKind, Cliente, Praticienne, Reservation, RendezVous } from "@/lib/data/types";

/* Pièces partagées entre la fiche réservation (panneau latéral, `AppointmentDetailSheet`) et la
 * page détaillée (`ReservationDetailView`, /reservations/[id]) — même lecture, deux densités. */

export type BeneficiaryGroup = {
  key: string;
  label: string;
  href: string | null;
  kind: BeneficiaryKind;
  /** The fiche behind this beneficiary, when known — the payer herself for "Elle-même", or the
   *  linked fiche for a named beneficiary. Powers the Préférences block; stays null for a
   *  beneficiary named free-text (no fiche to read preferences from). */
  client: Cliente | null;
  lines: RendezVous[];
};

/** Same key + kind derivation as `reservationComposition` (lib/data/planning.ts) — the panel's
 *  groups must always match the composition line shown on the Accueil card and the header here. */
export function beneficiaryGroups(lines: RendezVous[], clients: Cliente[], payer: Cliente | undefined): BeneficiaryGroup[] {
  const groups = new Map<string, BeneficiaryGroup>();
  for (const rv of lines) {
    const key = rv.beneficiaryClientId ?? rv.beneficiaryName ?? "__payer__";
    const service = serviceById(rv.serviceId);
    const kind: BeneficiaryKind = service?.categoryId === "mini-co" ? "enfant" : (rv.beneficiaryKind ?? "femme");
    if (!groups.has(key)) {
      const fiche = rv.beneficiaryClientId ? clients.find((c) => c.id === rv.beneficiaryClientId) : undefined;
      // Le nom de la payeuse plutôt qu'un générique « Elle-même » (audit UX du 19/09). Pour un
      // bénéficiaire sans fiche, son prénom sans la précision de lien de parenté entre parenthèses
      // (ex. « sœur ») — non pertinente, non récupérable dans les données de l'app.
      const label =
        key === "__payer__"
          ? payer
            ? clientFullName(payer)
            : "Elle-même"
          : fiche
            ? clientFullName(fiche)
            : (rv.beneficiaryName ?? "Bénéficiaire").replace(/\s*\([^)]*\)\s*$/, "");
      const client = key === "__payer__" ? (payer ?? null) : (fiche ?? null);
      groups.set(key, { key, label, href: fiche ? `/clientele/${fiche.id}` : null, kind, client, lines: [] });
    }
    groups.get(key)!.lines.push(rv);
  }
  return [...groups.values()].sort((a, b) => {
    const aStart = Math.min(...a.lines.map((rv) => timeToMinutes(rv.start)));
    const bStart = Math.min(...b.lines.map((rv) => timeToMinutes(rv.start)));
    return aStart - bStart;
  });
}

const pad = (n: number) => String(n).padStart(2, "0");
export const fmtMin = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

/** « 1 h 30 » / « 45 min » — durée sur chaise d'un rendez-vous. */
export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${pad(m)}` : `${h} h`;
}

/** « Jeu. 25 sept » — short fr-FR day for the header's slot line (no trailing abbreviation dot). */
export function formatShortDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const label = new Date(y, m - 1, d)
    .toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })
    .replace(/\.$/, "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function staffLabel(rv: RendezVous, praticiennes: Praticienne[]) {
  const first = praticiennes.find((p) => p.id === rv.staffId)?.name ?? "Inconnue";
  const second = rv.secondStaffId ? praticiennes.find((p) => p.id === rv.secondStaffId)?.name : null;
  return second ? `${first} + ${second} · à 2` : first;
}

/** Montants et bornes horaires d'une réservation — une seule source pour le panneau et la page. */
export function reservationFigures(reservation: Reservation | undefined, lines: RendezVous[]) {
  const extras = reservation?.extras ?? [];
  // Lignes décomptées d'un pack / abonnement : facturées 0 F (ADR 0017), hors Total et sous-totaux.
  const coverage = reservation ? rendezVousCoverage(reservation.payerClientId, lines) : new Map<string, RendezVousCoverage>();
  const billable = (rv: RendezVous) => rv.status !== "annule" && !coverage.has(rv.id);
  const linePrice = (rv: RendezVous) => serviceById(rv.serviceId)?.price ?? 0;
  const prestationsTotal = lines.filter(billable).reduce((sum, rv) => sum + linePrice(rv), 0);
  const coveredTotal = lines
    .filter((rv) => rv.status !== "annule" && coverage.has(rv.id))
    .reduce((sum, rv) => sum + linePrice(rv), 0);
  const extrasTotal = extras.reduce((sum, extra) => {
    const unitPrice = extra.kind === "boisson" ? (boissonById(extra.refId)?.price ?? 0) : (produitById(extra.refId)?.price ?? 0);
    return sum + unitPrice * extra.qty;
  }, 0);
  const startTimes = lines.map((rv) => timeToMinutes(rv.start));
  const endTimes = lines.map((rv) => timeToMinutes(appointmentEndTime(rv)));
  return {
    extras,
    coverage,
    billable,
    prestationsTotal,
    coveredTotal,
    extrasTotal,
    total: prestationsTotal + extrasTotal,
    rangeStart: startTimes.length ? Math.min(...startTimes) : 0,
    rangeEnd: endTimes.length ? Math.max(...endTimes) : 0,
  };
}

/** One advantage on the payer's always-visible summary line — a compact segment (icon, label,
 *  optional trailing status badge) rather than a full row: the detail lives on her fiche. */
function AvantageChip({
  icon,
  children,
  badge,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  badge?: { label: string; tone: "warning" | "neutral" };
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm bg-[var(--color-gray-50)] py-1 pr-2.5 pl-2 text-xs font-semibold text-[var(--color-gray-700)] ring-1 ring-inset ring-[var(--board-groove)]">
      <span className="text-[var(--brand-taupe-muted)]">{icon}</span>
      <span className="tabular-nums">{children}</span>
      {badge && <Badge variant={badge.tone}>{badge.label}</Badge>}
    </span>
  );
}

/** Points, carte cadeau, packs et abonnements de la payeuse — rien si elle n'a aucun avantage. */
export function PayerAvantages({ payer, className }: { payer: Cliente; className?: string }) {
  const giftCard = giftCardForClient(payer.id);
  const abonnements = abonnementsForClient(payer.id).filter((ab) => abonnementStatus(ab) !== "revoque");
  const packs = packPurchasesForClient(payer.id).filter((pp) => packRemainingPrestations(pp).length > 0);
  if (!giftCard && payer.points <= 0 && !abonnements.length && !packs.length) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {payer.points > 0 && <AvantageChip icon={<Star className="size-3.5" />}>{payer.points} pts</AvantageChip>}
      {giftCard && (
        <AvantageChip icon={<Gift className="size-3.5" />}>
          Carte cadeau · {giftCard.kind === "montant" ? formatFcfa(giftCard.balance) : "prestations prépayées"}
        </AvantageChip>
      )}
      {packs.map((pp) => {
        const pack = packById(pp.packId);
        if (!pack) return null;
        const remaining = packRemainingPrestations(pp).length;
        return (
          <AvantageChip key={pp.id} icon={<PackageCheck className="size-3.5" />}>
            {pack.label} · {remaining} restante{remaining > 1 ? "s" : ""} sur {pack.prestationIds.length}
          </AvantageChip>
        );
      })}
      {abonnements.map((ab) => {
        const forfait = forfaitById(ab.forfaitId);
        if (!forfait) return null;
        const status = abonnementStatus(ab);
        return (
          <AvantageChip
            key={ab.id}
            icon={<CalendarClock className="size-3.5" />}
            badge={{ label: ABONNEMENT_STATUS_LABEL[status], tone: status === "a_regler" ? "warning" : "neutral" }}
          >
            {forfait.label}
          </AvantageChip>
        );
      })}
    </div>
  );
}

/** « Annuler cette réservation ? » — motif facultatif, toutes les prestations passent Annulé. */
export function CancelReservationDialog({
  open,
  reservationId,
  hasSale,
  onClose,
  onCancelled,
}: {
  open: boolean;
  reservationId: string | undefined;
  hasSale: boolean;
  onClose: () => void;
  onCancelled: () => void;
}) {
  const { cancelReservation } = useAppData();
  const [cancelReason, setCancelReason] = useState("");

  return (
    <Dialog open={open} labelledBy="cancel-reservation-title" className="max-w-sm p-6">
      <h3 id="cancel-reservation-title" className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-gray-900)]">
        Annuler cette réservation ?
      </h3>
      <p className="mt-2 text-sm text-[var(--color-gray-500)]">
        {hasSale
          ? "Une vente est ouverte pour cette réservation — l'annuler ne la fermera pas."
          : "Toutes ses prestations passeront au statut Annulé et resteront consultables via « Afficher les annulés »."}
      </p>
      <Field label="Motif (facultatif)" className="mt-4">
        <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={2} placeholder="Ex. la cliente a décalé sa venue" />
      </Field>
      <div className="mt-4 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Retour
        </Button>
        <Button
          variant="danger"
          className="flex-1"
          onClick={() => {
            if (reservationId) cancelReservation(reservationId, cancelReason);
            setCancelReason("");
            onCancelled();
          }}
        >
          Annuler la réservation
        </Button>
      </div>
    </Dialog>
  );
}
