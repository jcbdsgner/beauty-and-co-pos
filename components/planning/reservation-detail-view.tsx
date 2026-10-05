"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Coffee, MessageCircle, Phone, ShoppingBag, SlidersHorizontal, UserRound } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { Badge } from "@/components/ui/atoms/badge";
import { Avatar } from "@/components/ui/atoms/avatar";
import { ServiceCategoryIcon } from "@/components/ui/atoms/service-category-icons";
import { BoardEmpty, FlipChip } from "@/components/ui/board";
import { RdvDialog } from "@/components/planning/rdv-dialog";
import { ClientPreferences } from "@/components/shared/client-preferences";
import { useEncaissement } from "@/components/journee/use-encaissement";
import { useAppData } from "@/components/providers/app-data-provider";
import { TIER_LABEL } from "@/lib/data/tiers";
import { clientFullName, clientInitial, clientNumberLabel } from "@/lib/data/clientele";
import { praticienneById } from "@/lib/data/praticiennes";
import { salonById } from "@/lib/data/entreprises";
import { boissonById } from "@/lib/data/boissons";
import { produitById, serviceById } from "@/lib/data/menu";
import {
  reservationById,
  reservationComposition,
  reservationDate,
  timeToMinutes,
  todayISO,
} from "@/lib/data/planning";
import { cn, formatFcfa } from "@/lib/utils";
import type { DepositMode, Praticienne, Reservation, RendezVous } from "@/lib/data/types";
import {
  CancelReservationDialog,
  PayerAvantages,
  beneficiaryGroups,
  fmtMin,
  formatDuration,
  formatShortDay,
  reservationFigures,
} from "@/components/planning/reservation-parts";

const DEPOSIT_MODE_LABEL: Record<DepositMode, string> = {
  especes: "en espèces",
  mobile_money: "par mobile money",
  carte: "par carte",
};

function formatLongDay(iso: string): string {
  const label = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(
    new Date(`${iso}T00:00:00`),
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatStamp(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/** Carte de la page — titre court en phrase (pas de surtitre capitales), méta à droite. */
function Panel({ title, meta, children }: { title: string; meta?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-box border border-base-300 bg-base-100">
      <header className="flex min-h-11 items-center justify-between gap-3 border-b border-base-300 px-4 py-2">
        <h2 className="text-sm font-semibold text-base-content">{title}</h2>
        {meta && <div className="text-xs text-base-content/60">{meta}</div>}
      </header>
      {children}
    </section>
  );
}

function staffOf(rv: RendezVous, praticiennes: Praticienne[]) {
  return [rv.staffId, rv.secondStaffId]
    .filter((id): id is string => Boolean(id))
    .map((id) => praticiennes.find((p) => p.id === id));
}

const staffNames = (rv: RendezVous, praticiennes: Praticienne[]) =>
  staffOf(rv, praticiennes)
    .map((p) => p?.name ?? "Inconnue")
    .join(" + ");

function StaffAvatars({ rv, praticiennes, size }: { rv: RendezVous; praticiennes: Praticienne[]; size: number }) {
  return (
    <span className="flex shrink-0 -space-x-1.5">
      {staffOf(rv, praticiennes).map((p, i) => (
        <Avatar
          key={p?.id ?? i}
          photoUrl={p?.photoUrl}
          initial={p?.initial ?? p?.name.charAt(0) ?? "?"}
          size={size}
          className="bg-accent text-[10px] font-bold text-base-content ring-2 ring-base-100"
        />
      ))}
    </span>
  );
}

function SumRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-0.5 text-sm">
      <span className="text-base-content/70">{label}</span>
      <span className="tabular-nums text-base-content/85">{children}</span>
    </div>
  );
}

/**
 * Page détaillée d'une réservation (/reservations/[id]), ouverte par « Voir les détails » de la
 * fiche réservation. Le panneau résume pour agir vite ; la page sert quand il faut comprendre ou
 * répondre : la frise (qui passe quand, chez qui, en parallèle), la facture ligne à ligne jusqu'au
 * reste à encaisser, et côté payeuse de quoi répondre à un appel — contact, avantages, préférences,
 * suivi de la réservation, ses autres réservations. Dense par choix : l'essentiel tient sur un écran.
 */
export function ReservationDetailView({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const { reservations, clients, praticiennes, sales, markReservationSeen } = useAppData();
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
      <div className="rounded-box border border-base-300 bg-base-100">
        <BoardEmpty
          title="Cette réservation est introuvable"
          hint={`Aucune réservation ne porte la référence ${reservationId}.`}
          action={
            <Button href="/" variant="outline">
              Retour à l&apos;Accueil
            </Button>
          }
        />
      </div>
    );
  }

  const payer = clients.find((c) => c.id === reservation.payerClientId);
  const lines = [...reservation.rendezVous].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  const cancelled = lines.length > 0 && lines.every((rv) => rv.status === "annule");
  const sale = reservation.saleId ? sales.find((s) => s.id === reservation.saleId) : undefined;
  const hasSale = Boolean(reservation.saleId);
  const settled = sale?.status === "encaissee";
  const { extras, coverage, prestationsTotal, coveredTotal, extrasTotal, total, rangeStart, rangeEnd } =
    reservationFigures(reservation, lines);
  const deposit = reservation.depositPaid ?? 0;
  const remaining = Math.max(0, total - deposit);
  const groups = beneficiaryGroups(lines, clients, payer);
  const groupOf = (rv: RendezVous) => groups.find((g) => g.lines.includes(rv));
  const prefPeople = [
    ...(payer ? [payer] : []),
    ...groups.flatMap((g) => (g.client && g.client.id !== payer?.id ? [g.client] : [])),
  ];
  const salons = [...new Set(lines.map((rv) => rv.salonId))].map((id) => salonById(id)?.name ?? id);
  const date = reservationDate(reservation);
  const cancelReason = lines.find((rv) => rv.cancelReason)?.cancelReason;

  // Suivi — uniquement ce que les données attestent, dans l'ordre où c'est arrivé.
  const events: { label: string; at?: string; tone?: "done" | "void" }[] = [
    {
      label: reservation.source === "en_ligne" ? "Réservée en ligne" : "Créée au comptoir",
      at: reservation.createdAt,
      tone: "done",
    },
  ];
  if (deposit > 0) {
    events.push({
      label: `Acompte de ${formatFcfa(deposit)} ${reservation.depositMode ? DEPOSIT_MODE_LABEL[reservation.depositMode] : "en ligne"}`,
      at: reservation.depositPaidAt,
      tone: "done",
    });
  }
  if (sale) events.push({ label: "Vente ouverte au comptoir", at: sale.createdAt, tone: "done" });
  if (settled) events.push({ label: "Encaissée", at: sale?.encaisseeAt, tone: "done" });
  if (cancelled) events.push({ label: cancelReason ? `Annulée · ${cancelReason}` : "Annulée", tone: "void" });
  if (!cancelled && !settled) events.push({ label: hasSale ? "En cours d'encaissement" : "À encaisser" });

  const otherReservations: Reservation[] = payer
    ? reservations
        .filter((r) => r.payerClientId === payer.id && r.id !== reservation.id)
        .sort((a, b) => reservationDate(b).localeCompare(reservationDate(a)))
        .slice(0, 4)
    : [];

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }

  const whatsapp = payer?.whatsapp ?? payer?.phone;

  return (
    <div className="flex flex-col">
      {/* Bandeau collant : identité de la réservation + ses trois actions, rien d'autre. */}
      <div className="sticky top-0 z-30 isolate -mx-8 -mt-8 mb-5 border-b border-base-300 bg-white px-8 py-3 shadow-[0_8px_10px_-6px_rgba(0,0,0,0.07)]">
        <div className="flex items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={goBack}
              aria-label="Retour"
              className="-ml-4 flex size-12 shrink-0 items-center justify-center rounded-field text-secondary transition hover:bg-base-200 active:scale-90"
            >
              <ChevronLeft aria-hidden className="size-6" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="truncate font-[family-name:var(--font-heading)] text-[22px] font-semibold leading-tight tabular-nums text-base-content">
                  {reservation.id}
                </h1>
                {cancelled ? (
                  <FlipChip value="Annulée" tone="void" />
                ) : settled ? (
                  <FlipChip value="Encaissée" tone="neutral" />
                ) : hasSale ? (
                  <FlipChip value="En cours" tone="signal" />
                ) : null}
              </div>
              <p className="mt-0.5 truncate text-sm text-base-content/65">
                <span className="font-medium text-base-content/85">{formatLongDay(date)}</span>
                <span className="tabular-nums">{` · ${fmtMin(rangeStart)} – ${fmtMin(rangeEnd)}`}</span>
                {` · ${reservationComposition(reservation)}`}
                {salons.length > 0 && ` · ${salons.join(" + ")}`}
              </p>
            </div>
          </div>

          {!cancelled && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="btn btn-ghost btn-md whitespace-nowrap border-transparent px-4 text-[15px] font-medium text-error normal-case hover:bg-error/10 active:scale-[0.97]"
              >
                Annuler la réservation
              </button>
              <Button variant="outline" icon={<SlidersHorizontal className="size-4" />} className="px-5" onClick={() => setEditing(true)}>
                Modifier
              </Button>
              <Button variant="dark" className="highlight-rose min-w-48 px-6" onClick={() => requestEncaissement(reservation.id)}>
                {hasSale ? (
                  "Voir la vente"
                ) : (
                  <>
                    Encaisser <span className="ml-1.5 tabular-nums opacity-80">{formatFcfa(remaining)}</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-5">
        {/* ── Gauche : les préférences, le passage (frise) puis l'argent (facture) ─────────── */}
        <div className="flex min-w-0 flex-col gap-5">
          {/* Préférences toujours visibles, jamais derrière un dépliage (demande utilisateur 25/09) —
              de chaque personne servie, pour préparer le passage. */}
          {prefPeople.length > 0 && (
            <Panel title="Préférences">
              <div className={cn("grid gap-4 p-4", prefPeople.length > 1 && "grid-cols-2")}>
                {prefPeople.map((c) => (
                  <div key={c.id} className="min-w-0">
                    {prefPeople.length > 1 && (
                      <Link href={`/clientele/${c.id}`} className="mb-2 block text-sm font-semibold text-base-content hover:underline">
                        {clientFullName(c)}
                      </Link>
                    )}
                    <ClientPreferences client={c} />
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {reservation.note && (
            <p className="rounded-box border border-primary/25 bg-[var(--brand-rose-soft)] px-4 py-2.5 text-sm text-base-content">
              <span className="font-semibold">Note de la cliente · </span>
              {reservation.note}
            </p>
          )}

          <Panel title="Détail et règlement" meta={deposit > 0 ? `Acompte de ${formatFcfa(deposit)} déjà versé` : undefined}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-300 text-left text-xs text-base-content/60">
                  <th className="w-20 py-2 pl-4 font-medium">Heure</th>
                  <th className="py-2 font-medium">Prestation</th>
                  <th className="py-2 font-medium">Pour</th>
                  <th className="py-2 font-medium">Praticienne</th>
                  <th className="w-20 py-2 text-right font-medium">Durée</th>
                  <th className="w-28 py-2 pr-4 text-right font-medium">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-300/70">
                {lines.map((rv) => {
                  const service = serviceById(rv.serviceId);
                  const covered = coverage.get(rv.id);
                  const voided = rv.status === "annule";
                  const group = groupOf(rv);
                  return (
                    <tr key={rv.id} className={cn(voided && "text-base-content/45")}>
                      <td className="py-2.5 pl-4 align-top font-medium tabular-nums">{rv.start}</td>
                      <td className="py-2.5 pr-3 align-top">
                        <span className="flex items-start gap-2">
                          <ServiceCategoryIcon
                            categoryId={service?.categoryId ?? ""}
                            className="mt-0.5 size-4 shrink-0 text-[var(--brand-taupe-muted)]"
                          />
                          <span>
                            <span className={cn("font-medium", voided && "line-through")}>{service?.name ?? "Prestation"}</span>
                            {covered && (
                              <span className="ml-2 inline-block rounded-sm bg-base-200 px-1.5 py-0.5 align-middle text-[11px] font-semibold text-base-content/70">
                                {covered.planLabel}
                              </span>
                            )}
                            {voided && <span className="ml-2 text-xs font-medium text-error">annulée</span>}
                          </span>
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 align-top whitespace-nowrap">
                        {group?.href ? (
                          <Link href={group.href} className="underline decoration-base-300 underline-offset-2 hover:decoration-secondary">
                            {group.label}
                          </Link>
                        ) : (
                          group?.label
                        )}
                      </td>
                      <td className="py-2.5 pr-3 align-top">
                        <span className="flex items-center gap-2">
                          <StaffAvatars rv={rv} praticiennes={praticiennes} size={20} />
                          <span className="truncate">{staffNames(rv, praticiennes)}</span>
                        </span>
                      </td>
                      <td className="py-2.5 text-right align-top tabular-nums text-base-content/70">{formatDuration(rv.durationMin)}</td>
                      <td
                        className={cn(
                          "py-2.5 pr-4 text-right align-top font-medium tabular-nums",
                          (covered || voided) && "text-base-content/40 line-through",
                        )}
                      >
                        {service ? formatFcfa(service.price) : "—"}
                      </td>
                    </tr>
                  );
                })}
                {extras.map((extra) => {
                  const item = extra.kind === "boisson" ? boissonById(extra.refId) : produitById(extra.refId);
                  return (
                    <tr key={`${extra.kind}-${extra.refId}`}>
                      <td className="py-2.5 pl-4 align-top text-xs text-base-content/60">Extra</td>
                      <td className="py-2.5 pr-3 align-top">
                        <span className="flex items-start gap-2">
                          {extra.kind === "boisson" ? (
                            <Coffee className="mt-0.5 size-4 shrink-0 text-[var(--brand-taupe-muted)]" />
                          ) : (
                            <ShoppingBag className="mt-0.5 size-4 shrink-0 text-[var(--brand-taupe-muted)]" />
                          )}
                          <span className="font-medium">
                            {extra.qty > 1 ? `${extra.qty}× ` : ""}
                            {item?.name ?? "Article"}
                          </span>
                        </span>
                      </td>
                      <td colSpan={3} className="py-2.5 pr-3 align-top text-base-content/65">
                        {extra.kind === "boisson" ? "Boisson, à servir sur place" : "Produit à emporter"}
                      </td>
                      <td className="py-2.5 pr-4 text-right align-top font-medium tabular-nums">
                        {item ? formatFcfa(item.price * extra.qty) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pied de facture : se lit de haut en bas jusqu'au montant que la réceptionniste va demander. */}
            <div className="flex justify-end border-t border-base-300 bg-base-200/40 px-4 py-3">
              <div className="w-80">
                <SumRow label="Prestations">{formatFcfa(prestationsTotal + coveredTotal)}</SumRow>
                {coveredTotal > 0 && <SumRow label="Couvert par pack ou forfait">− {formatFcfa(coveredTotal)}</SumRow>}
                {extrasTotal > 0 && <SumRow label="Extras">{formatFcfa(extrasTotal)}</SumRow>}
                {deposit > 0 && (
                  <>
                    <SumRow label="Total">{formatFcfa(total)}</SumRow>
                    <SumRow label="Acompte versé">− {formatFcfa(deposit)}</SumRow>
                  </>
                )}
                <div className="mt-1.5 flex items-baseline justify-between border-t border-base-300 pt-2">
                  <span className="text-sm font-semibold text-base-content">
                    {settled ? "Encaissé" : cancelled ? "Total" : "Reste à encaisser"}
                  </span>
                  <span className="text-xl font-bold tabular-nums text-base-content">{formatFcfa(remaining)}</span>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* ── Droite : la payeuse, de quoi répondre si elle appelle ─────────── */}
        <div className="flex flex-col gap-5">
          {payer && (
            <Panel
              title="Payeuse"
              meta={
                <Link
                  href={`/clientele/${payer.id}`}
                  className="-my-2 -mr-2 inline-flex h-11 items-center gap-1.5 rounded-field px-2 text-sm font-medium text-secondary hover:bg-base-200"
                >
                  <UserRound className="size-4" /> Fiche
                </Link>
              }
            >
              <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    initial={clientInitial(payer)}
                    size={44}
                    className="bg-[var(--brand-rose-soft)] text-base font-semibold text-[var(--brand-taupe-muted)]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-semibold text-base-content">{clientFullName(payer)}</span>
                      {payer.tier && <Badge variant={payer.tier}>{TIER_LABEL[payer.tier]}</Badge>}
                    </div>
                    <p className="truncate text-xs tabular-nums text-base-content/60">
                      {clientNumberLabel(payer)} · {payer.totalVisits} passage{payer.totalVisits > 1 ? "s" : ""} ·{" "}
                      {formatFcfa(payer.totalSpent)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`tel:${payer.phone.replace(/\s/g, "")}`}
                    className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-field border border-base-300 px-3 text-sm font-medium tabular-nums text-base-content transition hover:bg-base-200 active:scale-[0.98]"
                  >
                    <Phone className="size-4 shrink-0 text-secondary" />
                    <span className="truncate">{payer.phone}</span>
                  </a>
                  {whatsapp && (
                    <a
                      href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Écrire sur WhatsApp"
                      className="flex size-12 shrink-0 items-center justify-center rounded-field border border-base-300 text-secondary transition hover:bg-base-200 active:scale-[0.95]"
                    >
                      <MessageCircle className="size-5" />
                    </a>
                  )}
                </div>

                <PayerAvantages payer={payer} />
                {payer.notes?.[0] && (
                  <p className="border-l-2 border-base-300 pl-3 text-xs leading-snug text-base-content/70">
                    <span className="font-semibold text-base-content/80">
                      {praticienneById(payer.notes[0].authorId)?.name ?? "Équipe"},{" "}
                      {new Date(payer.notes[0].at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} ·{" "}
                    </span>
                    {payer.notes[0].text}
                  </p>
                )}
              </div>
            </Panel>
          )}

          <Panel title="Suivi">
            <ol className="px-4 py-3">
              {events.map((ev, i) => (
                <li key={i} className="relative flex gap-3 pb-3 last:pb-0">
                  {i < events.length - 1 && <span aria-hidden className="absolute top-3 bottom-0 left-[4.5px] w-px bg-base-300" />}
                  <span
                    aria-hidden
                    className={cn(
                      "relative mt-1.5 size-2.5 shrink-0 rounded-full",
                      ev.tone === "done" ? "bg-secondary" : ev.tone === "void" ? "bg-error" : "border-2 border-secondary bg-base-100",
                    )}
                  />
                  <div className="min-w-0 text-sm leading-snug">
                    <p className={cn("text-base-content", !ev.tone && "font-semibold")}>{ev.label}</p>
                    {ev.at && <p className="text-xs tabular-nums text-base-content/60">{formatStamp(ev.at)}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </Panel>

          {otherReservations.length > 0 && (
            <Panel title="Ses autres réservations">
              <ul className="divide-y divide-base-300/70">
                {otherReservations.map((r) => {
                  const names = r.rendezVous.map((rv) => serviceById(rv.serviceId)?.name ?? "Prestation");
                  const upcoming = reservationDate(r) >= todayISO();
                  return (
                    <li key={r.id}>
                      <Link
                        href={`/reservations/${r.id}`}
                        className="flex min-h-12 items-center gap-3 px-4 py-2 transition hover:bg-base-200/60 active:bg-base-200"
                      >
                        <span className="w-20 shrink-0 text-xs font-medium tabular-nums text-base-content/70">
                          {formatShortDay(reservationDate(r))}
                          {upcoming && <span className="block text-[11px] font-semibold text-secondary">à venir</span>}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-base-content">
                          {names[0]}
                          {names.length > 1 && <span className="text-base-content/60"> + {names.length - 1}</span>}
                        </span>
                        <span className="shrink-0 text-sm tabular-nums text-base-content/70">
                          {formatFcfa(reservationFigures(r, r.rendezVous).total)}
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-base-content/40" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}
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

      <RdvDialog open={editing} reservationId={reservation.id} onClose={() => setEditing(false)} />
    </div>
  );
}
