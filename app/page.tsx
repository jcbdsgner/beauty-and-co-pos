"use client";

import { useMemo, useState } from "react";
import { CalendarRange, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { SegmentedToggle } from "@/components/ui/molecules/segmented-toggle";
import { BoardHeader, Legend } from "@/components/ui/board";
import { AppointmentDetailSheet } from "@/components/planning/appointment-detail-sheet";
import { CreateReservationDialog } from "@/components/planning/create-reservation-dialog";
import { AccueilCalendar } from "@/components/journee/accueil-calendar";
import { AccueilDayList } from "@/components/journee/accueil-day-list";
import { AccueilGiftCards } from "@/components/journee/accueil-gift-cards";
import { useEncaissement } from "@/components/journee/use-encaissement";
import { useAppData } from "@/components/providers/app-data-provider";
import { groupDayByReservation } from "@/lib/data/planning";
import type { RendezVous } from "@/lib/data/types";

/** Today as "YYYY-MM-DD" (local). */
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type AccueilView = "liste" | "calendrier";

/**
 * Accueil — l'écran d'atterrissage (Figma 242:1735). Deux sections seulement : « Cartes cadeaux »,
 * un aperçu de la file de préparation (docs/adr/0012), qui s'efface quand il n'y a rien ; puis
 * « Rendez-vous », la journée du jour (docs/adr/0014) — basculable entre **Liste** (grille fixe de
 * 3 cartes par réservation, docs/adr/0018) et **Calendrier** (rail heures, un bloc = une
 * réservation, docs/adr/0019). Plus de bloc de compteurs : la journée est là, la file a son lien.
 */
export default function AccueilPage() {
  const { reservations, praticiennes, clients } = useAppData();
  const { requestEncaissement, encaissementDialog } = useEncaissement();

  const [detail, setDetail] = useState<RendezVous | null>(null);
  const [view, setView] = useState<AccueilView>("liste");
  const [creatingRdv, setCreatingRdv] = useState(false);

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
          <div className="flex items-center gap-2">
            {/* /recap-ventes était une route orpheline, jamais atteignable qu'en tapant l'URL
                (audit UX du 19/09) — point d'entrée depuis l'Accueil. */}
            <Button href="/recap-ventes" variant="outline" size="sm">
              Voir le récap
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCreatingRdv(true)}>
              Créer un rendez-vous
            </Button>
          </div>
        }
      />

      <AccueilGiftCards />

      <section>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3 pl-1">
          <Legend>Rendez-vous</Legend>
          {reservationRows.length > 0 && (
            <SegmentedToggle
              value={view}
              onChange={(v) => setView(v as AccueilView)}
              options={[
                { value: "liste", label: "Liste", icon: <ListChecks className="size-4" /> },
                { value: "calendrier", label: "Calendrier", icon: <CalendarRange className="size-4" /> },
              ]}
            />
          )}
        </div>
        {reservationRows.length === 0 ? (
          <div className="rounded-field border border-dashed border-base-300 px-4 py-12 text-center">
            <p className="font-[family-name:var(--font-heading)] text-[15px] font-semibold text-base-content/60">
              Journée libre
            </p>
            <p className="mt-1 text-sm text-base-content/45">Aucun rendez-vous aujourd&apos;hui.</p>
          </div>
        ) : view === "liste" ? (
          <AccueilDayList
            rows={reservationRows}
            clients={clients}
            praticiennes={praticiennes}
            onOpenReservation={setDetail}
            onEncaisser={requestEncaissement}
          />
        ) : (
          <AccueilCalendar
            rows={reservationRows}
            clients={clients}
            praticiennes={praticiennes}
            onOpenReservation={setDetail}
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

      <CreateReservationDialog open={creatingRdv} onClose={() => setCreatingRdv(false)} />
    </div>
  );
}
