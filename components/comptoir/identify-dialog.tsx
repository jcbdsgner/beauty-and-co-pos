"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { Button } from "@/components/ui/atoms/button";
import { TextInput } from "@/components/ui/atoms/text-input";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientByLoyaltyCode } from "@/lib/data/clientele";
import { carteCadeauByCode } from "@/lib/data/cartes-cadeaux";
import type { Sale } from "@/lib/data/types";

/** Prototype: no real card carries a resolvable QR payload, so any QR the camera reads stands in
 *  for this sample loyalty card. Replaced by a real lookup once cards are printed with real codes. */
const DEMO_QR_FALLBACK = "BACO-FID-1042"; // Awa Sarr

type DetectedBarcode = { rawValue: string };
type BarcodeDetectorLike = { detect(source: CanvasImageSource): Promise<DetectedBarcode[]> };

/**
 * One dialog, reached from the ticket's "Scanner" and from the Remise panel's scan icon. A real
 * `<video>` feed behind a viewfinder, and a single code field below it — the same field takes a
 * carte de fidélité code or a carte cadeau code, routed by what the code resolves to (ADR 0013):
 *  · loyalty code → attaches the cliente fiche;
 *  · gift-card code → `applyGiftCard` attaches the card's holder (if any) AND applies the card.
 * The camera reads QR codes on its own (BarcodeDetector where available); in this prototype any
 * QR read stands in for the sample card. A wrong identification is undone from the ticket
 * ("Retirer" on the cliente row).
 */
export function IdentifyDialog({ open, sale, onClose }: { open: boolean; sale: Sale; onClose: () => void }) {
  const { clients, updateSale, applyGiftCard } = useAppData();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const saleId = sale.id;

  function resolve(raw: string, fromScan: boolean) {
    const value = raw.trim();
    if (!value) return;
    setError(null);

    if (carteCadeauByCode(value)) {
      const res = applyGiftCard(saleId, value);
      if (res.ok) onClose();
      else setError(res.message);
      return;
    }

    const client = clientByLoyaltyCode(clients, value);
    if (client) {
      updateSale(saleId, { clientId: client.id });
      onClose();
      return;
    }

    if (fromScan) {
      // Any QR read counts in the prototype — fall back to the sample loyalty card.
      const demo = clientByLoyaltyCode(clients, DEMO_QR_FALLBACK);
      if (demo) {
        updateSale(saleId, { clientId: demo.id });
        onClose();
        return;
      }
    }

    setError("Code non reconnu — vérifiez-le ou cherchez la cliente par son nom.");
  }

  // Camera + QR polling. BarcodeDetector is Chromium-only; without it the field is the way in.
  useEffect(() => {
    if (!open) return;
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
              resolve(hits[0].rawValue, true);
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
  }, [open]);

  return (
    <Dialog open={open} labelledBy="identify-title" className="max-w-sm rounded-3xl p-6">
      <h2
        id="identify-title"
        className="font-[family-name:var(--font-heading)] font-semibold text-xl text-base-content"
      >
        Identifier la cliente
      </h2>

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
        {cameraError ? "Caméra indisponible — saisissez le code ci-dessous." : "Présentez le QR de la carte, ou saisissez son code."}
      </p>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          resolve(code, false);
        }}
      >
        <TextInput
          size="compact"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code de la carte"
          autoCapitalize="characters"
          spellCheck={false}
          aria-label="Code de la carte de fidélité ou de la carte cadeau"
        />
        <Button type="submit" variant="brand" size="sm" className="shrink-0" disabled={!code.trim()}>
          Valider
        </Button>
      </form>

      {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}

      <Button variant="outline" size="default" className="mt-5 w-full" onClick={onClose}>
        Annuler
      </Button>
    </Dialog>
  );
}
