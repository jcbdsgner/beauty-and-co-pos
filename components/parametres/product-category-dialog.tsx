"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ChevronIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { PRODUCT_CATEGORY_TREE } from "@/lib/data/parametres-catalogue";

type ProductCategoryDialogProps = {
  open: boolean;
  onClose: () => void;
};

/** "Categories produits" modal — 2-level tree (L1 catégorie, L2 sous-catégorie), chevron
 * expand/collapse per L1 kept in local state. */
export function ProductCategoryDialog({ open, onClose }: ProductCategoryDialogProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(PRODUCT_CATEGORY_TREE.map((node) => node.label)));

  function toggle(label: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  return (
    <Dialog open={open} labelledBy="product-categories-title" className="max-h-[85vh] max-w-md overflow-y-auto rounded-3xl">
      <div className="flex justify-center pt-3">
        <div className="h-1 w-10 rounded-full bg-[var(--color-gray-200)]" />
      </div>
      <div className="flex items-start justify-between px-6 pt-4">
        <div>
          <h2 id="product-categories-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
            Categories produits
          </h2>
          <p className="mt-1 text-sm text-[var(--color-gray-500)]">3 niveaux : Categorie → Sous-categorie → Specialite</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--color-gray-400)] hover:bg-[var(--color-gray-100)]"
        >
          ✕
        </button>
      </div>

      <ul className="px-6 py-5">
        {PRODUCT_CATEGORY_TREE.map((node) => {
          const hasChildren = !!node.children?.length;
          const isOpen = expanded.has(node.label);
          return (
            <li key={node.label} className="border-b border-[var(--color-gray-100)] py-2.5 last:border-0">
              <button
                type="button"
                onClick={() => hasChildren && toggle(node.label)}
                disabled={!hasChildren}
                className="flex w-full items-center justify-between text-left disabled:cursor-default"
              >
                <span className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-[var(--color-gray-900)]">{node.label}</span>
                  <span className="text-xs text-[var(--color-gray-400)]">L1</span>
                </span>
                {hasChildren && (
                  <ChevronIcon className={cn("size-4 text-[var(--color-gray-400)] transition", isOpen && "rotate-90")} />
                )}
              </button>
              {hasChildren && isOpen && (
                <ul className="mt-2 space-y-2 pl-4">
                  {node.children!.map((child) => (
                    <li key={child} className="flex items-center justify-between">
                      <span className="text-[15px] text-[var(--color-gray-700)]">{child}</span>
                      <span className="text-xs text-[var(--color-gray-400)]">L2</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <div className="px-6 pb-6">
        <Button variant="outline" onClick={onClose} className="w-full">
          Fermer
        </Button>
      </div>
    </Dialog>
  );
}
