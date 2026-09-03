"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { BoardHeader, Board, Legend, BoardEmpty } from "@/components/ui/board";
import { AppointmentDetailSheet } from "@/components/planning/appointment-detail-sheet";
import { DayList } from "@/components/planning/day-list";
import { useEncaissement } from "@/components/journee/use-encaissement";
import { useAppData } from "@/components/providers/app-data-provider";
import { BOOKING_URL, groupDayByReservation } from "@/lib/data/planning";
import { cn } from "@/lib/utils";
import type { RendezVous } from "@/lib/data/types";

/**
 * Accueil — l'écran d'atterrissage, langage « Le Tableau » (docs/adr/0005). Un point du jour calme
 * (pas de hero-metrics) et « Le jour » : la vue journée par réservation partagée avec le Planning
 * (docs/adr/0014) — une ligne = une payeuse, triée par heure.
 */
export default function AccueilPage() {
  const { reservations, praticiennes, clients, giftCardOrders } = useAppData();
  const { requestEncaissement, encaissementDialog } = useEncaissement();

  const [detail, setDetail] = useState<RendezVous | null>(null);

  const cartesAPreparer = giftCardOrders.filter(
    (o) => o.status === "a_imprimer" || o.status === "imprimee",
  ).length;

  const reservationRows = useMemo(() => groupDayByReservation(reservations), [reservations]);

  return (
    <div className="flex flex-col gap-6">
      <BoardHeader
        section="Accueil"
        action={
          <Button href={BOOKING_URL} external variant="outline" size="sm">
            Créer un rendez-vous
          </Button>
        }
      />

      {/* Le point du jour — deux repères, pas trois hero-metrics */}
      <Board legend="Le point du jour" tone="now">
        <div className="flex divide-x divide-[var(--board-groove)]">
          <PointCell
            href="/cartes-cadeaux"
            label="Cartes à préparer"
            value={cartesAPreparer > 0 ? String(cartesAPreparer) : "Aucune carte à préparer"}
            hint="Ouvrir la file"
            muted={cartesAPreparer === 0}
          />
          <PointCell
            href="/planning"
            label="Réservations du jour"
            value={reservationRows.length > 0 ? String(reservationRows.length) : "Journée libre"}
            hint="Ouvrir le planning"
            muted={reservationRows.length === 0}
          />
        </div>
      </Board>

      {/* Le jour — la vue journée par réservation, partagée avec le Planning (docs/adr/0014) */}
      <Board legend="Le jour">
        {reservationRows.length === 0 ? (
          <BoardEmpty
            title="Journée libre"
            hint="Aucun rendez-vous aujourd'hui."
            action={
              <Button href="/planning" variant="outline">
                Ouvrir le planning
              </Button>
            }
          />
        ) : (
          <DayList
            rows={reservationRows}
            clients={clients}
            praticiennes={praticiennes}
            onOpenReservation={setDetail}
            onEncaisser={requestEncaissement}
          />
        )}
      </Board>

      <AppointmentDetailSheet
        appointment={detail}
        onClose={() => setDetail(null)}
        onEncaisser={(id) => {
          setDetail(null);
          requestEncaissement(id);
        }}
      />

      {encaissementDialog}
    </div>
  );
}

function PointCell({
  href,
  label,
  value,
  hint,
  muted,
}: {
  href: string;
  label: string;
  value: string;
  hint: string;
  muted?: boolean;
}) {
  return (
    <Link href={href} className="group flex flex-1 items-center justify-between gap-3 px-5 py-4 transition hover:bg-black/[0.02]">
      <span className="min-w-0">
        <Legend>{label}</Legend>
        <span
          className={cn(
            "mt-0.5 block font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-gray-900)]",
            !muted && "tabular-nums",
            muted && "text-[var(--color-gray-400)]",
          )}
        >
          {value}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--brand-taupe-muted)]">
        {hint}
        <ChevronRight className="size-3.5 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
