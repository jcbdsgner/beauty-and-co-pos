"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { CloseButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { CameraIcon, QrFrameIcon } from "@/components/vente/icons";

type ScanModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  instructions: string;
  /** Runs when a scan "succeeds" — the caller owns what that means (select a client, apply a gift card...). */
  onSimulateDetect: () => void;
};

/** Generic QR-scan modal — activates the device camera for a live viewfinder feed. Used both for
 * the client loyalty card and the carte cadeau. QR decoding isn't wired to a real payload (there's
 * no encoded data behind either card's QR placeholder), so "Simuler la détection" stands in for a
 * successful scan; the caller decides what a detection means. */
export function ScanModal({ open, onClose, title, instructions, onSimulateDetect }: ScanModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let stream: MediaStream | null = null;
    let cancelled = false;

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" } })
      .then((mediaStream) => {
        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = mediaStream;
        setCameraError(null);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      })
      .catch(() => {
        if (!cancelled) setCameraError("Impossible d'accéder à la caméra");
      });

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [open]);

  return (
    <Dialog open={open} labelledBy="scan-modal-title" className="max-w-sm rounded-2xl p-6 shadow-2xl">
      <div className="relative mb-4 flex items-center gap-2">
        <CameraIcon className="size-5 text-[var(--brand-taupe-muted)]" />
        <h2 id="scan-modal-title" className="font-[var(--font-heading)] text-lg text-[var(--color-gray-900)]">
          {title}
        </h2>
        <CloseButton onClick={onClose} />
      </div>

      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[var(--color-gray-900)]">
        <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-8 text-white/80">
          <QrFrameIcon />
        </div>
        {cameraError && (
          <p className="relative max-w-[80%] text-center text-xs text-white/60">{cameraError}</p>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-[var(--color-gray-500)]">{instructions}</p>

      <Button variant="dark" className="mt-4 w-full" onClick={onSimulateDetect}>
        Simuler la détection
      </Button>
    </Dialog>
  );
}
