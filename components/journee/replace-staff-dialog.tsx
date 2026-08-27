"use client";

import { useState } from "react";
import { UserX } from "lucide-react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { Button } from "@/components/ui/atoms/button";
import { Select } from "@/components/ui/atoms/select";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import type { RendezVous } from "@/lib/data/types";

type ReplaceStaffDialogProps = {
  open: boolean;
  appointment: RendezVous | null;
  onCancel: () => void;
  onConfirm: (staffId: string) => void;
};

/**
 * Guard shown when "Accueillir" is tapped on a rendez-vous whose praticienne was just marked
 * "indisponible aujourd'hui" (last-minute absence). Per USERFLOW.md § Équipe: never silently
 * send the cliente to an empty chair — a replacement must be chosen before the Comptoir opens.
 */
export function ReplaceStaffDialog({ open, appointment, onCancel, onConfirm }: ReplaceStaffDialogProps) {
  const { praticiennes, clients } = useAppData();
  const [staffId, setStaffId] = useState("");

  if (!open || !appointment) return null;

  const originalStaff = praticiennes.find((p) => p.id === appointment.staffId);
  const client = clients.find((c) => c.id === appointment.clientId);
  const candidates = praticiennes.filter(
    (p) => p.workingToday && !p.unavailableToday && p.id !== appointment.staffId && (!originalStaff || p.role === originalStaff.role),
  );

  return (
    <Dialog open={open} labelledBy="replace-staff-title" className="max-w-md rounded-3xl p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-[var(--color-warning-soft)] text-[var(--color-warning)]">
          <UserX aria-hidden className="size-6" />
        </span>
        <h2 id="replace-staff-title" className="font-[var(--font-heading)] text-lg text-[var(--color-gray-900)]">
          {`${originalStaff?.name ?? "Cette praticienne"} est absente aujourd'hui`}
        </h2>
        <p className="text-sm text-[var(--color-gray-500)]">
          {`${client ? clientFullName(client) : "La cliente"} avait rendez-vous avec ${originalStaff?.name ?? "elle"}. Choisissez une remplaçante avant d'ouvrir le Comptoir.`}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-1.5">
        <FieldLabel variant="plain">Remplaçante *</FieldLabel>
        {candidates.length === 0 ? (
          <p className="rounded-xl bg-[var(--color-gray-100)] px-4 py-3 text-sm text-[var(--color-gray-500)]">
            Aucune autre {originalStaff?.role === "coiffeuse" ? "coiffeuse" : "praticienne"} disponible aujourd&apos;hui.
          </p>
        ) : (
          <Select
            value={staffId}
            onChange={setStaffId}
            options={candidates.map((p) => ({ value: p.id, label: p.name }))}
            placeholder="Choisir une praticienne…"
          />
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button
          type="button"
          variant="dark"
          onClick={() => staffId && onConfirm(staffId)}
          disabled={!staffId}
          className="flex-1"
        >
          Accueillir maintenant
        </Button>
      </div>
      {candidates.length === 0 && (
        <p className="mt-2 text-center text-xs text-[var(--color-gray-400)]">
          Ajoutez une disponibilité en Équipe pour pouvoir accueillir ce rendez-vous.
        </p>
      )}
    </Dialog>
  );
}
