"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Field } from "@/components/ui/molecules/field";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Textarea } from "@/components/ui/atoms/textarea";
import { RadioGroup } from "@/components/ui/molecules/radio-group";
import { Button } from "@/components/ui/atoms/button";
import type { Campaign } from "@/lib/data/types";

export type CampaignDraft = { title: string; message: string; audienceLabel: string };

type CampaignFormDialogProps = {
  open: boolean;
  editing?: Campaign | null;
  onClose: () => void;
  onSubmit: (draft: CampaignDraft) => void;
};

const AUDIENCE_OPTIONS = [
  { value: "Toutes les clientes", label: "Toutes les clientes", hint: "Toute la base répertoire" },
  { value: "VIP & Gold", label: "VIP & Gold", hint: "Paliers de fidélité élevés" },
  { value: "Venues ce mois-ci", label: "Venues ce mois-ci", hint: "Clientes actives récemment" },
  { value: "Inactives (3 mois +)", label: "Inactives (3 mois +)", hint: "Reconquête" },
];

/** Create/edit form for a Campagne — titre, message (with a {prenom} variable hint), audience. */
export function CampaignFormDialog({ open, editing, onClose, onSubmit }: CampaignFormDialogProps) {
  return (
    <Dialog open={open} labelledBy="campaign-form-title" className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6">
      {open && <CampaignForm key={editing?.id ?? "new"} editing={editing} onClose={onClose} onSubmit={onSubmit} />}
    </Dialog>
  );
}

function CampaignForm({ editing, onClose, onSubmit }: Omit<CampaignFormDialogProps, "open">) {
  const [title, setTitle] = useState(editing?.title ?? "");
  const [message, setMessage] = useState(editing?.message ?? "");
  const [audience, setAudience] = useState(editing?.audienceLabel ?? AUDIENCE_OPTIONS[0].value);

  const canSubmit = title.trim() !== "" && message.trim() !== "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ title: title.trim(), message: message.trim(), audienceLabel: audience });
  }

  return (
    <>
      <CloseButton onClick={onClose} />
      <h2 id="campaign-form-title" className="font-[family-name:var(--font-heading)] font-semibold text-2xl text-[var(--color-gray-900)]">
        {editing ? "Modifier la campagne" : "Nouvelle campagne"}
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <Field label="Titre" required>
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Tabaski — réservez vos tresses tôt" />
        </Field>

        <div>
          <Field label="Message" required>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Bonjour {prenom} …" />
          </Field>
          <p className="mt-1.5 text-xs text-[var(--color-gray-500)]">
            Utilisez <span className="rounded bg-[var(--color-gray-100)] px-1 py-0.5 font-mono text-[var(--color-gray-700)]">{"{prenom}"}</span> pour
            insérer automatiquement le prénom de chaque cliente.
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-[var(--color-gray-600)]">Audience</p>
          <RadioGroup options={AUDIENCE_OPTIONS} value={audience} onChange={setAudience} />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" variant="brand" className="flex-1" disabled={!canSubmit}>
            {editing ? "Enregistrer" : "Créer"}
          </Button>
        </div>
      </form>
    </>
  );
}
