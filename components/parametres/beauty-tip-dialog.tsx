"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Pills } from "@/components/ui/pills";
import { CheckIcon, XIcon } from "@/components/ui/icons";
import { ChipSelect } from "@/components/parametres/chip-select";
import {
  CARE_FAMILY_CHIP_OPTIONS,
  HAIR_TYPE_OPTIONS,
  SKIN_TYPE_OPTIONS,
  type BeautyTip,
  type CareFamilyValue,
  type ServiceCycleTip,
} from "@/lib/data/parametres-catalogue";

type BeautyTipDialogProps = {
  open: boolean;
  /** undefined = création ("+ Ajouter"), défini = édition (crayon sur une carte de "Mes conseils"). */
  tip?: BeautyTip;
  onClose: () => void;
  onSave: (tip: BeautyTip) => void;
};

const sectionLabelClass = "mb-2 text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase";
const fieldClass =
  "w-full rounded-xl border border-transparent bg-[var(--brand-rose-soft)] px-4 py-3 text-[15px] text-[var(--color-gray-900)] placeholder:text-[var(--color-gray-400)] focus:border-[var(--brand-taupe-muted)] focus:outline-none";

/** "Nouveau conseil beauté" / "Modifier le conseil beauté" bottom-sheet modal : famille de soin
 * (choix unique, aligné avec `BeautyTip.family` qui n'accepte qu'une seule valeur), texte du
 * conseil, types de peau / cheveux ciblés (chips multi, optionnels). The form lives in
 * `BeautyTipForm`, mounted only while `open` — `Dialog` unmounts its children when closed, so
 * remounting on reopen is what resets/reseeds the form, no effect needed. */
export function BeautyTipDialog({ open, tip, onClose, onSave }: BeautyTipDialogProps) {
  return (
    <Dialog open={open} labelledBy="beauty-tip-title" className="max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl">
      {open && <BeautyTipForm tip={tip} onClose={onClose} onSave={onSave} />}
    </Dialog>
  );
}

function BeautyTipForm({
  tip,
  onClose,
  onSave,
}: {
  tip?: BeautyTip;
  onClose: () => void;
  onSave: (tip: BeautyTip) => void;
}) {
  const [family, setFamily] = useState<CareFamilyValue>(tip?.family ?? "general");
  const [text, setText] = useState(tip?.text ?? "");
  const [skinTypes, setSkinTypes] = useState<string[]>(tip?.skinTypes ?? []);
  const [hairTypes, setHairTypes] = useState<string[]>(tip?.hairTypes ?? []);
  const [error, setError] = useState(false);

  function toggleIn(list: string[], setList: (value: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError(true);
      return;
    }
    onSave({
      id: tip?.id ?? `tip-${Date.now()}`,
      family,
      text: trimmed,
      skinTypes: skinTypes.length ? skinTypes : undefined,
      hairTypes: hairTypes.length ? hairTypes : undefined,
    });
  }

  return (
    <>
      <div className="flex justify-center pt-3">
        <div className="h-1 w-10 rounded-full bg-[var(--color-gray-200)]" />
      </div>
      <div className="flex items-start justify-between px-6 pt-4">
        <h2 id="beauty-tip-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
          {tip ? "Modifier le conseil beauté" : "Nouveau conseil beauté"}
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

      <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
        <div>
          <p className={sectionLabelClass}>Famille de soin</p>
          <Pills options={CARE_FAMILY_CHIP_OPTIONS} value={family} onChange={(value) => setFamily(value as CareFamilyValue)} />
        </div>

        <div>
          <label htmlFor="beauty-tip-text" className={sectionLabelClass}>
            Votre conseil (tel qu&apos;il apparaîtra dans le message)
          </label>
          <textarea
            id="beauty-tip-text"
            autoFocus
            required
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              if (error) setError(false);
            }}
            placeholder="ex : dormez avec un bonnet en satin pour préserver vos boucles"
            rows={3}
            aria-invalid={error}
            aria-describedby={error ? "beauty-tip-text-error" : undefined}
            className={fieldClass}
          />
          {error ? (
            <p id="beauty-tip-text-error" className="mt-1.5 text-xs font-medium text-[var(--color-error)]">
              Merci de saisir le texte du conseil avant d&apos;enregistrer.
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-[var(--color-gray-500)]">
              La conseillère l&apos;introduira par « En attendant, mon petit conseil : … » — commencez donc par un
              verbe, sans majuscule ni point final.
            </p>
          )}
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
          <Button type="submit" variant="brand" className="flex-1" icon={<CheckIcon />}>
            Enregistrer
          </Button>
        </div>
      </form>
    </>
  );
}

type ServiceCycleDialogProps = {
  open: boolean;
  cycle?: ServiceCycleTip;
  onClose: () => void;
  onSave: (cycle: ServiceCycleTip) => void;
};

/** Mini-formulaire d'édition d'un "Cycle & conseil par service" (délai de relance J+n + conseil
 * associé). Ouvert via le crayon d'une ligne de la section "Cycles & conseils par service". */
export function ServiceCycleDialog({ open, cycle, onClose, onSave }: ServiceCycleDialogProps) {
  return (
    <Dialog open={open} labelledBy="service-cycle-title" className="max-h-[85vh] max-w-md overflow-y-auto rounded-3xl">
      {open && cycle && <ServiceCycleForm cycle={cycle} onClose={onClose} onSave={onSave} />}
    </Dialog>
  );
}

function ServiceCycleForm({
  cycle,
  onClose,
  onSave,
}: {
  cycle: ServiceCycleTip;
  onClose: () => void;
  onSave: (cycle: ServiceCycleTip) => void;
}) {
  const [delayDays, setDelayDays] = useState(cycle.delayDays?.toString() ?? "");
  const [text, setText] = useState(cycle.text);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsedDelay = delayDays.trim() === "" ? undefined : Math.max(0, Number(delayDays));
    onSave({ ...cycle, delayDays: parsedDelay, text: text.trim() });
  }

  return (
    <>
      <div className="flex justify-center pt-3">
        <div className="h-1 w-10 rounded-full bg-[var(--color-gray-200)]" />
      </div>
      <div className="flex items-start justify-between px-6 pt-4">
        <div>
          <h2 id="service-cycle-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
            Conseil de relance
          </h2>
          <p className="mt-1 text-sm text-[var(--color-gray-500)]">{cycle.serviceName}</p>
        </div>
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
          <label htmlFor="cycle-delay" className={sectionLabelClass}>
            Délai de relance (jours après la prestation)
          </label>
          <input
            id="cycle-delay"
            autoFocus
            type="number"
            min={0}
            inputMode="numeric"
            value={delayDays}
            onChange={(event) => setDelayDays(event.target.value)}
            placeholder="Ex : 30"
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-[var(--color-gray-400)]">Laisser vide pour désactiver la relance (« — »).</p>
        </div>

        <div>
          <label htmlFor="cycle-text" className={sectionLabelClass}>
            Conseil envoyé au client
          </label>
          <textarea
            id="cycle-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            placeholder="ex : buvez beaucoup d'eau après votre séance pour prolonger ses bienfaits"
            className={fieldClass}
          />
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
