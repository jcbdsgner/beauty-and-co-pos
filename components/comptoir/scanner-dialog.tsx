"use client";

import { useEffect, useRef, useState } from "react";
import { ScanLine } from "lucide-react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Button } from "@/components/ui/atoms/button";
import { Alert } from "@/components/ui/molecules/alert";

type ScannerDialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  /** Fires with a plausible demo payload — "Simuler la détection" is explicitly labeled as demo mode, per USERFLOW.md, never applied silently. */
  onDetect: (value: string) => void;
  demoValue: string;
};

/** One scanner, reused for client identification and gift-card scanning — a real `<video>` feed behind an SVG viewfinder, camera-denied state handled, per USERFLOW.md's Comptoir spec. */
export function ScannerDialog({ open, title, onClose, onDetect, demoValue }: ScannerDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({ video: true })
      .then((s) => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setCameraError(null);
      })
      .catch(() => setCameraError("Caméra indisponible — utilisez la recherche ou la saisie manuelle."));
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [open]);

  return (
    <Dialog open={open} labelledBy="scanner-title" className="max-w-sm rounded-3xl p-6">
      <CloseButton onClick={onClose} />
      <h2 id="scanner-title" className="font-[family-name:var(--font-heading)] font-semibold text-xl text-[var(--color-gray-900)]">
        {title}
      </h2>

      <div className="relative mt-4 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-gray-900)]">
        <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 size-full object-cover opacity-80" />
        <svg viewBox="0 0 200 200" className="relative size-3/4 text-[var(--core-brand-color)]">
          <path d="M16 16 L16 56 M16 16 L56 16 M184 16 L144 16 M184 16 L184 56 M16 184 L16 144 M16 184 L56 184 M184 184 L184 144 M184 184 L144 184" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {cameraError && <Alert tone="error" title={cameraError} className="mt-4" />}

      <p className="mt-4 text-center text-xs font-semibold tracking-wide text-[var(--color-gray-400)] uppercase">Mode démo</p>
      <Button variant="dark" className="mt-2 w-full" onClick={() => onDetect(demoValue)}>
        <ScanLine className="size-4" />
        Simuler la détection
      </Button>
    </Dialog>
  );
}
