"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/atoms/button";
import { BoardHeader, Legend } from "@/components/ui/board";
import { AppointmentDetailSheet } from "@/components/planning/appointment-detail-sheet";
import { AccueilDayList } from "@/components/journee/accueil-day-list";
import { AccueilGiftCards } from "@/components/journee/accueil-gift-cards";
import { useEncaissement } from "@/components/journee/use-encaissement";
import { useAppData } from "@/components/providers/app-data-provider";
import { BOOKING_URL, groupDayByReservation } from "@/lib/data/planning";
import type { RendezVous } from "@/lib/data/types";

/** Today as "YYYY-MM-DD" (local). */
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Accueil — l'écran d'atterrissage (Figma 156-69). Deux sections seulement : « Cartes cadeaux »,
 * un aperçu de la file de préparation (docs/adr/0012), qui s'efface quand il n'y a rien ; puis
 * « Le jour », la journée en cartes chronologiques par réservation (docs/adr/0014) — une ligne =
 * une payeuse, triée par heure. Plus de bloc de compteurs : la journée est là, la file a son lien.
 */
export default function AccueilPage() {
  const { reservations, praticiennes, clients } = useAppData();
  const { requestEncaissement, encaissementDialog } = useEncaissement();

  const [detail, setDetail] = useState<RendezVous | null>(null);

  // « Le jour » = la journée en cours seulement. Le seed `RESERVATIONS` porte aujourd'hui par
  // défaut ; la passe Planning y ajoute un champ `date` pour ses vues Semaine — on filtre donc
  // sur le jour, sans dépendre de son helper `reservationDate` (pas encore committé).
  const reservationRows = useMemo(() => {
    const today = todayISO();
    const todayOnly = reservations.filter((r) => ((r as { date?: string }).date ?? today) === today);
    return groupDayByReservation(todayOnly);
  }, [reservations]);

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

      <AccueilGiftCards />

      <section>
        <div className="mb-2 pl-1">
          <Legend>Le jour</Legend>
        </div>
        {reservationRows.length === 0 ? (
          <div className="rounded-field border border-dashed border-base-300 px-4 py-12 text-center">
            <p className="font-[family-name:var(--font-heading)] text-[15px] font-semibold text-base-content/60">
              Journée libre
            </p>
            <p className="mt-1 text-sm text-base-content/45">Aucun rendez-vous aujourd&apos;hui.</p>
            <Button href="/planning" variant="outline" size="sm" className="mt-4">
              Ouvrir le planning
            </Button>
          </div>
        ) : (
          <AccueilDayList
            rows={reservationRows}
            clients={clients}
            praticiennes={praticiennes}
            onOpenReservation={setDetail}
            onEncaisser={requestEncaissement}
          />
        )}
      </section>

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
