"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Coffee, ShoppingBag, User, UserRound, Users, SlidersHorizontal } from "lucide-react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Button } from "@/components/ui/atoms/button";
import { Badge } from "@/components/ui/atoms/badge";
import { TIER_LABEL } from "@/lib/data/tiers";
import { Avatar } from "@/components/ui/atoms/avatar";
import { ServiceCategoryIcon } from "@/components/ui/atoms/service-category-icons";
import { FlipChip, Legend } from "@/components/ui/board";
import { RdvDialog } from "@/components/planning/rdv-dialog";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import { ClientPreferences } from "@/components/shared/client-preferences";
import { praticienneById } from "@/lib/data/praticiennes";
import { boissonById } from "@/lib/data/boissons";
import { produitById, serviceById } from "@/lib/data/menu";
import { appointmentEndTime, reservationComposition, reservationDate, reservationForRendezVous, reservationSalonIds } from "@/lib/data/planning";
import { salonById } from "@/lib/data/entreprises";
import { formatFcfa } from "@/lib/utils";
import type { RendezVous } from "@/lib/data/types";
import {
  CancelReservationDialog,
  PayerAvantages,
  beneficiaryGroups,
  fmtMin,
  formatShortDay,
  reservationFigures,
  staffLabel,
} from "@/components/planning/reservation-parts";

type Props = {
  /** The rendez-vous the receptionist tapped — the panel shows its whole réservation. */
  appointment: RendezVous | null;
  onClose: () => void;
  onEncaisser: (reservationId: string) => void;
};

/** Fiche réservation — panneau latéral droit (payeuse, avantages, prestations groupées par
 *  bénéficiaire, praticiennes), avec Encaisser, Modifier et Annuler la réservation entière (motif
 *  facultatif). La création de réservation se fait en ligne (ADR 0006/0009) ; ce panneau se ferme
 *  au clic dehors / Échap — c'est une lecture, rien à y perdre (ADR 0023). */
export function AppointmentDetailSheet({ appointment, onClose, onEncaisser }: Props) {
  const { clients, praticiennes, reservations } = useAppData();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [editing, setEditing] = useState(false);
  if (!appointment) return null;

  const reservation = reservationForRendezVous(reservations, appointment.id);
  const payer = clients.find((c) => c.id === reservation?.payerClientId);
  const lines = reservation?.rendezVous ?? [appointment];
  const reservationCancelled = lines.length > 0 && lines.every((rv) => rv.status === "annule");
  const hasSale = Boolean(reservation?.saleId);
  const { extras, coverage, billable, total, rangeStart, rangeEnd } = reservationFigures(reservation, lines);
  const groups = beneficiaryGroups(lines, clients, payer);
  // Almadies ou Sea Plaza — le salon vient des rendez-vous (ADR 0036).
  const salonNames = reservation
    ? reservationSalonIds(reservation).map((id) => salonById(id)?.name ?? id).join(" + ")
    : "";

  return (
    <>
      <Dialog open variant="side" onClose={onClose} labelledBy="rdv-detail-title" className="relative flex max-w-[640px] flex-col p-0">
        <CloseButton onClick={onClose} />

        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--board-groove)] bg-base-100 py-5 pr-16 pl-8 text-base-content">
          {/* Référence de la réservation plutôt que le nom de la payeuse (audit UX du 19/09) —
              son nom reste lisible plus bas, dans le bloc payeuse. */}
          <h2 id="rdv-detail-title" className="font-[family-name:var(--font-heading)] text-xl font-semibold tabular-nums">
            {reservation?.id ?? "Réservation"}
          </h2>
          {reservationCancelled && <FlipChip value="Annulé" tone="void" />}
          {hasSale && <FlipChip value="En cours" tone="signal" />}
          <span className="w-full text-xs text-[var(--color-gray-500)]">
            {reservation ? (
              <>
                {formatShortDay(reservationDate(reservation))}
                {lines.length > 0 && ` · ${fmtMin(rangeStart)} – ${fmtMin(rangeEnd)}`}
                {salonNames && (
                  <>
                    {" · "}
                    <span className="font-semibold text-base-content">{salonNames}</span>
                  </>
                )}
                {` · Réservé pour ${reservationComposition(reservation)}`}
              </>
            ) : (
              <>
                Réservée en ligne
                {lines.length > 0 && ` · ${fmtMin(rangeStart)} – ${fmtMin(rangeEnd)}`}
              </>
            )}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {payer && (
            <div className="border-b border-[var(--board-groove)] px-8 py-5">
              <div className="flex items-center gap-3">
                <Avatar
                  initial={clientInitial(payer)}
                  size={48}
                  className="bg-[var(--brand-rose-soft)] text-base font-semibold text-[var(--brand-taupe-muted)]"
                />
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-[var(--color-gray-900)]">{clientFullName(payer)}</span>
                  {payer.tier && <Badge variant={payer.tier}>{TIER_LABEL[payer.tier]}</Badge>}
                </div>
                <Button
                  href={`/clientele/${payer.id}`}
                  variant="outline"
                  size="sm"
                  icon={<UserRound className="size-4" />}
                  className="h-12 min-h-12 shrink-0"
                >
                  Fiche
                </Button>
              </div>

              <PayerAvantages payer={payer} className="mt-3" />

              {/* Préférences toujours visibles, jamais derrière un dépliage (demande utilisateur 25/09). */}
              <div className="mt-3 flex flex-col gap-3">
                <ClientPreferences client={payer} />
                {payer.notes?.[0] && (
                  <div className="rounded-lg bg-[var(--color-gray-50)] px-3 py-2">
                    <Legend className="text-[var(--color-gray-500)]">
                      Dernière note · {praticienneById(payer.notes[0].authorId)?.name ?? "Équipe"},{" "}
                      {new Date(payer.notes[0].at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </Legend>
                    <p className="mt-1 text-xs leading-snug text-[var(--color-gray-600)]">{payer.notes[0].text}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col">
            {groups.map((group) => {
              const groupTotal = group.lines
                .filter(billable)
                .reduce((sum, rv) => sum + (serviceById(rv.serviceId)?.price ?? 0), 0);
              return (
                <div key={group.key} className="border-b border-[var(--board-groove)] px-8 py-5">
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
                        <span className="rounded-sm bg-[var(--brand-rose-soft)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--brand-taupe-muted)]">
                          {group.kind === "homme" ? "Homme" : "Enfant"}
                        </span>
                      )}
                    </span>
                    {group.lines.length > 1 && (
                      <span className="text-xs font-semibold tabular-nums text-[var(--color-gray-500)]">{formatFcfa(groupTotal)}</span>
                    )}
                  </div>

                  {(() => {
                    // Payer-as-her-own-beneficiary already shows this in the payer block above
                    // (with the rest of her identity) — no need to repeat it here.
                    // A beneficiary named free-text has no fiche, hence no preferences to read.
                    if (!group.client || group.client.id === payer?.id) return null;
                    return <ClientPreferences client={group.client} className="mt-2" />;
                  })()}

                  <div className="mt-2 flex flex-col divide-y divide-[var(--board-groove)]">
                    {group.lines.map((rv) => {
                      const service = serviceById(rv.serviceId);
                      const covered = coverage.get(rv.id);
                      return (
                        <div key={rv.id} className="flex items-start gap-3 py-2.5">
                          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-rose-soft)] text-[var(--brand-taupe-muted)]">
                            <ServiceCategoryIcon categoryId={service?.categoryId ?? ""} className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[var(--color-gray-900)]">
                              {service?.name ?? "Prestation"}
                              {rv.status === "annule" && <span className="ml-1.5 text-[var(--color-gray-400)]">· annulé</span>}
                            </p>
                            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-gray-500)]">
                              <span className="tabular-nums">
                                {rv.start} – {appointmentEndTime(rv)}
                              </span>
                              <span aria-hidden>·</span>
                              <span className="inline-flex items-center gap-1">
                                {rv.secondStaffId ? <Users className="size-3" /> : <User className="size-3" />} {staffLabel(rv, praticiennes)}
                              </span>
                              {covered && (
                                <span className="rounded-sm bg-[var(--color-gray-100)] px-2 py-0.5 font-semibold text-[var(--color-gray-600)]">
                                  Couverte · {covered.planLabel}
                                </span>
                              )}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 text-sm font-semibold tabular-nums ${covered ? "text-[var(--color-gray-400)] line-through" : "text-[var(--color-gray-800)]"}`}
                          >
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
              <div className="px-8 py-5">
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

        <div className="shrink-0 border-t border-[var(--board-groove)] px-8 py-4">
          <div className="flex items-baseline justify-between">
            <Legend>Total</Legend>
            <span className="text-xl font-bold tabular-nums text-[var(--color-gray-900)]">{formatFcfa(total)}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 px-8 pt-1 pb-6">
          {reservation && !reservationCancelled && (
            <Button variant="dark" className="highlight-rose w-full" onClick={() => onEncaisser(reservation.id)}>
              {hasSale ? "Voir la vente" : "Encaisser"}
            </Button>
          )}
          <div className="flex gap-2">
            {reservation && !reservationCancelled && (
              <Button variant="outline" icon={<SlidersHorizontal className="size-4" />} className="shrink-0 px-6" onClick={() => setEditing(true)}>
                Modifier
              </Button>
            )}
            {reservation && (
              <Button
                href={`/reservations/${reservation.id}`}
                variant="outline"
                icon={<ArrowUpRight className="size-4" />}
                className="shrink-0 px-6"
              >
                Voir les détails
              </Button>
            )}
            {!reservationCancelled && (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="btn btn-ghost btn-md ml-auto whitespace-nowrap border-transparent px-5 text-[16px] font-medium text-error normal-case hover:bg-error/10 active:scale-[0.97]"
              >
                Annuler la réservation
              </button>
            )}
          </div>
          {reservationCancelled && appointment.cancelReason && (
            <p className="px-1 text-xs text-[var(--color-gray-500)]">Motif : {appointment.cancelReason}</p>
          )}
        </div>
      </Dialog>

      <CancelReservationDialog
        open={confirmCancel}
        reservationId={reservation?.id}
        hasSale={hasSale}
        onClose={() => setConfirmCancel(false)}
        onCancelled={() => {
          setConfirmCancel(false);
          onClose();
        }}
      />

      <RdvDialog open={editing && Boolean(reservation)} reservationId={reservation?.id} onClose={() => setEditing(false)} />
    </>
  );
}
