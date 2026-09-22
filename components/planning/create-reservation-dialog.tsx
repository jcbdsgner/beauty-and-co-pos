"use client";

import { useMemo, useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ChevronDown, Plus, Trash2, Users } from "lucide-react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Button } from "@/components/ui/atoms/button";
import { Select } from "@/components/ui/atoms/select";
import { TextInput } from "@/components/ui/atoms/text-input";
import { DatePicker } from "@/components/ui/molecules/date-picker";
import { Field } from "@/components/ui/molecules/field";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/molecules/command";
import { ClientSearchField } from "@/components/shared/client-search-field";
import { useAppData } from "@/components/providers/app-data-provider";
import { SERVICE_CATEGORIES, SERVICES, serviceById } from "@/lib/data/menu";
import { isWorkingOn } from "@/lib/data/praticiennes";
import { dateISO, formatHour, freeSlotsForStaff, minutesToTime, timeToMinutes, todayISO } from "@/lib/data/planning";
import { cn, formatFcfa } from "@/lib/utils";
import type { Praticienne, Reservation } from "@/lib/data/types";

const NONE = "__none__";
let draftUid = 0;
function nextDraftId() {
  draftUid += 1;
  return `draft-${draftUid}`;
}

type DraftLine = {
  id: string;
  serviceId: string;
  staffId: string;
  secondStaffId?: string;
  beneficiaryName: string;
};

function newLine(serviceId: string, staffId: string): DraftLine {
  return { id: nextDraftId(), serviceId, staffId, beneficiaryName: "" };
}

function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function isStaffFreeAt(staff: Praticienne, date: string, reservations: Reservation[], start: string, durationMin: number) {
  return freeSlotsForStaff(staff, date, reservations, durationMin).includes(start);
}

type Props = {
  open: boolean;
  onClose: () => void;
  /** Message affiché par l'appelant (ex. un Toast) une fois la réservation enregistrée. */
  onCreated?: (message: string) => void;
};

/**
 * Créer un rendez-vous au comptoir (ADR 0027) — typiquement une cliente au téléphone qui préfère
 * réserver directement plutôt qu'en ligne. Formulaire minimal, sans aucun des mécanismes du
 * parcours b&co self-service (pas de suggestion de prestation, pas d'acompte, pas de compte
 * cliente) : payeuse, jour, un seul horaire pour toute la visite (choisi dans une grille calculée
 * depuis l'agenda de la 1ʳᵉ prestation), puis 1..N prestations qui s'enchaînent l'une après
 * l'autre à partir de cet horaire (audit UX du 19/09) — pas d'encaissement immédiat depuis ce
 * dialog, seulement Enregistrer le rendez-vous.
 */
export function CreateReservationDialog({ open, onClose, onCreated }: Props) {
  return (
    <Dialog open={open} labelledBy="create-rdv-title" className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl p-0">
      {open && <CreateReservationBody onClose={onClose} onCreated={onCreated} />}
    </Dialog>
  );
}

function CreateReservationBody({ onClose, onCreated }: { onClose: () => void; onCreated?: (message: string) => void }) {
  const { praticiennes, reservations, createReservation } = useAppData();
  const schedulable = useMemo(() => praticiennes.filter((p) => p.role !== "accueil" && p.role !== "menage"), [praticiennes]);
  const firstService = SERVICES.find((s) => s.active);

  const [payerClientId, setPayerClientId] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState<string | null>(null);
  const [lines, setLines] = useState<DraftLine[]>(() => [newLine(firstService?.id ?? "", schedulable[0]?.id ?? "")]);
  const [error, setError] = useState<string | null>(null);

  const anchorLine = lines[0];
  const anchorStaff = schedulable.find((p) => p.id === anchorLine?.staffId);
  const anchorDuration = serviceById(anchorLine?.serviceId ?? "")?.durationMinutes ?? 30;

  const anchorSlots = useMemo(
    () => (anchorStaff ? freeSlotsForStaff(anchorStaff, date, reservations, anchorDuration) : []),
    [anchorStaff, date, reservations, anchorDuration],
  );
  const anchorDayOff = anchorStaff ? !isWorkingOn(anchorStaff, new Date(`${date}T00:00:00`)) : false;

  // Prestations enchaînées l'une après l'autre à partir de l'horaire choisi, chacune démarrant à
  // la fin de la précédente selon sa durée (audit UX du 19/09 — plus d'horaire indépendant par ligne).
  const startsByLine = useMemo(() => {
    if (!time) return lines.map(() => null as string | null);
    let cursor = timeToMinutes(time);
    return lines.map((l) => {
      const start = minutesToTime(cursor);
      cursor += serviceById(l.serviceId)?.durationMinutes ?? 30;
      return start;
    });
  }, [time, lines]);

  function updateLine(id: string, patch: Partial<DraftLine>) {
    setError(null);
    // L'horaire de toute la visite se choisit une seule fois, sur l'agenda de la 1ʳᵉ prestation —
    // un changement de praticienne ou de prestation de cette ligne invalide le choix (audit UX du 19/09).
    if (id === anchorLine?.id && ("serviceId" in patch || "staffId" in patch)) setTime(null);
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const next = { ...l, ...patch };
        if (patch.serviceId && !serviceById(patch.serviceId)?.twoPractitionersEligible) next.secondStaffId = undefined;
        // Une prestation « à 2 » implique toujours deux praticiennes du même salon (ADR 0028) —
        // changer la 1ʳᵉ praticienne invalide une 2ᵉ déjà choisie dans l'autre salon.
        if (patch.staffId && next.secondStaffId) {
          const firstSalon = schedulable.find((p) => p.id === patch.staffId)?.salonId;
          const secondSalon = schedulable.find((p) => p.id === next.secondStaffId)?.salonId;
          if (firstSalon !== secondSalon) next.secondStaffId = undefined;
        }
        return next;
      }),
    );
  }

  function pickDate(next: string) {
    setDate(next);
    setTime(null);
  }

  function submit() {
    if (!payerClientId) {
      setError("Choisissez la cliente qui règle.");
      return;
    }
    if (!time) {
      setError("Choisissez l'horaire de la visite.");
      return;
    }
    for (let i = 0; i < lines.length; i += 1) {
      const staff = schedulable.find((p) => p.id === lines[i].staffId);
      const start = startsByLine[i];
      const duration = serviceById(lines[i].serviceId)?.durationMinutes ?? 30;
      if (!staff || !start || !isStaffFreeAt(staff, date, reservations, start, duration)) {
        setError(`${staff?.name ?? "La praticienne"} n'est pas disponible à ${start ? formatHour(start) : "cet horaire"} pour cette prestation.`);
        return;
      }
    }
    const result = createReservation(
      payerClientId,
      lines.map((l, i) => ({
        serviceId: l.serviceId,
        staffId: l.staffId,
        start: startsByLine[i]!,
        ...(l.secondStaffId ? { secondStaffId: l.secondStaffId } : {}),
        ...(l.beneficiaryName.trim() ? { beneficiaryName: l.beneficiaryName.trim() } : {}),
      })),
      { date },
    );
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onCreated?.("Rendez-vous enregistré.");
    onClose();
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4 border-b border-[var(--board-groove)] p-6 pb-4">
        <div>
          <h2 id="create-rdv-title" className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-gray-900)]">
            Créer un rendez-vous
          </h2>
          <p className="mt-0.5 text-sm text-[var(--color-gray-500)]">Réservation au comptoir — utile quand la cliente est au téléphone.</p>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Field label="Payeuse (règle la note)" required>
            <ClientSearchField selectedClientId={payerClientId} onSelect={setPayerClientId} placeholder="Chercher la cliente…" required />
          </Field>
          <Field label="Jour">
            <DatePicker value={isoToDate(date)} onChange={(d) => pickDate(dateISO(d))} minDate={new Date()} className="sm:w-56" />
          </Field>
        </div>

        <div>
          <span className="text-sm font-medium text-base-content/70">Horaire de la visite</span>
          {anchorDayOff ? (
            <p className="mt-1.5 text-xs font-semibold text-[var(--color-error)]">{anchorStaff?.name} ne travaille pas ce jour-là.</p>
          ) : anchorSlots.length === 0 ? (
            <p className="mt-1.5 text-xs font-semibold text-[var(--color-error)]">Aucun horaire libre pour cette durée ce jour-là.</p>
          ) : (
            <div className="mt-1.5 flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
              {anchorSlots.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={time === s}
                  onClick={() => setTime(s)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[13px] font-medium transition active:scale-[0.97]",
                    time === s ? "bg-primary text-primary-content" : "border border-border bg-white text-base-content/70 hover:bg-base-200",
                  )}
                >
                  {formatHour(s)}
                </button>
              ))}
            </div>
          )}
        </div>

        {lines.map((line, i) => (
          <RvDraftLine
            key={line.id}
            line={line}
            staff={schedulable}
            start={startsByLine[i]}
            canRemove={lines.length > 1}
            onChange={(patch) => updateLine(line.id, patch)}
            onRemove={() => setLines((prev) => prev.filter((l) => l.id !== line.id))}
          />
        ))}

        <button
          type="button"
          onClick={() => setLines((prev) => [...prev, newLine(firstService?.id ?? "", schedulable[0]?.id ?? "")])}
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-gray-300)] py-3 text-sm font-semibold text-[var(--brand-taupe-muted)] transition hover:bg-accent"
        >
          <Plus className="size-4" /> Ajouter une prestation
        </button>

        {error && <p className="text-sm font-semibold text-[var(--color-error)]">{error}</p>}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-[var(--board-groove)] p-6 pt-4">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button
          variant="brand"
          className={cn(!payerClientId && "disabled:bg-accent disabled:text-primary disabled:opacity-100")}
          disabled={!payerClientId}
          onClick={submit}
        >
          {payerClientId ? "Enregistrer le rendez-vous" : "Choisir la payeuse"}
        </Button>
      </div>
    </>
  );
}

function RvDraftLine({
  line,
  staff,
  start,
  canRemove,
  onChange,
  onRemove,
}: {
  line: DraftLine;
  staff: Praticienne[];
  start: string | null;
  canRemove: boolean;
  onChange: (patch: Partial<DraftLine>) => void;
  onRemove: () => void;
}) {
  const service = serviceById(line.serviceId);
  const durationMin = service?.durationMinutes ?? 30;
  const activeStaff = staff.find((p) => p.id === line.staffId);
  const staffOptions = staff.map((p) => ({ value: p.id, label: p.name }));
  // Une prestation « à 2 » implique toujours deux praticiennes du même salon (ADR 0028).
  const secondOptions = [
    { value: NONE, label: "Aucune" },
    ...staff.filter((p) => p.id !== line.staffId && p.salonId === activeStaff?.salonId).map((p) => ({ value: p.id, label: p.name })),
  ];
  const end = start ? minutesToTime(timeToMinutes(start) + durationMin) : null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--board-groove)] p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Prestation">
          <ServicePickerButton serviceId={line.serviceId} onSelect={(serviceId) => onChange({ serviceId })} />
        </Field>
        <Field label="Bénéficiaire (vide = la payeuse)">
          <TextInput
            size="compact"
            value={line.beneficiaryName}
            onChange={(e) => onChange({ beneficiaryName: e.target.value })}
            placeholder="La payeuse"
          />
        </Field>
        <Field label="Praticienne">
          <Select value={line.staffId} onChange={(staffId) => onChange({ staffId })} options={staffOptions} size="compact" />
        </Field>
        {service?.twoPractitionersEligible && (
          <Field label="2ᵉ praticienne (à 2)">
            <Select
              value={line.secondStaffId ?? NONE}
              onChange={(v) => onChange({ secondStaffId: v === NONE ? undefined : v })}
              options={secondOptions}
              size="compact"
            />
          </Field>
        )}
      </div>

      <p className="text-sm text-base-content/70">
        {start && end ? (
          <>
            <span className="font-medium text-base-content">{formatHour(start)} – {formatHour(end)}</span>
            {" · "}
            {activeStaff?.name}
          </>
        ) : (
          "Choisissez l'horaire de la visite ci-dessus."
        )}
      </p>

      {canRemove && (
        <Button size="sm" variant="outline" icon={<Trash2 className="size-4" />} className="self-start" onClick={onRemove}>
          Retirer cette prestation
        </Button>
      )}
    </div>
  );
}

function ServicePickerButton({ serviceId, onSelect }: { serviceId: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const service = serviceById(serviceId);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className="input input-sm flex w-full items-center justify-between gap-2 bg-white text-left text-sm"
        >
          <span className="truncate">{service?.name ?? "Choisir une prestation"}</span>
          <ChevronDown aria-hidden className="size-4 shrink-0 text-base-content/50" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[26rem] rounded-2xl border border-border bg-white p-0 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)] focus:outline-none"
        >
          <Command className="border-0">
            <CommandInput placeholder="Chercher une prestation…" autoFocus />
            <CommandList className="max-h-80">
              <CommandEmpty>Aucune prestation ne correspond.</CommandEmpty>
              {SERVICE_CATEGORIES.map((cat) => {
                const items = SERVICES.filter((s) => s.active && s.categoryId === cat.id);
                if (items.length === 0) return null;
                return (
                  <CommandGroup key={cat.id} heading={cat.name}>
                    {items.map((s) => (
                      <CommandItem
                        key={s.id}
                        value={s.name}
                        onSelect={() => {
                          onSelect(s.id);
                          setOpen(false);
                        }}
                      >
                        <span className="min-w-0 flex-1 truncate">{s.name}</span>
                        <span className="flex shrink-0 items-center gap-1.5 text-xs text-base-content/50 tabular-nums">
                          {s.twoPractitionersEligible && <Users aria-hidden className="size-3" />}
                          {s.durationMinutes} min · {formatFcfa(s.price)}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
