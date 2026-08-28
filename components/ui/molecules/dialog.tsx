"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  labelledBy: string;
  role?: "dialog" | "alertdialog";
  /** "sheet" anchors to the bottom and shows a drag-handle grip — for a form that wants to feel
   *  like it slid up from the counter, not a floating alert. */
  variant?: "center" | "sheet";
  overlayClassName?: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Radix Dialog under the hood — real focus trap, scroll lock and portal, which the previous
 * hand-rolled overlay never had. Kept as a controlled, close-button-only surface: overlay clicks
 * and Escape do NOT dismiss it (USERFLOW.md § "aucun dialogue ne se ferme au clic sur l'overlay
 * ni à la touche Échap" — a deliberate decision on a counter where a stray tap must never wipe a
 * half-filled form). Every caller renders its own explicit "×" / "Annuler" control.
 *
 * Elevation: a deep, wide shadow + chunkier 28px corners so a Dialog never reads as a flat Card.
 */
export function Dialog({ open, labelledBy, role = "dialog", variant = "center", overlayClassName, className, children }: DialogProps) {
  const sheet = variant === "sheet";

  return (
    <DialogPrimitive.Root open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
            overlayClassName,
          )}
        />
        <div
          className={cn(
            "fixed inset-0 z-50 flex p-4",
            sheet ? "items-end justify-center sm:items-center" : "items-center justify-center",
          )}
        >
          <DialogPrimitive.Content
            aria-labelledby={labelledBy}
            aria-describedby={undefined}
            role={role}
            onEscapeKeyDown={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            className={cn(
              "w-full bg-white shadow-[0px_24px_64px_-12px_rgba(0,0,0,0.35)] focus:outline-none",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              sheet ? "rounded-t-[28px] sm:rounded-[28px]" : "rounded-[28px]",
              className,
            )}
          >
            <VisuallyHidden>
              <DialogPrimitive.Title>Boîte de dialogue</DialogPrimitive.Title>
            </VisuallyHidden>
            {sheet && <div aria-hidden className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border" />}
            {children}
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
