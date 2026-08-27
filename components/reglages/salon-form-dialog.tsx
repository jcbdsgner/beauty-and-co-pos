"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Field } from "@/components/ui/molecules/field";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Switch } from "@/components/ui/atoms/switch";
import { Button } from "@/components/ui/atoms/button";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import type { Salon } from "@/lib/data/types";

type SalonFormDialogProps = {
  open: boolean;
  mode: "add" | "edit";
  salon: Salon | null;
  defaultCompanyId: string;
  onClose: () => void;
  onSubmit: (values: Omit<Salon, "id">) => void;
};

function emptyDraft(companyId: string): Omit<Salon, "id"> {
  return { companyId, name: "", address: "", active: true };
}

/**
 * Ajouter/Modifier un salon. Turning the "actif" Switch off routes through the app's one
 * ConfirmDialog pattern with a description naming what depends on this salon — per USERFLOW.md's
 * warning that deactivation must never silently break selectors/rendez-vous/personnel elsewhere.
 * Turning it back on is not destructive, so it applies immediately.
 */
export function SalonFormDialog({ open, mode, salon, defaultCompanyId, onClose, onSubmit }: SalonFormDialogProps) {
  return (
    <Dialog open={open} labelledBy="salon-form-title" className="relative max-w-md rounded-3xl p-6">
      {open && (
        <SalonForm key={salon?.id ?? `new-${defaultCompanyId}`} mode={mode} salon={salon} defaultCompanyId={defaultCompanyId} onClose={onClose} onSubmit={onSubmit} />
      )}
    </Dialog>
  );
}

function SalonForm({ mode, salon, defaultCompanyId, onClose, onSubmit }: Omit<SalonFormDialogProps, "open">) {
  const [draft, setDraft] = useState<Omit<Salon, "id">>(() => (salon ? { ...salon } : emptyDraft(defaultCompanyId)));
  const [errors, setErrors] = useState<{ name?: string; address?: string }>({});
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  function handleSubmit() {
    const nextErrors: typeof errors = {};
    if (!draft.name.trim()) nextErrors.name = "Le nom du salon est obligatoire.";
    if (!draft.address.trim()) nextErrors.address = "L'adresse est obligatoire.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSubmit({ ...draft, name: draft.name.trim(), address: draft.address.trim() });
  }

  return (
    <>
      <CloseButton onClick={onClose} />
      <h2 id="salon-form-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
        {mode === "add" ? "Ajouter un salon" : "Modifier le salon"}
      </h2>

      <div className="mt-5 flex flex-col gap-4">
        <Field label="Nom du salon" required>
          <TextInput value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Ex. Almadies" />
          {errors.name && <p className="mt-1 text-xs font-medium text-[var(--color-error)]">{errors.name}</p>}
        </Field>
        <Field label="Adresse" required>
          <TextInput value={draft.address} onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))} placeholder="Route des Almadies, Dakar" />
          {errors.address && <p className="mt-1 text-xs font-medium text-[var(--color-error)]">{errors.address}</p>}
        </Field>

        <div className="flex items-center gap-2">
          <Switch
            checked={draft.active}
            onChange={(next) => {
              if (!next && draft.active) {
                setConfirmDeactivate(true);
                return;
              }
              setDraft((d) => ({ ...d, active: next }));
            }}
            label="Salon actif"
          />
          <span className="text-sm font-medium text-[var(--color-gray-700)]">{draft.active ? "Actif" : "Inactif"}</span>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Annuler
        </Button>
        <Button type="button" variant="dark" onClick={handleSubmit} className="flex-1">
          {mode === "add" ? "Ajouter" : "Enregistrer"}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDeactivate}
        title="Désactiver ce salon ?"
        description="Ce salon est référencé par le sélecteur Salon utilisé ailleurs dans l'app — le désactiver le masquera de ces sélecteurs, ainsi que des rendez-vous et du personnel qui lui sont rattachés."
        confirmLabel="Désactiver"
        onCancel={() => setConfirmDeactivate(false)}
        onConfirm={() => {
          setDraft((d) => ({ ...d, active: false }));
          setConfirmDeactivate(false);
        }}
      />
    </>
  );
}
