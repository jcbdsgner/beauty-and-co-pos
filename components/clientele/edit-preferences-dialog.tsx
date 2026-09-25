"use client";

import { useState } from "react";
import { Check, ImagePlus, X } from "lucide-react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Field } from "@/components/ui/molecules/field";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Textarea } from "@/components/ui/atoms/textarea";
import { Button } from "@/components/ui/atoms/button";
import { PhotoPlaceholder } from "@/components/ui/atoms/photo-placeholder";
import { NotationPhoto } from "@/components/clientele/notation-photo";
import { useAppData } from "@/components/providers/app-data-provider";
import { NOTATION_QUESTIONS } from "@/lib/data/notation";
import { cn } from "@/lib/utils";
import { PREFERENCE_DOMAINS, PREFERENCE_DOMAIN_LABEL, type Cliente, type PreferenceDomain } from "@/lib/data/types";

type EditPreferencesDialogProps = {
  open: boolean;
  client: Cliente;
  onClose: () => void;
};

/** Edit dialog for the Fiche cliente's "Préférences" card — type de cheveux + référence couleur,
 *  puis par domaine : les réponses de « Noter la cliente » (tuiles photo à cocher), un texte libre et
 *  des photos de référence (mock : pas de vrai upload). */
export function EditPreferencesDialog({ open, client, onClose }: EditPreferencesDialogProps) {
  return (
    <Dialog open={open} labelledBy="edit-preferences-title" className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl p-0">
      {open && <EditPreferencesForm key={client.id} client={client} onClose={onClose} />}
    </Dialog>
  );
}

function EditPreferencesForm({ client, onClose }: { client: Cliente; onClose: () => void }) {
  const { updateClient } = useAppData();
  const [hairType, setHairType] = useState(client.hairType ?? "");
  const [colorReference, setColorReference] = useState(client.colorReference ?? "");
  const [notes, setNotes] = useState<Partial<Record<PreferenceDomain, string>>>(() => ({ ...client.preferenceNotes }));
  const [photos, setPhotos] = useState<Partial<Record<PreferenceDomain, string[]>>>(() => {
    const seed: Partial<Record<PreferenceDomain, string[]>> = {};
    for (const d of PREFERENCE_DOMAINS) seed[d] = [...(client.preferencePhotos?.[d] ?? [])];
    return seed;
  });

  const [choices, setChoices] = useState<Record<string, string[]>>(() => ({ ...client.notationChoices }));

  function toggleChoice(questionId: string, optionId: string) {
    setChoices((prev) => {
      const current = prev[questionId] ?? [];
      return { ...prev, [questionId]: current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId] };
    });
  }

  function addPhoto(domain: PreferenceDomain) {
    setPhotos((prev) => ({ ...prev, [domain]: [...(prev[domain] ?? []), `photo-${domain}-${Date.now()}`] }));
  }
  function removePhoto(domain: PreferenceDomain, ref: string) {
    setPhotos((prev) => ({ ...prev, [domain]: (prev[domain] ?? []).filter((r) => r !== ref) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanNotes: Partial<Record<PreferenceDomain, string>> = {};
    const cleanPhotos: Partial<Record<PreferenceDomain, string[]>> = {};
    for (const d of PREFERENCE_DOMAINS) {
      const t = notes[d]?.trim();
      if (t) cleanNotes[d] = t;
      if (photos[d]?.length) cleanPhotos[d] = photos[d];
    }
    updateClient(client.id, {
      hairType: hairType.trim() || undefined,
      colorReference: colorReference.trim() || undefined,
      preferenceNotes: Object.keys(cleanNotes).length ? cleanNotes : undefined,
      preferencePhotos: Object.keys(cleanPhotos).length ? cleanPhotos : undefined,
      notationChoices: Object.fromEntries(Object.entries(choices).filter(([, ids]) => ids.length > 0)),
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-4 border-b border-base-300 p-6 pb-4">
        <h2 id="edit-preferences-title" className="font-[family-name:var(--font-heading)] text-xl font-semibold text-base-content">
          Modifier les préférences
        </h2>
        <CloseButton onClick={onClose} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type de cheveux">
            <TextInput value={hairType} onChange={(e) => setHairType(e.target.value)} placeholder="Naturel 4C, défrisé, locks…" />
          </Field>
          <Field label="Référence couleur">
            <TextInput value={colorReference} onChange={(e) => setColorReference(e.target.value)} placeholder="Châtain profond #3" />
          </Field>
        </div>

        {PREFERENCE_DOMAINS.map((domain) => (
          <Field key={domain} label={PREFERENCE_DOMAIN_LABEL[domain]}>
            {NOTATION_QUESTIONS.filter((q) => q.domain === domain).map((question) => (
              <div key={question.id} className="mb-3">
                <p className="mb-1.5 text-xs font-medium text-base-content/55">{question.noteLabel}</p>
                <div className="flex flex-wrap gap-2" role="group" aria-label={question.noteLabel}>
                  {question.options.map((option) => {
                    const on = (choices[question.id] ?? []).includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleChoice(question.id, option.id)}
                        className={cn(
                          "w-[4.5rem] overflow-hidden rounded-xl border-2 text-center transition active:scale-[0.97]",
                          on ? "border-primary" : "border-base-300 hover:border-primary/40",
                        )}
                      >
                        <span className="relative block aspect-square bg-accent">
                          <NotationPhoto question={question} option={option} />
                          {on && (
                            <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-content">
                              <Check className="size-3" strokeWidth={3} />
                            </span>
                          )}
                        </span>
                        <span className={cn("block px-1 py-1 text-[11px] leading-tight", on ? "font-semibold" : "text-base-content/70")}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <Textarea
              value={notes[domain] ?? ""}
              onChange={(e) => setNotes((prev) => ({ ...prev, [domain]: e.target.value }))}
              rows={2}
              placeholder="Ce que le salon retient…"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {(photos[domain] ?? []).map((ref) => (
                <span key={ref} className="relative">
                  <PhotoPlaceholder className="size-16" label="" />
                  <button
                    type="button"
                    onClick={() => removePhoto(domain, ref)}
                    aria-label="Retirer la photo"
                    className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-base-content text-white"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => addPhoto(domain)}
                className="flex size-16 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-base-content/30 text-base-content/45 transition hover:bg-accent"
              >
                <ImagePlus className="size-5" />
              </button>
            </div>
          </Field>
        ))}
      </div>

      <div className="flex gap-3 border-t border-base-300 p-6 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" variant="brand" className="flex-1">
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
