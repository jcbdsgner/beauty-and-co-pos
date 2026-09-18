"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Coffee,
  ShoppingBag,
  Scissors,
  User,
  Users,
  SlidersHorizontal,
  Gift,
  Star,
  CalendarClock,
  PackageCheck,
} from "lucide-react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Button } from "@/components/ui/atoms/button";
import { Badge } from "@/components/ui/atoms/badge";
import { Textarea } from "@/components/ui/atoms/textarea";
import { Field } from "@/components/ui/molecules/field";
import { FlipChip, Legend } from "@/components/ui/board";
import { EditRendezVousDialog } from "@/components/planning/edit-rendez-vous-dialog";
import { useAppData } from "@/components/providers/app-data-provider";
import { giftCardForClient } from "@/lib/data/cartes-cadeaux";
import { abonnementsForClient, abonnementStatus, ABONNEMENT_STATUS_LABEL } from "@/lib/data/abonnements";
import { forfaitById } from "@/lib/data/forfaits";
import { packPurchasesForClient, packRemainingPrestations } from "@/lib/data/pack-purchases";
import { packById } from "@/lib/data/packs";
import { clientFullName } from "@/lib/data/clientele";
import { boissonById } from "@/lib/data/boissons";
import { produitById, serviceById } from "@/lib/data/menu";
import { appointmentEndTime, reservationComposition, reservationForRendezVous, timeToMinutes } from "@/lib/data/planning";
import { formatFcfa } from "@/lib/utils";
import type { BeneficiaryKind, Cliente, RendezVous } from "@/lib/data/types";

type Props = {
  /** The rendez-vous the receptionist tapped — the panel shows its whole réservation. */
  appointment: RendezVous | null;
  onClose: () => void;
  onEncaisser: (reservationId: string) => void;
};

type BeneficiaryGroup = {
  key: string;
  label: string;
  href: string | null;
  kind: BeneficiaryKind;
  lines: RendezVous[];
};

/** Same key + kind derivation as `reservationComposition` (lib/data/planning.ts) — the panel's
 *  groups must always match the composition line shown on the Accueil card and the header here. */
function beneficiaryGroups(lines: RendezVous[], clients: Cliente[]): BeneficiaryGroup[] {
  const groups = new Map<string, BeneficiaryGroup>();
  for (const rv of lines) {
    const key = rv.beneficiaryClientId ?? rv.beneficiaryName ?? "__payer__";
    const service = serviceById(rv.serviceId);
    const kind: BeneficiaryKind = service?.categoryId === "mini-co" ? "enfant" : (rv.beneficiaryKind ?? "femme");
    if (!groups.has(key)) {
      const fiche = rv.beneficiaryClientId ? clients.find((c) => c.id === rv.beneficiaryClientId) : undefined;
      const label = key === "__payer__" ? "Elle-même" : (fiche ? clientFullName(fiche) : (rv.beneficiaryName ?? "Bénéficiaire"));
      groups.set(key, { key, label, href: fiche ? `/clientele/${fiche.id}` : null, kind, lines: [] });
    }
    groups.get(key)!.lines.push(rv);
  }
  return [...groups.values()].sort((a, b) => {
    const aStart = Math.min(...a.lines.map((rv) => timeToMinutes(rv.start)));
    const bStart = Math.min(...b.lines.map((rv) => timeToMinutes(rv.start)));
    return aStart - bStart;
  });
}

/** Fiche réservation — panneau latéral droit (payeuse, avantages, prestations groupées par
 *  bénéficiaire, praticiennes), avec Encaisser, Modifier et Annuler la réservation entière (motif
 *  facultatif). La création de réservation se fait en ligne (ADR 0006/0009) ; ce panneau se ferme
 *  au clic dehors / Échap — c'est une lecture, rien à y perdre (ADR 0023). */
export function AppointmentDetailSheet({ appointment, onClose, onEncaisser }: Props) {
  const { clients, praticiennes, reservations, cancelReservation } = useAppData();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [editing, setEditing] = useState(false);

  if (!appointment) return null;

  const reservation = reservationForRendezVous(reservations, appointment.id);
  const payer = clients.find((c) => c.id === reservation?.payerClientId);
  const lines = reservation?.rendezVous ?? [appointment];
  const extras = reservation?.extras ?? [];
  const reservationCancelled = lines.length > 0 && lines.every((rv) => rv.status === "annule");
  const hasSale = Boolean(reservation?.saleId);
  const prestationsTotal = lines
    .filter((rv) => rv.status !== "annule")
    .reduce((sum, rv) => sum + (serviceById(rv.serviceId)?.price ?? 0), 0);
  const extrasTotal = extras.reduce((sum, extra) => {
    const unitPrice = extra.kind === "boisson" ? (boissonById(extra.refId)?.price ?? 0) : (produitById(extra.refId)?.price ?? 0);
    return sum + unitPrice * extra.qty;
  }, 0);
  const total = prestationsTotal + extrasTotal;

  const groups = beneficiaryGroups(lines, clients);
  const startTimes = lines.map((rv) => timeToMinutes(rv.start));
  const endTimes = lines.map((rv) => timeToMinutes(appointmentEndTime(rv)));
  const rangeStart = startTimes.length ? Math.min(...startTimes) : 0;
  const rangeEnd = endTimes.length ? Math.max(...endTimes) : 0;
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmtMin = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

  function staffLabel(rv: RendezVous) {
    const first = praticiennes.find((p) => p.id === rv.staffId)?.name ?? "Inconnue";
    const second = rv.secondStaffId ? praticiennes.find((p) => p.id === rv.secondStaffId)?.name : null;
    return second ? `${first} + ${second} · à 2` : first;
  }

  const giftCard = payer ? giftCardForClient(payer.id) : undefined;
  const abonnements = payer
    ? abonnementsForClient(payer.id).filter((ab) => abonnementStatus(ab) !== "revoque")
    : [];
  const packs = payer
    ? packPurchasesForClient(payer.id).filter((pp) => packRemainingPrestations(pp).length > 0)
    : [];
  const hasAvantages = Boolean(giftCard) || (payer && payer.points > 0) || abonnements.length > 0 || packs.length > 0;

  return (
    <>
      <Dialog open variant="side" onClose={onClose} labelledBy="rdv-detail-title" className="relative flex flex-col p-0">
        <CloseButton onClick={onClose} className="text-white/70 hover:bg-white/10 hover:text-white active:bg-white/15" />

        <div className="flex shrink-0 flex-wrap items-center gap-2 bg-[var(--board-slate)] px-6 py-5 text-white">
          {payer ? (
            <Link
              href={`/clientele/${payer.id}`}
              id="rdv-detail-title"
              className="font-[family-name:var(--font-heading)] text-xl font-semibold underline decoration-white/30 decoration-2 underline-offset-4 transition hover:decoration-white/70"
            >
              {clientFullName(payer)}
            </Link>
          ) : (
            <h2 id="rdv-detail-title" className="font-[family-name:var(--font-heading)] text-xl font-semibold">
              Cliente
            </h2>
          )}
          {reservationCancelled && <FlipChip value="Annulé" tone="void" />}
          {hasSale && <FlipChip value="En cours" tone="signal" />}
          <span className="w-full text-[0.7rem] text-white/60">
            {reservation ? `Réservé pour ${reservationComposition(reservation)}` : "Réservée en ligne"}
            {lines.length > 0 && (
              <>
                {" · "}
                {fmtMin(rangeStart)} – {fmtMin(rangeEnd)}
              </>
            )}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {hasAvantages && (
            <div className="border-b border-[var(--board-groove)] px-6 py-4">
              <Legend>Avantages</Legend>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {giftCard && (
                  <Badge variant="neutral" icon={<Gift className="size-3.5" />}>
                    {giftCard.kind === "montant"
                      ? `Carte cadeau · ${formatFcfa(giftCard.balance)}`
                      : `Carte cadeau · ${giftCard.serviceIds?.length ?? 0} prestation${(giftCard.serviceIds?.length ?? 0) > 1 ? "s" : ""}`}
                  </Badge>
                )}
                {payer && payer.points > 0 && (
                  <Badge variant="neutral" icon={<Star className="size-3.5" />}>
                    {payer.points} pts fidélité
                  </Badge>
                )}
                {abonnements.map((ab) => {
                  const forfait = forfaitById(ab.forfaitId);
                  if (!forfait) return null;
                  const status = abonnementStatus(ab);
                  return (
                    <Badge
                      key={ab.id}
                      variant={status === "a_regler" ? "warning" : "neutral"}
                      icon={<CalendarClock className="size-3.5" />}
                    >
                      {forfait.label} · {ABONNEMENT_STATUS_LABEL[status]}
                    </Badge>
                  );
                })}
                {packs.map((pp) => {
                  const pack = packById(pp.packId);
                  if (!pack) return null;
                  const used = pack.prestationIds.length - packRemainingPrestations(pp).length;
                  return (
                    <Badge key={pp.id} variant="neutral" icon={<PackageCheck className="size-3.5" />}>
                      {pack.label} · {used}/{pack.prestationIds.length} utilisées
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col">
            {groups.map((group) => {
              const groupTotal = group.lines
                .filter((rv) => rv.status !== "annule")
                .reduce((sum, rv) => sum + (serviceById(rv.serviceId)?.price ?? 0), 0);
              return (
                <div key={group.key} className="border-b border-[var(--board-groove)] px-6 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5">
                      {group.href ? (
                        <Link
                          href={group.href}
                          className="text-sm font-semibold text-[var(--color-gray-900)] underline decoration-[var(--color-gray-300)] decoration-1 underline-offset-2 transition hover:decoration-[var(--brand-taupe-muted)]"
                        >
                          {group.label}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold text-[var(--color-gray-900)]">{group.label}</span>
                      )}
                      {group.kind !== "femme" && (
                        <span className="rounded-full bg-[var(--brand-rose-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-taupe-muted)]">
                          {group.kind === "homme" ? "Homme" : "Enfant"}
                        </span>
                      )}
                    </span>
                    {group.lines.length > 1 && (
                      <span className="text-xs font-semibold tabular-nums text-[var(--color-gray-500)]">{formatFcfa(groupTotal)}</span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-col divide-y divide-[var(--board-groove)]">
                    {group.lines.map((rv) => {
                      const service = serviceById(rv.serviceId);
                      return (
                        <div key={rv.id} className="flex items-start gap-3 py-2.5">
                          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-rose-soft)] text-[var(--brand-taupe-muted)]">
                            <Scissors className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[var(--color-gray-900)]">
                              {service?.name ?? "Prestation"}
                              {rv.status === "annule" && <span className="ml-1.5 text-[var(--color-gray-400)]">· annulé</span>}
                            </p>
                            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--color-gray-500)]">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="size-3" /> {rv.start} – {appointmentEndTime(rv)}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                {rv.secondStaffId ? <Users className="size-3" /> : <User className="size-3" />} {staffLabel(rv)}
                              </span>
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--color-gray-800)]">
                            {service ? formatFcfa(service.price) : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {extras.length > 0 && (
              <div className="px-6 py-4">
                <Legend>Extras</Legend>
                <div className="mt-2 flex flex-col divide-y divide-[var(--board-groove)]">
                  {extras.map((extra) => {
                    const item = extra.kind === "boisson" ? boissonById(extra.refId) : produitById(extra.refId);
                    return (
                      <div key={`${extra.kind}-${extra.refId}`} className="flex items-start gap-3 py-2.5">
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-rose-soft)] text-[var(--brand-taupe-muted)]">
                          {extra.kind === "boisson" ? <Coffee className="size-4" /> : <ShoppingBag className="size-4" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[var(--color-gray-900)]">
                            {extra.qty > 1 ? `${extra.qty}× ` : ""}
                            {item?.name ?? "Article"}
                          </p>
                          <p className="mt-0.5 text-xs text-[var(--color-gray-500)]">
                            {extra.kind === "boisson" ? "Boisson · à retirer sur place" : "Produit · à emporter"}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--color-gray-800)]">
                          {item ? formatFcfa(item.price * extra.qty) : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-[var(--board-groove)] px-6 py-3">
          <div className="flex items-center justify-between">
            <Legend>Total</Legend>
            <span className="text-sm font-bold tabular-nums text-[var(--color-gray-900)]">{formatFcfa(total)}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 p-5">
          {reservation && !reservationCancelled && (
            <Button variant="dark" onClick={() => onEncaisser(reservation.id)}>
              {hasSale ? "Voir la vente" : "Encaisser"}
            </Button>
          )}
          {reservation && !reservationCancelled && (
            <Button variant="outline" icon={<SlidersHorizontal className="size-4" />} onClick={() => setEditing(true)}>
              Modifier
            </Button>
          )}
          {!reservationCancelled && (
            <Button variant="danger-outline" onClick={() => setConfirmCancel(true)}>
              Annuler la réservation
            </Button>
          )}
          {reservationCancelled && appointment.cancelReason && (
            <p className="px-1 text-xs text-[var(--color-gray-500)]">Motif : {appointment.cancelReason}</p>
          )}
        </div>
      </Dialog>

      <Dialog open={confirmCancel} labelledBy="cancel-reservation-title" className="max-w-sm p-6">
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
          <Button variant="outline" className="flex-1" onClick={() => setConfirmCancel(false)}>
            Retour
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              if (reservation) {
                cancelReservation(reservation.id, cancelReason);
              }
              setConfirmCancel(false);
              setCancelReason("");
              onClose();
            }}
          >
            Annuler la réservation
          </Button>
        </div>
      </Dialog>

      <EditRendezVousDialog reservationId={editing && reservation ? reservation.id : null} onClose={() => setEditing(false)} />
    </>
  );
}
