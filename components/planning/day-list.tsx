"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Users } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Button } from "@/components/ui/atoms/button";
import { Lane, FlipChip, type LaneSignal } from "@/components/ui/board";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import { serviceById } from "@/lib/data/menu";
import type { ReservationDayRow } from "@/lib/data/planning";
import { cn } from "@/lib/utils";
import type { Cliente, Praticienne, RendezVous } from "@/lib/data/types";

/**
 * La vue journée par réservation (ADR 0014). Une ligne = une payeuse, triée par heure — plus
 * d'éparpillement d'une cliente sur plusieurs lanes de praticiennes. Partagée par le Planning
 * (vue « Liste chronologique ») et le bloc « Le jour » de l'Accueil. Langage « Le Tableau »
 * inchangé : `Lane`, `FlipChip`, rail de légende, signal ambre. Une réservation à plusieurs
 * prestations se déplie en sous-lignes ; taper la ligne ouvre la fiche réservation.
 */
type Props = {
  rows: ReservationDayRow[];
  clients: Cliente[];
  praticiennes: Praticienne[];
  /** Ouvre la fiche réservation (le sheet ardoise), pointée sur ce rendez-vous. */
  onOpenReservation: (rv: RendezVous) => void;
  onEncaisser: (reservationId: string) => void;
};

export function DayList({ rows, clients, praticiennes, onOpenReservation, onEncaisser }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Equal-start sub-sort by payeuse name — the receptionist scans an alphabetised column.
  const sorted = useMemo(() => {
    const name = (r: ReservationDayRow) => {
      const c = clients.find((x) => x.id === r.reservation.payerClientId);
      return c ? clientFullName(c) : "";
    };
    return [...rows].sort((a, b) => a.start.localeCompare(b.start) || name(a).localeCompare(name(b), "fr"));
  }, [rows, clients]);

  const staffName = (id?: string) => (id ? praticiennes.find((p) => p.id === id)?.name : undefined);
  const isAbsent = (id?: string) => Boolean(id && praticiennes.find((p) => p.id === id)?.unavailableToday);
  const beneficiary = (rv: RendezVous) =>
    rv.beneficiaryClientId
      ? clients.find((c) => c.id === rv.beneficiaryClientId)?.lastName
      : rv.beneficiaryName;

  function toggle(id: string) {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      {sorted.map((row) => {
        const { reservation, rendezVous, staffIds } = row;
        const payer = clients.find((c) => c.id === reservation.payerClientId);
        const active = rendezVous.filter((rv) => rv.status !== "annule");
        const anyAbsent = active.some((rv) => isAbsent(rv.staffId) || isAbsent(rv.secondStaffId));
        const hasSale = Boolean(reservation.saleId);
        const multi = rendezVous.length > 1;
        const isOpen = expanded.has(reservation.id);
        const summary = active.map((rv) => serviceById(rv.serviceId)?.name ?? "Prestation").join(" + ");
        const signal: LaneSignal = anyAbsent ? "hold" : "none";

        return (
          <div key={reservation.id}>
            <Lane
              leading={
                <span className="flex flex-col leading-tight">
                  <span>{row.start}</span>
                  <span className="text-[0.7rem] font-normal text-[var(--color-gray-400)]">→ {row.end}</span>
                </span>
              }
              title={
                <span className="flex items-center gap-2">
                  <Avatar
                    initial={payer ? clientInitial(payer) : "?"}
                    size={26}
                    className="bg-accent text-[0.65rem] font-semibold text-secondary"
                  />
                  {payer ? clientFullName(payer) : "Cliente"}
                </span>
              }
              meta={
                <span>
                  {summary || "Prestation"}
                  {staffIds.length > 1
                    ? ` · ${staffIds.length} praticiennes`
                    : staffIds.length === 1
                      ? ` · ${staffName(staffIds[0])}`
                      : ""}
                  {anyAbsent ? " · praticienne absente" : ""}
                </span>
              }
              chip={
                (hasSale || multi) && (
                  <span className="flex items-center gap-1.5">
                    {hasSale && <FlipChip value="En cours" tone="signal" />}
                    {multi && (
                      <button
                        type="button"
                        onClick={() => toggle(reservation.id)}
                        aria-label={isOpen ? "Replier les prestations" : "Voir les prestations"}
                        aria-expanded={isOpen}
                        className="flex items-center gap-0.5 rounded-full px-1.5 py-1 text-xs font-semibold tabular-nums text-[var(--color-gray-400)] transition hover:bg-black/[0.04]"
                      >
                        {rendezVous.length}
                        <ChevronDown className={cn("size-3.5 transition", isOpen && "rotate-180")} />
                      </button>
                    )}
                  </span>
                )
              }
              signal={signal}
              onSelect={() => onOpenReservation(rendezVous[0])}
              actions={
                <Button
                  size="sm"
                  variant={hasSale ? "outline" : "dark"}
                  onClick={() => onEncaisser(reservation.id)}
                >
                  {hasSale ? "Voir la vente" : "Encaisser"}
                </Button>
              }
            />
            {multi && isOpen && (
              <div className="divide-y divide-[var(--board-groove)] border-b border-[var(--board-groove)] bg-black/[0.015]">
                {rendezVous.map((rv) => {
                  const svc = serviceById(rv.serviceId);
                  const benef = beneficiary(rv);
                  const cancelled = rv.status === "annule";
                  return (
                    <button
                      key={rv.id}
                      type="button"
                      onClick={() => onOpenReservation(rv)}
                      className="flex w-full items-center gap-3 py-2.5 pl-[4.75rem] pr-4 text-left transition hover:bg-black/[0.02]"
                    >
                      <span className="w-11 shrink-0 text-xs font-semibold tabular-nums text-[var(--color-gray-400)]">
                        {rv.start}
                      </span>
                      <span className={cn("min-w-0 flex-1 truncate text-sm", cancelled && "line-through opacity-55")}>
                        <span className="text-[var(--color-gray-800)]">{svc?.name ?? "Prestation"}</span>
                        <span className="text-[var(--color-gray-500)]">
                          {" · "}
                          {staffName(rv.staffId) ?? "Inconnue"}
                          {rv.secondStaffId ? ` + ${staffName(rv.secondStaffId)}` : ""}
                          {benef ? ` · pour ${benef}` : ""}
                        </span>
                      </span>
                      {rv.secondStaffId && (
                        <Users aria-hidden className="size-3.5 shrink-0 text-[var(--brand-taupe-muted)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
