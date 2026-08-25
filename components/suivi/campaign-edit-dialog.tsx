"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { CheckIcon, XIcon } from "@/components/ui/icons";
import type { Campaign } from "@/lib/data/suivi";

type CampaignEditDialogProps = {
  open: boolean;
  /** undefined = création ("+ Créer"), défini = édition (sur une carte). */
  campaign?: Campaign;
  onClose: () => void;
  onSave: (campaign: Campaign) => void;
};

const AUDIENCE_OPTIONS = [
  "Toutes les clientes",
  "Venues ce mois-ci",
  "Clientes VIP & Gold",
  "Inactives depuis +60 jours",
  "Anniversaires du mois",
];

const fieldClass =
  "w-full rounded-xl border border-transparent bg-[var(--brand-rose-soft)] px-4 py-2.5 text-[15px] text-[var(--color-gray-900)] placeholder:text-[var(--color-gray-400)] focus:border-[var(--brand-taupe-muted)] focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-[var(--color-gray-600)]";

function blankCampaign(): Campaign {
  return {
    id: `campagne-${Date.now()}`,
    title: "",
    message: "Bonjour {prenom} 🌸 ",
    audience: "Toutes les clientes",
    status: "brouillon",
  };
}

export function CampaignEditDialog({ open, campaign, onClose, onSave }: CampaignEditDialogProps) {
  return (
    <Dialog open={open} labelledBy="campaign-edit-title" className="max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl">
      {open && <CampaignEditForm campaign={campaign} onClose={onClose} onSave={onSave} />}
    </Dialog>
  );
}

function CampaignEditForm({
  campaign,
  onClose,
  onSave,
}: {
  campaign?: Campaign;
  onClose: () => void;
  onSave: (campaign: Campaign) => void;
}) {
  const [draft, setDraft] = useState<Campaign>(() => campaign ?? blankCampaign());

  function update<K extends keyof Campaign>(key: K, value: Campaign[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function insertTag(tag: string) {
    setDraft((prev) => ({ ...prev, message: prev.message + tag }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const title = draft.title.trim();
    const message = draft.message.trim();
    if (!title || !message) return;
    onSave({ ...draft, title, message });
  }

  return (
    <>
      <div className="flex justify-center pt-3">
        <div className="h-1 w-10 rounded-full bg-[var(--color-gray-200)]" />
      </div>
      <div className="flex items-start justify-between px-6 pt-4">
        <h2 id="campaign-edit-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
          {campaign ? "Modifier la campagne" : "Nouvelle campagne"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--color-gray-400)] hover:bg-[var(--color-gray-100)]"
        >
          <XIcon />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
        <div>
          <label className={labelClass}>Titre de la campagne *</label>
          <input
            autoFocus
            required
            value={draft.title}
            onChange={(event) => update("title", event.target.value)}
            placeholder="Ex : Tabaski — réservez vos tresses tôt"
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>Audience ciblée *</label>
          <select
            value={draft.audience}
            onChange={(event) => update("audience", event.target.value)}
            className={fieldClass}
          >
            {AUDIENCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className={labelClass}>Message de la campagne *</label>
            <div className="flex items-center gap-1 pb-1 text-xs">
              <span className="text-[var(--color-gray-500)]">Insérer :</span>
              <button
                type="button"
                onClick={() => insertTag("{prenom}")}
                className="rounded-md bg-[var(--color-gray-100)] px-1.5 py-0.5 font-mono text-[var(--brand-taupe-muted)] hover:bg-[var(--color-gray-200)]"
              >
                {"{prenom}"}
              </button>
            </div>
          </div>
          <textarea
            required
            rows={4}
            value={draft.message}
            onChange={(event) => update("message", event.target.value)}
            placeholder="Rédigez votre message..."
            className={`${fieldClass} resize-none`}
          />
          <p className="mt-1 text-xs text-[var(--color-gray-400)]">
            La variable <code className="font-mono">{`{prenom}`}</code> sera remplacée automatiquement par le prénom de la cliente lors de l&apos;envoi.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" variant="brand" className="flex-1" icon={<CheckIcon />}>
            Enregistrer
          </Button>
        </div>
      </form>
    </>
  );
}
