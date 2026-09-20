"use client";

import { useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { StockLine } from "@/components/catalogue/catalogue-parts";
import { CloseButton, IconButton } from "@/components/ui/atoms/icon-button";
import { PhotoPlaceholder } from "@/components/ui/atoms/photo-placeholder";
import { cn, formatFcfa } from "@/lib/utils";

export type CatalogueLightboxItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  /** Present for a produit (stock counted) — absent for a boisson (le bar n'a pas de stock). */
  stock?: number;
};

/**
 * Plein écran au clic sur une carte du Catalogue (Figma node 260:874) : photo à gauche, fiche à
 * droite (nom, prix, stock si produit, description), navigation précédent/suivant entre les
 * éléments du volet courant. Pure lecture — comme la fiche cliente en "side", rien n'est perdu à
 * la fermer tôt, donc clic sur le fond et Échap ferment aussi (contrairement au Dialog par défaut
 * de l'app, protégé pour ne rien effacer d'un formulaire en cours).
 *
 * Précédent/suivant/fermer vivent tous DANS `DialogPrimitive.Content` (pas en overlay à côté) :
 * son `FocusScope` piège les vrais clics pointeur en dehors de lui-même — un bouton placé à côté
 * ne reçoit jamais de clic réel (seul un `.click()` programmatique passerait), donc `Content` est
 * ici la scène plein écran entière plutôt que la seule carte blanche.
 */
export function CatalogueLightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: CatalogueLightboxItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const open = index !== null && items[index] !== undefined;
  const item = open ? items[index] : null;
  const count = items.length;

  useEffect(() => {
    if (!open || index === null || count <= 1) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") onNavigate((index! - 1 + count) % count);
      if (e.key === "ArrowRight") onNavigate((index! + 1) % count);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, index, count, onNavigate]);

  if (!item || index === null) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />

        <DialogPrimitive.Content
          aria-labelledby="catalogue-lightbox-title"
          aria-describedby={item.description ? "catalogue-lightbox-description" : undefined}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          className="group fixed inset-0 z-50 flex items-center justify-center p-6 focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 sm:p-10"
        >
          {/* La carte peint APRÈS ces boutons dans le DOM serait dessinée par-dessus eux sur les
              viewports où elle n'a pas de marge dédiée — d'où le rendu de la carte AVANT
              précédent/suivant/fermer, pour qu'ils restent toujours cliquables au-dessus d'elle. */}
          <div
            className={cn(
              "flex h-full max-h-[720px] w-full max-w-[1100px] overflow-hidden rounded-[var(--radius-box)] bg-base-100 shadow-[0px_24px_64px_-12px_rgba(0,0,0,0.35)]",
              "group-data-[state=open]:animate-in group-data-[state=open]:zoom-in-95",
              "group-data-[state=closed]:animate-out group-data-[state=closed]:zoom-out-95",
            )}
          >
            <div className="relative hidden w-[58%] shrink-0 bg-base-200 sm:block">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill sizes="640px" className="object-cover" />
              ) : (
                <PhotoPlaceholder className="size-full rounded-none border-0" label="Photo à venir" />
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto px-8 py-10 sm:px-10 sm:py-12">
              <DialogPrimitive.Title
                id="catalogue-lightbox-title"
                className="font-[family-name:var(--font-heading)] text-[28px] font-medium leading-[32px] tracking-[-0.02em] text-[var(--color-gray-900)]"
              >
                {item.name}
              </DialogPrimitive.Title>
              <p className="text-xl font-semibold text-base-content">{formatFcfa(item.price)}</p>
              {typeof item.stock === "number" && <StockLine stock={item.stock} />}
              {item.description && (
                <p id="catalogue-lightbox-description" className="text-sm leading-relaxed text-base-content/60">
                  {item.description}
                </p>
              )}
            </div>
          </div>

          {count > 1 && (
            <IconButton
              aria-label="Élément précédent"
              onClick={() => onNavigate((index - 1 + count) % count)}
              className="absolute left-2 top-1/2 size-12 -translate-y-1/2 rounded-field border border-base-300 bg-white text-base-content/60 shadow-sm transition active:scale-90 active:bg-base-200 hover:bg-base-200 hover:text-base-content sm:left-4"
            >
              <ChevronLeft className="size-5" />
            </IconButton>
          )}

          {count > 1 && (
            <IconButton
              aria-label="Élément suivant"
              onClick={() => onNavigate((index + 1) % count)}
              className="absolute right-2 top-1/2 size-12 -translate-y-1/2 rounded-field border border-base-300 bg-white text-base-content/60 shadow-sm transition active:scale-90 active:bg-base-200 hover:bg-base-200 hover:text-base-content sm:right-4"
            >
              <ChevronRight className="size-5" />
            </IconButton>
          )}

          <DialogPrimitive.Close asChild>
            <CloseButton className="absolute right-6 top-6 rounded-field border border-base-300 bg-white text-base-content/60 shadow-sm active:bg-base-200 hover:bg-base-200 hover:text-base-content" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
