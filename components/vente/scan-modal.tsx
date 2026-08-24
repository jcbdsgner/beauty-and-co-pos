"use client";

import { Dialog } from "@/components/ui/dialog";
import { CloseButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { CameraIcon, QrFrameIcon } from "@/components/vente/icons";
import { CLIENTS, type Client } from "@/lib/data/vente";

type ScanModalProps = {
  open: boolean;
  onClose: () => void;
  onDetected: (client: Client) => void;
};

/** "Scanner QR Client" modal — no real camera access here, just the viewfinder chrome plus a
 * "Simuler la détection" button that stands in for a successful scan during demos/dev. */
export function ScanModal({ open, onClose, onDetected }: ScanModalProps) {
  return (
    <Dialog open={open} labelledBy="scan-modal-title" className="max-w-sm rounded-2xl p-6 shadow-2xl">
      <div className="relative mb-4 flex items-center gap-2">
        <CameraIcon className="size-5 text-[var(--brand-taupe-muted)]" />
        <h2 id="scan-modal-title" className="font-[var(--font-heading)] text-lg text-[var(--color-gray-900)]">
          Scanner QR Client
        </h2>
        <CloseButton onClick={onClose} />
      </div>

      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[var(--color-gray-900)]">
        <div className="absolute inset-8 text-white/80">
          <QrFrameIcon />
        </div>
        <p className="text-xs text-white/40">Caméra indisponible en mode démo</p>
      </div>

      <p className="mt-4 text-center text-sm text-[var(--color-gray-500)]">
        Pointez la caméra vers le QR code de la carte client
      </p>

      <Button
        variant="dark"
        className="mt-4 w-full"
        onClick={() => onDetected(CLIENTS[0])}
      >
        Simuler la détection
      </Button>
    </Dialog>
  );
}
