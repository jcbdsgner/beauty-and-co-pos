"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Field } from "@/components/ui/molecules/field";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Textarea } from "@/components/ui/atoms/textarea";
import { Button } from "@/components/ui/atoms/button";
import { useAppData } from "@/components/providers/app-data-provider";
import type { Cliente } from "@/lib/data/types";

type EditPreferencesDialogProps = {
  open: boolean;
  client: Cliente;
  onClose: () => void;
};

/** Edit dialog for the Fiche cliente's "Préférences beauté" card. */
export function EditPreferencesDialog({ open, client, onClose }: EditPreferencesDialogProps) {
  return (
    <Dialog open={open} labelledBy="edit-preferences-title" className="relative w-full max-w-md rounded-3xl p-6">
      {open && <EditPreferencesForm key={client.id} client={client} onClose={onClose} />}
    </Dialog>
  );
}

function EditPreferencesForm({ client, onClose }: { client: Cliente; onClose: () => void }) {
  const { updateClient } = useAppData();
  const [hairType, setHairType] = useState(client.hairType ?? "");
  const [colorReference, setColorReference] = useState(client.colorReference ?? "");
  const [skinNotes, setSkinNotes] = useState(client.skinNotes ?? "");
  const [preferencesNotes, setPreferencesNotes] = useState(client.preferencesNotes ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateClient(client.id, {
      hairType: hairType.trim() || undefined,
      colorReference: colorReference.trim() || undefined,
      skinNotes: skinNotes.trim() || undefined,
      preferencesNotes: preferencesNotes.trim() || undefined,
    });
    onClose();
  }

  return (
    <>
      <CloseButton onClick={onClose} />
      <h2 id="edit-preferences-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
        Modifier les préférences beauté
      </h2>
      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        <Field label="Type de cheveux">
          <TextInput value={hairType} onChange={(e) => setHairType(e.target.value)} placeholder="Naturel, lisse, bouclé…" />
        </Field>
        <Field label="Référence couleur">
          <TextInput value={colorReference} onChange={(e) => setColorReference(e.target.value)} />
        </Field>
        <Field label="Notes peau">
          <Textarea value={skinNotes} onChange={(e) => setSkinNotes(e.target.value)} rows={2} />
        </Field>
        <Field label="Préférences">
          <Textarea value={preferencesNotes} onChange={(e) => setPreferencesNotes(e.target.value)} rows={2} />
        </Field>
        <div className="mt-2 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" variant="brand" className="flex-1">
            Enregistrer
          </Button>
        </div>
      </form>
    </>
  );
}
