"use client";

import { useEffect, useRef, useState } from "react";

type DetectedBarcode = { rawValue: string };
type BarcodeDetectorLike = { detect(source: CanvasImageSource): Promise<DetectedBarcode[]> };

/**
 * Live camera feed behind a viewfinder, reading QR codes on its own (BarcodeDetector where
 * available). Shared by every "scanner un code" modal (identification cliente, carte cadeau) so
 * the getUserMedia/polling/cleanup wiring lives in one place instead of being copied per dialog.
 */
export function ScanCamera({
  active,
  onDetect,
  hint,
}: {
  active: boolean;
  onDetect: (rawValue: string) => void;
  hint: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    if (!active) return;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let stopped = false;

    const DetectorCtor = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => BarcodeDetectorLike })
      .BarcodeDetector;
    const detector = DetectorCtor ? new DetectorCtor({ formats: ["qr_code"] }) : null;

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        if (stopped) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setCameraError(false);
        if (!detector) return;
        timer = setInterval(async () => {
          const v = videoRef.current;
          if (!v || v.readyState < 2) return;
          try {
            const hits = await detector.detect(v);
            if (hits[0]?.rawValue) {
              if (timer) clearInterval(timer);
              onDetect(hits[0].rawValue);
            }
          } catch {
            /* a single failed frame is fine — keep polling */
          }
        }, 400);
      })
      .catch(() => setCameraError(true));

    return () => {
      stopped = true;
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <>
      <div className="relative mt-4 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-base-content">
        <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 size-full object-cover opacity-80" />
        <svg viewBox="0 0 200 200" className="relative size-3/4 text-primary">
          <path
            d="M16 16 L16 56 M16 16 L56 16 M184 16 L144 16 M184 16 L184 56 M16 184 L16 144 M16 184 L56 184 M184 184 L184 144 M184 184 L144 184"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="mt-3 text-center text-xs text-base-content/45">
        {cameraError ? "Caméra indisponible — saisissez le code ci-dessous." : hint}
      </p>
    </>
  );
}
