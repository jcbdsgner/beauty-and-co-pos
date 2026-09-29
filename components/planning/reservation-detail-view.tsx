"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Coffee, ShoppingBag, SlidersHorizontal, UserRound } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { Badge } from "@/components/ui/atoms/badge";
import { Avatar } from "@/components/ui/atoms/avatar";
import { ServiceCategoryIcon } from "@/components/ui/atoms/service-category-icons";
import { Board, BoardEmpty, FlipChip, Legend } from "@/components/ui/board";
import { PriseRdvModal } from "@/components/prise-rdv/prise-rdv-modal";
import { ClientPreferences } from "@/components/shared/client-preferences";
import { useEncaissement } from "@/components/journee/use-encaissement";
import { useAppData } from "@/components/providers/app-data-provider";
import { TIER_LABEL } from "@/lib/data/tiers";
import { clientFullName, clientInitial, clientNumberLabel } from "@/lib/data/clientele";
import { praticienneById } from "@/lib/data/praticiennes";
import { salonById } from "@/lib/data/entreprises";
import { boissonById } from "@/lib/data/boissons";
import { produitById, serviceById } from "@/lib/data/menu";
import { appointmentEndTime, reservationById, reservationComposition, reservationDate, timeToMinutes } from "@/lib/data/planning";
import { cn, formatFcfa } from "@/lib/utils";
import type { DepositMode, Praticienne, RendezVous } from "@/lib/data/types";
import {
  CancelReservationDialog,
  PayerAvantages,
  beneficiaryGroups,
  fmtMin,
  formatDuration,
  reservationFigures,
} from "@/components/planning/reservation-parts";

const DEPOSIT_MODE_LABEL: Record<DepositMode, string> = {
  especes: "espèces, au comptoir",
  mobile_money: "mobile money",
  carte: "carte",
};

/** « jeudi 25 septembre » — le jour en toutes lettres pour l'en-tête de la page. */
function formatLongDay(iso: string): string {
  const label = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(
    new Date(`${iso}T00:00:00`),
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Praticienne(s) d'une ligne, avec pastilles d'initiales — « à 2 » se lit sans légende. */
function StaffCell({ rv, praticiennes }: { rv: RendezVous; praticiennes: Praticienne[] }) {
  const staff = [rv.staffId, rv.secondStaffId]
    .filter((id): id is string => Boolean(id))
    .map((id) => praticiennes.find((p) => p.id === id));
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="flex shrink-0 -space-x-1.5">
        {staff.map((p, i) => (
          <Avatar
            key={p?.id ?? i}
            initial={p?.name.charAt(0) ?? "?"}
            size={26}
            className="bg-accent text-[11px] font-bold text-base-content ring-2 ring-base-100"
          />
        ))}
      </span>
      <span className="truncate text-sm text-base-content/75">
        {staff.map((p) => p?.name ?? "Inconnue").join(" + ")}
      </span>
    </span>
  );
}

/** A label/value line of the right-hand summaries (Règlement, Réservation). */
function Row({ label, children, strong }: { label: string; children: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <span className="text-base-content/70">{label}</span>
      <span className={cn("text-right tabular-nums", strong ? "font-semibold text-base-content" : "text-base-content/85")}>{children}</span>
    </div>
  );
}

/**
 * Page détaillée d'une réservation (/reservations/[id]) — la version pleine page de la fiche
 * réservation (`AppointmentDetailSheet`), ouverte depuis son bouton « Voir les détails ». Là où le
 * panneau résume, la page déroule : chaque rendez-vous sur sa ligne horaire (début → fin, durée,
 * bénéficiaire, praticiennes, prix), les préférences de chaque bénéficiaire, le règlement complet
 * (couvert par forfait, acompte déjà versé, reste à encaisser) et la provenance de la réservation.
 * Mêmes actions que le panneau : Encaisser, Modifier, Annuler.
 */
export function ReservationDetailView({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const { reservations, clients, praticiennes, markReservationSeen } = useAppData();
  const { requestEncaissement, encaissementDialog } = useEncaissement();
  const [editing, setEditing] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const reservation = reservationById(reservations, reservationId);

  // Ouvrir la page vaut ouvrir la fiche : la réservation en ligne n'est plus « reçue non vue » (ADR 0030).
  useEffect(() => {
    if (reservation && reservation.seen === false) markReservationSeen(reservation.id);
  }, [reservation, markReservationSeen]);

  if (!reservation) {
    return (
      <Board legend="Réservation introuvable">
        <BoardEmpty
          title="Cette réservation est introuvable"
          hint={`Aucune réservation ne porte la référence ${reservationId}.`}
          action={
            <Button href="/" variant="outline">
              Retour à l&apos;Accueil
            </Button>
          }
        />
      </Board>
    );
  }

  const payer = clients.find((c) => c.id === reservation.payerClientId);
  const lines = [...reservation.rendezVous].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  const cancelled = lines.length > 0 && lines.every((rv) => rv.status === "annule");
  const hasSale = Boolean(reservation.saleId);
  const { extras, coverage, prestationsTotal, coveredTotal, extrasTotal, total, rangeStart, rangeEnd } =
    reservationFigures(reservation, lines);
  const deposit = reservation.depositPaid ?? 0;
  const remaining = Math.max(0, total - deposit);
  const groups = beneficiaryGroups(lines, clients, payer);
  const groupOf = (rv: RendezVous) => groups.find((g) => g.lines.includes(rv));
  const otherBeneficiaries = groups.filter((g) => g.client && g.client.id !== payer?.id);
  const salons = [...new Set(lines.map((rv) => rv.salonId))].map((id) => salonById(id)?.name ?? id);
  const cancelReason = lines.find((rv) => rv.cancelReason)?.cancelReason;

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }

  return (
    <div className="flex flex-col">
      {/* Bandeau collant, même grammaire que la fiche cliente : retour, référence, quand et pour qui,
          et les actions de la réservation toujours à portée. */}
      <div className="sticky top-0 z-30 isolate -mx-8 -mt-8 mb-8 border-b border-base-300 bg-white px-8 py-5 shadow-[0_8px_10px_-6px_rgba(0,0,0,0.07)]">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              aria-label="Retour"
              className="-ml-7 flex size-10 shrink-0 items-center justify-center text-secondary transition hover:text-primary active:scale-90"
            >
              <ChevronLeft aria-hidden className="size-6" />
            </button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-[family-name:var(--font-heading)] text-[28px] font-semibold leading-tight tracking-[-0.01em] tabular-nums text-base-content">
                  {reservation.id}
                </h1>
                {cancelled && <FlipChip value="Annulé" tone="void" />}
                {hasSale && <FlipChip value="En cours" tone="signal" />}
              </div>
              <p className="mt-1 text-sm text-base-content/60">
                {formatLongDay(reservationDate(reservation))}
                {lines.length > 0 && (
                  <span className="tabular-nums">{` · ${fmtMin(rangeStart)} – ${fmtMin(rangeEnd)}`}</span>
                )}
                {` · Réservé pour ${reservationComposition(reservation)}`}
                {salons.length > 0 && ` · ${salons.join(" + ")}`}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {!cancelled && (
              <>
                <button
                  type="button"
                  onClick={() => setConfirmCancel(true)}
                  className="btn btn-ghost btn-md whitespace-nowrap border-transparent px-5 text-[16px] font-medium text-error normal-case hover:bg-error/10 active:scale-[0.97]"
                >
                  Annuler la réservation
                </button>
                <Button variant="outline" icon={<SlidersHorizontal className="size-4" />} className="px-6" onClick={() => setEditing(true)}>
                  Modifier
                </Button>
                <Button variant="dark" className="highlight-rose min-w-44 px-8" onClick={() => requestEncaissement(reservation.id)}>
                  {hasSale ? "Voir la vente" : "Encaisser"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_400px] items-start gap-8">
        {/* ── Colonne principale : le déroulé ─────────────────────────────── */}
        <div className="flex min-w-0 flex-col gap-8">
          <Board legend="Déroulé" legendRight={<span className="text-sm text-base-content/55">{lines.length} prestation{lines.length > 1 ? "s" : ""}</span>}>
            <ol className="divide-y divide-[var(--board-groove)]">
              {lines.map((rv) => {
                const service = serviceById(rv.serviceId);
                const covered = coverage.get(rv.id);
                const group = groupOf(rv);
                const voided = rv.status === "annule";
                return (
                  <li key={rv.id} className={cn("flex items-stretch", voided && "opacity-55")}>
                    <div className="flex w-24 shrink-0 flex-col justify-center border-r border-[var(--board-groove)] bg-black/[0.015] px-4 py-4 tabular-nums">
                      <span className="text-base font-semibold text-base-content">{rv.start}</span>
                      <span className="text-sm text-base-content/55">{appointmentEndTime(rv)}</span>
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-rose-soft)] text-[var(--brand-taupe-muted)]">
                        <ServiceCategoryIcon categoryId={service?.categoryId ?? ""} className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-base font-semibold text-base-content", voided && "line-through")}>
                          {service?.name ?? "Prestation"}
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-base-content/60">
                          <span className="tabular-nums">{formatDuration(rv.durationMin)}</span>
                          {group && (
                            <>
                              <span aria-hidden>·</span>
                              {group.href ? (
                                <Link
                                  href={group.href}
                                  className="font-medium text-base-content/80 underline decoration-base-300 underline-offset-2 transition hover:decoration-secondary"
                                >
                                  {group.label}
                                </Link>
                              ) : (
                                <span className="font-medium text-base-content/80">{group.label}</span>
                              )}
                              {group.kind !== "femme" && (
                                <span className="rounded-sm bg-[var(--brand-rose-soft)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--brand-taupe-muted)]">
                                  {group.kind === "homme" ? "Homme" : "Enfant"}
                                </span>
                              )}
                            </>
                          )}
                          {voided && <span className="font-medium text-error">· annulé</span>}
                          {covered && (
                            <span className="rounded-sm bg-[var(--color-gray-100)] px-2 py-0.5 text-xs font-semibold text-[var(--color-gray-600)]">
                              Couverte · {covered.planLabel}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="w-48 shrink-0">
                        <StaffCell rv={rv} praticiennes={praticiennes} />
                      </div>
                      <span
                        className={cn(
                          "w-24 shrink-0 text-right text-base font-semibold tabular-nums",
                          covered || voided ? "text-base-content/40 line-through" : "text-base-content",
                        )}
                      >
                        {service ? formatFcfa(service.price) : "—"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Board>

          {extras.length > 0 && (
            <Board legend="Extras pré-commandés">
              <ul className="divide-y divide-[var(--board-groove)]">
                {extras.map((extra) => {
                  const item = extra.kind === "boisson" ? boissonById(extra.refId) : produitById(extra.refId);
                  return (
                    <li key={`${extra.kind}-${extra.refId}`} className="flex items-center gap-4 px-5 py-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-rose-soft)] text-[var(--brand-taupe-muted)]">
                        {extra.kind === "boisson" ? <Coffee className="size-5" /> : <ShoppingBag className="size-5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold text-base-content">
                          {extra.qty > 1 ? `${extra.qty}× ` : ""}
                          {item?.name ?? "Article"}
                        </p>
                        <p className="mt-1 text-sm text-base-content/60">
                          {extra.kind === "boisson" ? "Boisson · à retirer sur place" : "Produit · à emporter"}
                        </p>
                      </div>
                      <span className="w-24 shrink-0 text-right text-base font-semibold tabular-nums text-base-content">
                        {item ? formatFcfa(item.price * extra.qty) : "—"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Board>
          )}

          {reservation.note && (
            <Board legend="Note pour le salon">
              <p className="px-5 py-4 text-sm leading-relaxed text-base-content/80">{reservation.note}</p>
            </Board>
          )}

          {otherBeneficiaries.length > 0 && (
            <Board legend="Préférences des bénéficiaires">
              <div className="divide-y divide-[var(--board-groove)]">
                {otherBeneficiaries.map((g) => (
                  <div key={g.key} className="px-5 py-4">
                    <Link
                      href={g.href ?? "#"}
                      className="text-sm font-semibold text-base-content underline decoration-base-300 underline-offset-2 transition hover:decoration-secondary"
                    >
                      {g.label}
                    </Link>
                    <ClientPreferences client={g.client!} className="mt-2" />
                  </div>
                ))}
              </div>
            </Board>
          )}
        </div>

        {/* ── Colonne latérale : qui paie, combien, d'où vient la réservation ── */}
        <div className="flex flex-col gap-8">
          <Board legend="Règlement">
            <div className="px-5 py-4">
              <Row label="Prestations">{formatFcfa(prestationsTotal + coveredTotal)}</Row>
              {coveredTotal > 0 && <Row label="Couvert par forfait ou pack">− {formatFcfa(coveredTotal)}</Row>}
              {extrasTotal > 0 && <Row label="Extras">{formatFcfa(extrasTotal)}</Row>}
              <div className="mt-2 border-t border-[var(--board-groove)] pt-2">
                <Row label="Total" strong>
                  {formatFcfa(total)}
                </Row>
                {deposit > 0 && (
                  <Row label={`Acompte versé${reservation.depositMode ? ` · ${DEPOSIT_MODE_LABEL[reservation.depositMode]}` : " en ligne"}`}>
                    − {formatFcfa(deposit)}
                  </Row>
                )}
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-[var(--board-groove)] pt-3">
                <span className="text-sm font-semibold text-base-content">{hasSale ? "Vente ouverte" : "Reste à encaisser"}</span>
                <span className="text-2xl font-bold tabular-nums text-base-content">{formatFcfa(remaining)}</span>
              </div>
            </div>
          </Board>

          {payer && (
            <Board legend="Payeuse">
              <div className="flex flex-col gap-4 px-5 py-5">
                <div className="flex items-center gap-3">
                  <Avatar
                    initial={clientInitial(payer)}
                    size={52}
                    className="bg-[var(--brand-rose-soft)] text-lg font-semibold text-[var(--brand-taupe-muted)]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-base font-semibold text-base-content">{clientFullName(payer)}</span>
                      {payer.tier && <Badge variant={payer.tier}>{TIER_LABEL[payer.tier]}</Badge>}
                    </div>
                    <span className="text-sm tabular-nums text-base-content/55">{clientNumberLabel(payer)}</span>
                  </div>
                  <Button href={`/clientele/${payer.id}`} variant="outline" size="sm" icon={<UserRound className="size-4" />} className="h-12 min-h-12 shrink-0">
                    Fiche
                  </Button>
                </div>
                <PayerAvantages payer={payer} />
                {/* Préférences toujours visibles, jamais derrière un dépliage (demande utilisateur 25/09). */}
                <ClientPreferences client={payer} />
                {payer.notes?.[0] && (
                  <div className="rounded-lg bg-[var(--color-gray-50)] px-3 py-2">
                    <Legend className="text-[var(--color-gray-500)]">
                      Dernière note · {praticienneById(payer.notes[0].authorId)?.name ?? "Équipe"},{" "}
                      {new Date(payer.notes[0].at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </Legend>
                    <p className="mt-1 text-sm leading-snug text-base-content/70">{payer.notes[0].text}</p>
                  </div>
                )}
              </div>
            </Board>
          )}

          <Board legend="Réservation">
            <div className="px-5 py-4">
              <Row label="Provenance">{reservation.source === "en_ligne" ? "Réservée en ligne" : "Créée au comptoir"}</Row>
              {reservation.createdAt && (
                <Row label="Créée le">
                  {new Date(reservation.createdAt).toLocaleString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Row>
              )}
              <Row label="Salon">{salons.join(" + ") || "—"}</Row>
              <Row label="Statut">{cancelled ? "Annulée" : hasSale ? "Vente en cours" : "À encaisser"}</Row>
              {cancelled && cancelReason && <Row label="Motif">{cancelReason}</Row>}
            </div>
          </Board>
        </div>
      </div>

      {encaissementDialog}

      <CancelReservationDialog
        open={confirmCancel}
        reservationId={reservation.id}
        hasSale={hasSale}
        onClose={() => setConfirmCancel(false)}
        onCancelled={() => setConfirmCancel(false)}
      />

      <PriseRdvModal open={editing} reservationId={reservation.id} onClose={() => setEditing(false)} />
    </div>
  );
}
