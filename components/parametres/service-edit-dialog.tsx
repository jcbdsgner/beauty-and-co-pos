"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_OPTIONS, type Service } from "@/lib/data/parametres-catalogue";

type ServiceEditDialogProps = {
  open: boolean;
  /** undefined = création ("+ Ajouter"), défini = édition (crayon sur une carte). */
  service?: Service;
  onClose: () => void;
  onSave: (service: Service) => void;
};

const fieldClass =
  "w-full rounded-xl border border-transparent bg-[var(--brand-rose-soft)] px-4 py-2.5 text-[15px] text-[var(--color-gray-900)] placeholder:text-[var(--color-gray-400)] focus:border-[var(--brand-taupe-muted)] focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-[var(--color-gray-600)]";

function blankService(): Service {
  return {
    id: `srv-${Date.now()}`,
    name: "",
    groupLabel: SERVICE_CATEGORY_LABELS[SERVICE_CATEGORY_OPTIONS[0].value],
    category: SERVICE_CATEGORY_OPTIONS[0].value,
    price: 0,
    durationMin: 30,
    active: true,
  };
}

/** "Modifier le service" / "Nouveau service" bottom-sheet modal — même formulaire pour la
 * création ("+ Ajouter", service=undefined) et l'édition (crayon sur une carte de "Gestion
 * Services"), sur le modèle de `ProductEditDialog`. The form lives in `ServiceEditForm`, mounted
 * only while `open` — `Dialog` unmounts its children when closed, so remounting on reopen is
 * what resets the draft, no effect needed. */
export function ServiceEditDialog({ open, service, onClose, onSave }: ServiceEditDialogProps) {
  return (
    <Dialog open={open} labelledBy="service-edit-title" className="max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl">
      {open && <ServiceEditForm service={service} onClose={onClose} onSave={onSave} />}
    </Dialog>
  );
}

function ServiceEditForm({
  service,
  onClose,
  onSave,
}: {
  service?: Service;
  onClose: () => void;
  onSave: (service: Service) => void;
}) {
  const [draft, setDraft] = useState<Service>(() => service ?? blankService());

  function update<K extends keyof Service>(key: K, value: Service[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const name = draft.name.trim();
    if (!name || draft.price <= 0 || draft.durationMin <= 0) return;
    onSave({ ...draft, name });
  }

  return (
    <>
      <div className="flex justify-center pt-3">
        <div className="h-1 w-10 rounded-full bg-[var(--color-gray-200)]" />
      </div>
      <div className="flex items-start justify-between px-6 pt-4">
        <h2 id="service-edit-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
          {service ? "Modifier le service" : "Nouveau service"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--color-gray-400)] hover:bg-[var(--color-gray-100)]"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
        <div>
          <label className={labelClass}>Nom du service *</label>
          <input
            autoFocus
            required
            value={draft.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Ex : Balayage californien"
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>Categorie *</label>
          <select
            value={draft.category}
            onChange={(event) => {
              const category = event.target.value as Service["category"];
              update("category", category);
              // Le groupe d'affichage suit la catégorie par défaut (regroupement de la liste) ;
              // il reste modifiable indépendamment ci-dessous pour créer un sous-groupe dédié.
              update("groupLabel", SERVICE_CATEGORY_LABELS[category]);
            }}
            className={fieldClass}
          >
            {SERVICE_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Groupe affiché dans la liste</label>
          <input
            value={draft.groupLabel}
            onChange={(event) => update("groupLabel", event.target.value)}
            placeholder="Ex : Mèches & Balayage"
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-[var(--color-gray-400)]">
            Sert d&apos;en-tête de section dans la liste (peut être plus précis que la catégorie).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Prix (FCFA) *</label>
            <input
              required
              type="number"
              min={0}
              value={draft.price}
              onChange={(event) => update("price", Number(event.target.value))}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Durée (min) *</label>
            <input
              required
              type="number"
              min={0}
              value={draft.durationMin}
              onChange={(event) => update("durationMin", Number(event.target.value))}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={draft.active} onChange={(checked) => update("active", checked)} label="Service actif" />
          <button
            type="button"
            onClick={() => update("active", !draft.active)}
            className="text-left text-sm text-[var(--color-gray-700)]"
          >
            Service actif
          </button>
        </div>
        <p className="-mt-3 text-xs text-[var(--color-gray-400)]">
          Un service inactif reste visible avec « Afficher les services inactifs » mais n&apos;est plus proposé en
          caisse.
        </p>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" variant="brand" className="flex-1">
            ✓ Enregistrer
          </Button>
        </div>
      </form>
    </>
  );
}
