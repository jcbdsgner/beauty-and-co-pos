"use client";

import { useState } from "react";
import { Clock, Scissors, User, Users } from "lucide-react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Button } from "@/components/ui/atoms/button";
import { FlipChip, Legend, type ChipTone } from "@/components/ui/board";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import { serviceById } from "@/lib/data/menu";
import { appointmentEndTime, reservationForRendezVous } from "@/lib/data/planning";
import { formatFcfa } from "@/lib/utils";
import type { AppointmentStatus, RendezVous } from "@/lib/data/types";

const STATUS: Record<AppointmentStatus, { value: string; tone: ChipTone }> = {
  confirme: { value: "Confirmé", tone: "now" },
  en_attente: { value: "En attente", tone: "act" },
  annule: { value: "Annulé", tone: "void" },
};

type Props = {
  /** The rendez-vous the receptionist tapped — the sheet shows its whole réservation. */
  appointment: RendezVous | null;
  onClose: () => void;
  onEncaisser: (reservationId: string) => void;
};

/** Fiche rendez-vous — le détail de la réservation (payeuse, prestations, praticiennes), avec
 *  Confirmer / Encaisser / Annuler. Pas d'édition : la prise de rendez-vous se fait en ligne. */
export function AppointmentDetailSheet({ appointment, onClose, onEncaisser }: Props) {
  const { clients, praticiennes, reservations, confirmAppointment, cancelAppointment } = useAppData();
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!appointment) return null;

  const reservation = reservationForRendezVous(reservations, appointment.id);
  const payer = clients.find((c) => c.id === reservation?.payerClientId);
  const status = STATUS[appointment.status];
  const hasSale = Boolean(reservation?.saleId);
  const lines = reservation?.rendezVous ?? [appointment];
  const total = lines
    .filter((rv) => rv.status !== "annule")
    .reduce((sum, rv) => sum + (serviceById(rv.serviceId)?.price ?? 0), 0);

  function staffLabel(rv: RendezVous) {
    const first = praticiennes.find((p) => p.id === rv.staffId)?.name ?? "Inconnue";
    const second = rv.secondStaffId ? praticiennes.find((p) => p.id === rv.secondStaffId)?.name : null;
    return second ? `${first} + ${second} · à 2` : first;
  }

  function beneficiaryLabel(rv: RendezVous) {
    if (rv.beneficiaryClientId) {
      const c = clients.find((x) => x.id === rv.beneficiaryClientId);
      return c ? clientFullName(c) : null;
    }
    return rv.beneficiaryName ?? null;
  }

  return (
    <>
      <Dialog open labelledBy="rdv-detail-title" className="relative w-full max-w-lg overflow-hidden rounded-[14px] p-0">
        <CloseButton onClick={onClose} />

        <div className="flex flex-wrap items-center gap-2 bg-[var(--board-slate)] px-6 py-5 text-white">
          <h2 id="rdv-detail-title" className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            {payer ? clientFullName(payer) : "Cliente"}
          </h2>
          <FlipChip value={status.value} tone={status.tone} />
          {hasSale && <FlipChip value="En cours" tone="signal" />}
          <span className="w-full text-[0.7rem] text-white/60">
            {reservation?.source === "comptoir" ? "Notée au comptoir" : "Réservée en ligne"} · règle {lines.length > 1 ? `${lines.length} prestations` : "la prestation"}
          </span>
        </div>

        <div className="flex flex-col divide-y divide-[var(--board-groove)]">
          {lines.map((rv) => {
            const service = serviceById(rv.serviceId);
            const benef = beneficiaryLabel(rv);
            return (
              <div key={rv.id} className="flex items-start gap-3 px-6 py-3.5">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-rose-soft)] text-[var(--brand-taupe-muted)]">
                  <Scissors className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--color-gray-900)]">
                    {service?.name ?? "Prestation"}
                    {rv.status === "annule" && <span className="ml-1.5 text-[var(--color-gray-400)]">· annulé</span>}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--color-gray-500)]">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" /> {rv.start} – {appointmentEndTime(rv)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      {rv.secondStaffId ? <Users className="size-3" /> : <User className="size-3" />} {staffLabel(rv)}
                    </span>
                    {benef && <span className="text-[var(--brand-taupe-muted)]">pour {benef}</span>}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--color-gray-800)]">
                  {service ? formatFcfa(service.price) : "—"}
                </span>
              </div>
            );
          })}
          <div className="flex items-center justify-between px-6 py-3">
            <Legend>Total prestations</Legend>
            <span className="text-sm font-bold tabular-nums text-[var(--color-gray-900)]">{formatFcfa(total)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-5">
          {appointment.status === "en_attente" && (
            <Button variant="success" onClick={() => confirmAppointment(appointment.id)}>
              Confirmer cette prestation
            </Button>
          )}
          {reservation && appointment.status !== "annule" && (
            <Button variant="dark" onClick={() => onEncaisser(reservation.id)}>
              {hasSale ? "Voir la vente en cours" : "Encaisser la réservation"}
            </Button>
          )}
          {appointment.status !== "annule" && (
            <Button variant="danger-outline" onClick={() => setConfirmCancel(true)}>
              Annuler cette prestation
            </Button>
          )}
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmCancel}
        title="Annuler cette prestation ?"
        description={
          hasSale
            ? "Une vente est ouverte pour cette réservation — l'annuler ne la fermera pas."
            : "La prestation passera au statut Annulé et restera consultable via « Afficher les annulés »."
        }
        confirmLabel="Annuler la prestation"
        cancelLabel="Retour"
        confirmVariant="danger"
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() => {
          cancelAppointment(appointment.id);
          setConfirmCancel(false);
          onClose();
        }}
      />
    </>
  );
}
