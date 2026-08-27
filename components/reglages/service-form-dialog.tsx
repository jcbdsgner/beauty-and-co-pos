"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Field } from "@/components/ui/molecules/field";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Select } from "@/components/ui/atoms/select";
import { Switch } from "@/components/ui/atoms/switch";
import { Button } from "@/components/ui/atoms/button";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import type { Service, ServiceCategory } from "@/lib/data/types";

type ServiceFormDialogProps = {
  open: boolean;
  mode: "add" | "edit";
  service: Service | null;
  categories: ServiceCategory[];
  defaultCategoryId: string;
  onClose: () => void;
  onSubmit: (values: Omit<Service, "id">) => void;
  onDelete: (id: string) => void;
};

function emptyDraft(defaultCategoryId: string): Omit<Service, "id"> {
  return { categoryId: defaultCategoryId, name: "", price: 0, durationMinutes: 30, active: true, subcategory: undefined };
}

/**
 * Ajouter/Modifier un service. Per USERFLOW.md's Réglages spec: changing "Catégorie" never
 * touches "Groupe" (subcategory) — only the explicit "Réinitialiser au groupe par défaut" button
 * clears it. A single Switch carries actif/inactif (never a second control doing the same job).
 */
export function ServiceFormDialog({ open, mode, service, categories, defaultCategoryId, onClose, onSubmit, onDelete }: ServiceFormDialogProps) {
  return (
    <Dialog open={open} labelledBy="service-form-title" className="relative max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl p-6">
      {open && (
        <ServiceForm
          key={service?.id ?? `new-${defaultCategoryId}`}
          mode={mode}
          service={service}
          categories={categories}
          defaultCategoryId={defaultCategoryId}
          onClose={onClose}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
      )}
    </Dialog>
  );
}

function ServiceForm({ mode, service, categories, defaultCategoryId, onClose, onSubmit, onDelete }: Omit<ServiceFormDialogProps, "open">) {
  const [draft, setDraft] = useState<Omit<Service, "id">>(() => (service ? { ...service } : emptyDraft(defaultCategoryId)));
  const [priceText, setPriceText] = useState(String(service?.price ?? ""));
  const [durationText, setDurationText] = useState(String(service?.durationMinutes ?? ""));
  const [errors, setErrors] = useState<{ name?: string; price?: string; duration?: string }>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSubmit() {
    const price = Number(priceText.replace(/[^0-9]/g, ""));
    const duration = Number(durationText.replace(/[^0-9]/g, ""));
    const nextErrors: typeof errors = {};
    if (!draft.name.trim()) nextErrors.name = "Le nom du service est obligatoire.";
    if (!priceText.trim() || Number.isNaN(price) || price <= 0) nextErrors.price = "Indiquez un prix valide.";
    if (!durationText.trim() || Number.isNaN(duration) || duration <= 0) nextErrors.duration = "Indiquez une durée valide.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSubmit({ ...draft, name: draft.name.trim(), price, durationMinutes: duration });
  }

  return (
    <>
      <CloseButton onClick={onClose} />
      <h2 id="service-form-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
        {mode === "add" ? "Ajouter un service" : "Modifier le service"}
      </h2>

      <div className="mt-5 flex flex-col gap-4">
        <Field label="Nom du service" required>
          <TextInput value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Ex. Brushing" />
          {errors.name && <p className="mt-1 text-xs font-medium text-[var(--color-error)]">{errors.name}</p>}
        </Field>

        <Field label="Catégorie" required>
          <Select
            value={draft.categoryId}
            onChange={(v) => setDraft((d) => ({ ...d, categoryId: v }))}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
        </Field>

        <Field label="Groupe (sous-catégorie)">
          <div className="flex items-center gap-2">
            <TextInput
              value={draft.subcategory ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, subcategory: e.target.value }))}
              placeholder="Ex. Soins express"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setDraft((d) => ({ ...d, subcategory: undefined }))}
              className="w-auto shrink-0 px-4 py-3 text-sm"
            >
              Réinitialiser au groupe par défaut
            </Button>
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Prix (F CFA)" required>
            <TextInput inputMode="numeric" value={priceText} onChange={(e) => setPriceText(e.target.value)} placeholder="8000" />
            {errors.price && <p className="mt-1 text-xs font-medium text-[var(--color-error)]">{errors.price}</p>}
          </Field>
          <Field label="Durée (minutes)" required>
            <TextInput inputMode="numeric" value={durationText} onChange={(e) => setDurationText(e.target.value)} placeholder="45" />
            {errors.duration && <p className="mt-1 text-xs font-medium text-[var(--color-error)]">{errors.duration}</p>}
          </Field>
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={draft.active} onChange={(v) => setDraft((d) => ({ ...d, active: v }))} label="Service actif" />
          <span className="text-sm font-medium text-[var(--color-gray-700)]">{draft.active ? "Actif" : "Inactif"}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {mode === "edit" && (
          <Button type="button" variant="danger-outline" onClick={() => setConfirmDelete(true)} className="w-auto self-start">
            Supprimer ce service
          </Button>
        )}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button type="button" variant="dark" onClick={handleSubmit} className="flex-1">
            {mode === "add" ? "Ajouter" : "Enregistrer"}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer ce service ?"
        description={`« ${service?.name ?? ""} » sera retiré du catalogue. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          if (service) onDelete(service.id);
          onClose();
        }}
      />
    </>
  );
}
