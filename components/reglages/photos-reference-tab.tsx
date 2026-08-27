"use client";

import { useState } from "react";
import { Select } from "@/components/ui/atoms/select";
import { Pills } from "@/components/ui/molecules/pills";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { FileUpload, type UploadedFile } from "@/components/ui/molecules/file-upload";
import { COMPANIES } from "@/lib/data/entreprises";

const PHOTO_CATEGORIES = [
  { value: "coiffure", label: "Coiffure" },
  { value: "coloration", label: "Coloration" },
  { value: "ongles", label: "Ongles" },
  { value: "soins-visage", label: "Soins visage" },
];

const SLOT_COUNT = 6;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

function scopeKey(companyId: string, category: string) {
  return `${companyId}:${category}`;
}

/**
 * Photos de référence — real per-slot FileUpload (replaces the decorative PhotoPlaceholder
 * grid) with an Entreprise Select actually wired to a distinct slot set per company + photo
 * category, and the app's one file-rejection message (bad format / over 5 Mo) shown inline,
 * immediately, never a slot stuck loading.
 */
export function PhotosReferenceTab() {
  const [companyId, setCompanyId] = useState(COMPANIES[0]?.id ?? "");
  const [category, setCategory] = useState(PHOTO_CATEGORIES[0]?.value ?? "");
  const [slotsByScope, setSlotsByScope] = useState<Record<string, (UploadedFile | null)[]>>({});
  const [slotErrors, setSlotErrors] = useState<Record<number, string | null>>({});

  const key = scopeKey(companyId, category);
  const currentSlots = slotsByScope[key] ?? Array.from({ length: SLOT_COUNT }, () => null);

  function handleAdd(index: number, fileList: FileList) {
    const file = fileList[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSlotErrors((prev) => ({ ...prev, [index]: "Format non pris en charge — utilisez une image (JPG, PNG)." }));
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setSlotErrors((prev) => ({ ...prev, [index]: "Image trop grande, 5 Mo maximum." }));
      return;
    }
    setSlotErrors((prev) => ({ ...prev, [index]: null }));
    setSlotsByScope((prev) => {
      const next = [...(prev[key] ?? Array.from({ length: SLOT_COUNT }, () => null))];
      next[index] = { name: file.name, sizeLabel: `${(file.size / (1024 * 1024)).toFixed(1)} Mo` };
      return { ...prev, [key]: next };
    });
  }

  function handleRemove(index: number) {
    setSlotErrors((prev) => ({ ...prev, [index]: null }));
    setSlotsByScope((prev) => {
      const next = [...(prev[key] ?? Array.from({ length: SLOT_COUNT }, () => null))];
      next[index] = null;
      return { ...prev, [key]: next };
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="w-64">
        <FieldLabel variant="plain" className="mb-1.5">
          Entreprise
        </FieldLabel>
        <Select value={companyId} onChange={setCompanyId} options={COMPANIES.map((c) => ({ value: c.id, label: c.name }))} />
      </div>

      <div>
        <FieldLabel className="mb-2">Catégorie de photo</FieldLabel>
        <Pills options={PHOTO_CATEGORIES} value={category} onChange={setCategory} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {currentSlots.map((slot, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-2xl border border-[var(--color-gray-200)] bg-white p-4">
            <FieldLabel variant="plain">Emplacement {index + 1}</FieldLabel>
            <FileUpload
              files={slot ? [slot] : []}
              onAdd={(fileList) => handleAdd(index, fileList)}
              onRemove={() => handleRemove(index)}
              multiple={false}
              hint="JPG, PNG jusqu'à 5 Mo"
            />
            {slotErrors[index] && <p className="text-xs font-medium text-[var(--color-error)]">{slotErrors[index]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
