"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton, IconButton } from "@/components/ui/atoms/icon-button";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Button } from "@/components/ui/atoms/button";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { TrashIcon, PlusIcon } from "@/components/ui/atoms/icons";

type CategoriesDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  categories: { id: string; name: string }[];
  itemCount: (categoryId: string) => number;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
};

/**
 * Catégories management — a flat list (categories aren't hierarchical here) with live
 * item-per-category counts, inline rename, and a guarded delete (a category still holding
 * articles can't be deleted — no orphaned articles left silently pointing at nothing) routed
 * through the app's one ConfirmDialog pattern.
 */
export function CategoriesDialog({ open, onClose, title, categories, itemCount, onAdd, onRename, onDelete }: CategoriesDialogProps) {
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  if (!open) return null;

  function handleAdd() {
    if (!newName.trim()) {
      setAddError("Le nom de la catégorie est obligatoire.");
      return;
    }
    onAdd(newName.trim());
    setNewName("");
    setAddError(null);
  }

  return (
    <>
      <Dialog open={open} labelledBy="categories-dialog-title" className="relative max-h-[85vh] max-w-md overflow-y-auto rounded-3xl p-6">
        <CloseButton onClick={onClose} />
        <h2 id="categories-dialog-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
          {title}
        </h2>

        <ul className="mt-5 flex flex-col gap-2">
          {categories.map((cat) => {
            const count = itemCount(cat.id);
            return (
              <li key={cat.id} className="flex items-center gap-2 rounded-xl border border-[var(--color-gray-200)] px-2 py-1.5">
                <TextInput
                  value={cat.name}
                  onChange={(e) => onRename(cat.id, e.target.value)}
                  size="compact"
                  className="flex-1 border-transparent bg-transparent font-medium"
                />
                <span className="shrink-0 text-xs whitespace-nowrap text-[var(--color-gray-400)]">
                  {count} article{count > 1 ? "s" : ""}
                </span>
                <IconButton
                  aria-label={`Supprimer la catégorie ${cat.name}`}
                  disabled={count > 0}
                  onClick={() => setPendingDelete({ id: cat.id, name: cat.name })}
                  className="size-11 shrink-0 rounded-full text-[var(--color-gray-400)] transition active:scale-90 hover:bg-[var(--color-error-soft)] hover:text-[var(--color-error)] active:bg-[var(--color-error-soft)] active:text-[var(--color-error)] disabled:pointer-events-none disabled:text-[var(--color-gray-300)]"
                >
                  <TrashIcon />
                </IconButton>
              </li>
            );
          })}
        </ul>
        {categories.length > 0 && (
          <p className="mt-2 text-xs text-[var(--color-gray-400)]">Une catégorie contenant des articles ne peut pas être supprimée.</p>
        )}

        <div className="mt-5 flex items-center gap-2 border-t border-[var(--color-gray-200)] pt-4">
          <TextInput
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              if (addError) setAddError(null);
            }}
            placeholder="Nouvelle catégorie"
            className="flex-1"
          />
          <Button type="button" variant="dark" icon={<PlusIcon />} onClick={handleAdd} className="w-auto shrink-0">
            Ajouter
          </Button>
        </div>
        {addError && <p className="mt-1 text-xs font-medium text-[var(--color-error)]">{addError}</p>}
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Supprimer cette catégorie ?"
        description={pendingDelete ? `« ${pendingDelete.name} » sera retirée définitivement.` : undefined}
        confirmLabel="Supprimer"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) onDelete(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </>
  );
}
