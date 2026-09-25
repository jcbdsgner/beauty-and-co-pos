"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  Coffee,
  Copy,
  ShoppingBag,
  User,
  UserRound,
  Users,
  SlidersHorizontal,
  Gift,
  Star,
  CalendarClock,
  PackageCheck,
} from "lucide-react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton, IconButton } from "@/components/ui/atoms/icon-button";
import { Button } from "@/components/ui/atoms/button";
import { Badge } from "@/components/ui/atoms/badge";
import { TIER_LABEL } from "@/lib/data/tiers";
import { Avatar } from "@/components/ui/atoms/avatar";
import { ServiceCategoryIcon } from "@/components/ui/atoms/service-category-icons";
import { Textarea } from "@/components/ui/atoms/textarea";
import { Field } from "@/components/ui/molecules/field";
import { FlipChip, Legend } from "@/components/ui/board";
import { PriseRdvModal } from "@/components/prise-rdv/prise-rdv-modal";
import { useAppData } from "@/components/providers/app-data-provider";
import { giftCardForClient } from "@/lib/data/cartes-cadeaux";
import { abonnementsForClient, abonnementStatus, ABONNEMENT_STATUS_LABEL } from "@/lib/data/abonnements";
import { forfaitById } from "@/lib/data/forfaits";
import { packPurchasesForClient, packRemainingPrestations } from "@/lib/data/pack-purchases";
import { packById } from "@/lib/data/packs";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import { boissonById } from "@/lib/data/boissons";
import { produitById, serviceById } from "@/lib/data/menu";
import { rendezVousCoverage, type RendezVousCoverage } from "@/lib/data/coverage";
import { appointmentEndTime, reservationComposition, reservationDate, reservationForRendezVous, timeToMinutes } from "@/lib/data/planning";
import { formatFcfa } from "@/lib/utils";
import { PREFERENCE_DOMAINS, PREFERENCE_DOMAIN_LABEL } from "@/lib/data/types";
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
  /** The fiche behind this beneficiary, when known — the payer herself for "Elle-même", or the
   *  linked fiche for a named beneficiary. Powers the Préférences block; stays null for a
   *  beneficiary named free-text (no fiche to read preferences from). */
  client: Cliente | null;
  lines: RendezVous[];
};

/** Same key + kind derivation as `reservationComposition` (lib/data/planning.ts) — the panel's
 *  groups must always match the composition line shown on the Accueil card and the header here. */
function beneficiaryGroups(lines: RendezVous[], clients: Cliente[], payer: Cliente | undefined): BeneficiaryGroup[] {
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

/** Compact, per-beneficiary preference read: hair/color reference plus every non-empty domain
 *  note on her fiche. No photos here — this panel is a fast pre-service glance, not the fiche. */
function clientPreferenceLines(client: Cliente | null): { label: string; note: string }[] {
  if (!client) return [];
  const lines: { label: string; note: string }[] = [];
  if (client.hairType) lines.push({ label: "Type de cheveux", note: client.hairType });
  if (client.colorReference) lines.push({ label: "Réf. couleur", note: client.colorReference });
  for (const domain of PREFERENCE_DOMAINS) {
    const note = client.preferenceNotes?.[domain];
    if (note) lines.push({ label: PREFERENCE_DOMAIN_LABEL[domain], note });
  }
  return lines;
}

/** A cliente's preferences — always rendered, never behind a disclosure: the receptionist must
 *  see them on every passage. An empty fiche says so rather than silently showing nothing. */
function PreferencesBlock({ lines, className = "" }: { lines: { label: string; note: string }[]; className?: string }) {
  return (
    <div className={`rounded-lg bg-[var(--color-gray-50)] px-3 py-2 ${className}`}>
      <Legend className="text-[var(--color-gray-500)]">Préférences</Legend>
      {lines.length > 0 ? (
        <dl className="mt-1 flex flex-col gap-1">
          {lines.map((pref) => (
            <div key={pref.label} className="flex gap-1.5 text-xs leading-snug">
              <dt className="shrink-0 font-semibold text-[var(--color-gray-700)]">{pref.label} ·</dt>
              <dd className="text-[var(--color-gray-600)]">{pref.note}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-1 text-xs text-[var(--color-gray-500)]">Aucune préférence notée</p>
      )}
    </div>
  );
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
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-gray-50)] py-1 pr-2.5 pl-2 text-xs font-semibold text-[var(--color-gray-700)] ring-1 ring-inset ring-[var(--board-groove)]">
      <span className="text-[var(--brand-taupe-muted)]">{icon}</span>
      <span className="tabular-nums">{children}</span>
      {badge && <Badge variant={badge.tone}>{badge.label}</Badge>}
    </span>
  );
}

/** « Jeu. 25 sept » — short fr-FR day for the header's slot line (no trailing abbreviation dot). */
function formatShortDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const label = new Date(y, m - 1, d)
    .toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })
    .replace(/\.$/, "");
  return label.charAt(0).toUpperCase() + label.slice(1);
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
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(id);
  }, [copied]);
  if (!appointment) return null;

  const reservation = reservationForRendezVous(reservations, appointment.id);
  const payer = clients.find((c) => c.id === reservation?.payerClientId);
  const lines = reservation?.rendezVous ?? [appointment];
  const extras = reservation?.extras ?? [];
  const reservationCancelled = lines.length > 0 && lines.every((rv) => rv.status === "annule");
  const hasSale = Boolean(reservation?.saleId);
  // Lignes décomptées d'un pack / abonnement : facturées 0 F (ADR 0017), hors Total et sous-totaux.
  const coverage = reservation ? rendezVousCoverage(reservation.payerClientId, lines) : new Map<string, RendezVousCoverage>();
  const billable = (rv: RendezVous) => rv.status !== "annule" && !coverage.has(rv.id);
  const prestationsTotal = lines
    .filter(billable)
    .reduce((sum, rv) => sum + (serviceById(rv.serviceId)?.price ?? 0), 0);
  const extrasTotal = extras.reduce((sum, extra) => {
    const unitPrice = extra.kind === "boisson" ? (boissonById(extra.refId)?.price ?? 0) : (produitById(extra.refId)?.price ?? 0);
    return sum + unitPrice * extra.qty;
  }, 0);
  const total = prestationsTotal + extrasTotal;

  const groups = beneficiaryGroups(lines, clients, payer);
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
  const payerPrefLines = clientPreferenceLines(payer ?? null);

  function copyReference() {
    if (!reservation) return;
    navigator.clipboard?.writeText(reservation.id).then(() => setCopied(true), () => {});
  }

  return (
    <>
      <Dialog open variant="side" onClose={onClose} labelledBy="rdv-detail-title" className="relative flex flex-col p-0">
        <CloseButton onClick={onClose} />

        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--board-groove)] bg-base-100 py-4 pr-16 pl-6 text-base-content">
          {/* Référence de la réservation plutôt que le nom de la payeuse (audit UX du 19/09) —
              son nom reste lisible plus bas, dans le bloc payeuse. */}
          <h2 id="rdv-detail-title" className="font-[family-name:var(--font-heading)] text-xl font-semibold tabular-nums">
            {reservation?.id ?? "Réservation"}
          </h2>
          {reservation && (
            <IconButton
              aria-label={copied ? "Référence copiée" : "Copier la référence"}
              onClick={copyReference}
              className="-ml-1 size-12 rounded-full text-[var(--color-gray-400)] hover:bg-[var(--color-gray-50)] hover:text-[var(--color-gray-600)] active:bg-[var(--color-gray-100)]"
            >
              {copied ? <Check className="size-4 text-[var(--color-success)]" /> : <Copy className="size-4" />}
            </IconButton>
          )}
          {reservationCancelled && <FlipChip value="Annulé" tone="void" />}
          {hasSale && <FlipChip value="En cours" tone="signal" />}
          <span className="w-full text-xs text-[var(--color-gray-500)]">
            {reservation ? (
              <>
                {formatShortDay(reservationDate(reservation))}
                {lines.length > 0 && ` · ${fmtMin(rangeStart)} – ${fmtMin(rangeEnd)}`}
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
            <div className="border-b border-[var(--board-groove)] px-6 py-4">
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

              {hasAvantages && (
                <div className="mt-3 flex flex-wrap gap-1.5">
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
              )}

              {/* Préférences toujours visibles, jamais derrière un dépliage (demande utilisateur 25/09). */}
              <div className="mt-3 flex flex-col gap-3">
                <PreferencesBlock lines={payerPrefLines} />
                {payer.internalNotes && (
                  <div className="rounded-lg bg-[var(--color-gray-50)] px-3 py-2">
                    <Legend className="text-[var(--color-gray-500)]">Notes</Legend>
                    <p className="mt-1 text-xs leading-snug text-[var(--color-gray-600)]">{payer.internalNotes}</p>
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
                        <span className="rounded-full bg-[var(--brand-rose-soft)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--brand-taupe-muted)]">
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
                    return <PreferencesBlock lines={clientPreferenceLines(group.client)} className="mt-2" />;
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
                              <span className="inline-flex items-center gap-1">
                                {rv.secondStaffId ? <Users className="size-3" /> : <User className="size-3" />} {staffLabel(rv)}
                              </span>
                              {covered && (
                                <span className="rounded-full bg-[var(--color-gray-100)] px-2 py-0.5 font-semibold text-[var(--color-gray-600)]">
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
          <div className="flex items-baseline justify-between">
            <Legend>Total</Legend>
            <span className="text-xl font-bold tabular-nums text-[var(--color-gray-900)]">{formatFcfa(total)}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 p-5">
          {reservation && !reservationCancelled && (
            <Button variant="dark" className="highlight-rose w-full" onClick={() => onEncaisser(reservation.id)}>
              {hasSale ? "Voir la vente" : "Encaisser"}
            </Button>
          )}
          {!reservationCancelled && (
            <div className="flex gap-2">
              {reservation && (
                <Button variant="outline" icon={<SlidersHorizontal className="size-4" />} className="shrink-0 px-6" onClick={() => setEditing(true)}>
                  Modifier
                </Button>
              )}
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="btn btn-ghost btn-md flex-1 whitespace-nowrap border-transparent text-[16px] font-medium text-error normal-case hover:bg-error/10 active:scale-[0.97]"
              >
                Annuler la réservation
              </button>
            </div>
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

      <PriseRdvModal open={editing && Boolean(reservation)} reservationId={reservation?.id} onClose={() => setEditing(false)} />
    </>
  );
}
