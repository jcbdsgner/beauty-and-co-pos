import { AlertTriangle } from "lucide-react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { Button, type ButtonVariant } from "@/components/ui/atoms/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger-outline"/"success" etc. — matches the weight of the action being confirmed. */
  confirmVariant?: ButtonVariant;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Destructive/irreversible-action guard (delete a product, cancel a rendez-vous, revoke access) — built on the shared Dialog shell. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} labelledBy="confirm-dialog-title" role="alertdialog" className="max-w-sm rounded-3xl p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-[var(--color-error-soft)] text-[var(--color-error)]">
          <AlertTriangle aria-hidden className="size-6" />
        </span>
        <h2 id="confirm-dialog-title" className="font-[var(--font-heading)] text-lg text-[var(--color-gray-900)]">
          {title}
        </h2>
        {description && <p className="text-sm text-[var(--color-gray-500)]">{description}</p>}
      </div>
      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          {cancelLabel}
        </Button>
        <Button type="button" variant={confirmVariant} onClick={onConfirm} className="flex-1">
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
