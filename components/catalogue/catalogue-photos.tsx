"use client";

import { useState } from "react";
import { Board, ChipFilter, Legend } from "@/components/ui/board";
import { FileUpload, type UploadedFile } from "@/components/ui/molecules/file-upload";

const PHOTO_CATEGORIES = [
  { value: "coiffure", label: "Coiffure" },
  { value: "coloration", label: "Coloration" },
  { value: "ongles", label: "Ongles" },
  { value: "soins-visage", label: "Soins visage" },
];

const SLOT_COUNT = 6;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

/**
 * Photos de référence — banque d'images par catégorie, à montrer à la cliente. La seule règle de
 * rejet de fichier de l'app (mauvais format / plus de 5 Mo) s'affiche inline sur l'emplacement,
 * jamais un emplacement bloqué en chargement.
 */
export function CataloguePhotos() {
  const [category, setCategory] = useState(PHOTO_CATEGORIES[0]?.value ?? "");
  const [slotsByCategory, setSlotsByCategory] = useState<Record<string, (UploadedFile | null)[]>>({});
  const [slotErrors, setSlotErrors] = useState<Record<string, string | null>>({});

  const currentSlots = slotsByCategory[category] ?? Array.from({ length: SLOT_COUNT }, () => null);
  const key = (i: number) => `${category}-${i}`;

  function handleAdd(index: number, fileList: FileList) {
    const file = fileList[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSlotErrors((prev) => ({ ...prev, [key(index)]: "Format non pris en charge — utilisez une image (JPG, PNG)." }));
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setSlotErrors((prev) => ({ ...prev, [key(index)]: "Image trop grande, 5 Mo maximum." }));
      return;
    }
    setSlotErrors((prev) => ({ ...prev, [key(index)]: null }));
    setSlotsByCategory((prev) => {
      const next = [...(prev[category] ?? Array.from({ length: SLOT_COUNT }, () => null))];
      next[index] = { name: file.name, sizeLabel: `${(file.size / (1024 * 1024)).toFixed(1)} Mo` };
      return { ...prev, [category]: next };
    });
  }

  function handleRemove(index: number) {
    setSlotErrors((prev) => ({ ...prev, [key(index)]: null }));
    setSlotsByCategory((prev) => {
      const next = [...(prev[category] ?? Array.from({ length: SLOT_COUNT }, () => null))];
      next[index] = null;
      return { ...prev, [category]: next };
    });
  }

  const filled = currentSlots.filter(Boolean).length;

  return (
    <Board
      legend={`${filled} / ${SLOT_COUNT} emplacements`}
      legendRight={<ChipFilter options={PHOTO_CATEGORIES} value={category} onChange={setCategory} />}
    >
      <div className="grid grid-cols-2 gap-px bg-[var(--board-groove)] md:grid-cols-3">
        {currentSlots.map((slot, index) => (
          <div key={index} className="flex flex-col gap-2 bg-white p-4">
            <Legend>Emplacement {String(index + 1).padStart(2, "0")}</Legend>
            <FileUpload
              files={slot ? [slot] : []}
              onAdd={(fileList) => handleAdd(index, fileList)}
              onRemove={() => handleRemove(index)}
              multiple={false}
              hint="JPG, PNG · 5 Mo max"
            />
            {slotErrors[key(index)] && (
              <p className="text-xs font-medium text-[var(--board-amber)]">{slotErrors[key(index)]}</p>
            )}
          </div>
        ))}
      </div>
    </Board>
  );
}
