"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Field } from "@/components/ui/molecules/field";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Select } from "@/components/ui/atoms/select";
import { Switch } from "@/components/ui/atoms/switch";
import { Button } from "@/components/ui/atoms/button";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { FileUpload, type UploadedFile } from "@/components/ui/molecules/file-upload";
import type { Company, Produit, ProductCategory } from "@/lib/data/types";

/** Produit extended with session-only fields not (yet) in the shared data model — companyId and photos are managed locally here rather than in lib/data/types.ts. */
export type ManagedProduit = Produit & { companyId: string; photos: UploadedFile[] };

type ProduitFormDialogProps = {
  open: boolean;
  mode: "add" | "edit";
  produit: ManagedProduit | null;
  categories: ProductCategory[];
  companies: Company[];
  defaultCategoryId: string;
  defaultCompanyId: string;
  onClose: () => void;
  onSubmit: (values: Omit<ManagedProduit, "id">) => void;
  onDelete: (id: string) => void;
};

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

function emptyDraft(defaultCategoryId: string, defaultCompanyId: string): Omit<ManagedProduit, "id"> {
  return { categoryId: defaultCategoryId, companyId: defaultCompanyId, name: "", price: 0, stock: 0, active: true, importedAbroad: false, photos: [] };
}

/**
 * Ajouter/Modifier un produit. Real FileUpload for the product photo (no more decorative
 * placeholder), a single "Acheté à l'étranger" Switch, and an Entreprise Select hidden entirely
 * when there's only one company — no Dépôt selector, Stock is out of scope.
 */
export function ProduitFormDialog({ open, mode, produit, categories, companies, defaultCategoryId, defaultCompanyId, onClose, onSubmit, onDelete }: ProduitFormDialogProps) {
  return (
    <Dialog open={open} labelledBy="produit-form-title" className="relative max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl p-6">
      {open && (
        <ProduitForm
          key={produit?.id ?? `new-${defaultCategoryId}-${defaultCompanyId}`}
          mode={mode}
          produit={produit}
          categories={categories}
          companies={companies}
          defaultCategoryId={defaultCategoryId}
          defaultCompanyId={defaultCompanyId}
          onClose={onClose}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
      )}
    </Dialog>
  );
}

function ProduitForm({ mode, produit, categories, companies, defaultCategoryId, defaultCompanyId, onClose, onSubmit, onDelete }: Omit<ProduitFormDialogProps, "open">) {
  const [draft, setDraft] = useState<Omit<ManagedProduit, "id">>(() => (produit ? { ...produit } : emptyDraft(defaultCategoryId, defaultCompanyId)));
  const [priceText, setPriceText] = useState(String(produit?.price ?? ""));
  const [stockText, setStockText] = useState(String(produit?.stock ?? "0"));
  const [errors, setErrors] = useState<{ name?: string; price?: string; stock?: string }>({});
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleAddPhoto(fileList: FileList) {
    const file = fileList[0];
    if (!file) return;
    // Same rejection behavior as Photos de référence — one file-rejection pattern app-wide.
    if (!file.type.startsWith("image/")) {
      setPhotoError("Format non pris en charge — utilisez une image (JPG, PNG).");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError("Image trop grande, 5 Mo maximum.");
      return;
    }
    setPhotoError(null);
    setDraft((d) => ({ ...d, photos: [{ name: file.name, sizeLabel: `${(file.size / (1024 * 1024)).toFixed(1)} Mo` }] }));
  }

  function handleSubmit() {
    const price = Number(priceText.replace(/[^0-9]/g, ""));
    const stock = Number(stockText.replace(/[^0-9]/g, ""));
    const nextErrors: typeof errors = {};
    if (!draft.name.trim()) nextErrors.name = "Le nom du produit est obligatoire.";
    if (!priceText.trim() || Number.isNaN(price) || price <= 0) nextErrors.price = "Indiquez un prix valide.";
    if (stockText.trim() && Number.isNaN(stock)) nextErrors.stock = "Indiquez un stock valide.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSubmit({ ...draft, name: draft.name.trim(), price, stock: Number.isNaN(stock) ? 0 : stock });
  }

  return (
    <>
      <CloseButton onClick={onClose} />
      <h2 id="produit-form-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
        {mode === "add" ? "Ajouter un produit" : "Modifier le produit"}
      </h2>

      <div className="mt-5 flex flex-col gap-4">
        <Field label="Photo du produit">
          <FileUpload
            files={draft.photos}
            onAdd={handleAddPhoto}
            onRemove={() => setDraft((d) => ({ ...d, photos: [] }))}
            multiple={false}
            hint="JPG, PNG jusqu'à 5 Mo"
          />
          {photoError && <p className="mt-1 text-xs font-medium text-[var(--color-error)]">{photoError}</p>}
        </Field>

        <Field label="Nom du produit" required>
          <TextInput value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Ex. Shampoing 300ml" />
          {errors.name && <p className="mt-1 text-xs font-medium text-[var(--color-error)]">{errors.name}</p>}
        </Field>

        <Field label="Catégorie" required>
          <Select
            value={draft.categoryId}
            onChange={(v) => setDraft((d) => ({ ...d, categoryId: v }))}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
        </Field>

        {companies.length > 1 && (
          <Field label="Entreprise">
            <Select
              value={draft.companyId}
              onChange={(v) => setDraft((d) => ({ ...d, companyId: v }))}
              options={companies.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Prix (F CFA)" required>
            <TextInput inputMode="numeric" value={priceText} onChange={(e) => setPriceText(e.target.value)} placeholder="20000" />
            {errors.price && <p className="mt-1 text-xs font-medium text-[var(--color-error)]">{errors.price}</p>}
          </Field>
          <Field label="Stock">
            <TextInput inputMode="numeric" value={stockText} onChange={(e) => setStockText(e.target.value)} placeholder="0" />
            {errors.stock && <p className="mt-1 text-xs font-medium text-[var(--color-error)]">{errors.stock}</p>}
          </Field>
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={draft.importedAbroad ?? false} onChange={(v) => setDraft((d) => ({ ...d, importedAbroad: v }))} label="Acheté à l'étranger" />
          <span className="text-sm font-medium text-[var(--color-gray-700)]">Acheté à l&apos;étranger</span>
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={draft.active} onChange={(v) => setDraft((d) => ({ ...d, active: v }))} label="Produit actif" />
          <span className="text-sm font-medium text-[var(--color-gray-700)]">{draft.active ? "Actif" : "Inactif"}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {mode === "edit" && (
          <Button type="button" variant="danger-outline" onClick={() => setConfirmDelete(true)} className="w-auto self-start">
            Supprimer ce produit
          </Button>
        )}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button type="button" variant="dark" onClick={handleSubmit} className="flex-1">
            {mode === "add" ? "Ajouter" : "Enregistrer"}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer ce produit ?"
        description={`« ${produit?.name ?? ""} » sera retiré du catalogue. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          if (produit) onDelete(produit.id);
          onClose();
        }}
      />
    </>
  );
}
