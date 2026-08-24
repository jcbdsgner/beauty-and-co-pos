"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ChipSelect } from "@/components/parametres/chip-select";
import {
  CARE_FAMILY_CHIP_OPTIONS,
  HAIR_TYPE_OPTIONS,
  SKIN_TYPE_OPTIONS,
  type BeautyTip,
  type CareFamilyValue,
} from "@/lib/data/parametres-catalogue";

type BeautyTipDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (tip: BeautyTip) => void;
};

const sectionLabelClass = "mb-2 text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase";

/** "Nouveau conseil beauté" bottom-sheet modal : famille de soin (chips multi), texte du
 * conseil, types de peau / cheveux ciblés (chips multi, optionnels). The form lives in
 * `BeautyTipForm`, mounted only while `open` — `Dialog` unmounts its children when closed, so
 * remounting on reopen is what resets the form, no effect needed. */
export function BeautyTipDialog({ open, onClose, onSave }: BeautyTipDialogProps) {
  return (
    <Dialog open={open} labelledBy="beauty-tip-title" className="max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl">
      {open && <BeautyTipForm onClose={onClose} onSave={onSave} />}
    </Dialog>
  );
}

function BeautyTipForm({ onClose, onSave }: { onClose: () => void; onSave: (tip: BeautyTip) => void }) {
  const [families, setFamilies] = useState<string[]>(["general"]);
  const [text, setText] = useState("");
  const [skinTypes, setSkinTypes] = useState<string[]>([]);
  const [hairTypes, setHairTypes] = useState<string[]>([]);

  function toggleIn(list: string[], setList: (value: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    onSave({
      id: `tip-${Date.now()}`,
      family: (families[0] ?? "general") as CareFamilyValue,
      text: text.trim(),
    });
  }

  return (
    <>
      <div className="flex justify-center pt-3">
        <div className="h-1 w-10 rounded-full bg-[var(--color-gray-200)]" />
      </div>
      <div className="flex items-start justify-between px-6 pt-4">
        <h2 id="beauty-tip-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
          Nouveau conseil beauté
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

      <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
        <div>
          <p className={sectionLabelClass}>Famille de soin</p>
          <ChipSelect
            options={CARE_FAMILY_CHIP_OPTIONS}
            selected={families}
            onToggle={(value) => toggleIn(families, setFamilies, value)}
          />
        </div>

        <div>
          <p className={sectionLabelClass}>Votre conseil (tel qu&apos;il apparaîtra dans le message)</p>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="ex : dormez avec un bonnet en satin pour préserver vos boucles"
            rows={3}
            className="w-full rounded-xl border border-transparent bg-[var(--brand-rose-soft)] px-4 py-3 text-[15px] text-[var(--color-gray-900)] placeholder:text-[var(--color-gray-400)] focus:border-[var(--brand-taupe-muted)] focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-[var(--color-gray-500)]">
            La conseillère l&apos;introduira par « En attendant, mon petit conseil : … » — commencez donc par un verbe,
            sans majuscule ni point final.
          </p>
        </div>

        <div>
          <p className={sectionLabelClass}>Réservé à certains types de peau (optionnel)</p>
          <ChipSelect
            options={SKIN_TYPE_OPTIONS}
            selected={skinTypes}
            onToggle={(value) => toggleIn(skinTypes, setSkinTypes, value)}
          />
        </div>

        <div>
          <p className={sectionLabelClass}>Réservé à certains types de cheveux (optionnel)</p>
          <ChipSelect
            options={HAIR_TYPE_OPTIONS}
            selected={hairTypes}
            onToggle={(value) => toggleIn(hairTypes, setHairTypes, value)}
          />
        </div>

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
