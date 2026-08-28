"use client";

import { useState } from "react";
import { UserX } from "lucide-react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { Button } from "@/components/ui/atoms/button";
import { Select } from "@/components/ui/atoms/select";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import { serviceById } from "@/lib/data/menu";
import type { Reservation } from "@/lib/data/types";

type ReplaceStaffDialogProps = {
  open: boolean;
  reservation: Reservation | null;
  onCancel: () => void;
  /** One replacement praticienne per affected rendez-vous, keyed by rendez-vous id. */
  onConfirm: (staffOverrides: Record<string, string>) => void;
};

/**
 * Guard shown when "Encaisser" is tapped on a réservation that has at least one rendez-vous whose
 * praticienne was just marked "indisponible aujourd'hui". Per USERFLOW.md § Équipe: never let the
 * sale be attributed to someone who wasn't there — the replacement who actually did each prestation
 * must be chosen before the Comptoir opens.
 */
export function ReplaceStaffDialog({ open, reservation, onCancel, onConfirm }: ReplaceStaffDialogProps) {
  const { praticiennes, clients } = useAppData();
  const [picks, setPicks] = useState<Record<string, string>>({});

  if (!open || !reservation) return null;

  const payer = clients.find((c) => c.id === reservation.payerClientId);
  const affected = reservation.rendezVous.filter(
    (rv) => rv.status !== "annule" && praticiennes.find((p) => p.id === rv.staffId)?.unavailableToday,
  );
  const allChosen = affected.every((rv) => picks[rv.id]);

  return (
    <Dialog open={open} labelledBy="replace-staff-title" className="max-w-md rounded-3xl p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-[var(--color-warning-soft)] text-[var(--color-warning)]">
          <UserX aria-hidden className="size-6" />
        </span>
        <h2 id="replace-staff-title" className="font-[family-name:var(--font-heading)] font-semibold text-lg text-[var(--color-gray-900)]">
          Une praticienne est absente aujourd&apos;hui
        </h2>
        <p className="text-sm text-[var(--color-gray-500)]">
          {`${payer ? clientFullName(payer) : "La cliente"} avait un rendez-vous avec une praticienne absente. Indiquez qui a réalisé la prestation avant d'ouvrir le Comptoir.`}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {affected.map((rv) => {
          const original = praticiennes.find((p) => p.id === rv.staffId);
          const service = serviceById(rv.serviceId);
          const candidates = praticiennes.filter(
            (p) => p.workingToday && !p.unavailableToday && p.id !== rv.staffId && (!original || p.role === original.role),
          );
          return (
            <div key={rv.id} className="flex flex-col gap-1.5">
              <FieldLabel variant="plain">
                {service?.name ?? "Prestation"} · {original?.name ?? "praticienne"} absente
              </FieldLabel>
              {candidates.length === 0 ? (
                <p className="rounded-xl bg-[var(--color-gray-100)] px-4 py-3 text-sm text-[var(--color-gray-500)]">
                  Aucune autre {original?.role === "coiffeuse" ? "coiffeuse" : "praticienne"} disponible aujourd&apos;hui.
                </p>
              ) : (
                <Select
                  value={picks[rv.id] ?? ""}
                  onChange={(v) => setPicks((p) => ({ ...p, [rv.id]: v }))}
                  options={candidates.map((p) => ({ value: p.id, label: p.name }))}
                  placeholder="Choisir une praticienne…"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button
          type="button"
          variant="dark"
          onClick={() => allChosen && onConfirm(picks)}
          disabled={!allChosen}
          className="flex-1"
        >
          Ouvrir le Comptoir
        </Button>
      </div>
    </Dialog>
  );
}
