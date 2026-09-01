"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Field } from "@/components/ui/molecules/field";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Select } from "@/components/ui/atoms/select";
import { Button } from "@/components/ui/atoms/button";
import { useAppData } from "@/components/providers/app-data-provider";
import { PAYS_DEFAUT, PAYS_OPTIONS } from "@/lib/data/pays";
import type { Cliente } from "@/lib/data/types";

type EditCoordonneesDialogProps = {
  open: boolean;
  client: Cliente;
  onClose: () => void;
};

/** Edit dialog for the Fiche cliente's "Coordonnées" card — phone/WhatsApp/email/address/profession. */
export function EditCoordonneesDialog({ open, client, onClose }: EditCoordonneesDialogProps) {
  return (
    <Dialog open={open} labelledBy="edit-coordonnees-title" className="relative w-full max-w-md rounded-3xl p-6">
      {/* Mounting only while open — and remounting whenever the target client changes — is what
          resets the form fields; no effect needed to sync state back to the latest props. */}
      {open && <EditCoordonneesForm key={client.id} client={client} onClose={onClose} />}
    </Dialog>
  );
}

function EditCoordonneesForm({ client, onClose }: { client: Cliente; onClose: () => void }) {
  const { updateClient } = useAppData();
  const [phone, setPhone] = useState(client.phone);
  const [whatsapp, setWhatsapp] = useState(client.whatsapp ?? "");
  const [email, setEmail] = useState(client.email ?? "");
  const [address, setAddress] = useState(client.address ?? "");
  const [residenceCountry, setResidenceCountry] = useState(client.residenceCountry || PAYS_DEFAUT);
  const [profession, setProfession] = useState(client.profession ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() || !residenceCountry.trim()) return;
    updateClient(client.id, {
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      residenceCountry,
      profession: profession.trim() || undefined,
    });
    onClose();
  }

  return (
    <>
      <CloseButton onClick={onClose} />
      <h2 id="edit-coordonnees-title" className="font-[family-name:var(--font-heading)] font-semibold text-xl text-[var(--color-gray-900)]">
        Modifier les coordonnées
      </h2>
      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        <Field label="Téléphone" required>
          <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="WhatsApp">
          <TextInput value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </Field>
        <Field label="Email">
          <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Adresse">
          <TextInput value={address} onChange={(e) => setAddress(e.target.value)} />
        </Field>
        <Field label="Pays de résidence" required>
          <Select value={residenceCountry} onChange={setResidenceCountry} options={PAYS_OPTIONS} tone="cream" />
        </Field>
        <Field label="Profession">
          <TextInput value={profession} onChange={(e) => setProfession(e.target.value)} />
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
