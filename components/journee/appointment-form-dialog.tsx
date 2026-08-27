"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Button } from "@/components/ui/atoms/button";
import { Select } from "@/components/ui/atoms/select";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Field } from "@/components/ui/molecules/field";
import { Pills } from "@/components/ui/molecules/pills";
import { Alert } from "@/components/ui/molecules/alert";
import { ClientSearchField } from "@/components/shared/client-search-field";
import { useAppData } from "@/components/providers/app-data-provider";
import { SLOT_START_TIMES, timeToMinutes } from "@/lib/data/planning";
import { SERVICES } from "@/lib/data/catalogue";
import type { AppointmentStatus, RendezVous } from "@/lib/data/types";

type AppointmentFormDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Set when editing an existing rendez-vous — otherwise the dialog creates a new one. */
  appointment?: RendezVous | null;
  /** Prefill when opened from an empty grid cell in Planning complet. */
  prefill?: { staffId?: string; start?: string };
};

const STATUS_OPTIONS = [
  { value: "en_attente", label: "En attente" },
  { value: "confirme", label: "Confirmé" },
];

function overlaps(aStart: number, aDur: number, bStart: number, bDur: number) {
  return aStart < bStart + bDur && bStart < aStart + aDur;
}

/** Formulaire rendez-vous (création/édition) — Dialog, per USERFLOW.md § Journée. */
export function AppointmentFormDialog({ open, onClose, appointment, prefill }: AppointmentFormDialogProps) {
  return (
    <Dialog open={open} labelledBy="appointment-form-title" className="relative max-w-lg rounded-3xl p-6">
      {open && (
        <AppointmentForm
          key={appointment?.id ?? `new-${prefill?.staffId ?? ""}-${prefill?.start ?? ""}`}
          onClose={onClose}
          appointment={appointment}
          prefill={prefill}
        />
      )}
    </Dialog>
  );
}

function AppointmentForm({ onClose, appointment, prefill }: Omit<AppointmentFormDialogProps, "open">) {
  const { appointments, praticiennes, createAppointment, updateAppointment } = useAppData();
  const isEdit = Boolean(appointment);

  const [clientId, setClientId] = useState<string | null>(appointment?.clientId ?? null);
  const [serviceId, setServiceId] = useState(appointment?.serviceId ?? "");
  const [staffId, setStaffId] = useState(appointment?.staffId ?? prefill?.staffId ?? "");
  const [start, setStart] = useState(appointment?.start ?? prefill?.start ?? "");
  const [duration, setDuration] = useState(appointment ? String(appointment.durationMin) : "");
  const [status, setStatus] = useState<AppointmentStatus>(
    appointment && appointment.status !== "annule" ? appointment.status : "confirme",
  );
  const [error, setError] = useState<string | null>(null);
  const [durationTouched, setDurationTouched] = useState(false);

  const workingStaff = praticiennes.filter((p) => p.workingToday && p.role !== "accueil");
  const durationMin = Number(duration) || 0;

  // Slots already taken for the selected staff (excluding the appointment being edited and
  // cancelled ones) — disabled rather than removed, so the receptionist sees a slot exists but
  // is unavailable (per USERFLOW.md's Formulaire spec).
  const takenStarts = new Set(
    appointments
      .filter((a) => a.staffId === staffId && a.status !== "annule" && a.id !== appointment?.id)
      .map((a) => a.start),
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!clientId || !serviceId || !staffId || !start || durationMin <= 0) {
      setError("Merci de compléter tous les champs obligatoires.");
      return;
    }

    const startMin = timeToMinutes(start);
    const conflict = appointments.some(
      (a) =>
        a.staffId === staffId &&
        a.status !== "annule" &&
        a.id !== appointment?.id &&
        overlaps(startMin, durationMin, timeToMinutes(a.start), a.durationMin),
    );
    if (conflict) {
      setError("Ce créneau chevauche un autre rendez-vous de cette praticienne — choisissez un autre horaire.");
      return;
    }

    const data = { clientId, serviceId, staffId, start, durationMin, status };
    if (appointment) {
      updateAppointment(appointment.id, data);
    } else {
      createAppointment(data);
    }
    onClose();
  }

  return (
    <>
      <CloseButton onClick={onClose} />
      <h2 id="appointment-form-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
        {isEdit ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}
      </h2>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        <Field label="Cliente" required>
          <ClientSearchField selectedClientId={clientId} onSelect={setClientId} required />
        </Field>

        <Field label="Service" required>
          <Select
            value={serviceId}
            onChange={(v) => {
              setServiceId(v);
              if (!durationTouched) {
                const svc = SERVICES.find((s) => s.id === v);
                if (svc) setDuration(String(svc.durationMinutes));
              }
            }}
            options={SERVICES.map((s) => ({ value: s.id, label: s.name }))}
            placeholder="Choisir une prestation…"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Praticien·ne" required>
            <Select
              value={staffId}
              onChange={setStaffId}
              options={workingStaff.map((p) => ({ value: p.id, label: p.name }))}
              placeholder="Choisir…"
            />
          </Field>

          <Field label="Heure de début" required>
            <Select
              value={start}
              onChange={setStart}
              options={SLOT_START_TIMES.map((t) => ({ value: t, label: t, disabled: takenStarts.has(t) }))}
              placeholder="Choisir…"
              disabled={!staffId}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Durée (min)" required>
            <TextInput
              type="number"
              min={5}
              step={5}
              value={duration}
              onChange={(e) => {
                setDurationTouched(true);
                setDuration(e.target.value);
              }}
              placeholder="60"
            />
          </Field>

          <Field label="Statut">
            <Pills options={STATUS_OPTIONS} value={status} onChange={(v) => setStatus(v as AppointmentStatus)} />
          </Field>
        </div>

        {error && <Alert tone="error" title={error} />}

        <div className="mt-1 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" variant="dark" className="flex-1">
            {isEdit ? "Enregistrer" : "Créer le rendez-vous"}
          </Button>
        </div>
      </form>
    </>
  );
}
