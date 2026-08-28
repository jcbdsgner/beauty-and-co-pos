"use client";

import { useState } from "react";
import { useAppData } from "@/components/providers/app-data-provider";
import { ReplaceStaffDialog } from "@/components/journee/replace-staff-dialog";
import { reservationById } from "@/lib/data/planning";
import type { Reservation } from "@/lib/data/types";

/**
 * "Encaisser" — the receptionist's real moment with a réservation. The cliente booked online,
 * came in, had her prestation(s); now the payeuse is at the counter to settle everything in one
 * go. Tapping this opens a Comptoir tab pre-filled with the payeuse + every prestation planifiée
 * of the réservation, ready to take payment.
 *
 * The one guard the spec calls out: any rendez-vous whose praticienne was marked "indisponible
 * aujourd'hui" must get a replacement chosen first, so the sale is attributed to whoever actually
 * did the prestation. Re-tapping a réservation that already has a sale is handled inside
 * `openNewTab` (switches to the existing tab).
 *
 * Shared between the Chronologie du jour, the Planning grid and the Fiche rendez-vous so the guard
 * behaves identically from every entry point.
 */
export function useEncaissement() {
  const { reservations, praticiennes, openNewTab } = useAppData();
  const [pending, setPending] = useState<Reservation | null>(null);

  function requestEncaissement(reservationId: string) {
    const reservation = reservationById(reservations, reservationId);
    if (!reservation) return;
    if (!reservation.saleId) {
      const hasAbsent = reservation.rendezVous.some((rv) => {
        if (rv.status === "annule") return false;
        return praticiennes.find((p) => p.id === rv.staffId)?.unavailableToday;
      });
      if (hasAbsent) {
        setPending(reservation);
        return;
      }
    }
    openNewTab({ reservationId });
  }

  const encaissementDialog = (
    <ReplaceStaffDialog
      open={pending !== null}
      reservation={pending}
      onCancel={() => setPending(null)}
      onConfirm={(staffOverrides) => {
        if (!pending) return;
        openNewTab({ reservationId: pending.id, staffOverrides });
        setPending(null);
      }}
    />
  );

  return { requestEncaissement, encaissementDialog };
}
