"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Card } from "@/components/ui/atoms/card";
import { Field } from "@/components/ui/molecules/field";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Textarea } from "@/components/ui/atoms/textarea";
import { DatePicker } from "@/components/ui/molecules/date-picker";
import { Alert } from "@/components/ui/molecules/alert";
import { Button } from "@/components/ui/atoms/button";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import type { Cliente } from "@/lib/data/types";

type NewClientDialogProps = {
  open: boolean;
  onClose: () => void;
  /** When provided, called with the new client's id instead of this dialog navigating itself — lets a caller (e.g. Comptoir) decide what happens next. Left unset, the dialog navigates to the new Fiche cliente itself. */
  onCreated?: (clientId: string) => void;
  /** Pre-fill fields from what the caller already knows — e.g. the text typed into "Chercher une cliente" before the search came up empty. */
  initialValues?: Partial<typeof emptyForm>;
};

const emptyForm = {
  firstName: "",
  lastName: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  profession: "",
  hairType: "",
  colorReference: "",
  skinNotes: "",
  preferencesNotes: "",
};

/**
 * Self-contained "Nouvelle cliente" form dialog — reusable from the Répertoire toolbar today and
 * from the Comptoir later (per USERFLOW.md), hence the optional `onCreated` escape hatch instead
 * of a hardcoded redirect.
 */
export function NewClientDialog({ open, onClose, onCreated, initialValues }: NewClientDialogProps) {
  const router = useRouter();
  const { addClient, findDuplicatePhone } = useAppData();

  const [form, setForm] = useState<typeof emptyForm>(() => ({ ...emptyForm, ...initialValues }));
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [duplicate, setDuplicate] = useState<Cliente | undefined>(() =>
    initialValues?.phone?.trim() ? findDuplicatePhone(initialValues.phone) : undefined,
  );
  const [attempted, setAttempted] = useState(false);

  function set<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setForm(emptyForm);
    setBirthday(null);
    setDuplicate(undefined);
    setAttempted(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  const canSubmit = form.firstName.trim() !== "" && form.lastName.trim() !== "" && form.phone.trim() !== "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (!canSubmit) return;

    const client = addClient({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim() || undefined,
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      profession: form.profession.trim() || undefined,
      birthday: birthday ? birthday.toISOString().slice(0, 10) : undefined,
      hairType: form.hairType.trim() || undefined,
      colorReference: form.colorReference.trim() || undefined,
      skinNotes: form.skinNotes.trim() || undefined,
      preferencesNotes: form.preferencesNotes.trim() || undefined,
    });

    reset();
    onClose();
    if (onCreated) {
      onCreated(client.id);
    } else {
      router.push(`/clientele/${client.id}`);
    }
  }

  if (!open) return null;

  return (
    <Dialog
      open={open}
      labelledBy="new-client-title"
      className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6"
    >
      <CloseButton onClick={handleClose} />
      <h2 id="new-client-title" className="font-[family-name:var(--font-heading)] font-semibold text-2xl text-[var(--color-gray-900)]">
        Nouvelle cliente
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <Card className="flex flex-col gap-4 p-5">
          <FieldLabel>Identité</FieldLabel>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prénom" required>
              <TextInput value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Awa" />
            </Field>
            <Field label="Nom" required>
              <TextInput value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Sarr" />
            </Field>
            <Field label="Téléphone" required>
              <TextInput
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                onBlur={(e) => setDuplicate(e.target.value.trim() ? findDuplicatePhone(e.target.value) : undefined)}
                placeholder="+221 77 000 00 00"
              />
            </Field>
            <Field label="WhatsApp">
              <TextInput value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+221 77 000 00 00" />
            </Field>
            <Field label="Email">
              <TextInput type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="awa@example.com" />
            </Field>
            <Field label="Profession">
              <TextInput value={form.profession} onChange={(e) => set("profession", e.target.value)} />
            </Field>
            <Field label="Adresse" className="col-span-2">
              <TextInput value={form.address} onChange={(e) => set("address", e.target.value)} />
            </Field>
            <Field label="Anniversaire" className="col-span-2">
              <DatePicker value={birthday} onChange={setBirthday} />
            </Field>
          </div>

          {duplicate && (
            <Alert
              tone="warning"
              title="Ce numéro existe déjà"
              description={`${clientFullName(duplicate)} utilise déjà ce numéro de téléphone. Deux clientes distinctes peuvent partager un même foyer — vous pouvez créer quand même.`}
              action={
                <Link
                  href={`/clientele/${duplicate.id}`}
                  className="shrink-0 text-sm font-semibold text-[var(--color-warning)] underline underline-offset-2"
                >
                  Voir la fiche existante
                </Link>
              }
            />
          )}
        </Card>

        <Card className="flex flex-col gap-4 p-5">
          <FieldLabel>Profil beauté</FieldLabel>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type de cheveux">
              <TextInput value={form.hairType} onChange={(e) => set("hairType", e.target.value)} placeholder="Naturel, lisse, bouclé…" />
            </Field>
            <Field label="Référence couleur">
              <TextInput value={form.colorReference} onChange={(e) => set("colorReference", e.target.value)} />
            </Field>
            <Field label="Notes peau" className="col-span-2">
              <Textarea value={form.skinNotes} onChange={(e) => set("skinNotes", e.target.value)} rows={2} />
            </Field>
            <Field label="Préférences" className="col-span-2">
              <Textarea value={form.preferencesNotes} onChange={(e) => set("preferencesNotes", e.target.value)} rows={2} />
            </Field>
          </div>
        </Card>

        {attempted && !canSubmit && (
          <Alert tone="error" title="Complétez les champs obligatoires" description="Prénom, nom et téléphone sont nécessaires pour créer la fiche." />
        )}

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" variant="brand" className="flex-1">
            {duplicate ? "Créer quand même" : "Créer"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
