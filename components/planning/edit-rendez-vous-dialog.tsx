"use client";

import { useState } from "react";
import { ExternalLink, Plus, Trash2, CalendarX } from "lucide-react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Button } from "@/components/ui/atoms/button";
import { Select } from "@/components/ui/atoms/select";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Textarea } from "@/components/ui/atoms/textarea";
import { Field } from "@/components/ui/molecules/field";
import { Legend } from "@/components/ui/board";
import { Toast } from "@/components/ui/molecules/toast";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import { SERVICES, serviceById } from "@/lib/data/menu";
import { appointmentEndTime, BOOKING_URL, reservationById } from "@/lib/data/planning";
import type { Praticienne, RendezVous } from "@/lib/data/types";

const SERVICE_OPTIONS = [...SERVICES]
  .filter((s) => s.active)
  .sort((a, b) => a.name.localeCompare(b.name, "fr"))
  .map((s) => ({ value: s.id, label: s.name }));

type Props = { reservationId: string | null; onClose: () => void };

/**
 * Ajuster une réservation au comptoir (ADR 0009) : changer prestation / praticienne / bénéficiaire,
 * reprogrammer, ajouter ou retirer un rendez-vous, annuler avec un motif. Aucune création de
 * réservation — le bouton « Créer un rendez-vous » ouvre la plateforme externe.
 */
export function EditRendezVousDialog({ reservationId, onClose }: Props) {
  const { reservations } = useAppData();
  const reservation = reservationId ? reservationById(reservations, reservationId) : undefined;

  return (
    <Dialog open={Boolean(reservation)} labelledBy="edit-rdv-title" className="relative flex max-h-[92vh] w-full max-w-xl flex-col rounded-3xl p-0">
      {reservation && <EditRendezVousBody reservationId={reservation.id} onClose={onClose} />}
    </Dialog>
  );
}

function EditRendezVousBody({ reservationId, onClose }: { reservationId: string; onClose: () => void }) {
  const { reservations, clients, praticiennes, addRendezVous } = useAppData();
  const reservation = reservationById(reservations, reservationId)!;
  const payer = clients.find((c) => c.id === reservation.payerClientId);
  const schedulable = praticiennes.filter((p) => p.role !== "accueil" && p.role !== "menage");

  const [toast, setToast] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const activeLines = reservation.rendezVous.filter((rv) => rv.status !== "annule");
  const cancelledLines = reservation.rendezVous.filter((rv) => rv.status === "annule");

  return (
    <>
      <div className="flex items-start justify-between gap-4 border-b border-[var(--board-groove)] p-6 pb-4">
        <div>
          <h2 id="edit-rdv-title" className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-gray-900)]">
            Ajuster la réservation
          </h2>
          <p className="mt-0.5 text-sm text-[var(--color-gray-500)]">{payer ? clientFullName(payer) : "Cliente"} · règle la note</p>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
        {activeLines.map((rv) => (
          <RvEditor
            key={rv.id}
            rv={rv}
            staff={schedulable}
            canRemove={activeLines.length > 1}
            onDone={(msg) => setToast(msg)}
          />
        ))}

        {cancelledLines.map((rv) => (
          <div key={rv.id} className="rounded-xl border border-[var(--board-groove)] bg-black/[0.015] px-4 py-3 text-sm">
            <p className="font-semibold text-[var(--color-gray-500)] line-through">{serviceById(rv.serviceId)?.name ?? "Prestation"}</p>
            <p className="mt-0.5 text-xs text-[var(--color-gray-400)]">
              Annulé{rv.cancelReason ? ` · ${rv.cancelReason}` : ""}
            </p>
          </div>
        ))}

        {adding ? (
          <AddRvForm
            staff={schedulable}
            onCancel={() => setAdding(false)}
            onAdd={(data) => {
              const r = addRendezVous(reservationId, data);
              if (r.ok) {
                setAdding(false);
                setToast(r.message);
              }
              return r;
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-gray-300)] py-3 text-sm font-semibold text-[var(--brand-taupe-muted)] transition hover:bg-accent"
          >
            <Plus className="size-4" /> Ajouter une prestation
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--board-groove)] p-6 pt-4">
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-taupe-muted)] underline underline-offset-2"
        >
          <ExternalLink className="size-4" /> Créer un rendez-vous
        </a>
        <Button variant="dark" onClick={onClose}>
          Terminé
        </Button>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}

type ActionResult = { ok: boolean; message: string };

function RvEditor({
  rv,
  staff,
  canRemove,
  onDone,
}: {
  rv: RendezVous;
  staff: Praticienne[];
  canRemove: boolean;
  onDone: (message: string) => void;
}) {
  const { clients, rescheduleRendezVous, updateRendezVous, removeRendezVous, cancelAppointment } = useAppData();

  const initialBenef = rv.beneficiaryClientId
    ? clients.find((c) => c.id === rv.beneficiaryClientId)?.firstName ?? ""
    : rv.beneficiaryName ?? "";

  const NONE = "__none__";
  const [serviceId, setServiceId] = useState(rv.serviceId);
  const [staffId, setStaffId] = useState(rv.staffId);
  const [secondStaffId, setSecondStaffId] = useState(rv.secondStaffId ?? NONE);
  const [start, setStart] = useState(rv.start);
  const [benef, setBenef] = useState(initialBenef);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [reason, setReason] = useState("");

  const staffOptions = staff.map((p) => ({ value: p.id, label: p.name }));
  const secondOptions = [{ value: NONE, label: "Aucune" }, ...staffOptions.filter((o) => o.value !== staffId)];

  const dirty =
    serviceId !== rv.serviceId ||
    staffId !== rv.staffId ||
    secondStaffId !== (rv.secondStaffId ?? NONE) ||
    start !== rv.start ||
    benef.trim() !== initialBenef;

  function save() {
    setError(null);
    const patch: Parameters<typeof updateRendezVous>[1] = {};
    if (serviceId !== rv.serviceId) patch.serviceId = serviceId;
    if (staffId !== rv.staffId) patch.staffId = staffId;
    if (secondStaffId !== (rv.secondStaffId ?? NONE)) patch.secondStaffId = secondStaffId === NONE ? undefined : secondStaffId;
    if (benef.trim() !== initialBenef) {
      patch.beneficiaryName = benef.trim() || undefined;
      patch.beneficiaryClientId = undefined;
    }

    let result: ActionResult = { ok: true, message: "" };
    if (Object.keys(patch).length > 0) result = updateRendezVous(rv.id, patch);
    if (result.ok && start !== rv.start) result = rescheduleRendezVous(rv.id, start);

    if (!result.ok) {
      setError(result.message);
      return;
    }
    onDone("Rendez-vous mis à jour.");
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--board-groove)] p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Prestation">
          <Select value={serviceId} onChange={setServiceId} options={SERVICE_OPTIONS} size="compact" />
        </Field>
        <Field label="Créneau">
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-[var(--color-gray-900)] transition focus:border-ring focus:ring-4 focus:ring-ring/15 focus:outline-none"
          />
        </Field>
        <Field label="Praticienne">
          <Select value={staffId} onChange={setStaffId} options={staffOptions} size="compact" />
        </Field>
        <Field label="2ᵉ praticienne (à 2)">
          <Select value={secondStaffId} onChange={setSecondStaffId} options={secondOptions} size="compact" />
        </Field>
        <Field label="Bénéficiaire (vide = la payeuse)" className="sm:col-span-2">
          <TextInput value={benef} onChange={(e) => setBenef(e.target.value)} placeholder="La payeuse" />
        </Field>
      </div>

      <p className="text-xs text-[var(--color-gray-400)]">
        {rv.start}–{appointmentEndTime(rv)} · {serviceById(rv.serviceId)?.durationMinutes ?? rv.durationMin} min
      </p>

      {error && <p className="text-xs font-semibold text-[var(--color-error)]">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="brand" disabled={!dirty} onClick={save}>
          Enregistrer
        </Button>
        <Button size="sm" variant="danger-outline" icon={<CalendarX className="size-4" />} onClick={() => setConfirmCancel(true)}>
          Annuler le rendez-vous
        </Button>
        {canRemove && (
          <Button
            size="sm"
            variant="outline"
            icon={<Trash2 className="size-4" />}
            onClick={() => {
              removeRendezVous(rv.id);
              onDone("Rendez-vous retiré de la réservation.");
            }}
          >
            Retirer
          </Button>
        )}
      </div>

      <Dialog open={confirmCancel} labelledBy="cancel-rdv-title" className="max-w-sm p-6">
        <h3 id="cancel-rdv-title" className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-gray-900)]">
          Annuler ce rendez-vous ?
        </h3>
        <p className="mt-2 text-sm text-[var(--color-gray-500)]">
          Il passera au statut Annulé et restera consultable via « Afficher les annulés ».
        </p>
        <Field label="Motif (facultatif)" className="mt-4">
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Ex. la cliente a décalé sa venue" />
        </Field>
        <div className="mt-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setConfirmCancel(false)}>
            Retour
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              cancelAppointment(rv.id, reason);
              setConfirmCancel(false);
              onDone("Rendez-vous annulé.");
            }}
          >
            Annuler le rendez-vous
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function AddRvForm({
  staff,
  onCancel,
  onAdd,
}: {
  staff: Praticienne[];
  onCancel: () => void;
  onAdd: (data: { serviceId: string; staffId: string; start: string }) => ActionResult;
}) {
  const [serviceId, setServiceId] = useState(SERVICE_OPTIONS[0]?.value ?? "");
  const [staffId, setStaffId] = useState(staff[0]?.id ?? "");
  const [start, setStart] = useState("12:00");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--brand-taupe-muted)]/40 bg-accent/40 p-4">
      <Legend>Nouvelle prestation</Legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Prestation">
          <Select value={serviceId} onChange={setServiceId} options={SERVICE_OPTIONS} size="compact" />
        </Field>
        <Field label="Créneau">
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-[var(--color-gray-900)] transition focus:border-ring focus:ring-4 focus:ring-ring/15 focus:outline-none"
          />
        </Field>
        <Field label="Praticienne" className="sm:col-span-2">
          <Select value={staffId} onChange={setStaffId} options={staff.map((p) => ({ value: p.id, label: p.name }))} size="compact" />
        </Field>
      </div>
      {error && <p className="text-xs font-semibold text-[var(--color-error)]">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button
          size="sm"
          variant="brand"
          disabled={!serviceId || !staffId}
          onClick={() => {
            const r = onAdd({ serviceId, staffId, start });
            if (!r.ok) setError(r.message);
          }}
        >
          Ajouter
        </Button>
      </div>
    </div>
  );
}
