"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Field } from "@/components/ui/molecules/field";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Textarea } from "@/components/ui/atoms/textarea";
import { Button } from "@/components/ui/atoms/button";
import type { BeautyTip } from "@/lib/data/types";

type BeautyTipFormDialogProps = {
  open: boolean;
  mode: "add" | "edit";
  tip: BeautyTip | null;
  onClose: () => void;
  onSubmit: (values: Omit<BeautyTip, "id">) => void;
};

/** Ajouter/Modifier un conseil beauté — title reflects add vs edit, inline validation on every required field. */
export function BeautyTipFormDialog({ open, mode, tip, onClose, onSubmit }: BeautyTipFormDialogProps) {
  return (
    <Dialog open={open} labelledBy="tip-form-title" className="relative max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl p-6">
      {open && <BeautyTipForm key={tip?.id ?? "new"} mode={mode} tip={tip} onClose={onClose} onSubmit={onSubmit} />}
    </Dialog>
  );
}

function BeautyTipForm({ mode, tip, onClose, onSubmit }: Omit<BeautyTipFormDialogProps, "open">) {
  const [family, setFamily] = useState(tip?.family ?? "");
  const [title, setTitle] = useState(tip?.title ?? "");
  const [body, setBody] = useState(tip?.body ?? "");
  const [errors, setErrors] = useState<{ family?: string; title?: string; body?: string }>({});

  function handleSubmit() {
    const nextErrors: typeof errors = {};
    if (!family.trim()) nextErrors.family = "La famille est obligatoire.";
    if (!title.trim()) nextErrors.title = "Le titre est obligatoire.";
    if (!body.trim()) nextErrors.body = "La description est obligatoire.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSubmit({ family: family.trim(), title: title.trim(), body: body.trim() });
  }

  return (
    <>
      <CloseButton onClick={onClose} />
      <h2 id="tip-form-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
        {mode === "add" ? "Ajouter un conseil" : "Modifier le conseil"}
      </h2>

      <div className="mt-5 flex flex-col gap-4">
        <Field label="Famille" required>
          <TextInput value={family} onChange={(e) => setFamily(e.target.value)} placeholder="Ex. Cheveux crépus" />
          {errors.family && <p className="mt-1 text-xs font-medium text-[var(--color-error)]">{errors.family}</p>}
        </Field>
        <Field label="Titre" required>
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Hydratation quotidienne" />
          {errors.title && <p className="mt-1 text-xs font-medium text-[var(--color-error)]">{errors.title}</p>}
        </Field>
        <Field label="Description" required>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Conseil à partager avec la cliente…" />
          {errors.body && <p className="mt-1 text-xs font-medium text-[var(--color-error)]">{errors.body}</p>}
        </Field>
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Annuler
        </Button>
        <Button type="button" variant="dark" onClick={handleSubmit} className="flex-1">
          {mode === "add" ? "Ajouter" : "Enregistrer"}
        </Button>
      </div>
    </>
  );
}
