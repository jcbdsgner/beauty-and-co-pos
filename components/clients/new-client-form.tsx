"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CakeIcon } from "@/components/clients/icons";

const inputClass =
  "w-full rounded-xl border border-[var(--color-gray-200)] bg-[var(--brand-cream)] px-4 py-3 text-[15px] text-[var(--color-gray-900)] placeholder:text-[var(--color-gray-400)] focus:border-[var(--brand-taupe-muted)] focus:outline-none";

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-[var(--color-gray-600)]">
        {label}
        {required && <span className="text-[var(--color-error)]"> *</span>}
      </span>
      {children}
    </label>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">{children}</p>
  );
}

export function NewClientForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    // Pas de persistance réelle — mock local uniquement. On redirige vers le répertoire.
    router.push("/clients");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-6">
        <SectionLabel>Identité</SectionLabel>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Prénom" required>
            <input name="firstName" required placeholder="Prénom" className={inputClass} />
          </Field>
          <Field label="Nom" required>
            <input name="lastName" required placeholder="Nom" className={inputClass} />
          </Field>
        </div>

        <Field label="Téléphone" required>
          <input name="phone" required type="tel" placeholder="+221 77 123 45 67" className={inputClass} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="WhatsApp">
            <input name="whatsapp" placeholder="Numéro WhatsApp" className={inputClass} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" placeholder="email@exemple.com" className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Adresse">
            <input name="address" placeholder="Quartier, ville" className={inputClass} />
          </Field>
          <Field label="Poste / Profession">
            <input name="profession" placeholder="Ex: Directrice, Avocate..." className={inputClass} />
          </Field>
        </div>

        <Field label="Anniversaire">
          <div className="relative">
            <input name="birthday" placeholder="jj/mm/aaaa" className={cn(inputClass, "pr-10")} />
            <CakeIcon className="pointer-events-none absolute top-1/2 right-3 size-4.5 -translate-y-1/2 text-[var(--color-gray-400)]" />
          </div>
        </Field>
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <SectionLabel>Profil beauté</SectionLabel>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Type de cheveux">
            <select name="hairType" defaultValue="" className={inputClass}>
              <option value="" disabled>
                Sélectionner...
              </option>
              <option value="lisse">Lisse</option>
              <option value="ondule">Ondulé</option>
              <option value="boucle">Bouclé</option>
              <option value="crepu">Crépu</option>
            </select>
          </Field>
          <Field label="Référence coloration">
            <input name="colorReference" placeholder="Ex: 6.1, Blond cendré..." className={inputClass} />
          </Field>
        </div>

        <Field label="Notes peau">
          <textarea
            name="skinNotes"
            rows={3}
            placeholder="Allergies, type de peau, sensibilités..."
            className={cn(inputClass, "resize-none")}
          />
        </Field>

        <Field label="Préférences & notes">
          <textarea
            name="preferencesNotes"
            rows={3}
            placeholder="Services préférés, notes spéciales, habitudes..."
            className={cn(inputClass, "resize-none")}
          />
        </Field>
      </Card>

      <Button type="submit" variant="brand" className="w-full" disabled={submitting}>
        Créer le client
      </Button>
    </form>
  );
}
