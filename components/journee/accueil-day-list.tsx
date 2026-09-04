"use client";

import { useMemo } from "react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Button } from "@/components/ui/atoms/button";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import { serviceById } from "@/lib/data/menu";
import { timeToMinutes, type ReservationDayRow } from "@/lib/data/planning";
import { cn } from "@/lib/utils";
import type { Cliente, Praticienne, RendezVous } from "@/lib/data/types";

type Props = {
  rows: ReservationDayRow[];
  clients: Cliente[];
  praticiennes: Praticienne[];
  /** Ouvre la fiche réservation (le sheet), pointée sur ce rendez-vous. */
  onOpenReservation: (rv: RendezVous) => void;
  onEncaisser: (reservationId: string) => void;
};

function currentMinute(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

/**
 * « Le jour » sur l'Accueil (Figma 156-72) — la journée en cartes chronologiques : une carte par
 * réservation, heure · payeuse · prestations, « Voir les détails » + « Encaisser ». Volontairement
 * plus simple que la `DayList` du Planning (pas de rail, pas de filet « maintenant », pas de
 * dépliage des prestations) : l'Accueil trie, le Planning est l'établi. Elles pourront reconverger
 * quand le Planning passera à daisyUI.
 */
export function AccueilDayList({ rows, clients, praticiennes, onOpenReservation, onEncaisser }: Props) {
  const now = currentMinute();

  // Equal-start sub-sort by payeuse name — the receptionist scans an alphabetised column.
  const sorted = useMemo(() => {
    const name = (r: ReservationDayRow) => {
      const c = clients.find((x) => x.id === r.reservation.payerClientId);
      return c ? clientFullName(c) : "";
    };
    return [...rows].sort(
      (a, b) => a.start.localeCompare(b.start) || name(a).localeCompare(name(b), "fr"),
    );
  }, [rows, clients]);

  const staffName = (id?: string) => (id ? praticiennes.find((p) => p.id === id)?.name : undefined);

  return (
    <div className="flex flex-col gap-2.5">
      {sorted.map((row) => {
        const { reservation, rendezVous, staffIds } = row;
        const payer = clients.find((c) => c.id === reservation.payerClientId);
        const active = rendezVous.filter((rv) => rv.status !== "annule");
        const hasSale = Boolean(reservation.saleId);
        const summary = active.map((rv) => serviceById(rv.serviceId)?.name ?? "Prestation").join(" + ");

        const startMin = timeToMinutes(row.start);
        const endMin = timeToMinutes(row.end);
        const phase = endMin <= now ? "past" : startMin <= now ? "current" : "upcoming";
        const awaitingCheckout = phase === "past" && !hasSale;
        const past = phase === "past" && !awaitingCheckout;

        const staffLabel =
          staffIds.length > 1
            ? ` · ${staffIds.length} praticiennes`
            : staffIds.length === 1
              ? ` · ${staffName(staffIds[0])}`
              : "";

        const target = active[0] ?? rendezVous[0];

        return (
          <div
            key={reservation.id}
            className="flex items-center gap-3 rounded-field border border-base-300 bg-base-100 px-4"
          >
            <button
              type="button"
              onClick={() => target && onOpenReservation(target)}
              className="flex min-w-0 flex-1 items-center gap-3 py-3 text-left transition active:opacity-70"
            >
              <span className={cn("flex w-16 shrink-0 flex-col items-center text-center leading-tight", past && "opacity-55")}>
                <span className="text-sm font-semibold tabular-nums text-base-content/55">{row.start}</span>
                <span className="text-[0.7rem] tabular-nums text-base-content/40">→ {row.end}</span>
              </span>

              <span className={cn("min-w-0 flex-1 py-0.5", past && "opacity-70")}>
                <span className="flex items-center gap-2">
                  <Avatar
                    initial={payer ? clientInitial(payer) : "?"}
                    size={26}
                    className="bg-accent text-[0.65rem] font-bold text-base-content"
                  />
                  <span className="truncate font-[family-name:var(--font-heading)] text-[15px] font-semibold text-base-content">
                    {payer ? clientFullName(payer) : "Cliente"}
                  </span>
                </span>
                <span className="mt-1 block truncate text-sm text-base-content/55">
                  {summary || "Prestation"}
                  {staffLabel}
                  {awaitingCheckout && <span className="font-semibold text-warning"> · à encaisser</span>}
                  {phase === "current" && <span className="font-semibold text-base-content/70"> · en cours</span>}
                </span>
              </span>
            </button>

            <span className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="min-w-[120px]"
                onClick={() => target && onOpenReservation(target)}
              >
                Voir les détails
              </Button>
              <Button
                variant={hasSale ? "outline" : "dark"}
                size="sm"
                className="min-w-[120px]"
                onClick={() => onEncaisser(reservation.id)}
              >
                {hasSale ? "Voir la vente" : "Encaisser"}
              </Button>
            </span>
          </div>
        );
      })}
    </div>
  );
}
