"use client";

import { useState } from "react";
import { Calendar, Clock, Scissors, User } from "lucide-react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Badge, type BadgeVariant } from "@/components/ui/atoms/badge";
import { Button } from "@/components/ui/atoms/button";
import { Card } from "@/components/ui/atoms/card";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import { serviceById } from "@/lib/data/catalogue";
import { appointmentEndTime } from "@/lib/data/planning";
import { formatFcfa } from "@/lib/utils";
import type { AppointmentStatus, RendezVous } from "@/lib/data/types";

const STATUS: Record<AppointmentStatus, { label: string; variant: BadgeVariant }> = {
  confirme: { label: "Confirmé", variant: "success" },
  en_attente: { label: "En attente", variant: "warning" },
  annule: { label: "Annulé", variant: "error" },
};

type AppointmentDetailDialogProps = {
  open: boolean;
  appointment: RendezVous | null;
  onClose: () => void;
  onEdit: (appointment: RendezVous) => void;
  /** Delegates to the shared useAccueil() guard so a "Marquer indisponible" praticienne never
   *  silently receives the cliente — same helper the Chronologie du jour calls. */
  onAccueil: (appointmentId: string) => void;
};

/** Détail rendez-vous — informative dialog (not alertdialog) reached from the Chronologie du jour and Planning complet's grid. */
export function AppointmentDetailDialog({ open, appointment, onClose, onEdit, onAccueil }: AppointmentDetailDialogProps) {
  const { clients, praticiennes, confirmAppointment, cancelAppointment } = useAppData();
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!open || !appointment) return null;

  const client = clients.find((c) => c.id === appointment.clientId);
  const staff = praticiennes.find((p) => p.id === appointment.staffId);
  const service = serviceById(appointment.serviceId);
  const status = STATUS[appointment.status];
  const hasOpenSale = Boolean(appointment.saleId);

  return (
    <>
      <Dialog open={open} labelledBy="appointment-detail-title" className="relative max-w-lg rounded-3xl p-6">
        <CloseButton onClick={onClose} />

        <div className="flex items-center gap-2">
          <h2 id="appointment-detail-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
            {client ? clientFullName(client) : "Cliente"}
          </h2>
          <Badge variant={status.variant}>{status.label}</Badge>
          {hasOpenSale && <Badge variant="dark">En cours</Badge>}
        </div>

        <Card className="mt-4 flex flex-col gap-3 border-none bg-[var(--brand-rose-soft)] p-4 shadow-none">
          <div className="flex items-center gap-3 text-sm text-[var(--color-gray-800)]">
            <Clock aria-hidden className="size-4 shrink-0 text-[var(--brand-taupe-muted)]" />
            {appointment.start} – {appointmentEndTime(appointment)} · {appointment.durationMin} min
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--color-gray-800)]">
            <Scissors aria-hidden className="size-4 shrink-0 text-[var(--brand-taupe-muted)]" />
            {service ? `${service.name} · ${formatFcfa(service.price)}` : "Prestation inconnue"}
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--color-gray-800)]">
            <User aria-hidden className="size-4 shrink-0 text-[var(--brand-taupe-muted)]" />
            {staff?.name ?? "Praticien·ne inconnue"}
            {staff?.unavailableToday && <Badge variant="warning">Praticien·ne absente</Badge>}
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--color-gray-800)]">
            <Calendar aria-hidden className="size-4 shrink-0 text-[var(--brand-taupe-muted)]" />
            Aujourd&apos;hui
          </div>
        </Card>

        <div className="mt-5 flex flex-col gap-2">
          {appointment.status === "en_attente" && (
            <Button variant="success" onClick={() => confirmAppointment(appointment.id)}>
              Confirmer
            </Button>
          )}
          {appointment.status !== "annule" && (
            <Button variant="dark" onClick={() => onAccueil(appointment.id)}>
              {hasOpenSale ? "Voir la vente en cours" : "Accueillir maintenant"}
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onEdit(appointment)} className="flex-1">
              Modifier
            </Button>
            {appointment.status !== "annule" && (
              <Button variant="danger-outline" onClick={() => setConfirmCancel(true)} className="flex-1">
                Annuler
              </Button>
            )}
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmCancel}
        title="Annuler ce rendez-vous ?"
        description={
          hasOpenSale
            ? "Un onglet de vente est ouvert pour ce rendez-vous — l'annuler ne le fermera pas."
            : "Le rendez-vous passera au statut Annulé et restera consultable via « Afficher les annulés » dans le Planning complet."
        }
        confirmLabel="Annuler le rendez-vous"
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
