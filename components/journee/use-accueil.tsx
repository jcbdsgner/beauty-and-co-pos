"use client";

import { useState } from "react";
import { useAppData } from "@/components/providers/app-data-provider";
import { ReplaceStaffDialog } from "@/components/journee/replace-staff-dialog";
import type { RendezVous } from "@/lib/data/types";

/**
 * "Accueillir" — LE point d'entrée principal d'une vente liée à un rendez-vous (cf. USERFLOW.md
 * § Journée). Wraps `openNewTab({ appointmentId })` with the one guard the spec calls out: a
 * rendez-vous whose praticienne was marked "indisponible aujourd'hui" must get a replacement
 * chosen first, never a silent hand-off to an empty chair. Re-tapping an already-accueilli
 * rendez-vous (saleId set) is handled inside openNewTab itself (switches to the existing tab).
 *
 * Shared between the Chronologie du jour and Détail rendez-vous so the guard behaves identically
 * from either entry point.
 */
export function useAccueil() {
  const { appointments, praticiennes, openNewTab } = useAppData();
  const [pending, setPending] = useState<RendezVous | null>(null);

  function requestAccueil(appointmentId: string) {
    const appt = appointments.find((a) => a.id === appointmentId);
    if (!appt) return;
    if (!appt.saleId) {
      const staff = praticiennes.find((p) => p.id === appt.staffId);
      if (staff?.unavailableToday) {
        setPending(appt);
        return;
      }
    }
    openNewTab({ appointmentId });
  }

  const accueilDialog = (
    <ReplaceStaffDialog
      open={pending !== null}
      appointment={pending}
      onCancel={() => setPending(null)}
      onConfirm={(staffId) => {
        if (!pending) return;
        openNewTab({ appointmentId: pending.id, staffOverride: staffId });
        setPending(null);
      }}
    />
  );

  return { requestAccueil, accueilDialog };
}
